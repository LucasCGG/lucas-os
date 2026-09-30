export type ProjectScreenshot = {
    src: string;
    caption: string;
};

export type Project = {
    /** Folder name, also used for the screenshot directory under /files/projects. */
    id: string;
    name: string;
    year: string;
    category: string;
    summary: string;
    description: string[];
    stack: string[];
    /** Omit for private repositories, a link would only 404 for visitors. */
    repo?: string;
    live?: string;
    docs?: string;
    screenshots: ProjectScreenshot[];
};

const GITHUB = "https://github.com/LucasCGG";
const shot = (id: string, file: string, caption: string): ProjectScreenshot => ({
    src: `/files/projects/${id}/${file}`,
    caption,
});

// Newest first, this is the order the folders appear in.
export const projects: Project[] = [
    {
        id: "lucas-os",
        name: "LucasOS",
        year: "2025 – now",
        category: "Web",
        summary: "This portfolio: a retro desktop OS that runs in the browser.",
        description: [
            "A portfolio disguised as an operating system. Windows can be dragged, resized, minimized and maximized, and a dock launches the apps.",
            "Includes a terminal with a virtual file system and a set of commands, a mail client wired to EmailJS, a PDF viewer, a 2048 clone and a canvas dungeon crawler with its own small engine, sprite inspector and room editor.",
            "Text content is loaded from a JSON file and can be edited in place through a small built-in CMS. On phones it switches to a dedicated mobile layout.",
        ],
        stack: ["TypeScript", "React", "Vite", "Tailwind CSS", "Zustand", "i18next", "Canvas"],
        repo: `${GITHUB}/lucas-os`,
        screenshots: [
            shot("lucas-os", "desktop.jpg", "Desktop with the About Me app"),
            shot("lucas-os", "terminal.jpg", "Terminal with the virtual file system"),
            shot("lucas-os", "dungeon.jpg", "Dungeon game"),
        ],
    },
    {
        id: "hand-tracker",
        name: "Hand Tracker",
        year: "2026",
        category: "Experiment",
        summary: "Webcam hand tracking in the browser without any ML library.",
        description: [
            "Tracks a hand from the webcam using plain pixel processing: skin-colour segmentation, frame differencing to find motion, and erosion/dilation to clean up the mask.",
            "Candidate blobs are scored, checked for finger-like shapes, and smoothed between frames. The tracked point then drives an on-page cursor that fires hover events on whatever element it's over.",
            "Colour and motion thresholds are adjustable live with sliders.",
        ],
        stack: ["TypeScript", "React", "Vite", "Canvas", "getUserMedia"],
        repo: `${GITHUB}/hand-tracker`,
        screenshots: [],
    },
    {
        id: "game-engine-2d",
        name: "GameEngine2D",
        year: "2026",
        category: "Game dev",
        summary: "A 2D game engine built from scratch in Java with JavaFX.",
        description: [
            "No external libraries, just JavaFX. It has a delta-time game loop, keyboard and mouse input with per-frame state, and a scene system that switches between a level editor and a playable level.",
            "Also covers sprites and animated sprite sheets with an asset cache, a state-driven animator, a lerp follow camera, AABB and circle collision with triggers, audio with separate volume channels, and XP-based levelling.",
            "Includes an in-game sprite sheet inspector for tweaking frame sizes at runtime. Many of these ideas were later ported to the LucasOS dungeon game.",
        ],
        stack: ["Java 21", "JavaFX", "Gradle"],
        repo: `${GITHUB}/GameEngine2D`,
        screenshots: [],
    },
    {
        id: "wallycart",
        name: "WallyCart",
        year: "2025",
        category: "Backend",
        summary: "Shared shopping lists managed through WhatsApp, as a .NET API.",
        description: [
            "An ASP.NET Core API behind a WhatsApp bot. Families create groups, invite members and manage a shared shopping list by chatting with the bot.",
            "Talks to the WhatsApp Cloud API through webhooks. Users, groups, products and list items are stored in PostgreSQL via Entity Framework Core, and admin rights can be transferred between members.",
            "Covered by xUnit tests that run on GitHub Actions.",
        ],
        stack: ["C#", ".NET 9", "ASP.NET Core", "EF Core", "PostgreSQL", "WhatsApp Cloud API", "xUnit"],
        repo: `${GITHUB}/WallyCart`,
        screenshots: [],
    },
    {
        id: "animation-handler-for-rive",
        name: "Animation Handler for Rive",
        year: "2024 – 2025",
        category: "WordPress plugin",
        summary: "WordPress plugin that adds Rive animations to Elementor pages.",
        description: [
            "Adds a 'Rive Animation' widget to Elementor. You pick a .riv file from the media library, set the state machine name and layout fit, and drop it on the page.",
            "Animations render to a canvas and only start once they scroll into view, using an IntersectionObserver with a configurable threshold.",
            "Published as open source and my most-starred repository.",
        ],
        stack: ["PHP", "JavaScript", "WordPress", "Elementor", "Rive", "IntersectionObserver"],
        repo: `${GITHUB}/animation-handler-for-rive`,
        screenshots: [
            shot("animation-handler-for-rive", "screenshot-3.png", "Rive animation running on a live site"),
            shot("animation-handler-for-rive", "screenshot-1.png", "Widget settings in Elementor"),
            shot("animation-handler-for-rive", "screenshot-2.png", "Picking a .riv file from the media library"),
        ],
    },
    {
        id: "barcode-to-list",
        name: "Barcode to List",
        year: "2025",
        category: "Backend",
        summary: "WhatsApp bot that turns barcode photos into shopping list items.",
        description: [
            "Send the bot a photo of a product's barcode on WhatsApp and it's added to your family's shopping list. The Node version of the idea that later became WallyCart.",
            "Images are processed with Sharp and decoded with ZXing. Unknown barcodes are tracked until someone maps them to a product.",
            "Supports multiple families with admins, invites, promotions and removals, all through chat commands, stored in Firebase Firestore.",
        ],
        stack: ["JavaScript", "Node.js", "Express", "Twilio", "Firebase Firestore", "Sharp", "ZXing"],
        repo: `${GITHUB}/barcode-to-list`,
        screenshots: [],
    },
    {
        id: "smart-site-reviewer",
        name: "SmartSiteReviewer",
        year: "2024",
        category: "Tool",
        summary: "Desktop tool that writes AI reviews of websites from a CSV.",
        description: [
            "Load a CSV of website names and URLs, choose a model and write a prompt. The app sends each site to the OpenAI API and saves a structured review (performance, design, accessibility) plus a draft email to an output file.",
            "Built with a Tkinter GUI with progress feedback. Pairs with BusinessScraper to produce the input list.",
        ],
        stack: ["Python", "Tkinter", "OpenAI API"],
        repo: `${GITHUB}/SmartSiteReviewer`,
        screenshots: [],
    },
    {
        id: "business-scraper",
        name: "BusinessScraper",
        year: "2024",
        category: "Tool",
        summary: "Collects business listings for an area from the Google Places API.",
        description: [
            "Give it a location, a business category and a radius, and it pulls matching businesses from the Google Places API and exports them to a CSV with pandas.",
        ],
        stack: ["Python", "Google Places API", "pandas"],
        repo: `${GITHUB}/BusinessScraper`,
        screenshots: [],
    },
    {
        id: "dor",
        name: "DOR – WISS Lernjournal",
        year: "2023",
        category: "School project",
        summary: "Learning portal and work journal for WISS students and teachers, built as a team of four.",
        description: [
            "A team project for module 245 (Implementing innovative ICT solutions), built with Lukas Bühler, Linus Schönbächler and Martin Smidrkal. The goal was a single portal that pulls the school's scattered tools together, not a replacement for them.",
            "Students see their modules, each split into weekly blocks with side quests, and a Software Kiosk listing the software each module needs. Their work journal runs on a self-hosted HedgeDoc instance. Teachers and admins get role-based views to publish side quests and add or edit modules.",
            "Login uses Microsoft accounts through Azure AD (OAuth2 / OpenID Connect). The design went through four prototypes, refined with Figma usability tests on students.",
        ],
        stack: ["JavaScript", "Node.js", "Express", "Handlebars", "Azure AD", "Passport", "HedgeDoc", "Docker", "Figma"],
        docs: "https://hackmd.io/qDWtLToFTSSb6Dms08GqdQ",
        screenshots: [
            shot("dor", "home.jpg", "Home with pinned modules"),
            shot("dor", "module-teacher-view.jpg", "Module page in the teacher view, with weekly blocks and side quests"),
            shot("dor", "software-kiosk.jpg", "Software Kiosk"),
            shot("dor", "admin.jpg", "Admin page for managing modules"),
        ],
    },
    {
        id: "personal-website-v3",
        name: "Personal Website v3",
        year: "2023",
        category: "Web",
        summary: "Third version of my personal site, hosted on GitHub Pages.",
        description: [
            "A hand-written static site showing my programming, photography, drawings and 3D modelling, with lazy-loaded image galleries.",
            "A lighter redesign of the earlier dark versions.",
        ],
        stack: ["HTML", "CSS", "JavaScript", "jQuery", "Bootstrap"],
        repo: `${GITHUB}/LucasCGG.github.io`,
        live: "https://lucascgg.github.io/",
        screenshots: [
            shot("personal-website-v3", "home.jpg", "Home page"),
            shot("personal-website-v3", "drawings.jpg", "Drawings gallery"),
            shot("personal-website-v3", "3d-modelling.jpg", "3D modelling page"),
        ],
    },
    {
        id: "quizme",
        name: "QuizMe",
        year: "2023",
        category: "School project",
        summary: "Flashcard learning app, built for a software-testing module.",
        description: [
            "A full-stack flashcard app for creating learn sets and practising them card by card. Built for module 450 (Testing Applications).",
            "Spring Boot and JPA on MySQL for the API and React for the frontend. The focus was testing: unit tests, Selenium end-to-end tests and JaCoCo coverage reports.",
        ],
        stack: ["Java", "Spring Boot", "JPA", "MySQL", "React", "Selenium", "JaCoCo"],
        repo: `${GITHUB}/m450_applikation_testen`,
        screenshots: [],
    },
    {
        id: "tictactoe-android",
        name: "TicTacToe (Android)",
        year: "2023",
        category: "Mobile",
        summary: "Android tic-tac-toe app backed by Firebase.",
        description: [
            "A native Android tic-tac-toe game with a start screen and a game screen, using Firebase Realtime Database for game data.",
        ],
        stack: ["Java", "Android", "Firebase Realtime Database", "Gradle"],
        repo: `${GITHUB}/tictactoe`,
        screenshots: [],
    },
    {
        id: "personal-website-v2",
        name: "Personal Website v2",
        year: "2023",
        category: "Web",
        summary: "Second version of my personal site.",
        description: [
            "A redesign of v1 with a new homepage and portfolio layout, a slightly different colour palette and better responsiveness.",
        ],
        stack: ["HTML", "CSS", "JavaScript"],
        repo: `${GITHUB}/Website-V.02`,
        screenshots: [
            shot("personal-website-v2", "home.jpg", "Home page"),
            shot("personal-website-v2", "interests.jpg", "About and interests"),
        ],
    },
    {
        id: "personal-website-v1",
        name: "Personal Website v1",
        year: "2022 – 2023",
        category: "Web",
        summary: "The first version of my personal site.",
        description: [
            "My first personal website, built by hand with a dark theme and an image portfolio of photography and drawings.",
        ],
        stack: ["HTML", "CSS", "JavaScript"],
        repo: `${GITHUB}/Website-V.01`,
        screenshots: [
            shot("personal-website-v1", "home.jpg", "Home page"),
            shot("personal-website-v1", "projects.jpg", "Portfolio overview"),
        ],
    },
    {
        id: "lb-project",
        name: "LB Project",
        year: "2022",
        category: "School project",
        summary: "Browser game portal with accounts, Snake and a leaderboard (WISS modules 294 & 295).",
        description: [
            "A graded one-month project covering frontend (module 294) and backend (module 295). Users can sign up, log in, play Snake, and have their score posted to a leaderboard automatically when they're logged in.",
            "Games can be added to a searchable library, and users can change their details or delete their account. The React frontend talks to a Spring Boot REST API backed by MySQL.",
            "The full process is documented in the repo: use cases, database and class diagrams, screen mock-ups, the REST endpoints, test cases, Jest tests and an installation guide.",
        ],
        stack: ["JavaScript", "React", "Java", "Spring Boot", "Maven", "MySQL", "Jest"],
        repo: `${GITHUB}/LB_Project`,
        screenshots: [
            shot("lb-project", "snake.jpg", "Snake with live score"),
            shot("lb-project", "add-game.jpg", "Adding a game to the library"),
            shot("lb-project", "login.jpg", "Login with validation"),
            shot("lb-project", "home-mockup.jpg", "Home page mock-up from the design phase"),
            shot("lb-project", "database-model.png", "Database model"),
        ],
    },
    {
        id: "java-projects",
        name: "Java Projects",
        year: "2022",
        category: "Learning",
        summary: "Small Java Swing games and tools I built while learning Java.",
        description: [
            "A collection of early Java projects: Pong, Snake, TicTacToe and a calculator, each with a runnable .jar.",
        ],
        stack: ["Java", "Swing"],
        repo: `${GITHUB}/Java-Projects`,
        screenshots: [],
    },
];
