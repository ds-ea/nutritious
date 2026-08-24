# Mobile release runbook

End-to-end steps to cut an iOS + Android release of `apps/app`. Read the landmines section of the
root `AGENTS.md` before starting — a release built with the wrong `NX_*` values looks fine and is
dead on arrival.

## Store requirements

| Store | Requirement | Since |
|---|---|---|
| Google Play | `targetSdk` **36** for new apps and updates | Aug 31, 2026 (extension to Nov 1, 2026 available on request) |
| Google Play | `targetSdk` ≥ 35 to stay available to new users | Aug 31, 2025 |
| App Store | Built with **Xcode 26 / iOS 26 SDK** | Apr 28, 2026 |

The SDK you build against is independent of `minSdkVersion` / `IPHONEOS_DEPLOYMENT_TARGET`; raising
the target does not drop older users.

## Toolchain

| Tool | Version |
|---|---|
| Node | 22 (`.nvmrc`) — **not 24+**, see below |
| JDK | 21 — see "Selecting the JDK" below |
| Android SDK | platform 36 + build-tools 36 |
| Xcode | 26.x |
| CocoaPods | 1.16+ |

Check `apps/app/android/local.properties` agrees with `$ANDROID_HOME`.

### Selecting the JDK

Gradle 8.14.3 runs on Java 17–24 and fails above that, and AGP 8.13 targets 21 — so this project
needs JDK 21 specifically. It does **not** need to be your machine's default Java. Pick whichever
of these suits you; none of them change your global `JAVA_HOME`:

- **Android Studio** — Settings → Build, Execution, Deployment → Build Tools → Gradle → *Gradle JDK*
  → select Temurin 21. Stored per-project in `.idea/`, which is gitignored, so it stays local to
  your machine.
- **Command line** — set it for the one command:

  ```
  JAVA_HOME="/Library/Java/JavaVirtualMachines/temurin-21.jdk/Contents/Home" ./gradlew :app:bundleRelease
  ```

- **Automatic per-directory** — if you use `direnv`, put the same `export JAVA_HOME=...` in a
  gitignored `.envrc` at the repo root.

Do **not** put `org.gradle.java.home` in `apps/app/android/gradle.properties`: that file is
committed, and the path is machine-specific.

Verify whichever you chose with `./gradlew -version`, which prints the JVM it will use.

> **Node 24+ breaks the API at runtime.** `jsonwebtoken` depends on `buffer-equal-constant-time`,
> which reads `SlowBuffer` from the `buffer` module; Node 24 removed it. Every authenticated
> request throws. This applies to the deployed runtime as much as to your laptop — check the
> Node version the Cloud Run buildpack selects before shipping a server release.

## Steps

### 1. Prepare

```bash
nvm use
pnpm install
nx run core:prisma:generate
nx run-many -t lint test
```

Tests must be green before you build. They are the only thing standing between a dependency bump and
a silently broken study.

### 2. Bump the version

```bash
nx run app:version-bump
```

Writes `apps/app/.buildversion.json` (`build` + `version`), which `android/variables.gradle` feeds to
`android/app/build.gradle`. Then update the iOS side by hand in `apps/app/ios/App/App.xcodeproj`:
`CURRENT_PROJECT_VERSION` = `build`, `MARKETING_VERSION` = `version`, in **both** Debug and Release
configurations.

### 3. Build the web payload

Every `NX_*` variable must be exported in the shell that runs the build:

```bash
export NX_API_URL=https://…
export NX_QR_CODE_HASH=…
export NX_DEPLOYMENT_ENV=production
export NX_PROJECT_NAME=Nutritious
export NX_PRIVACY_URL=…
export NX_SUPPORT_URL=…
export NX_APP_VERSION=$(node -p "require('./apps/app/.buildversion.json').version")
export NX_APP_BUILD=$(node -p "require('./apps/app/.buildversion.json').build")

nx run app:build:production-mobile
```

**Verify before continuing** — a missing value produces a working build that cannot reach the API:

```bash
grep -ro "$NX_API_URL" dist/apps/app | head -1
```

Note `production-mobile` deliberately omits the `baseHref` / `deployUrl` that the plain `production`
configuration sets for the web deployment. Do not use `production` for a store build.

### 4. Sync native projects

```bash
nx run app:sync
```

Regenerates `capacitor.settings.gradle` and the Podfile with current pnpm paths. Afterwards confirm
the iOS bundle id is still `com.ipsy.foodapp` — `cap` occasionally tries to align it with the
Capacitor `appId` `de.dife.foodapp`, which would orphan the App Store record.

### 5. Android

```bash
cd apps/app/android && ./gradlew :app:bundleRelease
```

There is **no `signingConfig` in `build.gradle`** — the release bundle is signed through Android
Studio's *Build → Generate Signed App Bundle* wizard against a keystore that is not in the repo.
Confirm you have the keystore and its passwords before starting the release, and record where they
live in the team's secret store.

Upload the `.aab` to the Play Console.

### 6. iOS

Open `apps/app/ios/App/App.xcworkspace` in Xcode 26. Automatic signing, team `J2994VK9G3`.
*Product → Archive*, then distribute to App Store Connect.

### 7. Smoke test both builds

On an API 36 Android emulator and an iOS 26 simulator, walk the full participant path:

1. QR signup scan → credentials shown → login.
2. Dashboard on a day with upcoming, available and missed slots — check states and times are right.
3. Complete a slot and submit.
4. Airplane mode → submit another → back online → confirm it reaches `study/responses` and flips to
   `Done`.
5. Force-quit and relaunch → confirm the local log survived.

Since API 36 forces edge-to-edge, pay particular attention to headers, footers, and the scanner
overlay clipping under the status/navigation bars.
