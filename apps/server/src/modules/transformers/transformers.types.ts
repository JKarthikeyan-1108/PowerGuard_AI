export interface GetTransformersQuery {
  page?: string;
  limit?: string;
  status?: string;
  areaId?: string;
}

export interface CreateTransformerDto {
  name: string;
  serialNumber: string;
  capacity: number;
  latitude: number;
  longitude: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'FAULTY';
  areaId: string;
}
