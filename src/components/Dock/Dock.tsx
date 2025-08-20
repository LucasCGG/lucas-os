import { useEffect, useState } from 'react';
import { useWindowStore } from '../../store';
import { appsRegistry } from '../../apps';
import { AppIconButton } from '../AppIconButton';

const DockClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const n = new Date();
    const msToNextMin = (60 - n.getSeconds()) * 1000 - n.getMilliseconds();

    const timeout = setTimeout(() => {
      setNow(new Date());
      const interval = setInterval(() => setNow(new Date()), 60_000);
      return () => clearInterval(interval);
    }, msToNextMin);

    return () => clearTimeout(timeout);
  }, []);

  const hours = now.toLocaleString([], { hour: '2-digit', hour12: false });
  const minutes = now.toLocaleString([], { minute: '2-digit' });

  return (
    <div className="flex flex-col items-center tabular-nums leading-none text-[#FFF4D6]">
      <span className="text-xl">{hours}</span>
      <span className="text-xl">{minutes}</span>
    </div>
  );
};

export const Dock = () => {
  const { openApp } = useWindowStore();
  const pinnedApps = Object.values(appsRegistry).filter((app) => app.pinned);

  return (
    <aside className="flex w-16 flex-col items-center justify-between rounded-2xl bg-[#5D341A] py-4 text-white">
      <div className="space-y-4">
        <div className="text-2xl font-bold">LC</div>

        <div className="flex justify-center">
          {pinnedApps.map((app) => (
            <AppIconButton
              key={app.id}
              onClick={() => openApp(app.id)}
              icon={app.icon}
              size="2xl"
              withBackground={false}
              className="overflow-hidden rounded-lg border-4 border-border_fg p-0"
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3">
        <DockClock />
        <button aria-label="Open Settings" className="btn-retro-icon retro-hover" title="Settings">
          ⚙️
        </button>
      </div>
    </aside>
  );
};
