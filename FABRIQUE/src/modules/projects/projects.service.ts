import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Like, Between, In } from 'typeorm';
import { Project } from './entities/project.entity';
import { User } from '../users/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectStatus } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    const { teamMemberIds = [], ...projectData } = createProjectDto;
    
    // Check if project with the same name already exists for the user
    const existingProject = await this.projectRepository.findOne({
      where: { name: projectData.name, createdById: userId },
    });

    if (existingProject) {
      throw new ConflictException('A project with this name already exists');
    }

    // Create the project
    const project = this.projectRepository.create({
      ...projectData,
      createdById: userId,
    });

    // Add team members if provided
    if (teamMemberIds && teamMemberIds.length > 0) {
      const teamMembers = await this.userRepository.find({
        where: { id: In(teamMemberIds) },
      });
      project.teamMembers = teamMembers;
    }

    return this.projectRepository.save(project);
  }

  async findAll(
    userId: string,
    status?: ProjectStatus,
    search?: string,
    startDate?: Date,
    endDate?: Date,
    page = 1,
    limit = 10,
  ): Promise<{ data: Project[]; total: number }> {
    const skip = (page - 1) * limit;
    const where: FindManyOptions<Project>['where'] = { createdById: userId };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (startDate && endDate) {
      where.startDate = Between(startDate, endDate);
    } else if (startDate) {
      where.startDate = startDate;
    }

    const [data, total] = await this.projectRepository.findAndCount({
      where,
      relations: ['teamMembers'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return { data, total };
  }

  async findOne(id: string, userId: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id, createdById: userId },
      relations: ['teamMembers', 'tasks', 'tasks.assignedTo'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }

    return project;
  }

  async update(
    id: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<Project> {
    const project = await this.findOne(id, userId);
    const { teamMemberIds, ...updateData } = updateProjectDto;

    // Check if updating the name would cause a duplicate
    if (updateData.name && updateData.name !== project.name) {
      const existingProject = await this.projectRepository.findOne({
        where: { name: updateData.name, createdById: userId },
      });

      if (existingProject && existingProject.id !== id) {
        throw new ConflictException('A project with this name already exists');
      }
    }

    // Update team members if provided
    if (teamMemberIds) {
      const teamMembers = await this.userRepository.find({
        where: { id: In(teamMemberIds) },
      });
      project.teamMembers = teamMembers;
    }

    // Update project data
    Object.assign(project, updateData);
    return this.projectRepository.save(project);
  }

  async remove(id: string, userId: string): Promise<void> {
    const result = await this.projectRepository.delete({ id, createdById: userId });
    if (result.affected === 0) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
  }

  async updateStatus(
    id: string,
    status: ProjectStatus,
    userId: string,
  ): Promise<Project> {
    const project = await this.findOne(id, userId);
    
    // Add any business logic for status transitions here
    if (project.status === ProjectStatus.COMPLETED && status !== ProjectStatus.COMPLETED) {
      throw new ForbiddenException('Cannot change status from completed');
    }

    project.status = status;
    return this.projectRepository.save(project);
  }

  async addTeamMember(
    projectId: string,
    userId: string,
    memberId: string,
  ): Promise<Project> {
    const project = await this.findOne(projectId, userId);
    
    // Check if user is already a team member
    const isMember = project.teamMembers?.some(member => member.id === memberId);
    if (isMember) {
      throw new ConflictException('User is already a team member');
    }

    // Get the user to add
    const user = await this.userRepository.findOne({ where: { id: memberId } });
    if (!user) {
      throw new NotFoundException(`User with ID "${memberId}" not found`);
    }

    // Add user to team members
    if (!project.teamMembers) {
      project.teamMembers = [];
    }
    project.teamMembers.push(user);
    
    return this.projectRepository.save(project);
  }

  async removeTeamMember(
    projectId: string,
    userId: string,
    memberId: string,
  ): Promise<Project> {
    const project = await this.findOne(projectId, userId);
    
    // Check if user is a team member
    const memberIndex = project.teamMembers?.findIndex(member => member.id === memberId) ?? -1;
    if (memberIndex === -1) {
      throw new NotFoundException('User is not a team member');
    }

    // Remove user from team members
    project.teamMembers.splice(memberIndex, 1);
    
    return this.projectRepository.save(project);
  }
}
