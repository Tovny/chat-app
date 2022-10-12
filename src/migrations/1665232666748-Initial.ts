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
            referencedTableName: 'roomUsers',
            columnNames: ['rooms'],
            referencedColumnNames: ['user'],
            onDelete: 'cascade',
        },
        {
            referencedTableName: 'roomMessages',
            columnNames: ['messages'],
            referencedColumnNames: ['user'],
        },
        {
            referencedTableName: 'connections',
            columnNames: ['connections'],
            referencedColumnNames: ['user'],
            onDelete: 'cascade',
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
            referencedTableName: 'roomUsers',
            columnNames: ['users'],
            referencedColumnNames: ['room'],
            onDelete: 'cascade',
        },
        {
            referencedTableName: 'roomMessages',
            columnNames: ['messages'],
            referencedColumnNames: ['room'],
            onDelete: 'cascade',
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
            referencedTableName: 'roomMessages',
            columnNames: ['room'],
            referencedColumnNames: ['message'],
        },
    ],
});

const connectionTable = new Table({
    name: 'connections',
    columns: [
        {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
        },
    ],
    foreignKeys: [
        {
            referencedTableName: 'users',
            columnNames: ['user'],
            referencedColumnNames: ['connections'],
        },
    ],
});

const roomUserTable = new Table({
    name: 'roomUsers',
    columns: [
        {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
        },
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
        },
        {
            referencedTableName: 'rooms',
            columnNames: ['room'],
            referencedColumnNames: ['users'],
        },
    ],
});

const roomMessageTable = new Table({
    name: 'roomMessages',
    columns: [
        {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
        },
        {
            name: 'created_at',
            type: 'timestamptz',
            isNullable: false,
            default: 'now()',
        },
    ],
    foreignKeys: [
        {
            referencedTableName: 'messages',
            columnNames: ['message'],
            referencedColumnNames: ['room'],
            onDelete: 'cascade',
        },
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

const tables = [
    userTable,
    roomTable,
    messageTable,
    connectionTable,
    roomUserTable,
    roomMessageTable,
];

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
