import { Pool } from "pg";

export interface IDatabase {
  connected(): Promise<boolean>;
  close(): Promise<void>;
  get connection(): Pool;
}

export class Database implements IDatabase {
  private pool: Pool;
  constructor(dsn: string, max: number = 5) {
    this.pool = new Pool({
      connectionString: dsn,
      max: max,
    });
  }

  public async connected(): Promise<boolean> {
    try {
      await this.pool.query("SELECT NOW()");
      return true;
    } catch (error) {
      console.log("failed to connect database ", error);
      return false;
    }
  }

  public get connection(): Pool {
    return this.pool;
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}
