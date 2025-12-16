# Self-Healing Monitoring System

This module provides a comprehensive monitoring and self-healing system for the FABRIQUE application. It continuously monitors system health, automatically recovers from common issues, and alerts administrators when manual intervention is required.

## Features

- **Health Monitoring**: Continuously monitors system resources (CPU, memory, disk space)
- **Self-Healing**: Automatically recovers from common issues (e.g., missing directories)
- **Alerting**: Sends notifications via email and Slack when issues are detected
- **REST API**: Provides endpoints for health checks and monitoring data
- **Extensible**: Easy to add new health checks and recovery strategies

## Setup

1. Install the required dependencies:

```bash
npm install check-disk-space nodemailer node-fetch @types/nodemailer @types/node-fetch
```

2. Configure environment variables in your `.env` file:

```env
# Monitoring Configuration
MONITORING_INTERVAL=60000  # Check interval in milliseconds
MAX_FAILURES_BEFORE_ALERT=3

# Email Alerting (optional)
ALERT_EMAILS=admin@example.com,dev@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-email-password
ALERT_FROM_EMAIL=noreply@example.com

# Slack Webhook (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# External Service URLs (optional)
AUTH_SERVICE_URL=http://auth-service/health
PAYMENT_SERVICE_URL=http://payment-service/health
```

## Usage

### Available Endpoints

- `GET /api/health`: Basic health check
- `GET /api/monitor`: Detailed monitoring status
- `GET /api/metrics`: System metrics in Prometheus format
- `POST /api/monitor/simulate/cpu`: Simulate high CPU usage (for testing)
- `POST /api/monitor/simulate/memory`: Simulate high memory usage (for testing)

### Testing the Monitoring System

Run the test script to verify the monitoring system:

```bash
node test-monitoring.js
```

This will run a series of tests against the monitoring endpoints and generate a report.

### Adding Custom Health Checks

1. Create a new method in `monitoring.service.ts` for your health check:

```typescript
private async checkCustomService() {
  try {
    // Your health check logic here
    const isHealthy = await someHealthCheck();
    
    if (!isHealthy) {
      throw new Error('Custom service is not healthy');
    }
    
    this.recordSuccess('custom_service');
  } catch (error) {
    this.recordError('custom_service', error);
    throw error;
  }
}
```

2. Add your check to the `checkServices` method:

```typescript
async checkServices() {
  // ... existing checks ...
  
  // Add your custom check
  try {
    await this.checkCustomService();
  } catch (error) {
    this.recordError('custom_service', error);
  }
}
```

## Alerting

The system supports multiple alerting channels:

### Email Alerts
Configure SMTP settings in your environment variables to enable email alerts.

### Slack Alerts
Set the `SLACK_WEBHOOK_URL` environment variable to enable Slack notifications.

## Production Deployment

For production deployment, consider the following:

1. **Container Health Checks**:
   ```yaml
   # docker-compose.yml
   services:
     app:
       healthcheck:
         test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
         interval: 30s
         timeout: 10s
         retries: 3
   ```

2. **Kubernetes Liveness/Readiness Probes**:
   ```yaml
   # deployment.yaml
   livenessProbe:
     httpGet:
       path: /api/health
       port: 3000
     initialDelaySeconds: 30
     periodSeconds: 10
   
   readinessProbe:
     httpGet:
       path: /api/health
       port: 3000
     initialDelaySeconds: 5
     periodSeconds: 5
   ```

3. **Logging**: Ensure proper logging is configured to capture monitoring events.

## Troubleshooting

- Check application logs for detailed error messages
- Verify all required environment variables are set
- Ensure the application has proper permissions to access system resources
- Test email/Slack notifications in a non-production environment first
