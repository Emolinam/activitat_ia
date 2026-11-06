# Botiga Copilot

Mini-botiga en línia per practicar la programació assistida amb GitHub Copilot.

## Requisits

- Node.js 22.13 o superior (recomanat: Node.js 24 LTS)

## Instal·lació i execució

```bash
npm install
npm start
```

Obre <http://localhost:3000> al navegador.

## API

Tots els endpoints retornen dades en format JSON.

| Mètode | Endpoint | Descripció |
| --- | --- | --- |
| `GET` | `/api/productes` | Retorna tots els productes amb la mitjana i el nombre de ressenyes. |
| `GET` | `/api/productes?categoria=roba` | Filtra els productes per categoria. |
| `GET` | `/api/productes/:id` | Retorna el detall d'un producte. Si no existeix, retorna `404`. |
| `GET` | `/api/categories` | Retorna les categories amb el nombre de productes de cadascuna. |
| `GET` | `/api/ressenyes?productId=1` | Retorna les ressenyes d'un producte, de més nova a més antiga. |
| `POST` | `/api/ressenyes` | Crea una ressenya per a un producte. |
| `POST` | `/api/carret/total` | Calcula el subtotal, el cost d'enviament i el total del carret. |

Exemple de petició per crear una ressenya:

```json
{
  "productId": 1,
  "autor": "Marta",
  "text": "Molt còmoda i de bona qualitat.",
  "puntuacio": 5
}
```

Exemple de petició per calcular el total del carret:

```json
{
  "items": [
    { "preu": 20, "quantitat": 2, "pes": 0.5 }
  ],
  "descompte": 10
}
```

## Tests

Executa tots els tests amb el runner integrat de Node.js:

```bash
npm test
```

També pots executar un fitxer de test concret:

```bash
node --disable-warning=ExperimentalWarning --test test/api.test.js
```

## Estructura

```
src/
  index.js          Punt d'entrada: inicia el servidor
  app.js            Configuració d'Express i rutes
  config.js         Configuració de l'aplicació
  db.js             Base de dades SQLite en memòria amb dades de prova
  routes/           Rutes de l'API
  utils/carret.js   Càlcul del total del carret
public/             Frontend (HTML, CSS i JavaScript)
test/               Tests amb el runner integrat de Node.js
docs/               Documentació de proveïdors externs
```
