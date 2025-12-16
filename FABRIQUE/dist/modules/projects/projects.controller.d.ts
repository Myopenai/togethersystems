import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
export declare class ProjectsController {
    private readonly projectsService;
    constructor(projectsService: ProjectsService);
    create(req: any, createProjectDto: CreateProjectDto): Promise<Project>;
    findAll(req: any, status?: string, search?: string, startDate?: string, endDate?: string, page?: number, limit?: number): Promise<{
        data: Project[];
        total: number;
    }>;
    findOne(req: any, id: string): Promise<Project>;
    update(req: any, id: string, updateProjectDto: UpdateProjectDto): Promise<Project>;
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
    updateStatus(req: any, id: string, status: string): Promise<Project>;
    addTeamMember(req: any, projectId: string, memberId: string): Promise<Project>;
    removeTeamMember(req: any, projectId: string, memberId: string): Promise<Project>;
}
