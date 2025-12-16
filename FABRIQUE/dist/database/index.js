"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
exports.connectDatabase = connectDatabase;
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const logger_1 = require("../common/logger");
const user_entity_1 = require("../modules/users/entities/user.entity");
(0, dotenv_1.config)();
const logger = new logger_1.Logger('Database');
async function connectDatabase() {
    const dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'fabrique',
        entities: [user_entity_1.User],
        synchronize: process.env.NODE_ENV !== 'production',
        logging: process.env.NODE_ENV === 'development',
        migrations: ['src/database/migrations/**/*.ts'],
        subscribers: [],
    });
    try {
        await dataSource.initialize();
        logger.info('Database connection established');
        return dataSource;
    }
    catch (error) {
        logger.error('Failed to connect to database:', error);
        process.exit(1);
    }
}
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'fabrique',
    entities: [user_entity_1.User],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    migrations: ['src/database/migrations/**/*.ts'],
    subscribers: [],
});
//# sourceMappingURL=index.js.map