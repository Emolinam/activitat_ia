import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcularTotal, calcularTotalCarret } from '../src/utils/carret.js';

test('calcula el total sense descompte', () => {
  const items = [
    { preu: 10, quantitat: 2 },
    { preu: 5.5, quantitat: 1 },
  ];
  assert.equal(calcularTotal(items), 25.5);
});

test('aplica un descompte percentual', () => {
  const items = [{ preu: 20, quantitat: 2 }];
  assert.equal(calcularTotal(items, 25), 30);
});

test('calcula subtotal, enviament i total amb tarifes', () => {
  const items = [
    { preu: 10, quantitat: 2, pes: 0.6 },
    { preu: 12, quantitat: 1, pes: 0.5 },
  ];

  assert.deepEqual(calcularTotalCarret(items), {
    subtotal: 32,
    enviament: 5.9,
    total: 37.9,
  });
});

test('un carret buit val 0', () => {
  assert.equal(calcularTotal([]), 0);
  assert.deepEqual(calcularTotalCarret([]), { subtotal: 0, enviament: 0, total: 0 });
});

test('llança un error si el descompte és fora de rang', () => {
  assert.throws(() => calcularTotal([], 120), RangeError);
});
