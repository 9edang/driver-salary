export class BaseDelivery {
  protected parsePaginateFromQuery(current?: number, pageSize?: number): { offset: number; limit: number } {
    let offset: number = 1;
    let limit: number = 10;
    if (current && current > 1) {
      offset = current;
    }

    if (pageSize && pageSize > 0) {
      limit = pageSize;
    }

    offset = (offset - 1) * limit;

    return { offset, limit };
  }
}
