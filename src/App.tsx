import { AppCustomWaitCursor, Desktop } from './components';
import useDynamicTabTitle from './utils/useDynamicTitle';

export const App = () => {
  useDynamicTabTitle();
  return (
    <>
      <AppCustomWaitCursor />
      <div className="h-screen w-screen overflow-hidden">
        <Desktop />
      </div>
    </>
  );
};
