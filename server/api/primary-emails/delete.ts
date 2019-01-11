import { Request, Response } from 'express';
import { MySQL } from 'lib/MySQL';

export async function api_deletePrimaryEmail(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();
  try {
    await db.query(
      `DELETE FROM primary_emails WHERE email_id = ? AND user_id = ?`,
      [req.params.email, req.session.uid]
    );
    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err });
  }
  db.release();
}
