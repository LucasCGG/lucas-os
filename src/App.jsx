import { AppCustomWaitCursor, Desktop } from './components';

export default function App() {
  return (
    <>
      <AppCustomWaitCursor />
      <div className="h-screen w-screen overflow-hidden">
        <Desktop />
      </div>
    </>
  );
}
