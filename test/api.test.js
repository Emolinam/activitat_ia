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
