import { BaseProjectDto } from './base-project.dto';
declare const UpdateProjectDto_base: import("@nestjs/common").Type<Partial<BaseProjectDto>>;
export declare class UpdateProjectDto extends UpdateProjectDto_base {
    teamMemberIds?: string[];
}
export {};
