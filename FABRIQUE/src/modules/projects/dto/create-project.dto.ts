import { ApiProperty, OmitType } from '@nestjs/swagger';
import { BaseProjectDto } from './base-project.dto';

export class CreateProjectDto extends OmitType(BaseProjectDto, ['status'] as const) {
  @ApiProperty({
    description: 'Array of team member user IDs to be added to the project',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
    required: false,
  })
  teamMemberIds?: string[];
}
