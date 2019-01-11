import { Request, Response } from 'express';
import { MySQL } from 'lib/MySQL';

export async function api_deleteMessage(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    await db.query(
      `
      DELETE FROM messages
      WHERE id = ? AND proxyEmailId = (
        SELECT proxyEmailId FROM proxy_emails
        WHERE proxyEmailId = ? AND userId = ?
      )
    `,
      [req.params.message, req.params.email, req.session.uid]
    );
    db.release();

    res.status(200).json({});
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
