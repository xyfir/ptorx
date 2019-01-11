import { Request, Response } from 'express';
import { getProxyEmail } from 'lib/proxy-emails/get';
import { MySQL } from 'lib/MySQL';

export async function api_getProxyEmail(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();

  try {
    const email = await getProxyEmail(db, {
      user: +req.session.uid,
      email: +req.params.email
    });
    db.release();
    res.status(200).json(email);
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
