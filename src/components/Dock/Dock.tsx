import { useEffect, useMemo, useState } from 'react';
import { useWindowStore } from '../../store';
import { appsRegistry } from '../../apps';
import { AppIconButton } from '../AppIconButton';
import { AppIcon } from '../AppIcon';

const DockClock = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const tick = () => setNow(new Date());

    const n = new Date();
    const msToNextMin = (60 - n.getSeconds()) * 1000 - n.getMilliseconds();

    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 60_000);
    }, msToNextMin);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  const { hours, minutes } = useMemo(() => {
    return {
      hours: now.toLocaleString([], { hour: '2-digit', hour12: false }),
      minutes: now.toLocaleString([], { minute: '2-digit'}),
    };
  }, [now]);

  return (
    <div className="flex w-full flex-col items-center tabular-nums leading-none text-[#FFF4D6]">
      <span className="text-2xl">{hours}</span>
      <span className="text-2xl">{minutes}</span>
    </div>
  );
};

export const Dock = () => {
  const { openApp } = useWindowStore();

  const pinnedApps = useMemo(
    () => Object.values(appsRegistry).filter((app) => app.pinned),
    [appsRegistry]
  );

  return (
    <aside className="flex w-20 flex-col items-center justify-between rounded-2xl bg-[#5D341A] px-2 py-4 text-white">
      {useMemo(
        () => (
          <>
            <AppIcon icon="icn-logo-simple" />

            <div className="flex-col justify-center">
              {pinnedApps.map((app) => (
                <AppIconButton
                  key={app.id}
                  onClick={() => openApp(app.id)}
                  icon={app.icon}
                  size="full"
                  withBackground={false}
                  className="aspect-square w-full overflow-hidden p-0"
                />
              ))}
            </div>
          </>
        ),
        [pinnedApps]
      )}

      <DockClock />
    </aside>
  );
};
