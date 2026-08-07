export interface CreateNotificationDTO {
  userId: string;
  type: string;
  title: string;
  body: string;
  channels?: string; // 'IN_APP,EMAIL'
  actionUrl?: string;
}

export interface GetNotificationsQuery {
  page?: string;
  limit?: string;
  unreadOnly?: string;
}
