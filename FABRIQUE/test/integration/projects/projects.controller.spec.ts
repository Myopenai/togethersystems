import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { ProjectsModule } from '../../../src/modules/projects/projects.module';
import { Project } from '../../../src/modules/projects/entities/project.entity';
import { User } from '../../../src/modules/users/entities/user.entity';
import { AuthModule } from '../../../src/modules/auth/auth.module';
import { UsersModule } from '../../../src/modules/users/users.module';
import { ProjectStatus } from '../../../src/modules/projects/entities/project.entity';

describe('ProjectsController (e2e)', () => {
  let app: INestApplication;
  let projectRepository: Repository<Project>;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User',
    role: 'USER',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: () => ({
            type: 'sqljs',
            entities: [Project, User],
            synchronize: true,
            dropSchema: true,
          }),
        }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET') || 'test-secret',
            signOptions: { expiresIn: '1h' },
          }),
          inject: [ConfigService],
        }),
        ProjectsModule,
        AuthModule,
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    projectRepository = moduleFixture.get('ProjectRepository');
    userRepository = moduleFixture.get('UserRepository');
    jwtService = moduleFixture.get<JwtService>(JwtService);

    // Create test user
    await userRepository.save(userRepository.create(testUser));
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /projects', () => {
    it('should create a project', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const token = loginResponse.body.accessToken;

      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
      };

      const response = await request(app.getHttpServer())
        .post('/projects')
        .set('Authorization', `Bearer ${token}`)
        .send(projectData)
        .expect(201);

      expect(response.body).toMatchObject({
        name: projectData.name,
        description: projectData.description,
        status: ProjectStatus.PLANNING,
      });
    });

    it('should return 401 when not authenticated', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'Test Description',
      };

      await request(app.getHttpServer())
        .post('/projects')
        .send(projectData)
        .expect(401);
    });
  });

  describe('GET /projects', () => {
    it('should return projects', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const token = loginResponse.body.accessToken;

      // Create a test project
      await projectRepository.save(
        projectRepository.create({
          name: 'Test Project 1',
          description: 'Test Description 1',
          createdById: loginResponse.body.user.id,
          status: ProjectStatus.IN_PROGRESS,
        }),
      );

      const response = await request(app.getHttpServer())
        .get('/projects')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('description');
      expect(response.body.data[0]).toHaveProperty('status');
    });
  });

  describe('GET /projects/:id', () => {
    it('should return a project by id', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const token = loginResponse.body.accessToken;

      // Create a test project
      const project = await projectRepository.save(
        projectRepository.create({
          name: 'Test Project Details',
          description: 'Test Description Details',
          createdById: loginResponse.body.user.id,
          status: ProjectStatus.IN_PROGRESS,
        }),
      );

      const response = await request(app.getHttpServer())
        .get(`/projects/${project.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: project.id,
        name: 'Test Project Details',
        description: 'Test Description Details',
        status: ProjectStatus.IN_PROGRESS,
      });
    });
  });

  describe('PATCH /projects/:id', () => {
    it('should update a project', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const token = loginResponse.body.accessToken;

      // Create a test project
      const project = await projectRepository.save(
        projectRepository.create({
          name: 'Project to Update',
          description: 'Old Description',
          createdById: loginResponse.body.user.id,
          status: ProjectStatus.PLANNING,
        }),
      );

      const updateData = {
        name: 'Updated Project Name',
        description: 'Updated Description',
      };

      const response = await request(app.getHttpServer())
        .patch(`/projects/${project.id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: project.id,
        ...updateData,
      });
    });
  });

  describe('DELETE /projects/:id', () => {
    it('should delete a project', async () => {
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      const token = loginResponse.body.accessToken;

      // Create a test project
      const project = await projectRepository.save(
        projectRepository.create({
          name: 'Project to Delete',
          description: 'Will be deleted',
          createdById: loginResponse.body.user.id,
          status: ProjectStatus.PLANNING,
        }),
      );

      await request(app.getHttpServer())
        .delete(`/projects/${project.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Verify the project is deleted
      const deletedProject = await projectRepository.findOne({ where: { id: project.id } });
      expect(deletedProject).toBeNull();
    });
  });
});
