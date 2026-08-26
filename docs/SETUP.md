# Setup

About ten minutes. Everything here is free, and you only do it once.

Do this **before** the workshop. If you turn up at minute 0 with these five things done, you
spend the session building. If you do not, you spend it installing Node while other people
build, and we would much rather you were building.

---

## 1. Node.js, version 20 or newer

Download it from [nodejs.org](https://nodejs.org). Take the LTS version.

Check it worked - open a terminal and run:

```bash
node -v
```

You should see something starting with `v20` or higher. If you see `command not found`, the
install did not finish; try again and restart your terminal afterwards.

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

## 5. Clone this project

```bash
git clone https://github.com/RewritingTheCode/workshop.git my-portfolio
cd my-portfolio
npm install
npm run dev
```

Open <http://localhost:5173>. You should see a finished portfolio for a fictional person named
Jane Doe. If you do, you are fully set up.

> Using the green **Use this template** button on GitHub instead of cloning gives you your own
> repo with a clean history, which is nicer if you plan to keep this. Either works.

## 6. Your Netlify token, on the day

Make a file called `.env` in the project root:

```bash
NETLIFY_AUTH_TOKEN=paste_your_token_here
```

No quotes around the token, no trailing space. `.env` is already in `.gitignore`, so it will
never be committed - check with `git status` if you want to be sure.

After your first deploy, run `npx netlify-cli status` and add the site id as a second line:

```bash
NETLIFY_SITE_ID=paste_the_site_id_here
```

Once both are there, `npm run deploy` runs with no questions asked.

## 7. Warm up the Netlify CLI

Optional, and worth ninety seconds. The deploy step downloads the Netlify CLI the first time
you run it. Doing that now, on your own wifi, means it is already cached on the day:

```bash
npx --yes netlify-cli --version
```

If sixty people download it at the same moment on conference wifi, some of them wait. If you
run this once beforehand, you are not one of them.

## 8. Have your resume handy

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

Still stuck? Reply to the workshop email. We would much rather sort it out now than at minute
20 on the day.
