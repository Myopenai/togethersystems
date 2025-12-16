"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = exports.ProjectStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const task_entity_1 = require("../../tasks/entities/task.entity");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus["PLANNING"] = "planning";
    ProjectStatus["IN_PROGRESS"] = "in_progress";
    ProjectStatus["ON_HOLD"] = "on_hold";
    ProjectStatus["COMPLETED"] = "completed";
    ProjectStatus["CANCELLED"] = "cancelled";
})(ProjectStatus || (exports.ProjectStatus = ProjectStatus = {}));
let Project = class Project {
    id;
    name;
    description;
    status;
    startDate;
    dueDate;
    createdById;
    createdBy;
    tasks;
    createdAt;
    updatedAt;
    validateDates() {
        if (this.dueDate && this.startDate && this.dueDate < this.startDate) {
            throw new Error('Due date must be after start date');
        }
    }
    constructor(partial = {}) {
        Object.assign(this, partial);
    }
};
exports.Project = Project;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The unique identifier of the project' }),
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Project.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The name of the project', example: 'E-commerce Platform' }),
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, collation: 'utf8mb4_unicode_ci' }),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Project.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The description of the project',
        example: 'A complete e-commerce solution with payment integration',
        required: false
    }),
    (0, typeorm_1.Column)({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], Project.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The status of the project',
        enum: ProjectStatus,
        default: ProjectStatus.PLANNING
    }),
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ProjectStatus,
        default: ProjectStatus.PLANNING,
    }),
    (0, class_validator_1.IsEnum)(ProjectStatus),
    __metadata("design:type", String)
], Project.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The start date of the project',
        example: '2023-01-15',
        required: false
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], Project.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'The due date of the project',
        example: '2023-12-31',
        required: false
    }),
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], Project.prototype, "dueDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The ID of the user who created the project' }),
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], Project.prototype, "createdById", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by_id' }),
    __metadata("design:type", user_entity_1.User)
], Project.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, task => task.project, { cascade: true }),
    __metadata("design:type", Array)
], Project.prototype, "tasks", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The date and time when the project was created' }),
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Project.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'The date and time when the project was last updated' }),
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Project.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Project.prototype, "validateDates", null);
exports.Project = Project = __decorate([
    (0, typeorm_1.Entity)('projects'),
    __metadata("design:paramtypes", [Object])
], Project);
//# sourceMappingURL=project.entity.js.map