import { Router } from 'express';
import { calcularTotalCarret } from '../utils/carret.js';

/**
 * Crea el router per calcular el total d'un carret.
 *
 * @returns {import('express').Router} Router amb els endpoints del carret.
 */
export function routerCarret() {
  const router = Router();

  // POST /api/carret/total  { items: [{ preu, quantitat, pes }], descompte }
  router.post('/total', (req, res) => {
    const { items = [], descompte = 0 } = req.body;
    try {
      res.json(calcularTotalCarret(items, descompte));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  return router;
}
