import { deleteProxyEmail as _deleteProxyEmail } from 'lib/proxy-emails/delete';
import { Request, Response } from 'express';
import { MySQL } from 'lib/MySQL';

export async function api_deleteProxyEmail(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    await _deleteProxyEmail(db, +req.params.email, +req.session.uid);
    db.release();
    res.status(200).json({});
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
