import { PartialType } from '@nestjs/swagger';
import { BaseProjectDto } from './base-project.dto';

export class UpdateProjectDto extends PartialType(BaseProjectDto) {
  @ApiProperty({
    description: 'Array of team member user IDs to be updated for the project',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
    required: false,
  })
  teamMemberIds?: string[];
}
