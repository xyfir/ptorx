import { NextFunction, Response, Request } from 'express';
import { MySQL } from 'lib/MySQL';

export async function api_setEmailTemplate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const db = new MySQL();

  try {
    const result = await db.query(
      `UPDATE users SET emailTemplate = ? WHERE userId = ?`,
      [req.body.id, req.jwt.userId]
    );
    if (!result.affectedRows) throw 'Could not set template';

    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err });
  }

  db.release();
}
