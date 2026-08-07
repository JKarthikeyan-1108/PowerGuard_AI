export interface GetAuditLogsQuery {
  page?: string;
  limit?: string;
  action?: string;
  resource?: string;
  userId?: string;
  from?: string;
  to?: string;
}
