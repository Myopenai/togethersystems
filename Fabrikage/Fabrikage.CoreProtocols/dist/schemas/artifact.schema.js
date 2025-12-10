"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.artifactSchema = void 0;
exports.artifactSchema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    $id: 'https://fabrikage.io/schemas/artifact.json',
    title: 'Artifact',
    description: 'A build artifact produced by the Fabrikage platform',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique identifier for the artifact'
        },
        name: {
            type: 'string',
            description: 'Name of the artifact',
            minLength: 1,
            maxLength: 100
        },
        version: {
            type: 'string',
            description: 'Semantic version of the artifact',
            pattern: '^\\d+\\.\\d+\\.\\d+(?:-[\\w\\.-]+)?(?:\\+[\w\\.-]+)?$'
        },
        type: {
            type: 'string',
            description: 'Type of artifact (e.g., docker, npm, binary)',
            enum: ['docker', 'npm', 'binary', 'library', 'executable', 'documentation', 'other']
        },
        checksum: {
            type: 'string',
            description: 'Checksum of the artifact content',
            pattern: '^[a-fA-F0-9]+$'
        },
        algorithm: {
            type: 'string',
            description: 'Hashing algorithm used for the checksum',
            enum: ['sha256', 'sha512', 'md5']
        },
        location: {
            type: 'string',
            description: 'URI where the artifact is stored',
            format: 'uri'
        },
        metadata: {
            type: 'object',
            description: 'Additional metadata about the artifact',
            additionalProperties: true,
            properties: {
                buildId: {
                    type: 'string',
                    description: 'ID of the build that produced this artifact'
                },
                pipelineId: {
                    type: 'string',
                    description: 'ID of the pipeline that produced this artifact'
                },
                dependencies: {
                    type: 'array',
                    description: 'List of dependencies',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            version: { type: 'string' },
                            type: { type: 'string', enum: ['runtime', 'dev', 'peer', 'optional'] }
                        },
                        required: ['name', 'version']
                    }
                }
            }
        },
        createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the artifact was created'
        },
        updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp when the artifact was last updated'
        }
    },
    required: ['id', 'name', 'version', 'type', 'checksum', 'algorithm', 'location', 'createdAt'],
    additionalProperties: false
};
exports.default = exports.artifactSchema;
