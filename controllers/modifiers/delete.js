const MySQL = require('lib/mysql');

/**
 * DELETE /api/modifiers/:mod
 * @param {object} req
 * @param {object} req.params
 * @param {number} req.params.mod
 */
module.exports = async function(req, res) {
  const db = new MySQL();
  try {
    await db.query(
      `DELETE FROM modifiers WHERE modifier_id = ? AND user_id = ?`,
      [req.params.mod, req.session.uid]
    );
    res.status(200).json({});
  } catch (err) {
    res.status(400).json({ message: err });
  }
  db.release();
};
