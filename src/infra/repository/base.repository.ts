import { Pool, PoolClient } from "pg";

export interface ITrxRepository {
  beginTx(): Promise<PoolClient>;
  rollbackTx(tx: PoolClient): Promise<void>;
  commitTx(tx: PoolClient): Promise<void>;
}

export class BaseRepository {
  protected conn: Pool;

  constructor(conn: Pool) {
    this.conn = conn;
  }

  protected async existBy(tablename: string, column: string, value: any): Promise<boolean> {
    const result = await this.conn.query({
      text: `SELECT 1 FROM "${tablename}" WHERE "${column}" = $1`,
      values: [value],
    });

    return result.rows.length > 0 ? true : false;
  }
}

export class TrxRepository extends BaseRepository {
  async beginTx(): Promise<PoolClient> {
    const session = await this.conn.connect();
    await session.query("BEGIN");
    return session;
  }

  async rollbackTx(tx: PoolClient): Promise<void> {
    await tx.query("ROLLBACK").finally(tx.release);
  }

  async commitTx(tx: PoolClient): Promise<void> {
    await tx.query("COMMIT").finally(tx.release);
  }
}
