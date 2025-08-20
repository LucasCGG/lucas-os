import React from 'react';
import AboutMeAvatar from './assets/Images/AboutMeAvatar.png';
import { Timeline } from '../../components';

type Skill = { title: string; emoji: string };

const skills: Skill[] = [
  { title: 'HTML', emoji: '🟧' },
  { title: 'CSS', emoji: '🟦' },
  { title: 'JS', emoji: '🟨' },
  { title: 'TS', emoji: '🔷' },
  { title: 'React', emoji: '⚛️' },
  { title: 'C#', emoji: '🟪' },
  { title: 'Tailwind', emoji: '🌬️' },
  { title: 'WordPress', emoji: '🧩' },
  { title: 'Figma', emoji: '🎨' },
  { title: 'Rive', emoji: '🎞️' },
  { title: 'Framer', emoji: '🎛️' },
  { title: 'Webflow', emoji: '🧱' },
];

const timeline = [
  { year: '2021', title: 'Started WISS School' },
  { year: '2023', title: 'Apprenticeship at Expertsahre AG' },
  { year: '2025', title: 'Successfully finished the EFZ', sub: 'Average grade of 5.6' },
  { year: 'Present', title: 'Studying CS in ZHAW', sub: 'Frontend Dev @ Expertsahre AG' },
];

export const AboutApp: React.FC = () => {
  return (
    <div className="bg-bg_green h-full min-h-0 w-full overflow-auto p-4 pb-[60px] text-text-dark">
      <div className="mx-auto max-w-[1200px]">
        <div className="flex flex-wrap items-start gap-8">
          <div className="flex flex-shrink-0 flex-col items-center [width:clamp(240px,28vw,100%)]">
            <img
              src={AboutMeAvatar}
              alt="Lucas avatar"
              className="h-72 w-72 rounded-full border-4 border-border_fg object-cover object-top p-1"
            />

            <div className="w-full flex-col">
              <h2 className="mt-6 text-xl font-semibold text-text-muted">My Skills</h2>

              <div className="mt-3 grid grid-cols-[repeat(auto-fit,minmax(2.75rem,1fr))] gap-3">
                {skills.map((s) => (
                  <div
                    key={s.title}
                    title={s.title}
                    className="flex aspect-square items-center justify-center rounded-2xl border border-border_fg bg-background text-lg"
                  >
                    <span aria-hidden>{s.emoji}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="leading-none">
              <p className="font-chunky text-[clamp(28px,6cqw,56px)] text-text-muted">
                Hey there, I’m
              </p>
              <span className="font-crisis text-[clamp(28px,6cqw,56px)] text-accent_orange">
                Lucas
              </span>
            </div>

            <p className="mt-6 max-w-prose text-sm leading-7 text-text-muted/90">
              I love bringing ideas to life with{' '}
              <a
                className="group relative underline decoration-accent_orange decoration-2 underline-offset-4 after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-accent_orange after:transition-transform after:duration-300 hover:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent_orange/50 group-hover:after:scale-x-100"
                href="#"
              >
                code
              </a>{' '}
              and{' '}
              <a
                className="group relative underline decoration-accent_orange decoration-2 underline-offset-4 after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-accent_orange after:transition-transform after:duration-300 hover:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent_orange/50 group-hover:after:scale-x-100"
                href="#"
              >
                design
              </a>{' '}
              — whether it’s building smooth frontend interfaces, animating with Rive, or hacking
              together backend logic. I’ve touched a bit of{' '}
              <a
                className="group relative underline decoration-accent_orange decoration-2 underline-offset-4 after:absolute after:-bottom-[2px] after:left-0 after:right-0 after:h-[3px] after:origin-left after:scale-x-0 after:bg-accent_orange after:transition-transform after:duration-300 hover:text-text-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent_orange/50 group-hover:after:scale-x-100"
                href="#"
              >
                everything
              </a>
              , and I’m always up for a new challenge. Whatever you throw at me, I’ll figure it out
              (and probably already have something for it ;P)
            </p>
          </div>
        </div>

        <Timeline items={timeline} horizontalMin={700} />
      </div>
    </div>
  );
};
