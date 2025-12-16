"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_controller_1 = require("../controllers/health.controller");
const router = (0, express_1.Router)();
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
 */
router.get('/health', health_controller_1.HealthController.getHealth);
/**
 * @swagger
 * /health/liveness:
 *   get:
 *     summary: Liveness probe for Kubernetes
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Application is alive
 */
router.get('/health/liveness', health_controller_1.HealthController.liveness);
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
 *         description: Application is not ready
 */
router.get('/health/readiness', health_controller_1.HealthController.readiness);
exports.default = router;
//# sourceMappingURL=health.routes.js.map