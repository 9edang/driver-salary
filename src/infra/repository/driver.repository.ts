import { PoolClient, QueryResult } from "pg";
import { DriverEntity } from "../../domain/entity/driver.entity";
import { BaseRepository } from "./base.repository";
import { DriverSalary, DriverSalaryData, FilterDriverSalary } from "../../domain/dto/driver";
import { CostStatus } from "../../domain/entity/shipment-cost.entity";
import { Paginate } from "../../domain/dto/paginate";

export interface IDriverRepository {
  create(tx: PoolClient, entity: DriverEntity): Promise<QueryResult<any>>;
  existById(value: number): Promise<boolean>;
  findAllDriverSalary(filter: FilterDriverSalary): Promise<DriverSalaryData[]>;
  countAllDriverSalary(filter: FilterDriverSalary): Promise<number>;
}

export class DriverRepository extends BaseRepository implements IDriverRepository {
  async create(tx: PoolClient, entity: DriverEntity): Promise<QueryResult<any>> {
    return await tx.query({
      text: `INSERT INTO drivers(driver_code, name) VALUES ($1, $2)`,
      values: [entity.driver_code, entity.name],
    });
  }

  async existById(value: number): Promise<boolean> {
    return super.existBy("drivers", "id", value);
  }

  private buildQueryFindAllDriverSalary(filter: FilterDriverSalary, count: boolean): { query: string; values: any[] } {
    const values: any[] = [filter.year, filter.month];
    const whereStmt: string[] = [
      "s.shipment_status != 'CANCELLED'",
      "DATE_PART('year',s.shipment_date) = $1",
      "DATE_PART('month',s.shipment_date) = $2",
    ];

    if (filter.driver_code) {
      values.push(filter.driver_code);
      whereStmt.push(`d.driver_code = $${values.length}`);
    }

    if (filter.name) {
      values.push(filter.name);
      whereStmt.push(`d.name ILIKE '%' || $${values.length} || '%'`);
    }
    let query: string =
      `FROM drivers AS d ` +
      `JOIN shipment_costs AS sc ON sc.driver_code = d.driver_code ` +
      `JOIN shipments AS s ON s.shipment_no = sc.shipment_no ` +
      `WHERE ${whereStmt.join(" AND ")} `;

    let havingQuery: string = "";

    if (filter.status === CostStatus.PENDING || filter.status == CostStatus.CONFIRMED) {
      havingQuery = ` HAVING '${filter.status}' = ANY(ARRAY_AGG(sc.cost_status))`;
    } else if (filter.status === CostStatus.PAID) {
      havingQuery = ` HAVING '${filter.status}' = ALL(ARRAY_AGG(sc.cost_status))`;
    }

    if (count) {
      query = `SELECT d.id ` + query + ` GROUP BY d.id ${havingQuery}`;
      query = `SELECT COUNT(*) FROM (${query})`
    } else {
      query =
        `SELECT d.id, d.driver_code, d.name, SUM(sc.total_costs)::INT as total, ` +
        `SUM(case when sc.cost_status = 'PENDING' then sc.total_costs else 0 end)::INT as total_pending, ` +
        `SUM(case when sc.cost_status = 'CONFIRMED' then sc.total_costs else 0 end)::INT as total_confirmed, ` +
        `SUM(case when sc.cost_status = 'PAID' then sc.total_costs else 0 end)::INT as total_paid, ` +
        `COUNT(s.shipment_no)::INT as count_shipment, ` +
        `((SELECT COUNT(da.id) FROM driver_attendances AS da WHERE da.driver_code = d.driver_code AND ` +
        `da.attendance_status = true AND DATE_PART('year', da.attendance_date) = $1 AND ` +
        `DATE_PART('month', da.attendance_date) = $2) * (SELECT vc.value FROM variable_configs AS vc ` +
        `WHERE vc.key = 'DRIVER_MONTHLY_ATTENDANCE_SALARY'))::INT AS total_attendance_salary ` +
        query +
        `GROUP BY d.id, d.driver_code, d.name ${havingQuery} OFFSET $${values.length + 1} LIMIT $${values.length + 2}`;
      values.push(filter.offset, filter.limit);
    }

    return {
      query: query,
      values: values,
    };
  }

  async findAllDriverSalary(filter: FilterDriverSalary): Promise<DriverSalaryData[]> {
    const { query, values } = this.buildQueryFindAllDriverSalary(filter, false);

    const { rows } = await this.conn.query({
      text: query,
      values: values,
    });

    const results: DriverSalaryData[] = [];

    for (const row of rows) {
      const result = row as DriverSalaryData;
      result.total_salary =
        result.total_paid + result.total_pending + result.total_confirmed + result.total_attendance_salary;
      results.push(result);
    }

    return results;
  }

  async countAllDriverSalary(filter: FilterDriverSalary): Promise<number> {
    const { query, values } = this.buildQueryFindAllDriverSalary(filter, true);
    const { rows } = await this.conn.query({
      text: query,
      values: values,
      rowMode: "array",
    });

    return Number(rows[0]);
  }
}
