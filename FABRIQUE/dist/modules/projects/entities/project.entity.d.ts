import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';
export declare enum ProjectStatus {
    PLANNING = "planning",
    IN_PROGRESS = "in_progress",
    ON_HOLD = "on_hold",
    COMPLETED = "completed",
    CANCELLED = "cancelled"
}
export declare class Project {
    id: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    startDate?: Date;
    dueDate?: Date;
    createdById: string;
    createdBy: User;
    tasks: Task[];
    createdAt: Date;
    updatedAt: Date;
    validateDates(): void;
    constructor(partial?: Partial<Project>);
}
