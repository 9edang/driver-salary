import { PoolClient, QueryResult } from "pg";
import { VariableConfigEntity } from "../../domain/entity/variable-config.entity";
import { BaseRepository } from "./base.repository";

export interface IVariableConfigRepository {
  create(tx: PoolClient, entity: VariableConfigEntity): Promise<QueryResult<any>>;
  existByKey(value: string): Promise<boolean>;
}

export class VariableConfigRepository extends BaseRepository implements IVariableConfigRepository {
  async create(tx: PoolClient, entity: VariableConfigEntity): Promise<QueryResult<any>> {
    return await tx.query({
      text: `INSERT INTO "variable_configs"("key", "value") VALUES ($1, $2)`,
      values: [entity.key, entity.value],
    });
  }

  async existByKey(value: string): Promise<boolean> {
    return super.existBy("variable_configs", "key", value);
  }
}
