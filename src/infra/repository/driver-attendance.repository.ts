import { PoolClient, QueryResult } from "pg";
import { BaseRepository } from "./base.repository";
import { DriverAttendanceEntity } from "../../domain/entity/driver-attendance.entity";

export interface IDriverAttendanceRepository {
  create(tx: PoolClient, entity: DriverAttendanceEntity): Promise<QueryResult<any>>;
  existById(value: number): Promise<boolean>;
}

export class DriverAttendanceRepository extends BaseRepository implements IDriverAttendanceRepository {
  async create(tx: PoolClient, entity: DriverAttendanceEntity): Promise<QueryResult<any>> {
    return await tx.query({
      text: `INSERT INTO "driver_attendances"("driver_code", "attendance_date", "attendance_status") VALUES ($1, $2, $3)`,
      values: [entity.driver_code, entity.attendance_date, entity.attendance_status],
    });
  }

  async existById(value: number): Promise<boolean> {
    return super.existBy("driver_attendances", "id", value);
  }
}
