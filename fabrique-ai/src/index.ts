import { Logger } from './common/logger';
import { AIService } from './ai/service';
import { PLCServer } from './plc/server';
import { GatewayService } from './gateway/service';
import { SCADAService } from './scada/service';
import { MonitoringService } from './runtime/monitoring';

class FabriqueAI {
  private logger: Logger;
  private aiService: AIService;
  private plcServer: PLCServer;
  private gatewayService: GatewayService;
  private scadaService: SCADAService;
  private monitoringService: MonitoringService;

  constructor() {
    this.logger = new Logger('FabriqueAI');
    this.monitoringService = new MonitoringService();
  }

  async initialize() {
    try {
      this.logger.info('Initializing Fabrique AI System...');
      
      // Initialize services
      await this.monitoringService.initialize();
      
      this.aiService = new AIService(this.monitoringService);
      this.plcServer = new PLCServer(this.monitoringService);
      this.gatewayService = new GatewayService(this.monitoringService);
      this.scadaService = new SCADAService(this.monitoringService);
      
      // Start services
      await this.aiService.start();
      await this.plcServer.start();
      await this.gatewayService.start();
      await this.scadaService.start();
      
      this.logger.info('Fabrique AI System started successfully');
      
    } catch (error) {
      this.logger.error('Failed to initialize Fabrique AI System', error);
      process.exit(1);
    }
  }

  async shutdown() {
    this.logger.info('Shutting down Fabrique AI System...');
    
    // Shutdown in reverse order
    await this.scadaService?.shutdown();
    await this.gatewayService?.shutdown();
    await this.plcServer?.shutdown();
    await this.aiService?.shutdown();
    await this.monitoringService?.shutdown();
    
    this.logger.info('Fabrique AI System has been shut down');
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  const app = new FabriqueAI();
  await app.shutdown();
  process.exit(0);
});

// Start the application
(async () => {
  const app = new FabriqueAI();
  await app.initialize();
})();
