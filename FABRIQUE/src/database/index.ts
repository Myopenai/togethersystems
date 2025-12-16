import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Logger } from '../common/logger';
import { User } from '../modules/users/entities/user.entity';

config();

const logger = new Logger('Database');

export async function connectDatabase(): Promise<DataSource> {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'fabrique',
    entities: [User],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    migrations: ['src/database/migrations/**/*.ts'],
    subscribers: [],
  });

  try {
    await dataSource.initialize();
    logger.info('Database connection established');
    return dataSource;
  } catch (error) {
    logger.error('Failed to connect to database:', error);
    process.exit(1);
  }
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'fabrique',
  entities: [User],
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  migrations: ['src/database/migrations/**/*.ts'],
  subscribers: [],
});
