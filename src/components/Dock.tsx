import { appsRegistry } from "../apps";
import { useWindowStore } from "../store";

export default function Dock() {
  const { openApp } = useWindowStore();

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-neutral-800 px-4 py-2 rounded-lg flex gap-3 shadow-lg">
      {Object.values(appsRegistry).map((app) => (
        <button
          key={app.id}
          onClick={() => openApp(app.id)}
          className="text-xl hover:scale-110 transition"
        >
          {app.icon}
        </button>
      ))}
    </div>
  );
}
