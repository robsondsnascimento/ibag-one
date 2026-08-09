import { PaginationQueryDto } from '../dto/pagination-query.dto';

export function paginatedResult<T>(data: T[], total: number, pagination: PaginationQueryDto) {
  return {
    data,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages: Math.ceil(total / pagination.limit),
    },
  };
}
