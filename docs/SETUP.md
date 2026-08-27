# Setup

About ten minutes. Everything here is free, and you only do it once.

Do this **before** the workshop. If you turn up at minute 0 with these five things done, you
spend the session building. If you do not, you spend it installing Node while other people
build, and we would much rather you were building.

---

## 1. Node.js

Download it from [nodejs.org](https://nodejs.org). Take the **LTS** version - whatever the big
green button offers is right.

Check it worked - open a terminal and run:

```bash
node -v
```

You need **Node 24 (the current LTS), or 22.13 or newer**. Node 20 reached end of life in April
2026 and no longer gets security updates, so this project does not build on it. If you
just installed it you are fine. The awkward case is an old Node still sitting on your machine
from last year: `v20.5` looks close enough but is not, and the build tools will refuse it.

If it is too old, `npm install` stops immediately and tells you so in plain English - it will
not let you get halfway and then fail confusingly. If you see `command not found`, the install
did not finish; try again and restart your terminal afterwards.

## 2. A GitHub account

[github.com](https://github.com). If you already have one, you are done with this step.

## 3. A Netlify account, and one access token

This is the step with a waiting-on-email risk, so do it first if you are short on time.

1. Sign up at [netlify.com](https://netlify.com) **using your GitHub account**. Fastest path,
   no separate password.
2. Click your avatar, top right, then **User settings**.
3. In the left sidebar, **Applications**.
4. Scroll to **Personal access tokens** and click **New access token**.
5. Name it something like "portfolio workshop". Leave the expiry at the default.
6. **Copy the token somewhere you can find it.** It is only shown once. If you lose it, no
   harm done - just delete it and make another.

You will paste this exactly once, in step 6 below.

## 4. Claude Code

Install it from [claude.ai/code](https://claude.ai/code), then confirm:

```bash
claude --version
```

## 5. Get your own copy of this project

On the repo page, click the green **Use this template** button, then **Create a new repository**.
Call it `my-portfolio` and make it public. You now own the code outright, with a history that
starts with you.

Do it this way rather than forking. This is going on your resume, and a fork carries a permanent
"forked from RewritingTheCode/workshop" label at the top of the page - which makes your work look
like somebody else's project that you copied.

Now clone the repo you just made. Swap in your own GitHub username:

```bash
git clone https://github.com/YOUR-USERNAME/my-portfolio.git
cd my-portfolio
npm install
npm run dev
```

Open <http://localhost:5173>. You should see a finished portfolio for a fictional person named
Jane Doe. If you do, you are fully set up.

> Only here to look around, and not planning to keep it? Clone this repo directly with
> `git clone https://github.com/RewritingTheCode/workshop.git my-portfolio`. Everything in the
> workshop works exactly the same - you just will not have anywhere to push your own changes.

### If your laptop fights you: build it in the browser instead

If Node will not install - a locked-down work laptop, no admin rights, an install that keeps
failing - you do not need to fix it to take part. This repo ships a dev container, so GitHub
can give you a ready-made machine in your browser with Node and Claude Code already on it.

Make your own copy with **Use this template** as above, then skip the `git clone` entirely.
On **your** repo's page: green **Code** button → **Codespaces** tab → **Create codespace on main**.
Give it two or three minutes. Dependencies install themselves, and `npm run dev` will pop a
"port 5173" notification - click **Open in Browser**.

Everything else in this guide works exactly the same in there. It is a genuine fallback, not a
lesser version, and it is much faster than debugging a local install at minute 20.

## 6. Your Netlify token, on the day

Make a file called `.env` in the project root:

```bash
NETLIFY_AUTH_TOKEN=paste_your_token_here
```

No quotes around the token, no trailing space. `.env` is already in `.gitignore`, so it will
never be committed - check with `git status` if you want to be sure.

Then lock the file down so it is only readable by you:

```bash
chmod 600 .env
```

A container or a shared dev box hands new files out as world-readable by default, and a
long-lived deploy token sitting in a file every account on the machine can read is worth thirty
seconds to fix. The tooling in this repo cannot do this one for you - it is barred from touching
`.env` at all, which is the property worth keeping. See
[ADR-007](adr/ADR-007-security-posture.md).

After your first deploy, run `npx netlify-cli status` and add the site id as a second line:

```bash
NETLIFY_SITE_ID=paste_the_site_id_here
```

Once both are there, `npm run deploy` runs with no questions asked.

Use `npm run deploy` rather than calling the Netlify CLI yourself. The CLI reads its token from
the environment your terminal is running in, and a `.env` file is a file - it is not
automatically part of that environment. `npm run deploy` loads the file for you. Calling
`npx netlify-cli deploy` directly, with the token only in `.env`, fails with "Authentication
required" even though the token is sitting right there.

## 7. After your first deploy: check the URL is actually public

Open your live URL **in a private/incognito window**, or on your phone. Not the normal window
you are already logged into Netlify in.

If you get a Netlify login screen instead of your site, your site is protected and only you can
see it. New Netlify teams can default to "team members only", which is a sensible default for a
company and exactly wrong for a portfolio. It is not broken and you have not done anything
wrong - it is one setting.

The fix, using the token you already have:

```bash
npx --yes netlify-cli api updateSite --data '{"site_id":"YOUR_SITE_ID","body":{"sso_login":false}}'
```

Your site id comes from `npx netlify-cli status`. Reload the incognito window and you should see
your portfolio. In the Netlify UI the same setting lives under your site's access and security
settings.

**Check this before you tell anyone your URL.** A link that asks a recruiter to log in to
Netlify is worse than no link.

While you are there, turn off the Netlify badge:

```bash
npx --yes netlify-cli api updateSite --data '{"site_id":"YOUR_SITE_ID","body":{"built_with_badge_enabled":false,"hud_enabled":false}}'
```

Netlify injects a small script into every page to draw that badge, and the security policy this
project ships in `netlify.toml` blocks it - correctly, since it is script the page did not ask
for. Everything still works, but you get a red error in the browser console until you turn the
badge off. Both settings need to be off; the badge is the one that does the injecting.

## 8. Warm up the Netlify CLI

Optional, and worth ninety seconds. The deploy step downloads the Netlify CLI the first time
you run it. Doing that now, on your own wifi, means it is already cached on the day:

```bash
npx --yes netlify-cli --version
```

If sixty people download it at the same moment on conference wifi, some of them wait. If you
run this once beforehand, you are not one of them.

## 9. Have your resume handy

A PDF or a plain text file. You will be putting your real information into the site during the
session, and the fastest way is to let Claude Code read the file directly.

---

## If something is not working

| Symptom | Try this |
| --- | --- |
| `node: command not found` | The install did not finish, or the terminal predates it. Restart the terminal. |
| `npm install` fails with permission errors | You are probably in a folder you do not own. `cd` somewhere in your home directory and clone again. |
| `npm run dev` starts but the page is blank | Check the terminal for a red error. Paste it into Claude Code and ask it to fix it. |
| Port 5173 is already in use | Something else is running. Vite will offer another port - take it. |
| Netlify verification email has not arrived | Check spam. This is exactly why this step is pre-work. |
| `npm install` says your Node version is too old | It is. Install the current LTS from nodejs.org and run `npm install` again. |
| Deploy says "Authentication required" but the token is in `.env` | Use `npm run deploy`, not the CLI directly - see step 6. If you already are, check `.env` has no quotes around the token and no trailing space. |
| Nothing local will work at all | Use the Codespaces route in step 5. Do not spend the session fighting your laptop. |
| Your live URL shows a Netlify login screen | The site is set to team-members-only. See step 7 - it is one command. |
| A red console error about an inline script | The Netlify badge. Turn it off, also step 7. Your site is fine. |

Still stuck? Reply to the workshop email. We would much rather sort it out now than at minute
20 on the day.
