export enum CostStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PAID = "PAID",
}
export type ShipmentCostEntity = {
  id?: number;
  driver_code: string;
  shipment_no: string;
  total_costs: number;
  cost_status: CostStatus;
};
