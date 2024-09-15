import { NextFunction, Request, Response } from "express";
import { IDriverUsecase } from "../../../usecase/driver.usecase";

import { z } from "zod";
import { BaseDelivery } from "../delivery";
import { CostStatus } from "../../../../domain/entity/shipment-cost.entity";

export class DriverDelivery extends BaseDelivery {
  private driverUsecase: IDriverUsecase;
  constructor(driverUsecase: IDriverUsecase) {
    super();
    this.driverUsecase = driverUsecase;
  }

  async searchDriverSalary(req: Request, res: Response, next: NextFunction) {
    try {
      const schema = z.object({
        year: z.string().regex(/^\d+$/).transform(Number),
        month: z.string().regex(/^\d+$/).transform(Number),
        current: z.string().regex(/^\d+$/).optional().default("1").transform(Number),
        page_size: z.string().regex(/^\d+$/).optional().default("10").transform(Number),
        driver_code: z.string().optional(),
        status: z.nativeEnum(CostStatus).optional(),
        name: z.string().optional(),
      });
      const params = await schema.parseAsync(req.query as Object);
      const { offset, limit } = super.parsePaginateFromQuery(params.current, params.page_size);

      const result = await this.driverUsecase.searchDriverSalary({
        year: params.year,
        month: params.month,
        offset: offset,
        limit: limit,
        driver_code: params.driver_code,
        status: params.status,
        name: params.name,
      });

      result.current = params.current;
      result.page_size = params.page_size;

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
