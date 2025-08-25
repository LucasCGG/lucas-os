import { AboutApp } from "./apps/AboutApp";
import { Console } from "./apps/Console";
import { MailApp } from "./apps/MailApp";

export const appsRegistry = {
    console: {
        id: "console",
        title: "Console",
        component: Console,
        icon: "icn-console-app",
        defaultSize: { width: 500, height: 400 },
        startPosition: { x: 100, y: 100 },
        pinned: true,
    },
    about: {
        id: "about",
        title: "About Me",
        component: AboutApp,
        icon: "icn-about-app",
        defaultSize: { width: 1000, height: 650 },
        pinned: true,
    },
    mail: {
        id: "mail",
        title: "Email",
        component: MailApp,
        icon: "icn-mail-app",
        defaultSize: { width: 700, height: 500 },
        pinned: true,
    },
};
