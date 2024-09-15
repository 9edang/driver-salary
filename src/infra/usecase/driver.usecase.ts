import { DriverSalary, FilterDriverSalary } from "../../domain/dto/driver";
import { IDriverRepository } from "../repository/driver.repository";

export interface IDriverUsecase {
  searchDriverSalary(filter: FilterDriverSalary): Promise<DriverSalary>;
}

export class DriverUsecase implements IDriverUsecase {
  private dirverRepository: IDriverRepository;
  constructor(driverRepository: IDriverRepository) {
    this.dirverRepository = driverRepository;
  }

  async searchDriverSalary(filter: FilterDriverSalary): Promise<DriverSalary> {
    const [data, count] = await Promise.all([
      this.dirverRepository.findAllDriverSalary(filter),
      this.dirverRepository.countAllDriverSalary(filter),
    ]);

    return {
      data: data,
      total_row: count,
    };
  }
}
