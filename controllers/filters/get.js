const mysql = require('lib/mysql');

/*
  GET api/filters/:filter
  RETURN
    {
      error: boolean, message?: string,
      
      id: number, name: string, description: string, type: number,
      find: string, acceptOnMatch: boolean, regex: boolean,
      linkedTo: [{
        id: number, address: string
      }]
    }
  DESCRIPTION
    Returns data for a specific filter
*/
module.exports = async function(req, res) {

  const db = new mysql;

  try {
    await db.getConnection();
    const [filter] = await db.query(`
      SELECT
        filter_id AS id, name, description, type, find,
        accept_on_match as acceptOnMatch, use_regex AS regex
      FROM filters
      WHERE filter_id = ? AND user_id = ?
    `, [
      req.params.filter, req.session.uid
    ]);

    if (!filter) throw 'Could not find filter';

    filter.error = false,
    filter.regex = !!+filter.regex,
    filter.acceptOnMatch = !!+filter.acceptOnMatch;

    filter.linkedTo = await db.query(`
      SELECT
        email_id AS id, CONCAT(re.address, '@', d.domain) AS address
      FROM
        redirect_emails AS re, domains AS d
      WHERE
        re.email_id IN (
          SELECT email_id FROM linked_filters WHERE filter_id = ?
        ) AND d.id = re.domain_id
    `, [
      req.params.filter
    ]);
    db.release();

    res.json(filter);
  }
  catch (err) {
    db.release();
    res.json({ error: true, message: err });
  }

};