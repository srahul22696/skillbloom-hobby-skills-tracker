# Skillbloom

**A little progress, every day.** Skillbloom is a cloud-computing course project for tracking hobbies and skills, recording practice, setting goals, and sharing learning moments with a community.

## Current implementation

This repository contains a responsive React application with a local browser demo and a Firebase-backed mode. With Firebase web configuration, it supports email/password registration, sign-in and password reset; Firestore-backed profiles, skills, goals, sessions, community posts, likes and comments; and authenticated image uploads to Firebase Storage. Without configuration, it starts in local demo mode with synthetic content. Firebase rules, Render static-site configuration, and unit tests are included.

The full course brief is larger: REST API endpoints/Cloud Functions, follows, reporting/moderation, milestone automation, expanded analytics, server-side rate limits, and Firebase Emulator authorization tests remain future work. Validate the included rules in the Emulator Suite before using real accounts.

## Features

- Dashboard for active skills, practice time, streaks, goals, and recent sessions.
- Skill management with beginner/intermediate/advanced levels and configurable practice targets.
- Practice logging (1–1,440 minutes, valid non-future dates, required activity) and consecutive-day streak calculation.
- Goal tracking with capped 0–100% progress, skill association, unit, and deadline.
- Community feed with synthetic seed posts, likes, and user-owned post removal.
- Editable local profile and demo reset.
- Responsive desktop/mobile layouts and reduced-motion support.
- Defensive text normalization, length limits, corrupt-storage handling, duplicate-skill prevention, and storage quota feedback.
- Firebase Authentication email/password flows with bounded values and generic login failures.
- Cloud Firestore sync with user-owned records and a shared feed; per-user likes/comments.
- Owner-scoped image uploads restricted to supported image MIME types and 10 MiB.

## Architecture target

```text
React/Vite SPA (Render static-site CDN)
        │ Firebase Auth SDK / ID token
        ├─ Firebase Authentication
        ├─ Cloud Firestore (private records, shared posts, like/comment subcollections)
        └─ Cloud Storage (owner-scoped image uploads)
```

The included Firestore rules require authentication and enforce per-user ownership for private records, post ownership for edits/deletes, and caller identity for likes/comments. Storage rules restrict uploads to the owner's path, images only, and under 10 MiB. Review and test all rules against your intended public profile/feed model before production. REST Functions, server-side rate limits, and moderation remain to be implemented.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. The demo needs no cloud credentials. Data stays in your current browser profile under `skillbloom-v1`; use the profile menu's sign-out/reset action to start over. Clearing browser storage also removes the demo.

## Checks

```bash
npm test
npm run build
npm run test:rules
```

The unit tests cover text normalization, email/password input predicates, session bounds, impossible/future dates, over-100% progress, and streak continuity. Firestore rule tests cover private ownership, public feed reads, post ownership, idempotent per-user likes, and comment ownership. `npm run test:rules` requires a Java runtime; Firebase CLI downloads and starts the Firestore Emulator automatically.

## Configure Firebase

1. Create a Firebase project and register a web app.
2. Enable the authentication providers you intend to support, create Firestore and Storage, and add your Render domain to authorized domains.
3. Copy `.env.example` to `.env.local`, then fill in the Firebase web-app configuration. These client config values identify the Firebase project; do not place Admin SDK service-account credentials or other server secrets in `VITE_*` variables.
4. Review `firestore.rules` and `storage.rules`, then deploy with Firebase CLI after installing/configuring it: `firebase deploy --only firestore:rules,storage`.
5. Run the app, create synthetic test accounts, and verify private-data ownership with two accounts. Run Firebase Emulator Suite rules tests before publishing to real users.

Cloud costs and free quotas change. Check the current Firebase and Render plan details before enabling billable services. Keep synthetic data in public demos and never commit `.env.local`.

## Deploy to Render

The included [`render.yaml`](render.yaml) defines a Render Static Site with `npm ci && npm run build`, publishes `dist`, and rewrites client-side routes to `index.html`. It asks for Firebase web configuration values when the Blueprint is first created.

1. Push this repository to GitHub (see below).
2. In Render, choose **New → Blueprint**, connect the repository, and create the `skillbloom` static site from `render.yaml`.
3. Enter the Firebase web-app config values. These are browser-visible project identifiers, not Admin SDK secrets. Never add service-account credentials to a Vite `VITE_*` variable.
4. Add the deployed Render domain to Firebase Authentication's authorized domains and verify Auth, Firestore rules, and Storage rules using synthetic accounts.

The live static site was deployed from the public GitHub repository. This Blueprint does not have a Git provider connection, so new commits need a manual Blueprint sync. Static-site environment variables are applied at build time. The public demo currently runs with synthetic local data because no Firebase project configuration was provided; authentication, Firestore sync, and Storage uploads require configuring the six Firebase web-app values first.

## GitHub

Suggested repository name: `skillbloom-hobby-skills-tracker`.

```bash
git init
git add .
git commit -m "Build Skillbloom hobby and skills tracker"
git branch -M main
git remote add origin https://github.com/srahul22696/skillbloom-hobby-skills-tracker.git
git push -u origin main
```

**Suggested repository description / About:** `A cloud-backed hobby and skills tracker built with React, Firebase Auth, Firestore, and Storage. Log practice, track streaks and goals, and share progress with a community. Includes a local demo and Render deployment setup.`

This project is published at https://github.com/srahul22696/skillbloom-hobby-skills-tracker. Never share a personal access token in chat or commit it to the repo.

## Data model proposal

- `users/{uid}` — profile metadata and preferences.
- `users/{uid}/skills/{skillId}` — name, category, level, target, status, dates.
- `users/{uid}/goals/{goalId}` — skill reference, target, unit, deadline, status.
- `users/{uid}/sessions/{sessionId}` — skill reference, duration, activity, practice timestamp.
- `posts/{postId}` — author UID, content, optional skill/media reference, timestamp.
- `posts/{postId}/likes/{uid}` and `posts/{postId}/comments/{commentId}` — idempotent likes and owner-attributed comments.
- Storage path `users/{uid}/...` — private profile/achievement images; persist storage paths and metadata, not raw file bytes, in Firestore.

## Edge-case and security notes

- Normalize Unicode text (NFKC), strip control characters, trim, then enforce per-field lengths.
- Reject malformed/overlong email values; password predicate requires 10–128 chars with upper/lowercase and a digit. Production auth must use Firebase Auth's server-side provider policy and avoid logging credentials.
- Reject invalid, zero, negative, fractional, and over-day session durations; reject invalid/future dates and blank activities.
- Handle malformed or unavailable browser storage without crashing; surface quota failure.
- Clamp progress to 0–100 and return 0 for invalid/nonpositive targets. Streaks tolerate duplicate sessions on a day and bridge a missed current day only when yesterday is active.
- UI checks do not provide a security boundary. Enforce ownership, validation, abuse controls, and role checks in Firestore rules or a trusted server.
- Production additions: emulator-backed rules tests, App Check, pagination, callable/HTTP Functions, rate limits, report/block tools, moderation, backup/restore, monitoring, and accessibility review.

## Project report and interview summary

The project models a cross-device learning companion: Firebase Authentication establishes identity; Firestore stores structured practice and social data; Storage holds media; Render serves the frontend from its static-site CDN. Progress analytics aggregate sessions into goal progress, weekly practice, and streaks. REST Functions, moderation, and rate limiting from the broader brief are not yet implemented.

**Resume bullet (current scope):** Built a responsive React hobby and skills tracker with Firebase email authentication, Firestore-backed practice and community data, Storage image uploads, progress analytics, defensive validation, and security rules.

**Interview description:** Skillbloom helps users grow skills through practice sessions and community encouragement. Firebase Auth provides identity, Firestore stores private and shared records, Storage holds image proof, and Render hosts the React client. Firestore and Storage rules enforce ownership at the service boundary.

## Social post drafts

### LinkedIn

🚀 **Project Completed | Skillbloom: Online Hobby & Skills Tracker with Community Sharing**

Excited to share **Skillbloom**, a hobby and skills tracker designed to help people stay consistent, see their progress, and share what they are learning.

The project brings together:
🌱 Skill profiles, categories, levels, and practice targets
📝 Practice logs with date and duration validation
🔥 Streaks, weekly practice summaries, and measurable goals
👥 Community feed with likes, comments, and image sharing
🔐 Firebase Authentication and owner-scoped Firestore/Storage rules
☁️ React + Vite frontend deployed on Render
📱 Responsive desktop and mobile layouts
🧪 Automated edge-case tests for validation and progress calculations

This project helped me strengthen my skills in **Cloud Computing, SaaS product design, React, Firebase Authentication, cloud databases, media storage, security rules, cloud deployment, and testing**. I also explored how APIs, notifications, and a scalable backend can extend a community platform.

The live link is a browser-based demo with synthetic data. Firebase Auth, Firestore, and Storage integration are in the code, but a Firebase project still needs to be configured before real sign-in and cloud sync can be used. REST APIs/Cloud Functions, live notifications, moderation, and emulator-backed security tests are future work.

A special thank you to **Umesh Yadav Sir** for his guidance and encouragement. I’m also grateful to **EDC, IIIT Delhi**, in collaboration with **Indian Institute of Placement**, for the opportunity to learn and build.

**🌐 Live Demo:**  
https://skillbloom-wku9.onrender.com

**💻 GitHub Repository:**  
https://github.com/srahul22696/skillbloom-hobby-skills-tracker

#CloudComputing #SaaS #React #Firebase #Authentication #CloudDatabase #MediaStorage #CommunityPlatform #CloudDeployment #WebDevelopment #StudentProject #BuildInPublic

### Instagram

🚀 **Project Completed | Skillbloom** 🌱

A little space for the things you’re learning. Track your skills, log practice, set goals, build streaks, and share your progress with a community. ✨

🌱 Skill and user profiles  
📝 Practice logs + validation  
🔥 Goals, streaks + progress  
👥 Community posts, likes + comments  
🔐 Firebase Auth + cloud security rules  
☁️ React + Vite, deployed on Render  
📱 Responsive design  

Built as a Cloud Computing project exploring authentication, cloud databases, media storage, social features, APIs, notifications, and cloud deployment.

The live demo currently uses synthetic data. Firebase project setup is still needed to enable real sign-in, cloud database sync, and image uploads.

A special thank you to [@umeshcnyadav](https://www.instagram.com/umeshcnyadav/) sir for his guidance. Grateful to [@edc_iitd](https://www.instagram.com/edc_iitd/) and Indian Institute of Placement for the opportunity to learn and build. 🙏

🌐 Demo: https://skillbloom-wku9.onrender.com  
💻 GitHub: https://github.com/srahul22696/skillbloom-hobby-skills-tracker

#Skillbloom #CloudComputing #SaaS #ReactJS #Firebase #CommunityPlatform #CloudDeployment #StudentDeveloper #LearningJourney #BuildInPublic
