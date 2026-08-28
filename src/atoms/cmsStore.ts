import { create } from "zustand";
import { LSC } from "../configs";
import { i18nService } from "../services";

type FieldType = "text" | "longtext" | "number" | "list" | "timeline";

export interface CMSField{
  id: string;
  type: FieldType;
  label: string;
  value: unknown;
}

const NS = "translation";

const isWrapped = (n: unknown): n is { type: string; label?: string; value: unknown } => {
    return (
        typeof n === "object" &&
        n !== null &&
        !Array.isArray(n) &&
        "type" in (n as object) &&
        "value" in (n as object)
    );
};

const buildRegistry= (node: unknown, path = "", out: Record<string, CMSField> = {}) => {
  if (isWrapped(node)) {
    out[path] = {
      id: path,
      type: node.type as FieldType,
      label: node.label ?? path,
      value: node.value
    }
    return out;
  }

  if (node && typeof node === "object" && !Array.isArray(node)) {
    for (const [key, value] of Object.entries(node)) {
      buildRegistry(value, path ? `${path}.${key}` : key, out);
    }
  }

  return out;
}

const nestFromPath = (path: string, value: unknown): Record<string, unknown> => {
  const parts = path.split(".");
  const root: Record<string, unknown> = {};
  let cur = root;

  for (let i = 0; i < parts.length - 1; i++) {
    cur = cur[parts[i]] = {} as never;
  }

  cur[parts[parts.length - 1]] = value;

  return root;
}


const setWrappedValue = (tree: any, path: string, value: unknown)=>{
  const parts = path.split(".");
  let cur = tree;
  for (let i = 0; i < parts.length - 1; i++){
    cur = cur?.[parts[i]];
  }

  const leaf = cur?.[parts[parts.length - 1]];
  if (leaf && typeof leaf === "object" && "value" in leaf) leaf.value = value;
}

const clone = <T>(value: T): T => {
  return JSON.parse(JSON.stringify(value)) as T;
}

type EditsByLang = Record<string, Record<string, unknown>>;

const loadEdits = (): EditsByLang => {
  try {
    const raw = localStorage.getItem(LSC.LS_APP_EDITS_KEY);
    return raw ? (JSON.parse(raw) as EditsByLang) : {};
  } catch (err) {
    console.error("[contentStore] failed to loadEdits: ", err);
    return {};
  }
}

const saveEdits = (values: EditsByLang) => {
  try {
    localStorage.setItem(LSC.LS_APP_EDITS_KEY, JSON.stringify(values));
  } catch (err) {
    console.error("[contentStore] failed to saveEdits: ", err);
  }
}


type CMSStore = {
  lang: string;
  raw: unknown | null;
  fields: Record<string, CMSField>;
  editsByLang: EditsByLang;
  loaded: boolean;
  loadError: string | null;
  editing: boolean;
  selectedId: string | null;

  init: (lang?: string) => Promise<void>;
  setEditing: (on: boolean) => void;
  toggleEditing: () => void;
  select: (id: string | null) => void;
  update: (id: string, value: unknown) => void;
  hasEdits: () => boolean;
  revertEdits: () => void;
  exportJson: () => string;
  importJson: (json: string) => boolean;
}

const contentUrl=(lang: string, id?: string): string => {
    const build = i18nService.loadPath(id);
    return build([lang]);
}

const pushToI18n = (lang: string, id: string, value: unknown) => {
  const i = i18nService.getInstance();
  i.addResource(lang, NS, id, value as never);
  i.emit("added");
};

let initPromise: Promise<void> | null = null;

export const useCmsStore = create<CMSStore>((set, get) => ({
  lang: "en",
  raw: null,
  fields: {},
  editsByLang: loadEdits(),
  loaded: false,
  loadError: null,
  editing: false,
  selectedId: null,


  init: async (lang) => {
          const language = lang ?? i18nService.getInstance().language ?? "en";
          if (initPromise) return initPromise;
          initPromise = (async () => {
              let raw: unknown = null;
              let fields: Record<string, CMSField> = {};
              let loadError: string | null = null;
              try {
                  const res = await fetch(contentUrl(language), { cache: "no-store" });
                  if (!res.ok) throw new Error(`HTTP ${res.status}`);
                  raw = await res.json();
                  fields = buildRegistry(raw);
              } catch (e) {
                  loadError = e instanceof Error ? e.message : "failed to load content";
              }
              const edits = get().editsByLang[language] ?? {};
              for (const [id, value] of Object.entries(edits)) {
                  if (fields[id]) fields[id] = { ...fields[id], value };
                  pushToI18n(language, id, value);
              }
              set({ lang: language, raw, fields, loaded: true, loadError });
          })();
          return initPromise;
      },

      setEditing: (on) => set((s) => ({ editing: on, selectedId: on ? s.selectedId : null })),
      toggleEditing: () =>
          set((s) => ({ editing: !s.editing, selectedId: !s.editing ? s.selectedId : null })),
      select: (id) => set({ selectedId: id }),

      update: (id, value) =>
          set((s) => {
              const field = s.fields[id];
              if (!field) return s;
              const langEdits = { ...(s.editsByLang[s.lang] ?? {}), [id]: value };
              const editsByLang = { ...s.editsByLang, [s.lang]: langEdits };
              saveEdits(editsByLang);
              pushToI18n(s.lang, id, value);
              return {
                  editsByLang,
                  fields: { ...s.fields, [id]: { ...field, value } },
              };
          }),

      hasEdits: () => Object.keys(get().editsByLang[get().lang] ?? {}).length > 0,

      revertEdits: () => {
          const { lang, raw } = get();
          const fresh = raw ? buildRegistry(raw) : {};
          for (const id of Object.keys(fresh)) pushToI18n(lang, id, fresh[id].value);
          const editsByLang = { ...get().editsByLang };
          delete editsByLang[lang];
          saveEdits(editsByLang);
          set({ editsByLang, fields: fresh, selectedId: null });
      },

      exportJson: () => {
          const { raw, fields } = get();
          const out = clone(raw ?? {});
          for (const id of Object.keys(fields)) setWrappedValue(out, id, fields[id].value);
          return JSON.stringify(out, null, 2);
      },

      importJson: (json) => {
          try {
              const parsed = JSON.parse(json);
              const incoming = buildRegistry(parsed);
              for (const [id, f] of Object.entries(incoming)) get().update(id, f.value);
              return true;
          } catch {
              return false;
          }
      },
  }));
