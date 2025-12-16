import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  BadRequestException,
  ParseUUIDPipe,
  UsePipes,
  ValidationPipe,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { Project } from './entities/project.entity';

@ApiTags('projects')
@ApiBearerAuth()
@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'The project has been successfully created.', type: Project })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions.' })
  create(@Request() req, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create(createProjectDto, req.user.userId);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Get all projects' })
  @ApiQuery({ name: 'status', required: false, enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'] })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return all projects.', type: [Project] })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  findAll(
    @Request() req,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const parsedPage = Math.max(1, parseInt(page as any, 10)) || 1;
    const parsedLimit = Math.max(1, parseInt(limit as any, 10)) || 10;
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return this.projectsService.findAll(
      req.user.userId,
      status as any,
      search,
      start,
      end,
      parsedPage,
      parsedLimit,
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.USER)
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Return the project.', type: Project })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  findOne(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The project has been successfully updated.', type: Project })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions.' })
  update(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.userId);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Delete a project' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'The project has been successfully deleted.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions.' })
  async remove(@Request() req, @Param('id', ParseUUIDPipe) id: string) {
    await this.projectsService.remove(id, req.user.userId);
    return { message: 'Project deleted successfully' };
  }

  @Post(':id/status/:status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Update project status' })
  @ApiResponse({ status: HttpStatus.OK, description: 'The project status has been updated.', type: Project })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid status transition.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  updateStatus(
    @Request() req,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('status') status: string,
  ) {
    if (!Object.values(ProjectStatus).includes(status as ProjectStatus)) {
      throw new BadRequestException('Invalid status value');
    }
    return this.projectsService.updateStatus(id, status as ProjectStatus, req.user.userId);
  }

  @Post(':id/team/:userId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Add a team member to a project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Team member added successfully.', type: Project })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project or user not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User is already a team member.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  addTeamMember(
    @Request() req,
    @Param('id', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) memberId: string,
  ) {
    return this.projectsService.addTeamMember(projectId, req.user.userId, memberId);
  }

  @Delete(':id/team/:userId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Remove a team member from a project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Team member removed successfully.', type: Project })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Project not found or user is not a team member.' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
  removeTeamMember(
    @Request() req,
    @Param('id', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) memberId: string,
  ) {
    return this.projectsService.removeTeamMember(projectId, req.user.userId, memberId);
  }
}
