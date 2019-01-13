import { Request, Response } from 'express';
import { MySQL } from 'lib/MySQL';

export async function api_getModifiers(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();
  try {
    const modifiers = await db.query(
      `
        SELECT
          userId AS uid, modifierId AS id, name, type,
          IF(userId = 0, 1, 0) AS global
        FROM modifiers WHERE userId = ? OR userId = 0
      `,
      [req.session.uid]
    );
    res.status(200).json(modifiers);
  } catch (err) {
    res.status(400).json({ error: err });
  }
  db.release();
}
