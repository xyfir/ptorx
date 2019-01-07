import { getAffiliateInfo as _getAffiliateInfo } from 'lib/affiliates/get';
import * as moment from 'moment';
import { MySQL } from 'lib/MySQL';

export async function getAffiliateInfo(req, res) {
  const db = new MySQL();

  try {
    const affiliate = await _getAffiliateInfo(
      db,
      +req.session.uid,
      moment().format('YYYY-MM-DD HH:mm:ss')
    );
    db.release();
    res.status(200).json(affiliate);
  } catch (err) {
    db.release();
    res.status(400).json({ error: err });
  }
}
