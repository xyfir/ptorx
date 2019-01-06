const deleteEmail = require('lib/email/delete');
import { MySQL } from 'lib/MySQL';

/*
  DELETE /api/6/emails/:email
  DESCRIPTION
    Marks a proxy email as deleted, deletes its MailGun route, and deletes its
    links to any filters or modifiers
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    await deleteEmail(db, +req.params.email, +req.session.uid);
    db.release();
    res.status(200).json({});
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
};
