import { useEffect, useState } from 'react';

export const AppCustomWaitCursor = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handleMove);

    const observer = new MutationObserver(() => {
      setBusy(document.body.dataset.busy === 'true');
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-busy'] });

    return () => {
      window.removeEventListener('mousemove', handleMove);
      observer.disconnect();
    };
  }, []);

  if (!busy) return null;

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[9999]"
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px)`,
      }}
    >
      <img
        src="/assets/cursors/wait.png"
        alt="Wait cursor"
        className="animate-spin-center h-8 w-8"
        style={{ transform: 'translate(-50%, -50%)' }}
      />
    </div>
  );
};
