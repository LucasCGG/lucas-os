import { AboutApp } from "./apps/AboutApp";

export const appsRegistry = {
    about: {
        id: "about",
        title: "About Me",
        component: AboutApp,
        icon: "👤", // TODO: Add Icon here instead of emoji
        defaultSize: { width: 400, height: 300 },
        pinned: true,
    },
};
