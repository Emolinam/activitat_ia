import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { crearApp } from '../src/app.js';
import { crearBaseDades } from '../src/db.js';

let servidor;
let base;

before(() => {
  servidor = crearApp(crearBaseDades()).listen(0);
  base = `http://localhost:${servidor.address().port}`;
});

after(() => servidor.close());

test('GET /api/productes retorna tots els productes', async () => {
  const resposta = await fetch(`${base}/api/productes`);
  assert.equal(resposta.status, 200);
  const productes = await resposta.json();
  assert.equal(productes.length, 6);
});

test('GET /api/productes?categoria=roba filtra per categoria', async () => {
  const resposta = await fetch(`${base}/api/productes?categoria=roba`);
  const productes = await resposta.json();
  assert.ok(productes.every((p) => p.categoria === 'roba'));
});

test('GET /api/productes rebutja una categoria amb injecció SQL', async () => {
  const categoria = "' UNION SELECT id, email, contrasenya, rol, 0 FROM usuaris--";
  const resposta = await fetch(
    `${base}/api/productes?categoria=${encodeURIComponent(categoria)}`,
  );
  const productes = await resposta.json();
  assert.deepEqual(productes, []);
});

test('GET /api/productes inclou mitjana i numRessenyes per productes amb ressenyes', async () => {
  const resposta = await fetch(`${base}/api/productes`);
  const productes = await resposta.json();
  const producte = productes.find((p) => p.id === 1);

  assert.equal(producte.mitjana, 4);
  assert.equal(producte.numRessenyes, 2);
});

test('GET /api/productes inclou mitjana null i numRessenyes 0 per productes sense ressenyes', async () => {
  const resposta = await fetch(`${base}/api/productes`);
  const productes = await resposta.json();
  const producte = productes.find((p) => p.id === 2);

  assert.equal(producte.mitjana, null);
  assert.equal(producte.numRessenyes, 0);
});

test('GET /api/productes/:id retorna 404 si no existeix', async () => {
  const resposta = await fetch(`${base}/api/productes/999`);
  assert.equal(resposta.status, 404);
});

test('GET /api/categories retorna les categories amb nombre de productes', async () => {
  const resposta = await fetch(`${base}/api/categories`);
  assert.equal(resposta.status, 200);

  const categories = await resposta.json();
  assert.deepEqual(categories, [
    { categoria: 'casa', numProductes: 2 },
    { categoria: 'papereria', numProductes: 2 },
    { categoria: 'roba', numProductes: 2 },
  ]);
});

test('GET /api/categories retorna un array buit si no hi ha categories', async () => {
  const baseDadesBuida = new DatabaseSync(':memory:');
  baseDadesBuida.exec(`
    CREATE TABLE productes (
      id INTEGER PRIMARY KEY,
      nom TEXT NOT NULL,
      descripcio TEXT,
      categoria TEXT NOT NULL,
      preu REAL NOT NULL
    );
  `);

  const appBuida = crearApp(baseDadesBuida);
  const servidorBuida = appBuida.listen(0);
  const port = servidorBuida.address().port;

  try {
    const resposta = await fetch(`http://localhost:${port}/api/categories`);
    assert.equal(resposta.status, 200);
    const categories = await resposta.json();
    assert.deepEqual(categories, []);
  } finally {
    servidorBuida.close();
  }
});

test('POST /api/carret/total retorna subtotal, enviament i total', async () => {
  const resposta = await fetch(`${base}/api/carret/total`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [
        { preu: 20, quantitat: 2, pes: 0.5 },
        { preu: 5, quantitat: 1, pes: 0.4 },
      ],
      descompte: 10,
    }),
  });

  assert.equal(resposta.status, 200);
  assert.deepEqual(await resposta.json(), {
    subtotal: 40.5,
    enviament: 5.9,
    total: 46.4,
  });
});

test('POST /api/ressenyes rebutja un productId no enter o inexistent', async () => {
  for (const productId of [1.5, 999]) {
    const resposta = await fetch(`${base}/api/ressenyes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        autor: 'Marta',
        text: 'Ressenya vàlida.',
        puntuacio: 5,
      }),
    });

    assert.equal(resposta.status, 400);
    assert.equal(typeof (await resposta.json()).error, 'string');
  }
});

test('POST /api/ressenyes rebutja autor i text buits o massa llargs', async () => {
  const casos = [
    { autor: '   ', text: 'Text vàlid.' },
    { autor: 'a'.repeat(51), text: 'Text vàlid.' },
    { autor: 'Marta', text: '   ' },
    { autor: 'Marta', text: 'a'.repeat(501) },
  ];

  for (const dades of casos) {
    const resposta = await fetch(`${base}/api/ressenyes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: 1, ...dades, puntuacio: 5 }),
    });

    assert.equal(resposta.status, 400);
    assert.equal(typeof (await resposta.json()).error, 'string');
  }
});

test('POST /api/ressenyes rebutja una puntuacio fora del rang o no enter', async () => {
  for (const puntuacio of [0, 6, 2.5]) {
    const resposta = await fetch(`${base}/api/ressenyes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 1,
        autor: 'Marta',
        text: 'Ressenya vàlida.',
        puntuacio,
      }),
    });

    assert.equal(resposta.status, 400);
    assert.equal(typeof (await resposta.json()).error, 'string');
  }
});
