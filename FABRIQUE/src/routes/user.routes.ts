import { FastifyPluginAsync } from 'fastify';
import { UserController } from '../modules/users/user.controller';
import { CreateUserDto } from '../modules/users/dto/create-user.dto';
import { UpdateUserDto } from '../modules/users/dto/update-user.dto';
import { authenticate } from '../middleware/auth.middleware';

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  const userController = new UserController();

  // Public routes
  fastify.post<{ Body: CreateUserDto }>(
    '/register',
    {
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
    },
    userController.createUser
  );

  // Protected routes
  fastify.addHook('onRequest', authenticate);

  fastify.get('/', userController.getAllUsers);

  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    userController.getUserById
  );

  fastify.put<{ Params: { id: string }; Body: UpdateUserDto }>(
    '/:id',
    {
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
    },
    userController.updateUser
  );

  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string', format: 'uuid' },
          },
        },
      },
    },
    userController.deleteUser
  );
};
