import { SwitcheruGameBecauseNamingConventions } from "./apps/2048Replica";
import { AboutApp } from "./apps/AboutApp";
import { Browser } from "./apps/Browser";
import { Console } from "./apps/Console";
import { MailApp } from "./apps/MailApp";
import { PdfViewer } from "./apps/PdfViewer";

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
    browser: {
        id: "browser",
        title: "Browser",
        component: Browser,
        icon: "icn-browser",
        defaultSize: { width: 700, height: 500 },
        pinned: true,
    },
    pdfviewer: {
        id: "pdfviewer",
        title: "Pdf Viewer",
        component: PdfViewer,
        icon: "", // TODO: Implement "Browser Icon"
        defaultSize: { width: 700, height: 500 },
        pinned: false,
    },
    SwitcheruGameBecauseNamingConventions: {
        id: "SwitcheruGameBecauseNamingConventions",
        title: "2048",
        component: SwitcheruGameBecauseNamingConventions,
        icon: "icn-2048-app",
        defaultSize: {width: 300, height:400},
        pinned: true,
    }
};
