import { Request, Response } from 'express';
import { MySQL } from 'lib/MySQL';

export async function api_getPrimaryEmails(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();
  try {
    const emails = await db.query(
      'SELECT email_id AS id, address FROM primary_emails WHERE user_id = ?',
      [req.session.uid]
    );
    res.status(200).json(emails);
  } catch (err) {
    res.status(400).json({ error: err });
  }
  db.release();
}
