/**
 * ============================================================================
 * THIS IS THE ONLY FILE YOU EDIT TO MAKE THIS SITE YOURS.
 * ============================================================================
 *
 * Replace Jane Doe's information with your own. Everything else in `src/`
 * reads from here, so you should never have to hardcode a name, a job title,
 * or a date into a component.
 *
 * The shape is enforced by `src/content/schema.ts` and checked by
 * `tests/content.test.ts`. Run `npm test` after you edit this file - if you
 * get the shape wrong, the test tells you which field.
 *
 * Never invent content. If something is not in your resume, leave the field
 * out. This is a public page about you.
 *
 * Ordering does not matter. `Timeline` sorts by date, most recent first.
 */
import type { Profile } from './schema.ts';

export const profile: Profile = {
  name: 'Jane Doe',
  headline: 'Computer science student. I build things for the web.',
  intro:
    "I'm a third-year CS student who likes problems where the hard part is the people, not the algorithm. Most of what I build starts as something a friend complained about. I care a lot about making software that works on a five-year-old phone with two bars of signal.",
  location: 'Boston, MA',
  avatar: '/avatar-placeholder.svg',
  // Swap this for your own resume: drop the file in `public/` and point at it,
  // e.g. '/jane-doe-resume.pdf'. Remove the field entirely and the download
  // button disappears - better than offering a recruiter the placeholder.
  resumeUrl: '/resume-placeholder.pdf',

  // The page, top to bottom, under the hero. Move an id and the section and its
  // nav link move together; delete one and that section goes away entirely.
  // ['links', 'timeline'] puts how-to-reach-you above the history.
  // See docs/adr/ADR-006-section-order.md.
  sections: ['timeline', 'links'],

  links: [
    { label: 'GitHub', href: 'https://github.com/janedoe' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/janedoe' },
    { label: 'Email', href: 'mailto:jane.doe@example.com' },
  ],

  timeline: [
    // ---------------------------------------------------------------- work
    {
      id: 'northlight-swe-intern',
      kind: 'work',
      title: 'Software Engineering Intern',
      organization: 'Northlight Health',
      startDate: '2026-05',
      endDate: null,
      location: 'Boston, MA',
      summary:
        'Building patient-facing scheduling features on a React and TypeScript front end, with a small team that ships every Thursday.',
      highlights: [
        'Rebuilt the appointment reminder flow, cutting no-shows in the pilot clinic by 18% over eight weeks.',
        'Added the first accessibility tests to the front-end suite; the checkout path now passes axe with zero violations.',
        'Wrote the onboarding doc the next two interns used instead of asking me questions.',
      ],
      tags: ['React', 'TypeScript', 'Testing Library', 'Accessibility'],
      links: [],
    },
    {
      id: 'whitmore-hci-research',
      kind: 'work',
      title: 'Undergraduate Research Assistant',
      organization: 'Whitmore University, Human-Computer Interaction Lab',
      startDate: '2025-09',
      endDate: '2026-04',
      location: 'Boston, MA',
      summary:
        'Ran usability studies on a screen-reader navigation prototype and built the Python tooling that turned session recordings into something the team could actually read.',
      highlights: [
        'Moderated 24 sessions with blind and low-vision participants and wrote up the findings.',
        'Automated transcript coding in Python, taking analysis time from two days per study to about an hour.',
        'Second author on a workshop paper submitted to an accessibility conference.',
      ],
      tags: ['Python', 'User Research', 'Accessibility', 'Data Analysis'],
      links: [],
    },
    {
      id: 'riverside-library-dev',
      kind: 'work',
      title: 'Front-End Developer, Digital Services',
      organization: 'Riverside Public Library',
      startDate: '2024-09',
      endDate: '2025-05',
      location: 'Cambridge, MA',
      summary:
        'Part-time role rebuilding the event calendar that library staff had been maintaining by hand in a spreadsheet.',
      highlights: [
        'Shipped a mobile-first calendar; phone traffic to event pages roughly doubled in the first month.',
        'Trained four staff members on the new admin flow so they stopped needing me to publish events.',
        'Brought the site from 61 to 98 on Lighthouse accessibility.',
      ],
      tags: ['JavaScript', 'CSS', 'Netlify'],
      links: [],
    },

    // ------------------------------------------------------------ projects
    {
      id: 'trailhead',
      kind: 'project',
      title: 'Trailhead',
      startDate: '2026-01',
      endDate: null,
      summary:
        'A trail finder for people without signal. It caches maps and trail notes on your phone before you leave the parking lot.',
      highlights: [
        'Offline-first with a service worker and IndexedDB; the whole app works in airplane mode.',
        'Around 400 people used it during the spring hiking season without me telling anyone about it.',
        'The interesting bug was time zones. It is always time zones.',
      ],
      tags: ['React', 'TypeScript', 'PWA', 'Leaflet'],
      links: [{ label: 'Source', href: 'https://github.com/janedoe/trailhead' }],
    },
    {
      id: 'studyloop',
      kind: 'project',
      title: 'Studyloop',
      startDate: '2025-06',
      endDate: '2025-09',
      summary:
        'A spaced-repetition study tool built for a friend who kept forgetting organic chemistry mechanisms the week after the exam.',
      highlights: [
        'Implemented the SM-2 scheduling algorithm from the paper rather than pulling in a library.',
        'Keyboard-only review mode, because reaching for the mouse every four seconds ruins the flow.',
        'Eleven people in her study group used it through finals.',
      ],
      tags: ['React', 'TypeScript', 'IndexedDB', 'Algorithms'],
      links: [{ label: 'Source', href: 'https://github.com/janedoe/studyloop' }],
    },
    {
      id: 'bus-time-bot',
      kind: 'project',
      title: 'Bus Time Bot',
      startDate: '2024-11',
      endDate: '2025-02',
      summary:
        'A small bot that posts real delays for the two bus routes my dorm depends on, because the official app rounds everything to "5 min".',
      highlights: [
        'Polls the transit agency GTFS-realtime feed and posts to a group chat when a bus is more than six minutes late.',
        'Runs on a free scheduled function; costs nothing to keep alive.',
        'Taught me more about retries and rate limits than any class did.',
      ],
      tags: ['Python', 'GTFS', 'Serverless'],
      links: [{ label: 'Source', href: 'https://github.com/janedoe/bus-time-bot' }],
    },
  ],
};
