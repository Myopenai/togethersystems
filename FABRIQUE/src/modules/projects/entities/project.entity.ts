import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';
import { IsNotEmpty, IsString, IsOptional, IsDate, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ProjectStatus {
  PLANNING = 'planning',
  IN_PROGRESS = 'in_progress',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('projects')
export class Project {
  @ApiProperty({ description: 'The unique identifier of the project' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'The name of the project', example: 'E-commerce Platform' })
  @Column({ type: 'varchar', length: 255, collation: 'utf8mb4_unicode_ci' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ 
    description: 'The description of the project', 
    example: 'A complete e-commerce solution with payment integration',
    required: false 
  })
  @Column({ type: 'text', nullable: true, collation: 'utf8mb4_unicode_ci' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    description: 'The status of the project', 
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING 
  })
  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.PLANNING,
  })
  @IsEnum(ProjectStatus)
  status: ProjectStatus;

  @ApiProperty({ 
    description: 'The start date of the project',
    example: '2023-01-15',
    required: false 
  })
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @ApiProperty({ 
    description: 'The due date of the project',
    example: '2023-12-31',
    required: false 
  })
  @Column({ type: 'date', nullable: true })
  @IsOptional()
  @IsDate()
  dueDate?: Date;

  @ApiProperty({ description: 'The ID of the user who created the project' })
  @Column({ type: 'uuid' })
  @IsUUID()
  createdById: string;

  @ManyToOne(() => User, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @OneToMany(() => Task, task => task.project, { cascade: true })
  tasks: Task[];

  @ApiProperty({ description: 'The date and time when the project was created' })
  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ApiProperty({ description: 'The date and time when the project was last updated' })
  @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @BeforeInsert()
  @BeforeUpdate()
  validateDates() {
    if (this.dueDate && this.startDate && this.dueDate < this.startDate) {
      throw new Error('Due date must be after start date');
    }
  }

  constructor(partial: Partial<Project> = {}) {
    Object.assign(this, partial);
  }
}
