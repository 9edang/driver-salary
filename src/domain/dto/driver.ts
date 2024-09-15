import { CostStatus } from "../entity/shipment-cost.entity";
import { Paginate } from "./paginate";

export type FilterDriverSalary = {
  year: number;
  month: number;
  offset: number;
  limit: number;
  driver_code?: string;
  status?: CostStatus;
  name?: string;
};

export type DriverSalaryData = {
  driver_code: string;
  name: string;
  total_pending: number;
  total_confirmed: number;
  total_paid: number;
  total_attendance_salary: number;
  total_salary: number;
  count_shipment: number;
};

export type DriverSalary = {
  data: DriverSalaryData[];
} & Paginate;
