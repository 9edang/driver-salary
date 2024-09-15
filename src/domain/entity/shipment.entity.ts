export enum ShipmentStatus {
  RUNNING = "RUNNING",
  DONE = "DONE",
  CANCELLED = "CANCELLED",
}

export type ShipmentEntity = {
  shipment_no: string;
  shipment_date: Date;
  shipment_status: ShipmentStatus;
};
