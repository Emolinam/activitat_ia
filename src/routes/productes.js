import { Router } from 'express';

/**
 * Crea el router per consultar productes.
 *
 * @param {object} db Connexió a la base de dades.
 * @returns {import('express').Router} Router de productes.
 */
export function routerProductes(db) {
  const router = Router();

  // GET /api/productes?categoria=roba
  /**
   * Retorna tots els productes, opcionalment filtrats per categoria.
   *
   * @param {import('express').Request} req Petició HTTP.
   * @param {import('express').Response} res Resposta HTTP.
   */
  router.get('/', (req, res) => {
    const { categoria } = req.query;
    let sql = `
      SELECT
        p.id,
        p.nom,
        p.descripcio,
        p.categoria,
        p.preu,
        ROUND(AVG(r.puntuacio), 1) AS mitjana,
        COUNT(r.id) AS numRessenyes
      FROM productes p
      LEFT JOIN ressenyes r ON r.producte_id = p.id
    `;

    const params = [];
    if (categoria) {
      sql += ' WHERE p.categoria = ?';
      params.push(categoria);
    }

    sql += ' GROUP BY p.id';

    const productes = db.prepare(sql).all(...params);
    res.json(productes);
  });

  // GET /api/productes/:id
  /**
   * Retorna un producte a partir del seu identificador.
   *
   * @param {import('express').Request} req Petició HTTP.
   * @param {import('express').Response} res Resposta HTTP.
   */
  router.get('/:id', (req, res) => {
    const producte = db
      .prepare('SELECT * FROM productes WHERE id = ?')
      .get(Number(req.params.id));
    if (!producte) {
      return res.status(404).json({ error: 'Producte no trobat' });
    }
    res.json(producte);
  });

  return router;
}
