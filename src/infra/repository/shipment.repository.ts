import { PoolClient, QueryResult } from "pg";
import { BaseRepository } from "./base.repository";
import { ShipmentEntity } from "../../domain/entity/shipment.entity";

export interface IShipmentRepository {
  create(tx: PoolClient, entity: ShipmentEntity): Promise<QueryResult<any>>;
  existByShipmentNo(value: string): Promise<boolean>;
}

export class ShipmentRepository extends BaseRepository implements IShipmentRepository {
  async create(tx: PoolClient, entity: ShipmentEntity): Promise<QueryResult<any>> {
    return await tx.query({
      text: `INSERT INTO "shipments"("shipment_no","shipment_date","shipment_status") VALUES ($1,$2,$3)`,
      values: [entity.shipment_no, entity.shipment_date, entity.shipment_status],
    });
  }

  async existByShipmentNo(value: string): Promise<boolean> {
    return super.existBy("shipments", "shipment_no", value);
  }
}
