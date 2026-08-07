// Shared pagination parameters
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export function getPaginationOptions(params: PaginationParams) {
  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 20));
  
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

// Generate sorting options based on field and direction
export function getSortingOptions(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc') {
  if (!sortBy) return { createdAt: 'desc' };
  return { [sortBy]: sortOrder };
}

// Generates a base search query targeting multiple fields with an OR clause
export function generateSearchQuery(fields: string[], query?: string) {
  if (!query) return undefined;
  
  return {
    OR: fields.map((field) => ({
      [field]: { contains: query },
    })),
  };
}

// Generates soft delete filter conditions
export function excludeDeleted() {
  return {
    deletedAt: null
  };
}
