import express, { Express, NextFunction, Request, Response, Router } from "express";
import http from "http";
import { Database, IDatabase } from "./pkg/database";
import * as dotenv from "dotenv";
import { seeder } from "./pkg/seeder";
import { DriverRepository } from "./infra/repository/driver.repository";
import { ShipmentRepository } from "./infra/repository/shipment.repository";
import { ShipmentCostRepository } from "./infra/repository/shipment-cost.repository";
import { VariableConfigRepository } from "./infra/repository/variable-config.repository";
import { DriverAttendanceRepository } from "./infra/repository/driver-attendance.repository";
import { TrxRepository } from "./infra/repository/base.repository";
import { Repository } from "./infra/repository";
import { Usecase } from "./infra/usecase";
import { DriverUsecase } from "./infra/usecase/driver.usecase";
import { Handler } from "./infra/delivery/rest/handler";
import { ZodError } from "zod";

export class Application {
  private db: IDatabase;
  private app: Express;
  private router: Router;
  private server: http.Server | undefined;
  private repository: Repository;
  private usecase: Usecase;
  constructor() {
    dotenv.config();

    this.app = express();
  }

  private async initRepository(): Promise<void> {
    const dsn = process.env.DB_URL || "";
    this.db = new Database(dsn);

    const connected = await this.db.connected();
    if (!connected) {
      throw new Error("failed to connect database");
    }

    this.repository = {
      trx: new TrxRepository(this.db.connection),
      driver: new DriverRepository(this.db.connection),
      driverAttendance: new DriverAttendanceRepository(this.db.connection),
      shipmentCost: new ShipmentCostRepository(this.db.connection),
      shipment: new ShipmentRepository(this.db.connection),
      variableConfig: new VariableConfigRepository(this.db.connection),
    };
  }

  private initUsecase(): void {
    this.usecase = {
      driver: new DriverUsecase(this.repository.driver),
    };
  }

  private initHandler(): void {
    const handler = new Handler(this.usecase);
    this.router = handler.register();
  }

  private async shutdown(): Promise<void> {
    try {
      if (this.server) this.server.close();
      await this.db.close();
      console.log("shutdown.");
      process.exit(0);
    } catch (error) {
      console.log("errot shutdown app ", error);
      process.exit(1);
    }
  }

  private async init() {
    await this.initRepository();
    this.initUsecase();
    this.initHandler();

    this.app.use(express.json());
    this.app.use("/", this.router);
    this.app.use('*', function(req, res){
      res.status(404).json({message: "not found"})
    });
    
    this.app.use(async (error: Error, req: Request, res: Response, next: NextFunction) => {
      console.log(error);
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((issue: any) => ({
          message: `${issue.path.join(".")} is ${issue.message}`,
        }));
        res.status(400).json({ error: "Invalid data", details: errorMessages });
      } else {
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    process.on("SIGTERM", this.shutdown.bind(this));
    process.on("SIGINT", this.shutdown.bind(this));
  }

  public async runSeeder(): Promise<void> {
    await this.initRepository();
    await seeder(this.repository);
    await this.db.close();
    process.exit(0);
  }

  public async start(): Promise<void> {
    await this.init();
    const port = process.env.PORT || "8080";
    const host = "0.0.0.0";
    this.server = this.app.listen(parseInt(port), host, () => {
      console.log(`Application listen to http://${host}:${port}`);
    });
  }

  public get isSeed(): boolean {
    const args = process.argv.slice(2);
    return args.length > 0 && args[0] === "--seed";
  }
}
