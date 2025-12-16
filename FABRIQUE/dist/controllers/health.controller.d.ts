import { Request, Response } from 'express';
/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health check endpoints
 */
export declare class HealthController {
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
    static getHealth(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
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
    static liveness(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
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
    static readiness(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export default HealthController;
