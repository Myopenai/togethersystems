import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectsService } from '../../../src/modules/projects/projects.service';
import { Project } from '../../../src/modules/projects/entities/project.entity';
import { User } from '../../../src/modules/users/entities/user.entity';
import { CreateProjectDto } from '../../../src/modules/projects/dto/create-project.dto';
import { UpdateProjectDto } from '../../../src/modules/projects/dto/update-project.dto';
import { ProjectStatus } from '../../../src/modules/projects/entities/project.entity';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let projectRepository: Repository<Project>;
  let userRepository: Repository<User>;

  const mockProjectRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    })),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useValue: mockProjectRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    projectRepository = module.get<Repository<Project>>(getRepositoryToken(Project));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new project', async () => {
      const userId = 'user-id';
      const createProjectDto: CreateProjectDto = {
        name: 'Test Project',
        description: 'Test Description',
      };

      const savedProject = {
        id: 'project-id',
        ...createProjectDto,
        createdById: userId,
        status: ProjectStatus.PLANNING,
      };

      mockProjectRepository.findOne.mockResolvedValue(null);
      mockProjectRepository.create.mockReturnValue(savedProject);
      mockProjectRepository.save.mockResolvedValue(savedProject);

      const result = await service.create(createProjectDto, userId);

      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { name: createProjectDto.name, createdById: userId },
      });
      expect(projectRepository.create).toHaveBeenCalledWith({
        ...createProjectDto,
        createdById: userId,
      });
      expect(projectRepository.save).toHaveBeenCalledWith(savedProject);
      expect(result).toEqual(savedProject);
    });

    it('should throw ConflictException if project with same name exists', async () => {
      const userId = 'user-id';
      const createProjectDto: CreateProjectDto = {
        name: 'Existing Project',
        description: 'Test Description',
      };

      mockProjectRepository.findOne.mockResolvedValue({ id: 'existing-id', ...createProjectDto });

      await expect(service.create(createProjectDto, userId)).rejects.toThrow(
        'A project with this name already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of projects with pagination', async () => {
      const userId = 'user-id';
      const page = 1;
      const limit = 10;
      const projects = [{ id: '1', name: 'Project 1' }, { id: '2', name: 'Project 2' }];
      const total = 2;

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([projects, total]),
      };

      jest.spyOn(projectRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as any);

      const result = await service.findAll(userId, undefined, undefined, undefined, undefined, page, limit);

      expect(queryBuilder.where).toHaveBeenCalledWith('project.createdById = :userId', { userId });
      expect(queryBuilder.skip).toHaveBeenCalledWith((page - 1) * limit);
      expect(queryBuilder.take).toHaveBeenCalledWith(limit);
      expect(result).toEqual({ data: projects, total });
    });
  });

  describe('findOne', () => {
    it('should return a project by id', async () => {
      const userId = 'user-id';
      const projectId = 'project-id';
      const project = { id: projectId, name: 'Test Project', createdById: userId };

      mockProjectRepository.findOne.mockResolvedValue(project);

      const result = await service.findOne(projectId, userId);

      expect(projectRepository.findOne).toHaveBeenCalledWith({
        where: { id: projectId, createdById: userId },
        relations: ['teamMembers', 'tasks', 'tasks.assignedTo'],
      });
      expect(result).toEqual(project);
    });

    it('should throw NotFoundException if project not found', async () => {
      const userId = 'user-id';
      const projectId = 'non-existent-id';

      mockProjectRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(projectId, userId)).rejects.toThrow(
        `Project with ID \"${projectId}\" not found`,
      );
    });
  });

  describe('update', () => {
    it('should update a project', async () => {
      const userId = 'user-id';
      const projectId = 'project-id';
      const updateProjectDto: UpdateProjectDto = {
        name: 'Updated Project Name',
        description: 'Updated Description',
      };

      const existingProject = {
        id: projectId,
        name: 'Original Name',
        description: 'Original Description',
        createdById: userId,
      };

      const updatedProject = {
        ...existingProject,
        ...updateProjectDto,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingProject as any);
      mockProjectRepository.save.mockResolvedValue(updatedProject);

      const result = await service.update(projectId, updateProjectDto, userId);

      expect(service.findOne).toHaveBeenCalledWith(projectId, userId);
      expect(projectRepository.save).toHaveBeenCalledWith(updatedProject);
      expect(result).toEqual(updatedProject);
    });
  });

  describe('remove', () => {
    it('should delete a project', async () => {
      const userId = 'user-id';
      const projectId = 'project-id';

      mockProjectRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(projectId, userId);

      expect(projectRepository.delete).toHaveBeenCalledWith({ id: projectId, createdById: userId });
    });

    it('should throw NotFoundException if project not found', async () => {
      const userId = 'user-id';
      const projectId = 'non-existent-id';

      mockProjectRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(projectId, userId)).rejects.toThrow(
        `Project with ID \"${projectId}\" not found`,
      );
    });
  });

  describe('updateStatus', () => {
    it('should update project status', async () => {
      const userId = 'user-id';
      const projectId = 'project-id';
      const newStatus = ProjectStatus.IN_PROGRESS;

      const project = {
        id: projectId,
        status: ProjectStatus.PLANNING,
        createdById: userId,
      };

      const updatedProject = {
        ...project,
        status: newStatus,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(project as any);
      mockProjectRepository.save.mockResolvedValue(updatedProject);

      const result = await service.updateStatus(projectId, newStatus, userId);

      expect(service.findOne).toHaveBeenCalledWith(projectId, userId);
      expect(projectRepository.save).toHaveBeenCalledWith(updatedProject);
      expect(result.status).toEqual(newStatus);
    });
  });
});
