const getProxyEmail = require('lib/email/get');
const MySQL = require('lib/mysql');

/*
  GET /api/emails/:email
  RETURN
    { message?: string, ...ProxyEmail }
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    await db.getConnection();
    const email = await getProxyEmail(db, {
      user: +req.session.uid,
      email: +req.params.email
    });
    db.release();
    res.status(200).json(email);
  } catch (err) {
    db.release();
    res.status(400).json({ message: err });
  }
};
