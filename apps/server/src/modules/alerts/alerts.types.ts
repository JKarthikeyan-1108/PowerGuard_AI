export interface GetAlertsQuery {
  status?: string;
  severity?: string;
  type?: string;
}

export interface UpdateAlertStatusDto {
  status: 'ACKNOWLEDGED' | 'INVESTIGATING' | 'RESOLVED' | 'FALSE_ALARM';
}

export interface CreateAlertDto {
  type: string;
  severity: string;
  title: string;
  description: string;
  meterId?: string;
  userId?: string;
  metadata?: any;
}
