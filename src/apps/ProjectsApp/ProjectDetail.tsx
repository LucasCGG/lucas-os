import { AppIcon } from "../../components";
import { useTrans } from "../../hooks/useTrans";
import { Project } from "./projects";

const stackIcons: Record<string, string> = {
    HTML: "icn-html",
    CSS: "icn-css",
    JavaScript: "icn-js",
    React: "icn-react",
    "C#": "icn-csharp",
    WordPress: "icn-wordpress",
    Rive: "icn-rive",
};

const fileName = (src: string) => src.split("/").pop() ?? src;

export const ProjectDetail = ({
    project,
    onPreview,
}: {
    project: Project;
    onPreview: (index: number) => void;
}) => {
    const { t } = useTrans();

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <header className="flex items-start gap-4">
                <AppIcon icon="icn-folder" size="3xl" className="hidden shrink-0 [@container(min-width:420px)]:block" />
                <div className="min-w-0">
                    <h1 className="text-2xl font-bold leading-tight">{project.name}</h1>
                    <p className="text-xs uppercase tracking-wider opacity-60">
                        {project.category} · {project.year}
                    </p>
                    <p className="mt-2 text-sm">{project.summary}</p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {project.repo ? (
                            <a className="btn-retro" href={project.repo} target="_blank" rel="noopener noreferrer">
                                <AppIcon icon="icn-git" size="sm" />
                                <span>{t("app.projects.openRepo")}</span>
                            </a>
                        ) : (
                            <span className="inline-flex items-center gap-2 rounded border border-dashed border-sidebar/50 px-3 py-1 text-sm opacity-70">
                                <AppIcon icon="icn-git" size="sm" />
                                {t("app.projects.privateRepo")}
                            </span>
                        )}
                        {project.docs && (
                            <a className="btn-retro" href={project.docs} target="_blank" rel="noopener noreferrer">
                                <AppIcon icon="icn-external" size="sm" />
                                <span>{t("app.projects.openDocs")}</span>
                            </a>
                        )}
                        {project.live && (
                            <a className="btn-retro" href={project.live} target="_blank" rel="noopener noreferrer">
                                <AppIcon icon="icn-external" size="sm" />
                                <span>{t("app.projects.openLive")}</span>
                            </a>
                        )}
                    </div>
                </div>
            </header>

            <section className="space-y-3 text-sm leading-6">
                {project.description.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                ))}
            </section>

            <section>
                <h2 className="mb-2 border-b-2 border-sidebar pb-1 font-bold text-sidebar">
                    {t("app.projects.techStack")}
                </h2>
                <ul className="flex flex-wrap gap-2">
                    {project.stack.map((tech) => (
                        <li
                            key={tech}
                            className="flex items-center gap-1.5 rounded border border-sidebar/40 bg-background px-2 py-1 text-xs font-semibold"
                        >
                            {stackIcons[tech] && <AppIcon icon={stackIcons[tech]} size="sm" />}
                            {tech}
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <h2 className="mb-2 border-b-2 border-sidebar pb-1 font-bold text-sidebar">
                    {t("app.projects.screenshots")}
                </h2>
                {project.screenshots.length === 0 ? (
                    <div className="flex items-center gap-3 rounded border-2 border-dashed border-sidebar/40 p-4 text-sm opacity-70">
                        <AppIcon icon="icn-image-file" size="xl" className="shrink-0 opacity-60" />
                        <p>{t("app.projects.noScreenshots")}</p>
                    </div>
                ) : (
                    <ul className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-3">
                        {project.screenshots.map((screenshot, index) => (
                            <li key={screenshot.src}>
                                <button
                                    onClick={() => onPreview(index)}
                                    title={screenshot.caption}
                                    className="group flex w-full flex-col gap-1 rounded-md p-1.5 text-left transition-colors hover:bg-[#EAD3A2] focus-visible:bg-[#EAD3A2] focus-visible:outline-none"
                                >
                                    <img
                                        src={screenshot.src}
                                        alt={screenshot.caption}
                                        loading="lazy"
                                        className="aspect-video w-full border-2 border-[#392107] bg-[#392107]/10 object-cover object-top"
                                    />
                                    <span className="flex items-center gap-1 text-xs font-semibold">
                                        <AppIcon icon="icn-image-file" size="sm" className="shrink-0" />
                                        <span className="truncate">{fileName(screenshot.src)}</span>
                                    </span>
                                    <span className="line-clamp-2 text-[11px] leading-tight opacity-70">
                                        {screenshot.caption}
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};
