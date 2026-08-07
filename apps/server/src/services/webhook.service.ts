import axios from 'axios';
import crypto from 'crypto';
import prisma from '../config/database';
import logger from '../config/logger';

export class WebhookService {
  /**
   * Dispatches an event to all subscribed Webhook Endpoints for a given organization
   * @param organizationId The tenant ID where the event occurred
   * @param eventType The type of event (e.g. 'theft.detected', 'meter.offline')
   * @param payload The JSON payload to send
   */
  public async dispatchEvent(organizationId: string, eventType: string, payload: any): Promise<void> {
    try {
      // Find all active endpoints for this tenant that subscribe to this event type
      const endpoints = await prisma.webhookEndpoint.findMany({
        where: {
          organizationId,
          isActive: true
        }
      });

      // Filter endpoints that subscribe to the specific event (or wildcard '*')
      const targetEndpoints = endpoints.filter(ep => {
        const events = ep.events as string[];
        return events.includes(eventType) || events.includes('*');
      });

      if (targetEndpoints.length === 0) return;

      const payloadString = JSON.stringify({
        id: crypto.randomUUID(),
        type: eventType,
        created: new Date().toISOString(),
        data: payload
      });

      // Dispatch to all matching endpoints concurrently
      await Promise.allSettled(
        targetEndpoints.map(async (endpoint) => {
          try {
            // Sign the payload using HMAC SHA256 for security verification by the receiver
            const signature = crypto
              .createHmac('sha256', endpoint.secret)
              .update(payloadString)
              .digest('hex');

            await axios.post(endpoint.url, payloadString, {
              headers: {
                'Content-Type': 'application/json',
                'PowerGuard-Signature': `sha256=${signature}`,
                'PowerGuard-Event': eventType
              },
              timeout: 5000 // 5 second timeout
            });

            // Reset failure count on success if it was > 0
            if (endpoint.failureCount > 0) {
              await prisma.webhookEndpoint.update({
                where: { id: endpoint.id },
                data: { failureCount: 0 }
              });
            }
          } catch (error: any) {
            logger.warn(`Failed to dispatch webhook to ${endpoint.url}: ${error.message}`);
            
            // Increment failure count, disable if fails too many times (circuit breaker)
            const newFailureCount = endpoint.failureCount + 1;
            await prisma.webhookEndpoint.update({
              where: { id: endpoint.id },
              data: { 
                failureCount: newFailureCount,
                isActive: newFailureCount < 10 // Auto-disable after 10 consecutive failures
              }
            });
          }
        })
      );
    } catch (error) {
      logger.error('Error in WebhookService dispatcher:', error);
    }
  }
}

export const webhookService = new WebhookService();
