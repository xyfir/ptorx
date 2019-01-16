import { deletePrimaryEmail } from 'lib/primary-emails/delete';
import { Request, Response } from 'express';

export async function api_deletePrimaryEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await deletePrimaryEmail(+req.query.primaryEmail, req.session.uid);
    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
