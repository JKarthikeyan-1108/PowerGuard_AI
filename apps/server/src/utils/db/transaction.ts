import prisma from './connection';

export async function withTransaction<T>(
  callback: (tx: typeof prisma) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
  }
): Promise<T> {
  return prisma.$transaction(async (tx: any) => {
    return await callback(tx);
  }, options);
}
