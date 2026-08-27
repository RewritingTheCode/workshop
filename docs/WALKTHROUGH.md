# Walkthrough

The whole workshop, written out, so you can do it again on your own.

This is the loop RTC engineers use on the myRTC platform. It is five steps, and it does not
change based on how big the change is:

> **Context → Spec → Build → Validate → Ship**

Everything below is one pass through it. Do the pass three times and it stops being a list you
follow and starts being how you work.

Before you start, finish [SETUP.md](SETUP.md). You need Node 24 (or 22.13+), this repo cloned, and
`npm run dev` showing Jane Doe's portfolio at <http://localhost:5173>.

---

## Step 1. Context - do not let it write code yet

Open a terminal in the project and run `claude`. Then paste:

```
I want to build a personal portfolio site. Before we write any code, ask me
what you need to know: who it is for, what someone should learn in the first
30 seconds, and what the smallest useful version looks like. Do not propose an
implementation yet.
```

Notice what you just did. **The first prompt of a project should not produce code. It should
produce questions.** A model that starts building immediately is building for an imagined user,
and the imagined user is never the real one.

Answer its questions honestly and specifically. "For recruiters at mid-size tech companies who
will spend ninety seconds on it" is a useful answer. "For everyone" is not.

## Step 2. Spec - write the decision down before you build it

An **ADR** - Architecture Decision Record - is a one-page note saying what you decided, what you
rejected, and what you are accepting as a consequence. There are six in `docs/adr/` already.
Read [ADR-002](adr/ADR-002-scope.md) before you write yours; it is the shortest useful example.

```
Read docs/adr/ADR-TEMPLATE.md and docs/adr/ADR-002-scope.md.

Write an ADR in docs/adr/ for the decision we just talked through. Take the
next free number - list the directory first - and name the file
ADR-<number>-<slug>.md. Include: context, the decision, the options we
rejected and why, and the consequences we are accepting. One page. Do not
write any code.
```

ADR numbers are only ever handed out, never reused or renumbered. A decision that gets
overturned later gets a *new* ADR that supersedes the old one, and the old file stays exactly
where it is - because the thing you want in two years is the reasoning that was live at the
time, not a tidy sequence. "Take the next free number" is the whole rule.

Then **open the file and read the rejected-options section.** That section is the whole point.
Anyone can write down what they decided. Writing down what you turned away, and why, is what
stops you relitigating it in six months - and it is the part that tells you whether the model
actually understood the problem or just agreed with you.

If the rejected options are strawmen, the spec is not ready. Push back and regenerate.

## Step 3. Build - the ADR is the instruction

```
Implement the ADR you just wrote - use its filename.

Follow the existing patterns in src/components/. Content goes through
src/content/schema.ts - do not add a second source of truth. Keep it responsive
down to 320px. When you are done, run npm run check and fix anything red.
```

Two things are doing work in that prompt, and both are worth copying:

- **"Follow the existing patterns"** keeps the new code looking like the old code. Without it
  you get a second style in the same repo, and a repo with two styles is a repo nobody wants to
  read.
- **"Do not add a second source of truth"** is the constraint that keeps this codebase small.
  All content lives in `src/content/profile.ts`. Every time something else tries to become a
  source of content, say no.

If it goes in the wrong direction, interrupt it. Do not let it finish being wrong:

```
Stop. That is not what the ADR says. Re-read <your ADR filename> and do only
what is in it.
```

## Step 4. Your own content

Drop your resume in the project root - PDF or plain text is fine - then:

```
Read ./my-resume.pdf and rewrite src/content/profile.ts with my real
information. Follow src/content/schema.ts exactly. Keep the entry shapes, the
tags, and the sections array. Do not invent anything that is not in the resume
- if a field is not in there, leave it out. Then run npm test.
```

**The "do not invent anything" clause is not optional.** Without it you will get a
plausible-sounding job you never had, on a public page with your name on it. Constrain the
model hardest where the cost of being wrong is highest, and a fabricated internship on your
portfolio is about as high as that cost gets for a student.

Every entry gets a generated cover - a colour and an icon derived from its tags. To use a real
screenshot instead, make a `public/images/` folder, put the file in it, and point at it:

```ts
image: {
  src: '/images/my-project.png',
  alt: 'The dashboard, showing this week of data.',
},
```

A screenshot of the thing you built beats any stock photo, which is why nothing here ships with
one. The schema requires `alt` whenever there is an image, so `npm test` will tell you if you
forget it.

**The Download resume button needs its own file.** Importing your resume fills in the *text*;
it does not move the PDF anywhere. Until you deal with it, that button hands out
`public/resume-placeholder.pdf`, which is a blank page. Copy your real PDF into `public/` and
point `resumeUrl` at it - or delete the `resumeUrl` line, and the button disappears. Either is
fine. Offering a recruiter a blank PDF is not.

Note the file you copy in is *not* the one in the project root: `.gitignore` deliberately
excludes PDFs from the root, because that is where you dropped a resume carrying your phone
number and home address. `public/` is published, so put a copy there on purpose, knowing it
is public.

`npm test` is what catches the other failure mode. If the model drops a date or mangles a
`kind` field, `tests/content.test.ts` fails and names the exact field. That is the entire
reason the content lives in one typed file with a schema over it.

## Step 5. Validate - look at it, not just at the tests

```bash
npm run check
```

Four things, in order: lint, typecheck, tests, build. This is the same gate CI runs, which
means green here is a real prediction about green there.

Then do the two things a test suite cannot do for you:

- **Look at it.** Open <http://localhost:5173> and read your own page as a stranger would.
- **Squeeze the window as narrow as it goes.** `tests/responsive.test.tsx` catches fixed widths,
  but only your eyes catch a headline that wraps badly at 320px.

Tab through the page with the keyboard. You should always be able to see where you are. If you
cannot, that is a bug, not a preference.

## Step 6. Add a test for the thing you just changed

```
Add a test in tests/ that would fail if my timeline entries lost their dates
or their kind field. Run npm test and show me the output.
```

The rule to keep: **every behaviour change gets a test that would fail without it.** Not a test
that checks the markup rendered - a test that checks the behaviour happened.
`tests/timeline.test.tsx` is the example. It does not assert that three buttons exist. It
clicks one and asserts the work entries are gone.

Never delete or weaken a failing test to get to green. The test is usually right.

## Step 7. Ship - it is not done until it is on the internet

Put your Netlify token in `.env` first, per [SETUP.md](SETUP.md) step 6. Then:

```
I have NETLIFY_AUTH_TOKEN and NETLIFY_SITE_ID in my .env. Build the site and
deploy it to Netlify production. Show me the live URL when it is done.
```

Or do it yourself:

```bash
npm run deploy
```

Use that command rather than calling `npx netlify-cli` yourself. The CLI reads the token from
the environment your terminal is running in, and a `.env` file is not automatically part of that
environment - `npm run deploy` loads it for you. This is the single most common way this step
fails: the token is correct, it is in the right file, and the CLI still says "Authentication
required".

The first run asks which site to use. Choose **Create & configure a new site**, pick your team,
and give it a name. Afterwards, `npx netlify-cli status` prints the site id - put it in `.env`
and you will never be asked again.

Open the URL **in a private window**, not the one you are logged into Netlify in. If you see a
Netlify login screen, your site is set to team-members-only - a Netlify default that is right for
a company and wrong for a portfolio. [SETUP.md step 7](SETUP.md) fixes it with one command. Check
this before you give the link to anybody.

Open the URL. That is your site, on the real internet, at an address you can put on a resume.

---

## Do it again

That was one pass. Now pick something small - a skills grid, a "currently learning" callout, a
print stylesheet - and do all five steps again for it. Context, spec, build, validate, ship.

If you want the smallest possible version first, reorder the page. `profile.sections` in
`src/content/profile.ts` is the order of the page top to bottom, and the anchor nav follows it:
swap the two ids and both move together. It is one line, and it is a fair demonstration of what
the single-content-file rule buys you - [ADR-006](adr/ADR-006-section-order.md) is the write-up.

The third pass is where it stops feeling like ceremony. **That repetition is the entire skill.**

---

## When it breaks

It will. That is normal, and it is the most useful thing that can happen while you are learning.

| What happened | What to do |
| --- | --- |
| The model wrote code that does not work | Paste the error straight back: `This failed with: <error>. Fix it and rerun npm test.` |
| It fixed it wrong, twice | Stop. Ask it to explain what is failing in plain language before it tries again. Two attempts, then change approach. |
| It went off in its own direction | Interrupt. Point it back at the ADR by filename. |
| Tests are red after a content import | Read the failure - it names the field. Usually a date in the wrong format. |
| The deploy failed | Nine times out of ten it is the token. Check `.env` has no quotes and no trailing space, and make sure you ran `npm run deploy` rather than the CLI directly. |
| "Authentication required" with a token in `.env` | You called the CLI directly. Use `npm run deploy`. |
| You do not like how it looks | Say so, plainly: "the hero is too tall, make it about half that height." Faster than editing it yourself. |

## What this repo will not do for you

`docs/PRODUCTION-CHECKLIST.md` is the honest list of what a real production system needs and
what this one has. Three of its rows say **not in this repo**. Read those three first - knowing
what is missing is the part that makes you dangerous.
