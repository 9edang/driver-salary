import { Router } from "express";
import * as v1 from "./v1/index";
import { Usecase } from "../../usecase";

export class Handler {
  private usecase: Usecase;
  private router: Router;
  constructor(usecase: Usecase) {
    this.usecase = usecase;
    this.router = Router();
  }

  register(): Router {
    const driver = new v1.DriverDelivery(this.usecase.driver);

    this.router.get("/v1/salary/driver/list", driver.searchDriverSalary.bind(driver));

    return this.router;
  }
}
