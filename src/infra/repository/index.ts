import { IDriverAttendanceRepository } from "./driver-attendance.repository";
import { IDriverRepository } from "./driver.repository";
import { ITrxRepository } from "./base.repository";
import { IShipmentCostRepository } from "./shipment-cost.repository";
import { IShipmentRepository } from "./shipment.repository";
import { IVariableConfigRepository } from "./variable-config.repository";

export type Repository = {
  trx: ITrxRepository;
  driver: IDriverRepository;
  driverAttendance: IDriverAttendanceRepository;
  shipmentCost: IShipmentCostRepository;
  shipment: IShipmentRepository;
  variableConfig: IVariableConfigRepository;
};
