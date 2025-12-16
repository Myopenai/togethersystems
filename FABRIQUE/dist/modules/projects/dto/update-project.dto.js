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
exports.UpdateProjectDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const base_project_dto_1 = require("./base-project.dto");
class UpdateProjectDto extends (0, swagger_1.PartialType)(base_project_dto_1.BaseProjectDto) {
    teamMemberIds;
}
exports.UpdateProjectDto = UpdateProjectDto;
__decorate([
    ApiProperty({
        description: 'Array of team member user IDs to be updated for the project',
        example: ['550e8400-e29b-41d4-a716-446655440000'],
        type: [String],
        required: false,
    }),
    __metadata("design:type", Array)
], UpdateProjectDto.prototype, "teamMemberIds", void 0);
//# sourceMappingURL=update-project.dto.js.map