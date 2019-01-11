import { Request, Response } from 'express';
import { MySQL } from 'lib/MySQL';

export async function api_addPrimaryEmail(
  req: Request,
  res: Response
): Promise<void> {
  const db = new MySQL();
  try {
    const [row] = await db.query(
      `
        SELECT (
          SELECT COUNT(primaryEmailId) FROM primary_emails WHERE userId = ?
        ) AS emails, (
          SELECT COUNT(primaryEmailId) FROM primary_emails WHERE userId = ? AND address = ?
        ) AS email_exists
      `,
      [req.session.uid, req.session.uid, req.body.email]
    );

    if (row.email_exists > 0)
      throw 'This email is already linked to your account';
    if (req.body.email.length < 6 || req.body.email.length > 320)
      throw 'Invalid email length. 6-320 characters required';

    const result = await db.query('INSERT INTO primary_emails SET ?', {
      userId: req.session.uid,
      address: req.body.email
    });
    if (!result.affectedRows) throw 'Could not add email';

    res.status(200).json({ id: result.insertId });
  } catch (err) {
    res.status(400).json({ error: err });
  }
  db.release();
}
