import { Request, Response } from 'express';
import { addPrimaryEmail } from 'lib/primary-emails/add';

export async function api_addPrimaryEmail(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const primaryEmail = await addPrimaryEmail(req.body, req.session.uid);
    res.status(200).json(primaryEmail);
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
