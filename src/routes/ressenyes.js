import { Router } from 'express';

/**
 * Crea el router per consultar i crear ressenyes de productes.
 *
 * @param {import('node:sqlite').DatabaseSync} db Connexió a la base de dades.
 * @returns {import('express').Router} Router d'Express per a les ressenyes.
 */
export function routerRessenyes(db) {
  const router = Router();

  // GET /api/ressenyes?producteId=1
  /**
   * Retorna les ressenyes d'un producte ordenades de més nova a més antiga.
   *
   * @param {import('express').Request} req Petició HTTP.
   * @param {import('express').Response} res Resposta HTTP.
   */
  router.get('/', (req, res) => {
    const ressenyes = db
      .prepare('SELECT * FROM ressenyes WHERE producte_id = ? ORDER BY id DESC')
      .all(Number(req.query.producteId));
    res.json(ressenyes);
  });

  // POST /api/ressenyes
  /**
   * Crea una nova ressenya per a un producte.
   *
   * @param {import('express').Request} req Petició HTTP amb les dades de la ressenya.
   * @param {import('express').Response} res Resposta HTTP.
   */
  router.post('/', (req, res) => {
    const { productId, autor, text, puntuacio } = req.body;

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ error: 'productId ha de ser un enter.' });
    }

    const producte = db
      .prepare('SELECT id FROM productes WHERE id = ?')
      .get(productId);
    if (!producte) {
      return res.status(400).json({ error: 'El producte indicat no existeix.' });
    }

    if (typeof autor !== 'string' || autor.trim().length === 0) {
      return res.status(400).json({ error: "L'autor no pot estar buit." });
    }
    if (autor.length > 50) {
      return res.status(400).json({ error: "L'autor no pot superar els 50 caràcters." });
    }

    if (typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'El text no pot estar buit.' });
    }
    if (text.length > 500) {
      return res.status(400).json({ error: 'El text no pot superar els 500 caràcters.' });
    }

    if (!Number.isInteger(puntuacio) || puntuacio < 1 || puntuacio > 5) {
      return res.status(400).json({ error: 'La puntuacio ha de ser un enter entre 1 i 5.' });
    }

    const resultat = db
      .prepare(
        'INSERT INTO ressenyes (producte_id, autor, text, puntuacio) VALUES (?, ?, ?, ?)'
      )
      .run(productId, autor, text, puntuacio);
    res.status(201).json({ id: Number(resultat.lastInsertRowid) });
  });

  return router;
}
