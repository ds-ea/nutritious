# apps/server — API

NestJS 11 on Fastify, Prisma over MongoDB. Read the root `AGENTS.md` first, especially the
`nx run core:prisma:generate` prerequisite.

## Access control

`AuthGuard` (`src/app/auth/auth.guard.ts`) is global. Every route is user-level by default:

| Decorator | Effect |
|---|---|
| `@Public()` | No token required |
| `@ParticipantAccess()` | Participant tokens accepted as well as user tokens |
| *(none)* | User-level only — a valid participant token gets **403** |

The guard also re-checks that the participant/user row still exists and is `ENABLED`, so a revoked
account is rejected even while its token is otherwise valid.

## Sanitization is mandatory

Prisma models carry `password`, `state` and internal timestamps. Controllers return
`Sanitize.*` output from `libs/core/src/lib/data/sanitize.ts` — `safeParticipant`, `safeUser`,
`publicStudy`, `safeSlot`, `safeStep`, `safeSchedule`, `safeStudyForm`, `safeStudyContent`,
`safeFormInputPreset`. Adding a field to the Prisma schema does not add it to the safe type; that is
the point. `sanitize.spec.ts` asserts nothing leaks.

## Passwords

`AuthService.verifyPassword` handles two eras of hashes:

- Legacy PHP bcrypt with a `$2y$` prefix, rewritten to `$2a$` before `bcrypt.compare`.
- Current argon2, verified with the `PW_SECRET` config value as a keyed secret.

Both paths must keep working — a regression locks out every participant enrolled before the
migration, with no distinguishing error.

## Testing

Prisma/MongoDB needs a replica set for transactions, so unit tests mock `PrismaService` with plain
object stubs rather than starting a database. Guard tests build a `Reflector` and fake
`ExecutionContext` directly.

## Structure

Resource modules (`studies`, `groups`, `participants`, `slots`, `steps`, `schedules`, `responses`,
`study-forms`, …) follow the Nest CRUD generator layout. `study/` holds the participant-facing
endpoints the mobile app actually calls:

| Endpoint | Purpose |
|---|---|
| `POST auth/login` | Participant login, returns JWT + sanitized participant |
| `GET auth/me` | Current identity |
| `POST study/signup` | Signup check, or enrollment when `signup: true` |
| `GET study/studies` | The full prepared schedule payload the app caches offline |
| `POST study/responses` | Batch response submission, returns acknowledged uids |
