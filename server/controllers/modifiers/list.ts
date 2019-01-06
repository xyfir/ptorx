import { MySQL } from 'lib/MySQL';

/*
  GET /api/6/modifiers
  RETURN
    { modifiers: [{
      id: number, name: string, description: string, type: number,
      global: boolean, uid: number
    }] }
  DESCRIPTION
    Returns basic information for all modifiers linked to account
*/
module.exports = async function(req, res) {
  const db = new MySQL();

  try {
    const sql = `
      SELECT
        user_id AS uid, modifier_id AS id, name, description, type,
        IF(user_id = 0, 1, 0) AS global
      FROM modifiers WHERE user_id = ? OR user_id = 0
    `,
      vars = [req.session.uid],
      modifiers = await db.query(sql, vars);

    res.status(200).json({ modifiers });
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
};
