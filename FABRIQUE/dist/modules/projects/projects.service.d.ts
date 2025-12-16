import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { User } from '../users/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectStatus } from './entities/project.entity';
export declare class ProjectsService {
    private readonly projectRepository;
    private readonly userRepository;
    constructor(projectRepository: Repository<Project>, userRepository: Repository<User>);
    create(createProjectDto: CreateProjectDto, userId: string): Promise<Project>;
    findAll(userId: string, status?: ProjectStatus, search?: string, startDate?: Date, endDate?: Date, page?: number, limit?: number): Promise<{
        data: Project[];
        total: number;
    }>;
    findOne(id: string, userId: string): Promise<Project>;
    update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project>;
    remove(id: string, userId: string): Promise<void>;
    updateStatus(id: string, status: ProjectStatus, userId: string): Promise<Project>;
    addTeamMember(projectId: string, userId: string, memberId: string): Promise<Project>;
    removeTeamMember(projectId: string, userId: string, memberId: string): Promise<Project>;
}
