"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const user_entity_1 = require("../modules/users/entities/user.entity");
const project_entity_1 = require("../modules/projects/entities/project.entity");
const task_entity_1 = require("../modules/tasks/entities/task.entity");
const audit_log_entity_1 = require("../modules/audit/entities/audit-log.entity");
exports.databaseConfig = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'fabrique',
    entities: [user_entity_1.User, project_entity_1.Project, task_entity_1.Task, audit_log_entity_1.AuditLog],
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    migrations: ['dist/database/migrations/*.js'],
    migrationsRun: process.env.RUN_MIGRATIONS === 'true',
    cli: {
        migrationsDir: 'src/database/migrations',
    },
    extra: {
        charset: 'utf8mb4_unicode_ci',
    },
};
exports.default = exports.databaseConfig;
//# sourceMappingURL=database.config.js.map