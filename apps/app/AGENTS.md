# apps/app — participant mobile app

Ionic + Angular 19 (NgModules, not standalone) packaged with Capacitor for iOS and Android.
Read the root `AGENTS.md` first — the build-time `NX_*` config contract and the bundle-id rules live
there and are the two things most likely to break a release.

## Layout

| Path | What |
|---|---|
| `src/app/core` | `ApiService` (HTTP + bearer token), `CoreService` (auth/session/account), `ConfigService` (build-time config), `StorageService` (Ionic Storage wrapper) |
| `src/app/study` | Dashboard, slot runner, form inputs, meal/BLS pickers — the participant's daily workflow |
| `src/app/user` | Login and QR-based study registration |
| `src/app/log` | Older standalone meal/questions logging flow |
| `src/theme` | Global SCSS |
| `android`, `ios` | Native projects, partly generated (see root `AGENTS.md`) |

## Persistence — differs per platform

`StorageService` wraps `@ionic/storage-angular`, configured in `app.module.ts` with
`driverOrder: [ CordovaSQLiteDriver._driver, Drivers.IndexedDB ]`.

`cap ls` reports `cordova-sqlite-storage` for **both** android and ios, so both are configured to
use SQLite with an IndexedDB fallback. Note the committed iOS project's
`capacitor-cordova-ios-plugins/sources` directory is empty while the Android equivalent is
populated — that is a stale native project awaiting a `cap sync`, not a platform difference.

`@capacitor-community/sqlite` appears in `package.json` and `capacitor.plugins.json` but has **zero
TypeScript imports**; it is not the storage layer.

Session/account state is separate, in `@capacitor/preferences` (`accounts`, `state`, `lang`,
`study.prefs`), written by `CoreService` and `StudyService`.

## Offline response queue

The most safety-critical logic in the app: `StudyService.logResponses` writes every response to local
storage *before* attempting the network, `submitResponses` skips the POST when `core.online$` is
false, and `markResponsesAsSent` drops the payload and flips state to `Done` only after the server
acknowledges the uid. Losing a response here loses irreplaceable study data — do not restructure it
without reading `study.service.spec.ts` first.

## QR signup code format

Parsed by `parseSignupCode` in `src/app/user/registration/signup-code.ts`.

- Legacy: `key:code`, split on the first colon.
- Current: `█`-delimited — `version █ key █ code █ shortenedDomain [ █ ... ]`.
  - `version === '0x'` means every part after it is XOR-obfuscated with `NX_QR_CODE_HASH` plus a
    hardcoded salt, via `xorEncryptDecrypt` from `@nutritious/core`.
  - `shortenedDomain` carries the scheme in its first character: leading `1` → `https`, anything
    else → `http`. The remainder is the host.

A build with the wrong `NX_QR_CODE_HASH` produces codes that decode to garbage, with no error.

## Scheduling engine

`processSchedule` in `src/app/study/dashboard/process-schedule.ts` decides what a participant sees
and may do on a given day — `upcoming` / `available` / `missed` / `unfulfilled` / `overdue` /
`unavailable` / `done`. It is a pure function of `(study, schedule, day, now, log, translate)`; keep
it that way, and extend `process-schedule.spec.ts` alongside any change.

## Versioning

`nx run app:version-bump` writes `.buildversion.json`, which `android/variables.gradle` reads into
`nutritiousBuild` / `nutritiousVersion` for `android/app/build.gradle`. The iOS
`CURRENT_PROJECT_VERSION` / `MARKETING_VERSION` in the Xcode project must be updated to match by hand.

## Native work

- Change SDK levels and androidx versions in `android/variables.gradle`, AGP in
  `android/build.gradle`, Gradle in `android/gradle/wrapper/gradle-wrapper.properties`.
- After any dependency change run `nx run app:sync` — this rewrites `capacitor.settings.gradle` and
  the Podfile with new pnpm-hashed paths.
- Release steps live in `.claude/skills/mobile-release/SKILL.md`.
