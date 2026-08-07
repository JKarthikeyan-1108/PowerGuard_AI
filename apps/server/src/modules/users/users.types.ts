export interface GetUsersQuery {
  page?: string;
  limit?: string;
  role?: string;
  status?: string;
  search?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}
