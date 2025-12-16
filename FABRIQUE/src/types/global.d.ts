// Type definitions for global modules
declare module '*.json' {
  const value: any;
  export default value;
}

// Fastify type extensions
declare module 'fastify' {
  interface FastifyRequest {
    user?: any; // Adjust this type according to your user object structure
  }
}

// CORS plugin type definitions
declare module '@fastify/cors' {
  import { FastifyPluginAsync } from 'fastify';
  
  interface FastifyCorsOptions {
    origin?: boolean | string | RegExp | (string | RegExp)[] | ((origin: string, cb: (err: Error | null, allow: boolean) => void) => void);
    methods?: string | string[];
    allowedHeaders?: string | string[];
    exposedHeaders?: string | string[];
    credentials?: boolean;
    maxAge?: number;
    preflightContinue?: boolean;
    optionsSuccessStatus?: number;
    preflight?: boolean;
    strictPreflight?: boolean;
    hideOptionsRoute?: boolean;
  }

  const cors: FastifyPluginAsync<FastifyCorsOptions>;
  export default cors;
  export { FastifyCorsOptions };
}

// Helmet plugin type definitions
declare module '@fastify/helmet' {
  import { FastifyPluginAsync } from 'fastify';
  import { FastifyHelmetOptions } from '@fastify/helmet';
  
  const helmet: FastifyPluginAsync<FastifyHelmetOptions>;
  export default helmet;
  export { FastifyHelmetOptions };
}

// Compress plugin type definitions
declare module '@fastify/compress' {
  import { FastifyPluginAsync } from 'fastify';
  
  interface FastifyCompressOptions {
    global?: boolean;
    threshold?: number;
    customTypes?: RegExp;
    encodings?: string[];
    requestEncodings?: string[];
    inflateIfDefined?: boolean;
    zlib?: any;
  }

  const compress: FastifyPluginAsync<FastifyCompressOptions>;
  export default compress;
  export { FastifyCompressOptions };
}

// Global error type for better error handling
interface AppError extends Error {
  code?: string | number;
  statusCode?: number;
  details?: any;
  
  constructor(
    message: string,
    statusCode?: number,
    code?: string | number,
    details?: any
  );
}

// Extend NodeJS global type
declare namespace NodeJS {
  interface Global {
    __rootdir__: string;
  }

  // For environment variables
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    DB_HOST: string;
    DB_PORT: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    [key: string]: string | undefined;
  }
}

// Type for HTTP methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// Type for API response format
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string | number;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
