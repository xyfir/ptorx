import * as mysql from 'mysql';

const pool = mysql.createPool(process.enve.MYSQL);

export class MySQL {
  cn?: mysql.PoolConnection;

  /**
   * Retrieve a connection from the connection pool.
   */
  connect() {
    return new Promise((resolve, reject) => {
      // Cannot open another connection until previous is released
      if (this.cn) return resolve();

      pool.getConnection((err, cn) => {
        if (err) return reject('Could not connect to database');
        this.cn = cn;
        resolve();
      });
    });
  }

  /**
   * Sends query to database.
   */
  async query(sql: string, vars: any[] | object = []): Promise<any | any[]> {
    if (!this.cn) await this.connect();

    return await new Promise((resolve, reject) =>
      (this.cn as mysql.PoolConnection).query(sql, vars, (err, res) =>
        err ? reject(err) : resolve(res)
      )
    );
  }

  /**
   * Releases instance connection back to pool if it exists.
   */
  release() {
    this.cn && this.cn.release();
    delete this.cn;
  }
}
