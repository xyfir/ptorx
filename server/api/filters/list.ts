import { Request, Response } from 'express';
import { MySQL } from 'lib/MySQL';

export async function api_getFilters(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();
  try {
    const filters = await db.query(
      `
        SELECT filterId as id, name, description, type
        FROM filters WHERE userId = ?
      `,
      [req.session.uid]
    );
    res.status(200).json(filters);
  } catch (err) {
    res.status(400).json({ error: err });
  }
  db.release();
}
