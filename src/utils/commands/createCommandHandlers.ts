import { useWindowStore } from "../../store";

type FileSystemNode = {
  type: "file" | "directory";
  content?: string;
  children?: Record<string, FileSystemNode>;
};

export type CommandOutput =
  | string
  | "__CLEAR__"
  | {
      type: "confirm";
      message: string;
      perform: () => string | Promise<string>;
    };

export const confirm = (
  message: string,
  perform: () => string | Promise<string>
): CommandOutput => ({ type: "confirm", message, perform });

let currentPath = ["~"];

let fileSystem: Record<string, FileSystemNode> = {
  "~": {
    type: "directory",
    children: {
      apps: {
        type: "directory",
        children: {
          about: { type: "file", content: "About App" },
          projects: { type: "file", content: "Projects App" },
          terminal: { type: "file", content: "Terminal App" },
        },
      },
      documents: {
        type: "directory",
        children: {
          "readme.txt": {
            type: "file",
            content: "This is a fake terminal.\nFeel free to explore.",
          },
          "about_me.txt": {
            type: "file",
            content: `
Hi, I'm Lucas Gabriel Colaço 👋

I'm a Software Developer passionate about building scalable web apps, intuitive UIs, and modern digital experiences.

📍 Based in Zürich, Switzerland  
🎓 EFZ Applikationsentwickler (Grade: 5.6, ZLI Award, Best in Rank 2025)  
💻 Lead Frontend Dev @ expertshare AG  
📚 CS Student @ ZHAW  
🌐 Portfolio / Terminal: You're looking at it right now ;P

Core Skills:
- Frontend: React, JavaScript, HTML, CSS, SCSS
- Backend: C#, .NET, REST APIs, PostgreSQL
- Design & UX: Figma, Webflow, Rive Animations, Elementor
- Tools: Git, Postman, OBS Studio, Adobe Suite

Links:
- LinkedIn:<a>https://www.linkedin.com/in/lucas-gabriel-colaco/</a>
- GitHub: https://github.com/LucasCGG
- Instagram: https://www.instagram.com/lucas.gabriel.cc/
          `.trim(),
          },
          "skills.txt": {
            type: "file",
            content: `
Technical Skills Overview:

Frontend:
- ReactJS / JSX
- HTML / CSS / SCSS
- JavaScript / TypeScript

Backend:
- C# / .NET
- PostgreSQL
- REST APIs & Webhooks

Design & Prototyping:
- Figma, Webflow, Rive, Elementor
- Adobe Photoshop & Premiere

Other Tools:
- Git, Postman, OBS Studio, Framer

Languages:
- German (Fluent)
- English (Fluent)
- Portuguese (Fluent)
- French (Intermediate)
          `.trim(),
          },
          "timeline.txt": {
            type: "file",
            content: `
Career Timeline:

2021 → Started WISS School  
    • Began EFZ program in software development.

2023 → Apprenticeship @ Expertshare AG  
    • Worked on SaaS platforms, UI/UX, and web apps.

2025 → EFZ Graduation & Awards  
    • Graduated with a 5.6 grade.
    • Received ZLI Award & Best in Rank.

Present → Lead Frontend Developer & CS Student  
    • Leading frontend development @ expertshare AG.
    • Studying Computer Science at ZHAW.
          `.trim(),
          },
          "contacts.txt": {
            type: "file",
            content: `
Contact Information:

📧 Email: colaco.lucasgabriel@gmail.com
📱 Phone: +41 78 800 95 78
🌐 LinkedIn: https://www.linkedin.com/in/lucas-gabriel-colaco/
💻 GitHub: https://github.com/LucasCGG
📸 Instagram: https://www.instagram.com/lucas.gabriel.cc/
🏠 Location: Hüttikon, Switzerland
          `.trim(),
          },
        },
      },
      downloads: {
        type: "directory",
        children: {
          "lucas_cv.txt": {
            type: "file",
            content: `
Lucas Gabriel Colaço — Software Developer

Summary:
I enjoy making tech feel simple — for users, and for the teams building it. Passionate about clean, scalable, and user-friendly solutions.

Experience:
2023-2025 → Software Developer @ expertshare AG
    - Developed and maintained SaaS platforms & CRM websites.
    - Improved UI/UX for brand consistency.
    - Supported OBS live streams for hybrid events.

Private Projects:
- Barcode to Shopping List (v2) → WhatsApp + .NET + PostgreSQL integration.
- Rive Animation Handler → Integrated Rive animations dynamically into WordPress.
- BusinessScraper → Python tool using Google Places API.

Education:
- EFZ Applikationsentwickler @ WISS (Grade 5.6, ZLI Award, Best in Rank 2025).
- CS Student @ ZHAW.

Skills:
React · C# · .NET · PostgreSQL · Webflow · WordPress · Figma · Rive · OBS Studio · Adobe Suite

GitHub:
- https://github.com/LucasCGG
- https://github.com/LucasCGG/WallyCart
- https://github.com/LucasCGG/barcode-to-list
- https://github.com/LucasCGG/animation-handler-for-rive
- https://github.com/LucasCGG/BusinessScraper
          `.trim(),
          },
        },
      },
      ".secrets": {
        type: "directory",
        children: {
          "passwords.txt": {
            type: "file",
            content: `root: hunter2\nadmin: bread123\nlucas: ducklover`,
          },
        },
      },
      system32: {
        type: "directory",
        children: {
          kernel: {
            type: "file",
            content: "Binary gibberish\nDo not delete this file. Seriously.",
          },
        },
      },
      ducks: {
        type: "directory",
        children: {
          "duck_facts.txt": {
            type: "file",
            content: `
Duck Facts:
- Ducks have waterproof feathers.
- Male ducks are called drakes.
- Ducks have 3 eyelids.
- Bread is not good for ducks (but this OS loves it anyway).
          `.trim(),
          },
          "pond_log.txt": {
            type: "file",
            content: `
Pond Observation Log:
- 06:00 🦆  spotted eating bread.
- 08:15 🦆  attempted to hack mainframe.
- 12:00 🦆  took a nap under a lilypad.
- 15:00 🦆  initiated Duck Mode activation sequence.
          `.trim(),
          },
          "bread_manifesto.txt": {
            type: "file",
            content: `
The Bread Manifesto

We, the ducks of QuackdiOS, declare:
- All crumbs shall be shared equally.
- Stale bread is a war crime.
- One day, all terminals will be made of rye.

🦆🍞
          `.trim(),
          },
        },
      },
    },
  },
};

export function createCommandHandlers({
  duckCount,
  setDuckCount,
  duckMode,
  setDuckMode,
  duckModeActivatedAt,
  setDuckModeActivatedAt,
}: {
  duckCount: number;
  setDuckCount: (count: number) => void;
  duckMode: boolean;
  setDuckMode: (mode: boolean) => void;
  duckModeActivatedAt: number | null;
  setDuckModeActivatedAt: (time: number | null) => void;
}) {
  const bootTime = Date.now();

  function resolvePath(pathArray: string[]): FileSystemNode | null {
    let node: FileSystemNode = fileSystem["~"];
    for (const part of pathArray.slice(1)) {
      if (node.type === "directory" && node.children?.[part]) {
        node = node.children[part];
      } else {
        return null;
      }
    }
    return node;
  }

  function currentDirNode(): FileSystemNode {
    return resolvePath(currentPath) as FileSystemNode;
  }

  function pathString(): string {
    return currentPath.join("/");
  }

  return {
    help: () => {
      if (duckMode) {
        return `
DuckdiOS Command Menu (QUACK MODE):
- quack           Talk to the OS duck
- bread           Offer bread to the OS duck
- pond            Visit the virtual pond
- duckmode        Check if you're in Duck Mode
- duckstats       See how long Duck Mode has been active
- unduck          Return to boring human mode
- waddle          Just... waddles
- honk?           no.
        `.trim();
      }

      return `
Available commands:
- help            Show this help menu
- clear           Clear the terminal screen
- ls              List items in current directory
- cd [dir]        Change fake directory
- pwd             Print current directory
- whoami          Show user identity
- date            Show current date/time
- uptime          Time since terminal was opened
- echo [text]     Print text back
- open [app]      Open an app (e.g. open about)
- close [app]     Close an app
- minimize [app]  Minimize an app
- maximize [app]  Maximize an app
- mkdir [dir]     Create a new fake directory
- touch [file]    Create a new fake file
- cat [file]      Display contents of a fake file
- rm [name]       Delete a fake file or folder (dangerous!)
- quack           Talk to the OS duck
- duckmode        Check Duck Mode status
- duckstats       See Duck Mode uptime
- unduck          Disable Duck Mode (why would you tho?)
- waddle          Just... waddles
      `.trim();
    },

    clear: () => "__CLEAR__",

    ls: () => {
      const node = currentDirNode();
      if (node.type !== "directory") return "Not a directory";
      return Object.keys(node.children ?? {}).join("  ");
    },

    cd: (args: string[]) => {
      if (duckMode) return "cd: ducks don't do directories.";
      const dir = args[0];
      if (!dir) return "Usage: cd [directory]";
      if (dir === "..") {
        if (currentPath.length > 1) currentPath.pop();
        return `Moved to ${pathString()}`;
      }
      const next = resolvePath([...currentPath, dir]);
      if (!next || next.type !== "directory") return `cd: no such directory: ${dir}`;
      currentPath.push(dir);
      return `Moved to ${pathString()}`;
    },

    pwd: () => (duckMode ? "/pond/nest/bread" : pathString()),

    mkdir: (args: string[]) => {
      if (duckMode) return "mkdir: ducks don't need folders, we have nests.";
      const name = args[0];
      if (!name) return "Usage: mkdir [name]";
      const node = currentDirNode();
      if (node.children?.[name]) return "Directory already exists.";
      node.children![name] = { type: "directory", children: {} };
      return `Directory "${name}" created.`;
    },

    touch: (args: string[]) => {
      if (duckMode) return "touch: touching files is weird. Try bread instead.";
      const name = args[0];
      if (!name) return "Usage: touch [filename]";
      const node = currentDirNode();
      node.children![name] = { type: "file", content: "" };
      return `File "${name}" created.`;
    },

    cat: (args: string[]) => {
      if (duckMode) return "cat: QuackdiOS prefers ducks, not cats.";
      const name = args[0];
      const node = currentDirNode();
      const file = node.children?.[name];
      if (!file || file.type !== "file") return `cat: ${name}: No such file`;
      return file.content ?? "";
    },

    rm: (args: string[]): CommandOutput => {
      if (duckMode) return "rm: Ducks never forget. But they also don't delete.";
      const name = args[0];
      const node = currentDirNode();
      if (!name) return "Usage: rm [name]";
      if (!node.children?.[name]) {
        return `rm: cannot remove '${name}': No such file or directory`;
      }

      // choose which names are “dangerous”
      const dangerous = new Set(["kernel", "system32"]);
      if (dangerous.has(name)) {
        return confirm(`rm:"${name}". Are you sure? (Y/N)`, () => {
          delete node.children![name];
          return `'${name}' removed. May the ducks be with you.`;
        });
      }

      delete node.children[name];
      return `'${name}' removed.`;
    },

    sudo: () =>
      duckMode ? "🦆 You already have full duck privileges." : "You have no power here.",

    hack: () =>
      duckMode
        ? "Hacking the pond security perimeter...\n🦆 Too powerful. Abort."
        : "Attempting to breach the mainframe...\nACCESS DENIED\nYour IP has been logged 😈",

    fortune: () =>
      duckMode
        ? "One day, all computers will be made of breadcrumbs."
        : "You will debug something for 6 hours just to realize it's a typo.",

    whoami: () => (duckMode ? "duck@pond:~$" : "lucas@lucasos:~$"),

    date: () => (duckMode ? "🦆 It's always time for a swim." : new Date().toString()),

    uptime: () => {
      if (duckMode) return "🦆 You've been quacking for far too long.";
      const seconds = Math.floor((Date.now() - bootTime) / 1000);
      return `Uptime: ${seconds} seconds`;
    },

    echo: (args: string[]) =>
      duckMode ? "quack quack quack " + "🦆".repeat(args.length) : args.join(" "),

    open: (args: string[]) => {
      if (duckMode) return `You try to open "${args[0]}", but it's just... feathers.`;
      const appId = args[0];
      if (!appId) return "Specify an app to open.";
      useWindowStore.getState().openApp(appId);
      return `Opening "${appId}" app...`;
    },

    close: (args: string[]) => {
      if (duckMode) return `You try to close "${args[0]}", but ducks don't close things.`;
      const appId = args[0];
      if (!appId) return "Specify an app to close.";
      useWindowStore.getState().closeApp(appId);
      return `Closing "${appId}" app...`;
    },

    minimize: (args: string[]) => {
      if (duckMode) return `Minimizing? More like diving underwater.`;
      const appId = args[0];
      if (!appId) return "Specify an app to minimize.";
      useWindowStore.getState().minimizeApp(appId);
      return `Minimizing "${appId}"...`;
    },

    maximize: (args: string[]) => {
      if (duckMode) return `Maximizing? My feathers are already puffed.`;
      const appId = args[0];
      if (!appId) return "Specify an app to maximize.";
      useWindowStore.getState().toggleFullscreenApp(appId);
      return `Toggling fullscreen on "${appId}"...`;
    },

    // Duck-specific commands
    bread: () => {
      if (!duckMode) return "bread: command not found. Try quack-ing first.";
      return "🍞 You toss a piece of bread. Somewhere, a duck smiles.";
    },

    pond: () => {
      if (!duckMode) return "You approach the pond. Nothing happens.";
      return `
      ~  ~   🦆    ~     ~
  ~     ~       ~    ~
       ~     🐟     ~    🪷
  You feel calm. The pond accepts you.
      `.trim();
    },

    duckstats: () => {
      if (!duckMode || !duckModeActivatedAt) return "Duck Mode is OFF.";
      const seconds = Math.floor((Date.now() - duckModeActivatedAt) / 1000);
      return `🦆 Duck Mode has been active for ${seconds} seconds.`;
    },

    quack: () => {
      const newCount = duckCount + 1;
      setDuckCount(newCount);

      if (newCount >= 10 && !duckMode) {
        setDuckMode(true);
        setDuckModeActivatedAt(Date.now());
        return "🦆 Duck Mode activated. All commands must now be spoken in Quack.";
      }

      const responses = [
        "quack.",
        "QUACK!",
        "quack quack quack...",
        "bread?",
        "Where's the pond?",
        "*waddles aggressively*",
        "You dare speak to me, featherless biped?",
        "QuackdiOS is listening.",
        "System overheating: too much bread.",
        "What’s it like... to not be a duck?",
        "*stares at you with beady eyes*",
        "Why is this human talking to me?",
        "Did you just try to talk duck to me?",
        "Your IP has been logged... quack.",
        "404: Pond not found.",
        "Executing `quack --force`... complete.",
        "🦆🦆🦆🦆🦆",
      ];

      const randomIndex = Math.floor(Math.random() * responses.length);
      return responses[randomIndex];
    },

    duck: (args: string[]) => {
      if (!duckMode) return "duck: command only available in Duck Mode.";
      const name = args[0];
      const node = currentDirNode();
      const file = node.children?.[name];
      if (!file || file.type !== "file") return `duck: ${name}: No such file`;
      return file.content ?? "";
    },

    duckmode: () => (duckMode ? "🦆 Duck Mode is currently ACTIVE." : "Duck Mode is OFF."),

    unduck: () => {
      setDuckMode(false);
      setDuckCount(0);
      setDuckModeActivatedAt(null);
      return "Duck Mode deactivated. You're no longer speaking quack.";
    },

    waddle: () => "Waddle waddle",
  };
}
