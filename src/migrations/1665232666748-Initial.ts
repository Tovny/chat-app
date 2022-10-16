import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableColumnOptions,
} from 'typeorm';

const sharedColumns: TableColumnOptions[] = [
    {
        name: 'id',
        type: 'text',
        isPrimary: true,
        isGenerated: true,
        generationStrategy: 'uuid',
    },
    {
        name: 'created_at',
        type: 'timestamptz',
        isNullable: false,
        default: 'now()',
    },
    {
        name: 'updated_at',
        type: 'timestamptz',
        isNullable: false,
        default: 'now()',
    },
];

const userTable = new Table({
    name: 'users',
    columns: [
        ...sharedColumns,
        {
            name: 'username',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
        },
        {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
        },
        {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
        },
    ],
    foreignKeys: [
        {
            referencedTableName: 'rooms',
            columnNames: ['rooms'],
            referencedColumnNames: ['users'],
        },
        {
            referencedTableName: 'messages',
            columnNames: ['messages'],
            referencedColumnNames: ['user'],
        },
    ],
});

const roomTable = new Table({
    name: 'rooms',
    columns: [
        ...sharedColumns,
        {
            name: 'name',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
        },
        {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: true,
        },
    ],
    foreignKeys: [
        {
            referencedTableName: 'users',
            columnNames: ['users'],
            referencedColumnNames: ['rooms'],
        },
        {
            referencedTableName: 'messages',
            columnNames: ['messages'],
            referencedColumnNames: ['room'],
        },
    ],
});

const messageTable = new Table({
    name: 'messages',
    columns: [
        ...sharedColumns,
        {
            name: 'content',
            type: 'text',
            isNullable: false,
        },
    ],
    foreignKeys: [
        {
            referencedTableName: 'users',
            columnNames: ['user'],
            referencedColumnNames: ['messages'],
        },
        {
            referencedTableName: 'rooms',
            columnNames: ['room'],
            referencedColumnNames: ['messages'],
        },
    ],
});

const roomUserTable = new Table({
    name: 'roomUsers',
    columns: [
        {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
        },
    ],
    foreignKeys: [
        {
            referencedTableName: 'users',
            columnNames: ['user'],
            referencedColumnNames: ['rooms'],
            onDelete: 'cascade',
        },
        {
            referencedTableName: 'rooms',
            columnNames: ['room'],
            referencedColumnNames: ['users'],
            onDelete: 'cascade',
        },
    ],
});

const tables = [userTable, roomTable, messageTable, roomUserTable];

export class Initial1665232666748 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        Promise.all(
            tables.map(async (table) => await queryRunner.createTable(table))
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        Promise.all(
            tables.map(async (table) => await queryRunner.dropTable(table))
        );
    }
}
