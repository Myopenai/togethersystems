import { Request, Response } from 'express';
import { healthCheckService } from '../services/health.service';
import { Logger } from '../common/logger';

const logger = new Logger('HealthController');

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health check endpoints
 */

export class HealthController {
  /**
   * @swagger
   * /health:
   *   get:
   *     summary: Health check endpoint
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Application is healthy
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "ok"
   *                 timestamp:
   *                   type: string
   *                   format: date-time
   *                 uptime:
   *                   type: number
   *                   example: 123.45
   *                 details:
   *                   type: object
   *                   additionalProperties:
   *                     type: object
   *                     properties:
   *                       status:
   *                         type: string
   *                         example: "ok"
   *                       details:
   *                         type: object
   *       503:
   *         description: Service Unavailable
   */
  public static async getHealth(req: Request, res: Response) {
    try {
      const health = await healthCheckService.check();
      
      // Set the status code based on health status
      const statusCode = health.status === 'error' ? 503 : 200;
      
      // Add cache control headers
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.set('X-Health-Status', health.status);
      
      return res.status(statusCode).json(health);
    } catch (error) {
      logger.error('Health check failed', { error });
      return res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      });
    }
  }

  /**
   * @swagger
   * /health/liveness:
   *   get:
   *     summary: Liveness probe for Kubernetes
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Application is alive
   *       500:
   *         description: Application is not responding
   */
  public static async liveness(req: Request, res: Response) {
    try {
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      return res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Liveness probe failed', { error });
      return res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * @swagger
   * /health/readiness:
   *   get:
   *     summary: Readiness probe for Kubernetes
   *     tags: [Health]
   *     responses:
   *       200:
   *         description: Application is ready to receive traffic
   *       503:
   *         description: Application is not ready to receive traffic
   */
  public static async readiness(req: Request, res: Response) {
    try {
      const health = await healthCheckService.check();
      
      res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      
      if (health.status === 'error') {
        logger.warn('Readiness probe failed', { health });
        return res.status(503).json({
          status: 'error',
          timestamp: health.timestamp,
          details: health.details,
        });
      }
      
      return res.status(200).json({
        status: 'ok',
        timestamp: health.timestamp,
      });
    } catch (error) {
      logger.error('Readiness probe failed', { error });
      return res.status(503).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Readiness check failed',
      });
    }
  }
}

export default HealthController;
