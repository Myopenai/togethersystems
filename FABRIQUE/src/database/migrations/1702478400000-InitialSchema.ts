import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class InitialSchema1702478400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
            isGenerated: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
            collation: 'utf8mb4_unicode_ci',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
            collation: 'utf8mb4_unicode_ci',
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'role',
            type: 'enum',
            enum: ['user', 'admin', 'manager'],
            default: '"user"',
          },
          {
            name: 'is_email_verified',
            type: 'boolean',
            default: false,
          },
          {
            name: 'verification_token',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'verification_token_expires',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'reset_password_token',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'reset_password_expires',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'login_attempts',
            type: 'int',
            default: 0,
          },
          {
            name: 'lock_until',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create projects table
    await queryRunner.createTable(
      new Table({
        name: 'projects',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
            isGenerated: true,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: false,
            collation: 'utf8mb4_unicode_ci',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            collation: 'utf8mb4_unicode_ci',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
            default: '"planning"',
          },
          {
            name: 'start_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'due_date',
            type: 'date',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create tasks table
    await queryRunner.createTable(
      new Table({
        name: 'tasks',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
            isGenerated: true,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
            collation: 'utf8mb4_unicode_ci',
          },
          {
            name: 'description',
            type: 'text',
            isNullable: true,
            collation: 'utf8mb4_unicode_ci',
          },
          {
            name: 'status',
            type: 'enum',
            enum: ['todo', 'in_progress', 'in_review', 'done'],
            default: '"todo"',
          },
          {
            name: 'priority',
            type: 'enum',
            enum: ['low', 'medium', 'high', 'critical'],
            default: '"medium"',
          },
          {
            name: 'due_date',
            type: 'timestamp with time zone',
            isNullable: true,
          },
          {
            name: 'project_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'assigned_to',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create audit_logs table
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
            isGenerated: true,
          },
          {
            name: 'action',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'entity_type',
            type: 'varchar',
            length: '50',
            isNullable: false,
          },
          {
            name: 'entity_id',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'old_value',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'new_value',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'ip_address',
            type: 'varchar',
            length: '45',
            isNullable: true,
          },
          {
            name: 'user_agent',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create indexes
    await queryRunner.createIndex('users', new TableIndex({
      name: 'IDX_USER_EMAIL',
      columnNames: ['email'],
      isUnique: true,
    }));

    await queryRunner.createIndex('projects', new TableIndex({
      name: 'IDX_PROJECT_CREATED_BY',
      columnNames: ['created_by'],
    }));

    await queryRunner.createIndex('tasks', new TableIndex({
      name: 'IDX_TASK_PROJECT',
      columnNames: ['project_id'],
    }));

    await queryRunner.createIndex('tasks', new TableIndex({
      name: 'IDX_TASK_ASSIGNED_TO',
      columnNames: ['assigned_to'],
    }));

    await queryRunner.createIndex('audit_logs', new TableIndex({
      name: 'IDX_AUDIT_ENTITY',
      columnNames: ['entity_type', 'entity_id'],
    }));

    // Add foreign keys
    await queryRunner.createForeignKey(
      'projects',
      new TableForeignKey({
        name: 'FK_PROJECT_CREATED_BY',
        columnNames: ['created_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        name: 'FK_TASK_PROJECT',
        columnNames: ['project_id'],
        referencedTableName: 'projects',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        name: 'FK_TASK_ASSIGNED_TO',
        columnNames: ['assigned_to'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'tasks',
      new TableForeignKey({
        name: 'FK_TASK_CREATED_BY',
        columnNames: ['created_by'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    await queryRunner.dropForeignKey('tasks', 'FK_TASK_CREATED_BY');
    await queryRunner.dropForeignKey('tasks', 'FK_TASK_ASSIGNED_TO');
    await queryRunner.dropForeignKey('tasks', 'FK_TASK_PROJECT');
    await queryRunner.dropForeignKey('projects', 'FK_PROJECT_CREATED_BY');

    // Drop indexes
    await queryRunner.dropIndex('audit_logs', 'IDX_AUDIT_ENTITY');
    await queryRunner.dropIndex('tasks', 'IDX_TASK_ASSIGNED_TO');
    await queryRunner.dropIndex('tasks', 'IDX_TASK_PROJECT');
    await queryRunner.dropIndex('projects', 'IDX_PROJECT_CREATED_BY');
    await queryRunner.dropIndex('users', 'IDX_USER_EMAIL');

    // Drop tables
    await queryRunner.dropTable('audit_logs');
    await queryRunner.dropTable('tasks');
    await queryRunner.dropTable('projects');
    await queryRunner.dropTable('users');
  }
}
