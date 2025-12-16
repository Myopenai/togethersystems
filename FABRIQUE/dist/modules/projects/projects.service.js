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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const project_entity_1 = require("./entities/project.entity");
const user_entity_1 = require("../users/entities/user.entity");
const project_entity_2 = require("./entities/project.entity");
let ProjectsService = class ProjectsService {
    projectRepository;
    userRepository;
    constructor(projectRepository, userRepository) {
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }
    async create(createProjectDto, userId) {
        const { teamMemberIds = [], ...projectData } = createProjectDto;
        // Check if project with the same name already exists for the user
        const existingProject = await this.projectRepository.findOne({
            where: { name: projectData.name, createdById: userId },
        });
        if (existingProject) {
            throw new common_1.ConflictException('A project with this name already exists');
        }
        // Create the project
        const project = this.projectRepository.create({
            ...projectData,
            createdById: userId,
        });
        // Add team members if provided
        if (teamMemberIds && teamMemberIds.length > 0) {
            const teamMembers = await this.userRepository.find({
                where: { id: (0, typeorm_2.In)(teamMemberIds) },
            });
            project.teamMembers = teamMembers;
        }
        return this.projectRepository.save(project);
    }
    async findAll(userId, status, search, startDate, endDate, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const where = { createdById: userId };
        if (status) {
            where.status = status;
        }
        if (search) {
            where.name = (0, typeorm_2.Like)(`%${search}%`);
        }
        if (startDate && endDate) {
            where.startDate = (0, typeorm_2.Between)(startDate, endDate);
        }
        else if (startDate) {
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
    async findOne(id, userId) {
        const project = await this.projectRepository.findOne({
            where: { id, createdById: userId },
            relations: ['teamMembers', 'tasks', 'tasks.assignedTo'],
        });
        if (!project) {
            throw new common_1.NotFoundException(`Project with ID "${id}" not found`);
        }
        return project;
    }
    async update(id, updateProjectDto, userId) {
        const project = await this.findOne(id, userId);
        const { teamMemberIds, ...updateData } = updateProjectDto;
        // Check if updating the name would cause a duplicate
        if (updateData.name && updateData.name !== project.name) {
            const existingProject = await this.projectRepository.findOne({
                where: { name: updateData.name, createdById: userId },
            });
            if (existingProject && existingProject.id !== id) {
                throw new common_1.ConflictException('A project with this name already exists');
            }
        }
        // Update team members if provided
        if (teamMemberIds) {
            const teamMembers = await this.userRepository.find({
                where: { id: (0, typeorm_2.In)(teamMemberIds) },
            });
            project.teamMembers = teamMembers;
        }
        // Update project data
        Object.assign(project, updateData);
        return this.projectRepository.save(project);
    }
    async remove(id, userId) {
        const result = await this.projectRepository.delete({ id, createdById: userId });
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Project with ID "${id}" not found`);
        }
    }
    async updateStatus(id, status, userId) {
        const project = await this.findOne(id, userId);
        // Add any business logic for status transitions here
        if (project.status === project_entity_2.ProjectStatus.COMPLETED && status !== project_entity_2.ProjectStatus.COMPLETED) {
            throw new common_1.ForbiddenException('Cannot change status from completed');
        }
        project.status = status;
        return this.projectRepository.save(project);
    }
    async addTeamMember(projectId, userId, memberId) {
        const project = await this.findOne(projectId, userId);
        // Check if user is already a team member
        const isMember = project.teamMembers?.some(member => member.id === memberId);
        if (isMember) {
            throw new common_1.ConflictException('User is already a team member');
        }
        // Get the user to add
        const user = await this.userRepository.findOne({ where: { id: memberId } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID "${memberId}" not found`);
        }
        // Add user to team members
        if (!project.teamMembers) {
            project.teamMembers = [];
        }
        project.teamMembers.push(user);
        return this.projectRepository.save(project);
    }
    async removeTeamMember(projectId, userId, memberId) {
        const project = await this.findOne(projectId, userId);
        // Check if user is a team member
        const memberIndex = project.teamMembers?.findIndex(member => member.id === memberId) ?? -1;
        if (memberIndex === -1) {
            throw new common_1.NotFoundException('User is not a team member');
        }
        // Remove user from team members
        project.teamMembers.splice(memberIndex, 1);
        return this.projectRepository.save(project);
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(project_entity_1.Project)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map