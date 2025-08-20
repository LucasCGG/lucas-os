import { AboutApp } from './apps/AboutApp';

export const appsRegistry = {
  about: {
    id: 'about',
    title: 'About Me',
    component: AboutApp,
    icon: 'icn-about-app',
    defaultSize: { width: 400, height: 300 },
    pinned: true,
  },
};
