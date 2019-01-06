const CONFIG = require('config');
const mysql = require('mysql');

const pool = mysql.createPool(CONFIG.database.mysql);

/**
 * Wraps mysql package and uses promises in place of callbacks
 */
class MySQL {
  /**
   * Retrieve a connection from the connection pool.
   * @async
   */
  getConnection() {
    return new Promise((resolve, reject) => {
      // Cannot open another connection until previous is released
      if (this.cn) return resolve();

      pool.getConnection((err, cn) => {
        if (err) {
          reject('An unknown error occured');
        } else {
          this.cn = cn;
          resolve();
        }
      });
    });
  }

  /**
   * Sends query to database.
   * @async
   * @param {string} [sql] - SQL query string
   * @param {any[]|object} [vars] - Variables to insert at '?' in sql
   * @return {object[]} A promise that resolves to the database's response
   * and rejects with error message.
   */
  async query(sql = '', vars = []) {
    if (!this.cn) await this.getConnection();

    return await new Promise((resolve, reject) =>
      this.cn.query(sql, vars, (err, res) => (err ? reject(err) : resolve(res)))
    );
  }

  /**
   * Releases instance connection back to pool if it exists.
   */
  release() {
    this.cn && this.cn.release();
    this.cn = null;
  }
}

module.exports = MySQL;
