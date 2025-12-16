import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class BaseProjectDto {
  @ApiProperty({ description: 'The name of the project', example: 'E-commerce Platform' })
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'The description of the project', 
    example: 'A complete e-commerce solution with payment integration',
    required: false 
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'The status of the project', 
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
    example: ProjectStatus.PLANNING
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @ApiProperty({ 
    description: 'The start date of the project',
    example: '2023-01-15',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ 
    description: 'The due date of the project',
    example: '2023-12-31',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
