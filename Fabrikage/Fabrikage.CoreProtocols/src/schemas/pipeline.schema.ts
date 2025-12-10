import { SchemaDefinition } from '../types';

export const pipelineSchema: SchemaDefinition = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://fabrikage.io/schemas/pipeline.json',
  title: 'Pipeline',
  description: 'A pipeline definition for the Fabrikage platform',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      description: 'Unique identifier for the pipeline'
    },
    name: {
      type: 'string',
      description: 'Name of the pipeline',
      minLength: 1,
      maxLength: 100
    },
    version: {
      type: 'string',
      description: 'Schema version of the pipeline definition',
      const: '1.0.0'
    },
    description: {
      type: 'string',
      description: 'Description of what the pipeline does'
    },
    triggers: {
      type: 'object',
      description: 'Events that trigger the pipeline',
      properties: {
        push: {
          type: 'object',
          properties: {
            branches: {
              type: 'array',
              items: { type: 'string' },
              description: 'Branch patterns that trigger the pipeline on push'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Tag patterns that trigger the pipeline on push'
            }
          }
        },
        schedule: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              cron: { type: 'string' },
              timezone: { type: 'string', default: 'UTC' }
            },
            required: ['cron']
          },
          description: 'Cron schedules that trigger the pipeline'
        },
        webhook: {
          type: 'object',
          properties: {
            events: {
              type: 'array',
              items: { type: 'string' },
              description: 'Webhook events that trigger the pipeline'
            },
            secret: {
              type: 'string',
              description: 'Optional secret for webhook verification'
            }
          },
          required: ['events']
        }
      }
    },
    environment: {
      type: 'object',
      description: 'Environment configuration for the pipeline',
      properties: {
        name: {
          type: 'string',
          enum: ['development', 'staging', 'production'],
          default: 'development'
        },
        variables: {
          type: 'object',
          additionalProperties: {
            oneOf: [
              { type: 'string' },
              { type: 'number' },
              { type: 'boolean' },
              { type: 'null' }
            ]
          },
          description: 'Environment variables available to all steps'
        },
        secrets: {
          type: 'array',
          items: { type: 'string' },
          description: 'Names of secrets required by the pipeline'
        }
      },
      required: ['name']
    },
    steps: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            pattern: '^[a-z0-9-]+$',
            description: 'Unique identifier for the step'
          },
          name: {
            type: 'string',
            description: 'Human-readable name of the step'
          },
          type: {
            type: 'string',
            enum: ['task', 'approval', 'parallel', 'sequential'],
            default: 'task'
          },
          image: {
            type: 'string',
            description: 'Container image to use for the step (for task type)'
          },
          commands: {
            type: 'array',
            items: { type: 'string' },
            description: 'Commands to run in the container (for task type)'
          },
          environment: {
            type: 'object',
            additionalProperties: {
              oneOf: [
                { type: 'string' },
                { type: 'number' },
                { type: 'boolean' },
                { type: 'null' }
              ]
            },
            description: 'Step-specific environment variables'
          },
          timeout: {
            type: 'number',
            minimum: 1,
            description: 'Timeout in seconds',
            default: 3600
          },
          retry: {
            type: 'object',
            properties: {
              attempts: { type: 'number', minimum: 1, default: 3 },
              delay: { type: 'number', minimum: 0, default: 5 },
              backoff: { type: 'number', minimum: 1, default: 2 }
            },
            description: 'Retry configuration for the step'
          },
          when: {
            type: 'object',
            properties: {
              branch: {
                type: 'array',
                items: { type: 'string' },
                description: 'Only run for these branches'
              },
              event: {
                type: 'array',
                items: { type: 'string' },
                description: 'Only run for these events'
              },
              condition: {
                type: 'string',
                description: 'Condition expression for running the step'
              }
            },
            description: 'Conditions for running the step'
          },
          onSuccess: {
            type: 'array',
            items: { type: 'string' },
            description: 'Steps to run after this step succeeds'
          },
          onFailure: {
            type: 'array',
            items: { type: 'string' },
            description: 'Steps to run if this step fails'
          },
          always: {
            type: 'array',
            items: { type: 'string' },
            description: 'Steps to always run after this step, regardless of status'
          },
          parallel: {
            type: 'array',
            items: { $ref: '#' },
            description: 'Steps to run in parallel (for parallel type)'
          },
          sequential: {
            type: 'array',
            items: { $ref: '#' },
            description: 'Steps to run in sequence (for sequential type)'
          },
          approval: {
            type: 'object',
            properties: {
              users: {
                type: 'array',
                items: { type: 'string' },
                minItems: 1,
                description: 'Users who can approve this step'
              },
              groups: {
                type: 'array',
                items: { type: 'string' },
                description: 'Groups whose members can approve this step'
              },
              required: {
                type: 'number',
                minimum: 1,
                default: 1,
                description: 'Number of required approvals'
              },
              timeout: {
                type: 'number',
                minimum: 60,
                default: 86400,
                description: 'Approval timeout in seconds'
              }
            },
            required: ['users'],
            description: 'Approval configuration (for approval type)'
          }
        },
        required: ['id', 'name'],
        oneOf: [
          {
            properties: {
              type: { const: 'task' },
              image: { type: 'string' },
              commands: { type: 'array', minItems: 1 }
            },
            required: ['image', 'commands']
          },
          {
            properties: { type: { const: 'approval' } },
            required: ['approval']
          },
          {
            properties: {
              type: { const: 'parallel' },
              parallel: { type: 'array', minItems: 1 }
            },
            required: ['parallel']
          },
          {
            properties: {
              type: { const: 'sequential' },
              sequential: { type: 'array', minItems: 1 }
            },
            required: ['sequential']
          }
        ]
      },
      description: 'Steps to execute in the pipeline'
    },
    artifacts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          path: { type: 'string' },
          type: {
            type: 'string',
            enum: ['file', 'directory', 'docker', 'npm', 'maven', 'generic']
          },
          required: { type: 'boolean', default: true },
          metadata: { type: 'object' }
        },
        required: ['name', 'path', 'type']
      },
      description: 'Artifacts produced by the pipeline'
    },
    notifications: {
      type: 'object',
      properties: {
        onStart: {
          type: 'array',
          items: { $ref: '#/definitions/notification' },
          description: 'Notifications to send when the pipeline starts'
        },
        onSuccess: {
          type: 'array',
          items: { $ref: '#/definitions/notification' },
          description: 'Notifications to send when the pipeline succeeds'
        },
        onFailure: {
          type: 'array',
          items: { $ref: '#/definitions/notification' },
          description: 'Notifications to send when the pipeline fails'
        },
        onError: {
          type: 'array',
          items: { $ref: '#/definitions/notification' },
          description: 'Notifications to send when the pipeline encounters an error'
        }
      },
      description: 'Notification settings for the pipeline'
    },
    cache: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          key: { type: 'string' },
          path: { type: 'string' },
          restoreKeys: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['key', 'path']
      },
      description: 'Cache configuration for the pipeline'
    },
    timeout: {
      type: 'number',
      minimum: 60,
      default: 3600,
      description: 'Global timeout for the pipeline in seconds'
    },
    concurrency: {
      type: 'object',
      properties: {
        group: { type: 'string' },
        cancelInProgress: { type: 'boolean', default: false }
      },
      required: ['group'],
      description: 'Concurrency controls for the pipeline'
    },
    tags: {
      type: 'array',
      items: { type: 'string' },
      description: 'Tags for categorizing the pipeline'
    },
    metadata: {
      type: 'object',
      additionalProperties: true,
      description: 'Additional metadata for the pipeline'
    },
    createdAt: {
      type: 'string',
      format: 'date-time',
      description: 'Timestamp when the pipeline was created'
    },
    updatedAt: {
      type: 'string',
      format: 'date-time',
      description: 'Timestamp when the pipeline was last updated'
    }
  },
  required: ['id', 'name', 'version', 'steps', 'createdAt'],
  additionalProperties: false,
  definitions: {
    notification: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['email', 'slack', 'webhook', 'teams', 'custom']
        },
        config: {
          type: 'object',
          additionalProperties: true
        },
        template: {
          type: 'string',
          description: 'Template for the notification message'
        },
        recipients: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1
        }
      },
      required: ['type', 'config'],
      oneOf: [
        {
          properties: {
            type: { const: 'email' },
            config: {
              type: 'object',
              properties: {
                from: { type: 'string', format: 'email' },
                subject: { type: 'string' },
                smtp: {
                  type: 'object',
                  properties: {
                    host: { type: 'string' },
                    port: { type: 'number' },
                    secure: { type: 'boolean' },
                    auth: {
                      type: 'object',
                      properties: {
                        user: { type: 'string' },
                        pass: { type: 'string' }
                      },
                      required: ['user', 'pass']
                    }
                  },
                  required: ['host', 'port']
                }
              },
              required: ['from', 'smtp']
            }
          },
          required: ['recipients']
        },
        {
          properties: {
            type: { const: 'slack' },
            config: {
              type: 'object',
              properties: {
                webhookUrl: { type: 'string', format: 'uri' },
                channel: { type: 'string' },
                username: { type: 'string' },
                iconEmoji: { type: 'string' },
                iconUrl: { type: 'string', format: 'uri' }
              },
              required: ['webhookUrl']
            }
          }
        },
        {
          properties: {
            type: { const: 'webhook' },
            config: {
              type: 'object',
              properties: {
                url: { type: 'string', format: 'uri' },
                method: {
                  type: 'string',
                  enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                  default: 'POST'
                },
                headers: { type: 'object' },
                auth: {
                  type: 'object',
                  properties: {
                    type: { type: 'string', enum: ['basic', 'bearer', 'apiKey'] },
                    token: { type: 'string' },
                    username: { type: 'string' },
                    password: { type: 'string' },
                    key: { type: 'string' },
                    value: { type: 'string' },
                    prefix: { type: 'string' }
                  },
                  required: ['type'],
                  oneOf: [
                    {
                      properties: {
                        type: { const: 'basic' },
                        username: { type: 'string' },
                        password: { type: 'string' }
                      },
                      required: ['username', 'password']
                    },
                    {
                      properties: {
                        type: { const: 'bearer' },
                        token: { type: 'string' }
                      },
                      required: ['token']
                    },
                    {
                      properties: {
                        type: { const: 'apiKey' },
                        key: { type: 'string' },
                        value: { type: 'string' },
                        in: {
                          type: 'string',
                          enum: ['header', 'query'],
                          default: 'header'
                        },
                        prefix: { type: 'string' }
                      },
                      required: ['key', 'value']
                    }
                  ]
                }
              },
              required: ['url']
            }
          }
        }
      ]
    }
  }
};

export default pipelineSchema;
