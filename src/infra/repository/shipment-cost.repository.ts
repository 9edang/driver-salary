import { PoolClient, QueryResult } from "pg";
import { BaseRepository } from "./base.repository";
import { CostStatus, ShipmentCostEntity } from "../../domain/entity/shipment-cost.entity";

export interface IShipmentCostRepository {
  create(tx: PoolClient, entity: ShipmentCostEntity): Promise<QueryResult<any>>;
  existById(value: number): Promise<boolean>;
}

export class ShipmentCostRepository extends BaseRepository implements IShipmentCostRepository {
  async create(tx: PoolClient, entity: ShipmentCostEntity): Promise<QueryResult<any>> {
    return await tx.query({
      text: `INSERT INTO "shipment_costs"("driver_code","shipment_no","total_costs","cost_status") VALUES ($1,$2,$3,$4)`,
      values: [entity.driver_code, entity.shipment_no, entity.total_costs, entity.cost_status],
    });
  }

  async existById(value: number): Promise<boolean> {
    return super.existBy("shipment_costs", "id", value);
  }

  // async calculateCostByStatus(driverCode: string, status: CostStatus) {
  //   const query: string =
  //     `SELECT SUM(sc.total_costs) AS total FROM drivers AS d ` +
  //     `JOIN shipment_costs AS sc ON sc.driver_code = d.driver_code ` +
  //     `JOIN shipments AS s ON s.shipment_no = sc.shipment_no ` +
  //     `JOIN driver_attendances AS da ON da.driver_code = d.driver_code ` +
  //     `WHERE s.shipment_status != 'CANCELLED' AND d.driver_code = $1 AND sc.cost_status = $2` +
  //     `GROUP BY d.driver_code`;

  //   const res = await this.conn.query({
  //     text: query,
  //     values: [driverCode, status],
  //   });
  //   res.rows[0]
  // }
}
