"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const user_controller_1 = require("../modules/users/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const userRoutes = async (fastify) => {
    const userController = new user_controller_1.UserController();
    // Public routes
    fastify.post('/register', {
        schema: {
            body: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    role: { type: 'string', enum: ['user', 'admin'], default: 'user' },
                },
            },
        },
    }, userController.createUser);
    // Protected routes
    fastify.addHook('onRequest', auth_middleware_1.authenticate);
    fastify.get('/', userController.getAllUsers);
    fastify.get('/:id', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
        },
    }, userController.getUserById);
    fastify.put('/:id', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
            body: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 8 },
                    role: { type: 'string', enum: ['user', 'admin'] },
                    isActive: { type: 'boolean' },
                },
            },
        },
    }, userController.updateUser);
    fastify.delete('/:id', {
        schema: {
            params: {
                type: 'object',
                required: ['id'],
                properties: {
                    id: { type: 'string', format: 'uuid' },
                },
            },
        },
    }, userController.deleteUser);
};
exports.userRoutes = userRoutes;
//# sourceMappingURL=user.routes.js.map