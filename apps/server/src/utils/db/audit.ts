// Audit helpers for injecting user context into operations

export interface AuditContext {
  userId: string;
}

export function withAuditCreate(context: AuditContext) {
  return {
    createdBy: context.userId,
    updatedBy: context.userId,
  };
}

export function withAuditUpdate(context: AuditContext) {
  return {
    updatedBy: context.userId,
  };
}

export function withSoftDelete(context: AuditContext) {
  return {
    deletedAt: new Date(),
    deletedBy: context.userId,
  };
}
