import { Router } from 'express';

export function routerCategories(db) {
  const router = Router();

  // GET /api/categories
  router.get('/', (req, res) => {
    try {
      const categories = db
        .prepare(`
          SELECT
            categoria,
            COUNT(*) AS numProductes
          FROM productes
          GROUP BY categoria
          ORDER BY categoria
        `)
        .all();

      return res.json(categories);
    } catch (error) {
      return res.status(500).json({ error: 'Error en consultar les categories' });
    }
  });

  return router;
}
