# Week 1 Quiz: Project Setup & Environment Discipline

**DRAFT for instructor review. Not yet published.**

- **Source material:** Week 1 guide (Ledger project: Node, Express, Postgres, Docker, migrations)
- **Format:** 10 multiple-choice questions, difficulty 7 to 9 out of 10, applied/scenario style
- **Includes:** answer key with feedback, a "what to review" map, and flashcards

---

## Reviewer Notes

Please check the technical claims before this goes to students. Items worth a second look:

| Q   | What to verify                                                                                                                                                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Q3  | Postgres image applies `POSTGRES_*` variables only when initializing an empty data directory. Fixes offered: `ALTER USER` or `down -v`.                         |
| Q4  | Compose/Docker restart policies react to process exit, not health status. (Swarm/orchestrators behave differently.)                                             |
| Q5  | Assumes a process supervisor exists. The guide's claim that the pool is "in an unreliable state" is the guide's stance; the question only tests the dependency. |
| Q7  | **Goes beyond the Week 1 text.** The "derived, rebuildable cache" idea is an extension. Keep, reword, or cut.                                                   |
| Q8  | Assumes node-pg-migrate tracks applied migrations by name in `pgmigrations`.                                                                                    |
| Q10 | `process.exit(1)` in `catch` ends the process before `finally` runs.                                                                                            |

### Review tracker

| Q   | Topic                     | Difficulty | Source section     | Status (approve / edit / cut) | Comments |
| --- | ------------------------- | ---------- | ------------------ | ----------------------------- | -------- |
| 1   | Config & fail-fast        | 7/10       | Step 3             |                               |          |
| 2   | Env pipeline (CLI vs app) | 7/10       | Step 3, Step 6     |                               |          |
| 3   | Docker persistence        | 8/10       | Step 4             |                               |          |
| 4   | Docker lifecycle          | 8/10       | Step 4             |                               |          |
| 5   | Failure handling          | 8/10       | Step 5             |                               |          |
| 6   | Query safety              | 8/10       | Step 8             |                               |          |
| 7   | Data modeling             | 9/10       | Step 6, Concept #5 |                               |          |
| 8   | Migrations                | 8/10       | Step 6             |                               |          |
| 9   | Secrets hygiene           | 7/10       | Steps 9, 11        |                               |          |
| 10  | Script lifecycle          | 9/10       | Steps 5, 8         |                               |          |

---

# Part 1: Quiz (Student Version)

**Instructions:** Choose the single best answer. Answer key and feedback are in Part 2.

### Question 1 · Config & fail-fast · 7/10

Your `.env` contains the lines `DATABASE_URL=` and `PORT=` (both set to empty values). Using the config module from Step 3, what happens at startup?

- **A.** Both calls throw, because the module treats empty values as missing for every variable.
- **B.** `required('DATABASE_URL')` throws immediately, while `PORT` silently falls back to 3000 because `optional` uses `||` and an empty string is falsy.
- **C.** Neither throws; `DATABASE_URL` reaches `Pool` as an empty string and the failure surfaces on the first query.
- **D.** The app starts, but `config.port` becomes `NaN` because `parseInt('')` runs on the empty value.

### Question 2 · Env pipeline · 7/10

`npm run dev` works, but `npm run migrate:up` fails with a connection error. Your `.env` is correct and the Postgres container is healthy. What is the most likely cause?

- **A.** The `pgmigrations` tracking table is missing, so the CLI cannot open a connection.
- **B.** The `engines` field in `package.json` is blocking the CLI because of a Node version mismatch.
- **C.** The migration script never loads `.env`. dotenv is only invoked inside `src/config/index.js`, which the migration CLI never imports.
- **D.** The pool's default limit of 10 connections is being exceeded by the CLI.

### Question 3 · Docker persistence · 8/10

You change `POSTGRES_PASSWORD` in `docker-compose.yml` and update `DATABASE_URL` to match, then run `docker compose down && docker compose up -d`. The app now fails password authentication. Why?

- **A.** `POSTGRES_*` variables are only applied when Postgres initializes an empty data directory. The `pgdata` volume survived `down`, so the original password is still in effect.
- **B.** `docker compose down` does not actually stop the container, so the old configuration is still running.
- **C.** Pinning `image: postgres:16` makes Compose ignore environment changes for that service.
- **D.** `restart: unless-stopped` restores the container's previous environment when it comes back up.

### Question 4 · Docker lifecycle · 8/10

`docker compose ps` shows `ledger-db` as `Up (unhealthy)` after the healthcheck exhausts its 5 retries. With `restart: unless-stopped` set, what does Docker do?

- **A.** It restarts the container automatically, since unhealthy containers are treated as crashed.
- **B.** It restarts the container after 5 retries at 10-second intervals, then gives up.
- **C.** It does nothing, because `unless-stopped` only applies after a manual `docker compose stop`.
- **D.** Nothing. Restart policies react to the container's process exiting; health status only reports state, so a running-but-unhealthy container stays as is.

### Question 5 · Failure handling · 8/10

The pool's `error` handler calls `process.exit(1)`. This "crash and restart" strategy is only a sound production choice under which assumption?

- **A.** The database uses a named volume, so no data is lost when the process exits.
- **B.** Something outside the process, such as a process manager or orchestrator, restarts the app; otherwise one dropped idle connection becomes a permanent outage.
- **C.** Every request already wraps its queries in try/catch, so exiting cannot affect in-flight work.
- **D.** The `pg` library retries failed connections indefinitely, so the exit is rarely reached.

### Question 6 · Query safety · 8/10

A teammate adds sorting: `db.query('SELECT * FROM accounts ORDER BY $1', [req.query.sort])` and says it is safe because it is parameterized. What is the most accurate assessment?

- **A.** It works as intended: the value is substituted into the SQL text as a column name safely.
- **B.** It is still injectable, because `ORDER BY` clauses are exempt from parameter binding.
- **C.** It is safe from injection but will not behave as intended: `$1` binds as a value, never as an identifier. Sorting by a caller-chosen column needs validation against an allowlist.
- **D.** It fails at startup because parameters are only allowed in `INSERT` statements.

### Question 7 · Data modeling · 9/10

A teammate wants to add a `balance` column to `accounts` because summing the ledger will "get slow at scale." Which response is most consistent with the ledger principle?

- **A.** Keep the ledger as the source of truth. If performance becomes a real problem, add a derived, rebuildable value (such as a cached or materialized balance) that can be recomputed and reconciled against the ledger.
- **B.** Add the column and update it inside every request handler; performance always outranks purity in finance apps.
- **C.** Add the column, but forbid deleting or editing transactions so it can never drift.
- **D.** Reject any form of stored balance permanently, because derived values must never be persisted anywhere.

### Question 8 · Migrations · 8/10

After your team has all run `migrate:up`, someone edits the already-applied `accounts` migration to add a new column and pushes. Teammates pull the change and run `migrate:up` again, but the column never appears. What is the correct explanation and fix?

- **A.** The tool needs a `--force` flag to re-run modified files; add it to the script.
- **B.** The dev server must be restarted so nodemon picks up the schema change.
- **C.** Migrations only run on a fresh clone, so teammates should re-clone the repo.
- **D.** The migration is recorded by name in `pgmigrations` as already applied, so it is skipped. Applied migrations are treated as immutable; add a new migration for the change.

### Question 9 · Secrets hygiene · 7/10

You accidentally committed `.env`, noticed on the next commit, ran `git rm --cached .env`, committed that, and confirmed `.gitignore` lists `.env`. Which statement is most accurate?

- **A.** You are safe: `.gitignore` retroactively removes the file from the repository.
- **B.** Removing it from the index stops future tracking, but the earlier commit still contains the secrets, so you should rotate the credentials.
- **C.** You are safe as long as nobody clones the repo after your cleanup commit.
- **D.** Only the database password is exposed; API keys and JWT secrets are excluded from commits automatically.

### Question 10 · Script lifecycle · 9/10

In `seed.js`, the `finally` block calls `await db.pool.end()`, and the `catch` block calls `process.exit(1)`. Which statement is correct?

- **A.** `pool.end()` is what commits the inserts; without it the rows would be rolled back.
- **B.** `pool.end()` protects the parameterized queries by closing the connection before user input can reach it.
- **C.** Without `pool.end()`, the inserts would still succeed but the script would hang, because open pooled connections keep the Node process alive. On the error path, `process.exit(1)` ends the process immediately, so `finally` does not run.
- **D.** `pool.end()` runs on both success and failure paths, and is required so `migrate:up` can acquire its lock afterward.

---

# Part 2: Answer Key & Feedback

| Q          | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  |
| ---------- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **Answer** | B   | C   | A   | D   | B   | C   | A   | D   | B   | C   |

### Q1: Answer B

`required` explicitly rejects both `undefined` and `''`, so it crashes at startup. `optional` returns `process.env[name] || defaultValue`, and `'' || '3000'` evaluates to `'3000'`, so `parseInt` never sees an empty string. The same input gets opposite policies: strict for required values, forgiving for optional ones. That is a deliberate design choice you should be able to defend.

- **Hint:** Trace each function line by line. Look at what each one checks before it returns.
- **Study focus:** Re-read Step 3 and trace `required()` vs `optional()` with inputs of `undefined`, `''`, and a real value.

### Q2: Answer C

The Express app gets its environment because `src/index.js` requires the config module, which calls `dotenv.config()`. `node-pg-migrate` is a separate process that never touches that code, so `DATABASE_URL` is undefined unless something else loads it. The `dotenv --` prefix from `dotenv-cli` fixes that. It also explains why `migrate:create` doesn't need it: it never connects to a database.

- **Hint:** Ask which process reads your `.env` file, and which code path triggers that read.
- **Study focus:** Step 6, Options A vs B. Draw which processes exist (app, CLI, seed script) and what loads the environment for each.

### Q3: Answer A

Credentials are stored inside the database cluster on the volume, not re-read from the environment on each start. Since `down` (without `-v`) keeps `pgdata`, the old password persists. Two fixes: `ALTER USER ledger PASSWORD '...'` (keeps data) or `docker compose down -v` (wipes data and re-initializes). This is the flip side of the persistence benefit the guide describes.

- **Hint:** The guide describes these variables as setting the _initial_ credentials. What else survived `down`?
- **Study focus:** Step 4, the `volumes` bullet and the `down` vs `down -v` commands. For any config change, ask whether it applies at container creation or at database initialization.

### Q4: Answer D

Restart policies fire when the main process exits. A healthcheck only labels the container starting, healthy, or unhealthy; it does not kill or restart anything on its own. Its value is for humans, verification checklists, and later orchestration (the guide previews this for Week 23, where an app container waits on database health).

- **Hint:** Compare what triggers a restart policy with what a healthcheck actually changes.
- **Study focus:** Step 4, the `restart` and `healthcheck` bullets. Write one sentence each on what problem each solves so you never conflate them.

### Q5: Answer B

Fail-fast moves recovery responsibility from your code to a supervisor. That is a good trade only if a supervisor exists. In-flight requests are also dropped when the process exits, which is acceptable only if clients can retry. Fail-fast is a system-level strategy, not just a line of code.

- **Hint:** Who starts the process again after it exits?
- **Study focus:** Step 5, "Why `pool.on('error', ...)` calls `process.exit(1)`." Extension: research how nodemon behaves after a crash, and what your production process manager would be.

### Q6: Answer C

Parameters carry values, not SQL structure, so table names, column names, and keywords cannot be bound. That is exactly why injection is impossible, and also why it cannot do what your teammate wants. The safe pattern is an allowlist (`const allowed = ['name', 'created_at']`) and then interpolating only a matched, known-good identifier.

- **Hint:** What kinds of things can a `$1` placeholder stand in for?
- **Study focus:** The parameterized query section at the end of Step 8. List three query parts that can be parameters and three that cannot.

### Q7: Answer A

The migration comment names the risks of a mutable balance: concurrent updates, forgotten adjustments, and silent drift. The principle is that the ledger is authoritative. A cache that can be rebuilt from it doesn't violate that; a second independent source of truth does. Option C misses the concurrent-update risk, B reintroduces drift, and D is dogmatic.

_Note: the caching idea goes beyond the Week 1 text, so treat it as an extension._

- **Hint:** Separate "source of truth" from "performance optimization." They can coexist.
- **Study focus:** The migration's design-decisions comment and Concept #5. Think about what "rebuildable" and "reconcilable" would require.

### Q8: Answer D

The tool decides what to run by comparing migration files against names recorded in `pgmigrations`. An edited but already-recorded file is skipped, so environments silently diverge: your machine, teammates, CI, and production can each have a different schema. The fix is a new migration (for example `add_column_x`).

- **Hint:** Recall what the `pgmigrations` table stores and why the tool never runs a migration twice.
- **Study focus:** Step 6, "What migrations actually are." Once a migration has left your machine, never edit it.

### Q9: Answer B

`.gitignore` only affects untracked files, and `git rm --cached` only changes what future commits track. The secret remains in earlier commits, and anyone with access to the history can retrieve it. The real remediation is to rotate every exposed credential, and optionally rewrite history. Deleting the file later doesn't undo exposure.

- **Hint:** Does deleting a file in a new commit change the old commits?
- **Study focus:** Steps 9 and 11. Run `git status` before every first commit, and add `.env` to `.gitignore` before the first `git add`.

### Q10: Answer C

Each query autocommits, so `pool.end()` has nothing to do with durability. Idle pooled sockets keep Node's event loop alive, so without it a successful seed would hang. And `process.exit()` terminates synchronously, so `finally` is skipped on that path, which is fine because the process is dying anyway.

- **Hint:** Think about why a script that finished its work might not exit, and what `process.exit` does to pending code.
- **Study focus:** Step 5 (what a pool is) and Step 8 (seed script). Try it: comment out `pool.end()`, observe the hang, then explain why it happens.

---

# Part 3: Review Map & Score Guide

| If you missed | Review                                                                         |
| ------------- | ------------------------------------------------------------------------------ |
| Q1, Q2        | Step 3 (config module) and Step 6 (why the migration CLI needs `dotenv-cli`)   |
| Q3, Q4        | Step 4: volumes, `down` vs `down -v`, healthcheck vs restart policy            |
| Q5, Q10       | Steps 5 and 8: pool lifecycle and fail-fast behavior                           |
| Q6            | Parameterized-query section in Step 8                                          |
| Q7, Q8        | Migration design-decisions comment, "What migrations actually are," Concept #5 |
| Q9            | Steps 9 and 11: `.gitignore`, `git rm --cached`, secrets in history            |

**Score guide**

- **9 to 10:** Ready for Week 2.
- **7 to 8:** Re-read the sections for what you missed, then explain each answer out loud without notes.
- **6 or below:** Redo the verification checklist (fresh setup, missing env var, migration round-trip). Hands-on repetition will help more than re-reading.

---

# Part 4: Flashcards

Format: **Front** (prompt) / **Back** (answer + why). Cover the back and answer aloud first.

**1**

- **Front:** `.env` has `DATABASE_URL=` and `PORT=` (both empty). What does the config module do with each?
- **Back:** `DATABASE_URL` throws at startup (`required` rejects `''`). `PORT` falls back to 3000 (`optional` uses `||`, and `''` is falsy).

**2**

- **Front:** `npm run dev` works but `migrate:up` can't connect. Likely cause?
- **Back:** dotenv is only loaded inside the config module, which the migration CLI never imports. Fix: `dotenv --` (dotenv-cli) in the script.

**3**

- **Front:** You change `POSTGRES_PASSWORD` and restart with `down` / `up -d`. Auth fails. Why?
- **Back:** `POSTGRES_*` variables only apply when initializing an empty data directory. The `pgdata` volume kept the old cluster. Fix: `ALTER USER` (keeps data) or `down -v` (wipes data).

**4**

- **Front:** A container is `Up (unhealthy)` and `restart: unless-stopped` is set. Does Docker restart it?
- **Back:** No. Restart policies react to process exit. Health status only reports state.

**5**

- **Front:** `process.exit(1)` on a pool error is only safe if...?
- **Back:** Something outside the process (process manager or orchestrator) restarts the app. Otherwise one dropped connection becomes a permanent outage.

**6**

- **Front:** Can `ORDER BY $1` take a column name as a parameter?
- **Back:** No. Parameters bind values, not identifiers. It's injection-safe but won't sort by that column. Validate against an allowlist.

**7**

- **Front:** "Summing the ledger will be slow." Should you add a `balance` column?
- **Back:** Keep the ledger as the source of truth. If needed, add a derived, rebuildable cache that can be reconciled against the ledger. Never a second independent source of truth. _(Extension beyond the Week 1 text.)_

**8**

- **Front:** You edit an already-applied migration and teammates' `migrate:up` does nothing. Why?
- **Back:** `pgmigrations` already records it by name, so it's skipped. Applied migrations are immutable; write a new one.

**9**

- **Front:** You committed `.env`, then ran `git rm --cached .env`. Are you safe?
- **Back:** No. The secret is still in earlier commits. Rotate the credentials. `.gitignore` only affects untracked files.

**10**

- **Front:** What does `pool.end()` in `seed.js` do, and what happens without it?
- **Back:** It closes pooled connections. Without it the script hangs after seeding (open sockets keep Node alive). On the error path, `process.exit(1)` skips `finally`.

**Bonus (terms)**

| Front                              | Back                                                                                                       |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Fail fast                          | Crash at startup with a clear message instead of failing obscurely later                                   |
| `.env` vs `.env.example`           | `.env` holds real secrets (ignored); `.env.example` lists required variables with placeholders (committed) |
| `docker compose down` vs `down -v` | `down` stops but keeps the volume; `down -v` also deletes the data                                         |
| Connection pool                    | A reusable set of open DB connections; faster than opening one per query                                   |
| Migration `up` / `down`            | Apply / undo a schema change; tracked in `pgmigrations` so it never runs twice                             |
| Why no `balance` column?           | Balances are derived from the ledger to avoid drift, lost updates, and forgotten adjustments               |
