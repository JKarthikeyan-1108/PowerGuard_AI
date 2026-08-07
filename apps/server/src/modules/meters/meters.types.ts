export interface GetMetersQuery {
  page?: string;
  limit?: string;
  status?: string;
  type?: string;
  search?: string;
}

export interface GetReadingsQuery {
  days?: string;
}
