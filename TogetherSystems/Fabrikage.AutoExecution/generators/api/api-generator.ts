/**
 * ============================================================================
 * API GENERATOR
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. API-Generator mit OpenAPI-Spec und Validation
 * ============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';

export interface APIGeneratorConfig {
  openapiSpec: boolean;
  validation: boolean;
  documentation: boolean;
  versioning: boolean;
}

export class APIGenerator {
  private config: APIGeneratorConfig;
  private outputDir: string;

  constructor(config: APIGeneratorConfig, outputDir: string = './generated/api') {
    this.config = config;
    this.outputDir = outputDir;
  }

  /**
   * Generates API based on intent
   */
  async generate(intent: any): Promise<string[]> {
    console.log('T,. Generating API...');

    const generatedFiles: string[] = [];

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // Generate OpenAPI spec
    if (this.config.openapiSpec) {
      const openapi = this.generateOpenAPISpec(intent);
      const openapiPath = path.join(this.outputDir, 'openapi.yaml');
      fs.writeFileSync(openapiPath, openapi);
      generatedFiles.push(openapiPath);
    }

    // Generate API implementation
    const api = this.generateAPIImplementation(intent);
    const apiPath = path.join(this.outputDir, 'api.ts');
    fs.writeFileSync(apiPath, api);
    generatedFiles.push(apiPath);

    // Generate validation schemas
    if (this.config.validation) {
      const schemas = this.generateValidationSchemas(intent);
      const schemasPath = path.join(this.outputDir, 'schemas.json');
      fs.writeFileSync(schemasPath, JSON.stringify(schemas, null, 2));
      generatedFiles.push(schemasPath);
    }

    // Generate documentation
    if (this.config.documentation) {
      const docs = this.generateDocumentation(intent);
      const docsPath = path.join(this.outputDir, 'README.md');
      fs.writeFileSync(docsPath, docs);
      generatedFiles.push(docsPath);
    }

    console.log(`T,. API generated: ${generatedFiles.length} files`);
    return generatedFiles;
  }

  private generateOpenAPISpec(intent: any): string {
    return `openapi: 3.0.0
info:
  title: T,. ${intent.name || 'API'}
  version: 1.0.0
  description: T,. Generated API
  branding: T,.&T,,.&T,,,.T.

servers:
  - url: https://api.togethersystems.com/v2
    description: Production server

paths:
  /health:
    get:
      summary: T,. Health check
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: "ok"
`;
  }

  private generateAPIImplementation(intent: any): string {
    return `
/**
 * T,. Generated API Implementation
 */
import express from 'express';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', branding: 'T,.&T,,.&T,,,.T.' });
});

export default app;
`;
  }

  private generateValidationSchemas(intent: any): any {
    return {
      health: {
        type: 'object',
        properties: {
          status: { type: 'string' },
        },
        required: ['status'],
      },
    };
  }

  private generateDocumentation(intent: any): string {
    return `# T,. API Documentation

## Endpoints

### GET /health

Health check endpoint.

**Response:**
\`\`\`json
{
  "status": "ok",
  "branding": "T,.&T,,.&T,,,.T."
}
\`\`\`
`;
  }
}

