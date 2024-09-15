import * as fs from "fs";
import * as path from "path";
import * as csv from "csv-parse";
import { DriverEntity } from "../domain/entity/driver.entity";
import { ShipmentEntity } from "../domain/entity/shipment.entity";
import { DriverAttendanceEntity } from "../domain/entity/driver-attendance.entity";
import { ShipmentCostEntity } from "../domain/entity/shipment-cost.entity";
import { VariableConfigEntity } from "../domain/entity/variable-config.entity";
import { Repository } from "../infra/repository";

export async function seeder(args: Repository) {
  const tx = await args.trx.beginTx();

  const drivers = await parse<DriverEntity>("drivers.csv", ["id", "driver_code", "name"]);
  for (const record of drivers) {
    const exist = await args.driver.existById(record.id!);
    if (exist) continue;
    try {
      await args.driver.create(tx, record);
    } catch (error) {
      console.log("seeder error: ", error);
      await args.trx.rollbackTx(tx);
      return;
    }
  }

  const shipments = await parse<ShipmentEntity>("shipments.csv", ["shipment_no", "shipment_date", "shipment_status"]);
  for (const record of shipments) {
    const exist = await args.shipment.existByShipmentNo(record.shipment_no);
    if (exist) continue;
    try {
      await args.shipment.create(tx, record);
    } catch (error) {
      console.log("seeder error: ", error);
      await args.trx.rollbackTx(tx);
      return;
    }
  }

  const driverAttendances = await parse<DriverAttendanceEntity>("driver_attendances.csv", [
    "id",
    "driver_code",
    "attendance_date",
    "attendance_status",
  ]);
  for (const record of driverAttendances) {
    const exist = await args.driverAttendance.existById(record.id!);
    if (exist) continue;
    try {
      await args.driverAttendance.create(tx, record);
    } catch (error) {
      console.log("seeder error: ", error);
      await args.trx.rollbackTx(tx);
      return;
    }
  }

  const shipmentCosts = await parse<ShipmentCostEntity>("shipment_costs.csv", [
    "id",
    "driver_code",
    "shipment_no",
    "total_costs",
    "cost_status",
  ]);
  for (const record of shipmentCosts) {
    const exist = await args.shipmentCost.existById(record.id!);
    if (exist) continue;
    try {
      await args.shipmentCost.create(tx, record);
    } catch (error) {
      console.log("seeder error: ", error);
      await args.trx.rollbackTx(tx);
      return;
    }
  }

  const variableConfigs = await parse<VariableConfigEntity>("variable_configs.csv", ["key", "value"]);
  for (const record of variableConfigs) {
    const exist = await args.variableConfig.existByKey(record.key);
    if (exist) continue;
    try {
      await args.variableConfig.create(tx, record);
    } catch (error) {
      console.log("seeder error: ", error);
      await args.trx.rollbackTx(tx);
      return;
    }
  }

  await args.trx.commitTx(tx);
}

function parse<T>(filename: string, headers: string[]): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const result: T[] = [];
    const filePath = path.resolve(process.cwd(), path.join("seeders", filename));
    fs.createReadStream(filePath, { encoding: "utf-8" })
      .pipe(csv.parse({ delimiter: ",", columns: headers, fromLine: 2 }))
      .on("data", (data: T) => {
        result.push(data);
      })
      .on("end", () => {
        resolve(result);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}
