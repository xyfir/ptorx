import { Request, Response } from 'express';
import { editDomainUser } from 'lib/domains/users/edit';

export async function api_editDomainUser(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await editDomainUser(req.body, req.session.uid);
    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ error: err });
  }
}
