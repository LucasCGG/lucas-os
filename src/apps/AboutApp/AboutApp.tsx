import { FC } from "react";
import AboutMeAvatar from "./assets/Images/AboutMeAvatar.png";
import { AppIcon, Timeline } from "../../components";
import { AppEditable } from "../../components/cms";
import { useTrans } from "../../hooks/useTrans";

const skillIcons: Record<string, string> = {
    HTML: "icn-html",
    CSS: "icn-css",
    JS: "icn-js",
    React: "icn-react",
    "C#": "icn-csharp",
    WordPress: "icn-wordpress",
    Figma: "icn-figma",
    Rive: "icn-rive",
    Webflow: "icn-webflow",
};
const iconFor = (name: string) => skillIcons[name] ?? skillIcons[name.trim()] ?? "";

export const AboutApp: FC = () => {
    const { t, tc } = useTrans();

    const skillsRaw = t("app.about.skills", { returnObjects: true });
    const skills = Array.isArray(skillsRaw) ? (skillsRaw as string[]) : [];

    const timelineRaw = t("app.about.timeline", { returnObjects: true });
    const timelineData = Array.isArray(timelineRaw)
        ? (timelineRaw as { year: string; title: string; sub: string }[])
        : [];

    const timeline = timelineData.map((item) => ({
        year: item.year === "Present" ? t("com.timeline.presentLabel") : item.year,
        title: item.title,
        // sub holds the translated string (with tags); render tags via <Trans> children
        sub: tc(item.sub),
    }));

    return (
        <div className="h-full min-h-0 w-full overflow-auto bg-bg_green p-4 pb-16 text-text-dark">
            <div className="max-w-[1200px]">
                <div className="flex flex-wrap items-start justify-center gap-8 [container-type:inline-size] [@container(min-width:665px)]:justify-start">
                    {/* Avatar + Skills */}
                    <div className="order-2 flex w-full flex-shrink-0 flex-col items-center [@container(min-width:665px)]:order-1 [@container(min-width:665px)]:[width:clamp(240px,28vw,100%)]">
                        <img
                            src={AboutMeAvatar}
                            alt="Lucas avatar"
                            className="hidden aspect-square h-72 w-72 rounded-full border-4 border-border_fg object-cover object-top p-1 [@container(min-width:665px)]:block"
                        />

                        <div className="w-full flex-col">
                            <AppEditable id="app.about.skillsHeading">
                                <h2 className="mt-6 text-xl font-semibold text-text-muted">
                                    {t("app.about.skillsHeading")}
                                </h2>
                            </AppEditable>
                            <AppEditable id="app.about.skills">
                                <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(2.75rem,1fr))] gap-3">
                                    {skills.map((title) => (
                                        <div
                                            key={title}
                                            title={title}
                                            className="flex aspect-square items-center justify-center rounded-md bg-background p-2"
                                        >
                                            <AppIcon icon={iconFor(title)} size="auto" />
                                        </div>
                                    ))}
                                </div>
                            </AppEditable>
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
                                <AppEditable id="app.about.greeting">
                                    <p className="font-chunky text-3xl text-text-muted [@container(min-width:420px)]:text-4xl [@container(min-width:665px)]:text-5xl [@container(min-width:900px)]:text-6xl">
                                        {t("app.about.greetingPre")}
                                    </p>
                                    <span className="text-start font-crisis text-3xl text-accent_orange [@container(min-width:420px)]:text-4xl [@container(min-width:665px)]:text-5xl [@container(min-width:900px)]:text-6xl">
                                        {t("app.about.greetingName")}
                                    </span>
                                </AppEditable>
                            </div>
                        </div>

                        <AppEditable id="app.about.intro">
                            <p className="mt-6 max-w-prose text-sm leading-7 text-text-muted/90 [@container(min-width:420px)]:text-base [@container(min-width:665px)]:mx-0 [@container(min-width:900px)]:text-lg">
                                {tc("app.about.intro")}
                            </p>
                        </AppEditable>
                    </div>
                </div>

                <AppEditable id="app.about.timeline">
                    <Timeline items={timeline} horizontalMin={700} />
                </AppEditable>
            </div>
        </div>
    );
};
