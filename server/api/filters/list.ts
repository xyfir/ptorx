import { Request, Response } from 'express';
import { MySQL } from 'lib/MySQL';

export async function getFilters(req: Request, res: Response): Promise<void> {
  const db = new MySQL();
  try {
    const filters = await db.query(
      `
        SELECT filter_id as id, name, description, type
        FROM filters WHERE user_id = ?
      `,
      [req.session.uid]
    );
    res.status(200).json(filters);
  } catch (err) {
    res.status(400).json({ error: err });
  }
  db.release();
}
