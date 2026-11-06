# Botiga Copilot

## Stack
- Backend: Node.js amb Express i SQLite (mòdul `node:sqlite`), amb mòduls ES (`import` / `export`).
- Frontend: HTML, CSS i JavaScript sense frameworks.
- Tests: runner integrat de Node.js (`node:test` i `node:assert/strict`).

## Convencions
- Noms de variables, funcions i missatges en català, en camelCase.
- Totes les rutes asíncrones han de gestionar els errors amb blocs try-catch netejats.
- Els comentaris i la documentació JSDoc s'escriuen en català.
- No esborris els comentaris existents quan afegeixis documentació.
## Arquitectura
- Separació estricta entre la lògica de rutes (`src/routes/`) i les funcions auxiliars de càlcul (`src/utils/`).
- Interacció amb la base de dades centralitzada exclusivament mitjançant el mòdul `src/db.js`.
- La base de dades és `DatabaseSync` del mòdul `node:sqlite`. En el JSDoc, el tipus del paràmetre `db` és `import('node:sqlite').DatabaseSync`. No facis servir `better-sqlite3`.
## No facis
- No afegeixis dependències noves sense demanar-ho.
- No utilitzis consultes SQL en brut concatenant strings; fes servir sempre paràmetres preparats per evitar injeccions.
- No alteris l'estructura dels tests que ja funcionen de manera nativa.
