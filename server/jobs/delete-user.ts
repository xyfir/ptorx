import { addPath } from 'app-module-path';
import * as path from 'path';

addPath(path.resolve(__dirname, '../'));

import { deleteUser } from 'lib/user/delete';
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
