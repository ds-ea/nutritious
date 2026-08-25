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

## Google Play's 16 KB page size requirement

Play blocks uploads whose native `.so` files are not 16 KB aligned (enforced since the extended
deadline of 2026-05-31). Only four native libraries ship in this app:

| Library | From |
|---|---|
| `libbarhopper_v3.so` | ML Kit barcode scanning |
| `libimage_processing_util_jni.so`, `libsurface_util_jni.so` | CameraX, pulled in by ML Kit |
| `libsqlc-ndk-native-driver.so` | `cordova-sqlite-storage` |

The ML Kit and CameraX libraries are already aligned. `cordova-sqlite-storage` was **not** until
7.0.0, which ships aligned binaries via `cordova-sqlite-storage-dependencies@5.0.0` and raises its
own floor to Android API 24. Both are pinned together for that reason.

To check an APK rather than trust the emulator warning — which reports "Unknown error" for
libraries it cannot parse and makes compliant ones look broken — read the ELF program headers and
confirm every `PT_LOAD` segment has `p_align >= 16384`.

## Logging on device

Capacitor's Android bridge calls `String()` on every `console.*` argument, so anything passed as a
separate argument reaches logcat as `[object Object]`. Fold detail into the message string, and
run errors through `describeError()` (`src/app/core/log-format.ts`), which turns `Error`s,
`HttpErrorResponse`es and plain objects into something readable:

```ts
console.warn( `[study] flush failed: ${ describeError( err ) }` );   // HTTP 401 Unauthorized
console.warn( '[study] flush failed', err );                         // [object Object]
```

Diagnostic lines are prefixed with the area (`[core]`, `[study]`, `[slot]`, `[app]`) so they can
be filtered in logcat.

## Rebuilding after a web change

The web payload lives in `android/app/src/main/assets/public` and `ios/App/App/public`, copied
there by `cap copy` / `cap sync`. Rebuilding `dist/apps/app` alone changes nothing the native
build can see, so the order is always **build → sync → run**.

Two things bite here:

- **Android Studio's *Apply Changes* does not repackage assets.** If the simulator relaunches the
  app without a rebuild and you still see the old bundle, you used Apply Changes (the lightning
  bolt) rather than Run. *Build → Clean Project* clears it, or use `nx run app:run:android`, which
  copies and installs in one step.
- **`app:build` never bumps the version.** Minting a build number on every build would change
  `.buildversion.json`, which is a cache input, so the app build would never hit the cache. Use
  `nx run app:build-release` for a shippable build: it runs `version-bump` and then
  `build:production-mobile` in sequence (`parallel: false` — `dependsOn` would let Nx run them
  concurrently and the build would read the previous number). `NX_SKIP_VERSION_BUMP=1` turns the
  bump into a no-op if you need to rebuild the same version.
- **`.buildversion.json` must invalidate the Nx build cache.** It is listed explicitly in the
  `build` target's `inputs` in `apps/app/project.json`, because Nx's `{projectRoot}/**/*` default
  does not pick up dotfiles. Without it Nx replays a cached bundle - and its cached stdout, so the
  `[app] building version …` line reports the version of whatever build was cached, not the
  current one.

## Native work

- Change SDK levels and androidx versions in `android/variables.gradle`, AGP in
  `android/build.gradle`, Gradle in `android/gradle/wrapper/gradle-wrapper.properties`.
- **The iOS deployment target is ours to maintain.** Capacitor 8's Podfile template ships
  `platform :ios, '15.0'`, but `@capacitor-mlkit/barcode-scanning` pulls in
  `GoogleMLKit/BarcodeScanning`, which requires **15.5**. On 15.0 `pod install` fails with
  "Specs satisfying the dependency were found, but they required a higher minimum deployment
  target". `cap sync` does not rewrite the `platform` line, but re-check it and the four
  `IPHONEOS_DEPLOYMENT_TARGET` entries in the Xcode project after any Capacitor migration.
- `pod install` needs `cdn.jsdelivr.net` and `raw.githubusercontent.com` reachable — the
  CocoaPods trunk CDN serves podspecs from there, not `cdn.cocoapods.org`. CocoaPods also
  refuses to start unless `LANG` is set to a UTF-8 locale.
- **Two CocoaPods versions are installed on this machine** and they write different spec
  checksums into `Podfile.lock`: `pod` resolves to 1.12.1 via the rbenv shim, while Homebrew
  has 1.17.0. Whichever runs `pod install` stamps its version into the lock, so the file churns
  depending on PATH order. Pick one and stick to it — a `Gemfile` pinning cocoapods is the
  usual fix if this becomes annoying.
- After any dependency change run `nx run app:sync` — this rewrites `capacitor.settings.gradle` and
  the Podfile with new pnpm-hashed paths.
- CocoaPods emits `${DT_TOOLCHAIN_DIR}` in `LIBRARY_SEARCH_PATHS`, which Xcode 15+ rejects with
  "DT_TOOLCHAIN_DIR cannot be used to evaluate LIBRARY_SEARCH_PATHS, use TOOLCHAIN_DIR instead".
  A `post_install` hook in the Podfile rewrites it. `cap sync` only regenerates the
  `capacitor_pods` block, so the hook survives - but check it is still there after a Capacitor
  major upgrade.
- Release steps live in `.claude/skills/mobile-release/SKILL.md`.
