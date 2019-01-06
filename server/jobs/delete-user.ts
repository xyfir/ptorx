const path = require('path');
require('app-module-path').addPath(path.resolve(__dirname, '../'));

const deleteUser = require('lib/user/delete');
import { MySQL } from 'lib/MySQL';

(async function() {
  const db = new MySQL();

  try {

    await deleteUser(db, +process.argv[2]);
    db.release();
    console.log('Done');
  } catch (err) {
    db.release();
    console.error(err);
  }

  process.exit(0);
})();
