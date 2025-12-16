import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { TypeOrmModule, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../src/modules/users/entities/user.entity';

export const createTestingModule = async () => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      TypeOrmModule.forRoot({
        type: 'sqljs',
        entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
        synchronize: true,
        dropSchema: true,
      }),
      AppModule,
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  
  await app.init();
  
  return { app, moduleFixture };
};

export const createTestUser = async (app: INestApplication, userData: Partial<User> = {}) => {
  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));
  
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

export const getAuthToken = async (app: INestApplication, email: string, password: string) => {
  const response = await request(app.getHttpServer())
    .post('/auth/login')
    .send({ email, password });
    
  return response.body.accessToken;
};

import * as request from 'supertest';

export const createTestProject = async (app: INestApplication, token: string, projectData: any = {}) => {
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
