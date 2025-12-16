import { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { User } from '../src/modules/users/entities/user.entity';
export declare const createTestingModule: () => Promise<{
    app: INestApplication<any>;
    moduleFixture: TestingModule;
}>;
export declare const createTestUser: (app: INestApplication, userData?: Partial<User>) => Promise<User[]>;
export declare const getAuthToken: (app: INestApplication, email: string, password: string) => Promise<any>;
export declare const createTestProject: (app: INestApplication, token: string, projectData?: any) => Promise<any>;
