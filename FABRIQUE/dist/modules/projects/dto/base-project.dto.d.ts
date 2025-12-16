import { ProjectStatus } from '../entities/project.entity';
export declare class BaseProjectDto {
    name: string;
    description?: string;
    status?: ProjectStatus;
    startDate?: string;
    dueDate?: string;
}
