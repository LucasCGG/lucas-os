import React from "react";
import AboutMeAvatar from "./assets/Images/AboutMeAvatar.png";
import { AppIcon, Timeline } from "../../components";

type Skill = { title: string; icon: string };

const skills: Skill[] = [
    { title: "HTML", icon: "icn-html" },
    { title: "CSS", icon: "icn-css" },
    { title: "JS", icon: "icn-js" },
    { title: "React", icon: "icn-react" },
    { title: "C#", icon: "icn-csharp" },
    { title: "WordPress", icon: "icn-wordpress" },
    { title: "Figma", icon: "icn-figma" },
    { title: "Rive", icon: "icn-rive" },
    { title: "Webflow", icon: "icn-webflow" },
];

const timeline = [
    {
        year: "2021",
        title: "Started WISS School",
        sub: "Began my EFZ program in software development.",
    },
    {
        year: "2023",
        title: "Apprenticeship @ Expertshare AG",
        sub: (
            <>
                Worked on{" "}
                <span className="group relative cursor-text underline decoration-accent_orange decoration-2 underline-offset-4 after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-accent_orange after:transition-transform after:duration-300 hover:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent_orange/50 group-hover:after:scale-x-100">
                    SaaS platforms SD
                </span>
                , UI/UX, and web apps.
            </>
        ),
    },
    {
        year: "2025",
        title: "EFZ Graduation & Awards",
        sub: (
            <>
                Graduated with <b>5.6 Grade</b>,{" "}
                <span className="group relative cursor-text underline decoration-accent_orange decoration-2 underline-offset-4 after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-accent_orange after:transition-transform after:duration-300 hover:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent_orange/50 group-hover:after:scale-x-100">
                    ZLI Award
                </span>{" "}
                &{" "}
                <span className="group relative cursor-text underline decoration-accent_orange decoration-2 underline-offset-4 after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-accent_orange after:transition-transform after:duration-300 hover:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent_orange/50 group-hover:after:scale-x-100">
                    {" "}
                    Best in Rank
                </span>
                .
            </>
        ),
    },
    {
        year: "Present",
        title: "Lead Frontend Dev & CS Student",
        sub: (
            <>
                Leading frontend at{" "}
                <span className="group relative cursor-text underline decoration-accent_orange decoration-2 underline-offset-4 after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-accent_orange after:transition-transform after:duration-300 hover:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent_orange/50 group-hover:after:scale-x-100">
                    expertshare AG
                </span>{" "}
                while studying{" "}
                <span className="group relative cursor-text underline decoration-accent_orange decoration-2 underline-offset-4 after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-accent_orange after:transition-transform after:duration-300 hover:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent_orange/50 group-hover:after:scale-x-100">
                    Computer Science
                </span>{" "}
                at ZHAW.
            </>
        ),
    },
];

export const AboutApp: React.FC = () => {
    return (
        <div className="h-full min-h-0 w-full overflow-auto bg-bg_green p-4 pb-16 text-text-dark">
            <div className="max-w-[1200px]">
                <div className="flex flex-wrap items-start justify-center gap-8 [container-type:inline-size] [@container(min-width:665px)]:justify-start">
                    {/* Avatar + Skills */}
                    <div className="order-2 flex w-full flex-shrink-0 flex-col items-center [@container(min-width:665px)]:order-1 [@container(min-width:665px)]:[width:clamp(240px,28vw,100%)]">
                        {/* Large avatar only on wide containers */}
                        <img
                            src={AboutMeAvatar}
                            alt="Lucas avatar"
                            className="hidden aspect-square h-72 w-72 rounded-full border-4 border-border_fg object-cover object-top p-1 [@container(min-width:665px)]:block"
                        />

                        <div className="w-full flex-col">
                            <h2 className="mt-6 text-xl font-semibold text-text-muted">
                                My Skills
                            </h2>
                            <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(2.75rem,1fr))] gap-3">
                                {skills.map((s) => (
                                    <div
                                        key={s.title}
                                        title={s.title}
                                        className="flex aspect-square items-center justify-center rounded-md bg-background p-2"
                                    >
                                        <AppIcon icon={s.icon} size="auto" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="order-1 min-w-[257px] flex-1 [width:clamp(665px,28vw,100%)] [@container(min-width:665px)]:order-2">
                        <div className="flex flex-col items-center gap-4 text-center [@container(min-width:355px)]:flex-row [@container(min-width:355px)]:justify-start [@container(min-width:665px)]:justify-start [@container(min-width:665px)]:text-left">
                            <img
                                src={AboutMeAvatar}
                                alt="Lucas avatar small"
                                className="block aspect-square h-32 w-32 rounded-full border-4 border-border_fg object-cover object-top p-1 [@container(min-width:665px)]:hidden"
                            />

                            <div className="text-start leading-[1.1]">
                                <p className="font-chunky text-3xl text-text-muted [@container(min-width:420px)]:text-4xl [@container(min-width:665px)]:text-5xl [@container(min-width:900px)]:text-6xl">
                                    Hey there, I’m
                                </p>
                                <span className="text-start font-crisis text-3xl text-accent_orange [@container(min-width:420px)]:text-4xl [@container(min-width:665px)]:text-5xl [@container(min-width:900px)]:text-6xl">
                                    Lucas
                                </span>
                            </div>
                        </div>

                        <p className="mt-6 max-w-prose text-sm leading-7 text-text-muted/90 [@container(min-width:420px)]:text-base [@container(min-width:665px)]:mx-0 [@container(min-width:900px)]:text-lg">
                            I love bringing ideas to life with{" "}
                            <a
                                className="group relative cursor-text underline decoration-accent_orange decoration-2 underline-offset-4 after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-accent_orange after:transition-transform after:duration-300 hover:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent_orange/50 group-hover:after:scale-x-100"
                                href="#"
                            >
                                code
                            </a>{" "}
                            and{" "}
                            <a
                                className="group relative cursor-text underline decoration-accent_orange decoration-2 underline-offset-4 after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-accent_orange after:transition-transform after:duration-300 hover:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent_orange/50 group-hover:after:scale-x-100"
                                href="#"
                            >
                                design
                            </a>{" "}
                            — whether it’s building smooth frontend interfaces, animating with Rive,
                            or hacking together backend logic. I’ve touched a bit of{" "}
                            <a
                                className="group relative cursor-text underline decoration-accent_orange decoration-2 underline-offset-4 after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-accent_orange after:transition-transform after:duration-300 hover:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent_orange/50 group-hover:after:scale-x-100"
                                href="#"
                            >
                                everything
                            </a>
                            , and I’m always up for a new challenge. Whatever you throw at me, I’ll
                            figure it out (and probably already have something in mind for it ;P)
                        </p>
                    </div>
                </div>

                <Timeline items={timeline} horizontalMin={700} />
            </div>
        </div>
    );
};
