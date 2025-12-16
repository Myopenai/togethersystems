import { BaseProjectDto } from './base-project.dto';
declare const CreateProjectDto_base: import("@nestjs/common").Type<Omit<BaseProjectDto, "status">>;
export declare class CreateProjectDto extends CreateProjectDto_base {
    teamMemberIds?: string[];
}
export {};
