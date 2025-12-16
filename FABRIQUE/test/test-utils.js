"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestProject = exports.getAuthToken = exports.createTestUser = exports.createTestingModule = void 0;
const testing_1 = require("@nestjs/testing");
const common_1 = require("@nestjs/common");
const app_module_1 = require("../src/app.module");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../src/modules/users/entities/user.entity");
const createTestingModule = async () => {
    const moduleFixture = await testing_1.Test.createTestingModule({
        imports: [
            typeorm_1.TypeOrmModule.forRoot({
                type: 'sqljs',
                entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
                synchronize: true,
                dropSchema: true,
            }),
            app_module_1.AppModule,
        ],
    }).compile();
    const app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new common_1.ValidationPipe({ whitelist: true }));
    await app.init();
    return { app, moduleFixture };
};
exports.createTestingModule = createTestingModule;
const createTestUser = async (app, userData = {}) => {
    const userRepository = app.get((0, typeorm_1.getRepositoryToken)(user_entity_1.User));
    const user = userRepository.create({
        email: userData.email || 'test@example.com',
        password: userData.password || 'password123',
        firstName: userData.firstName || 'Test',
        lastName: userData.lastName || 'User',
        role: userData.role || 'USER',
        isEmailVerified: userData.isEmailVerified !== undefined ? userData.isEmailVerified : true,
    });
    return await userRepository.save(user);
};
exports.createTestUser = createTestUser;
const getAuthToken = async (app, email, password) => {
    const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password });
    return response.body.accessToken;
};
exports.getAuthToken = getAuthToken;
const request = __importStar(require("supertest"));
const createTestProject = async (app, token, projectData = {}) => {
    const defaultProject = {
        name: 'Test Project',
        description: 'Test Description',
        status: 'planning',
        ...projectData,
    };
    const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(defaultProject);
    return response.body;
};
exports.createTestProject = createTestProject;
//# sourceMappingURL=test-utils.js.map