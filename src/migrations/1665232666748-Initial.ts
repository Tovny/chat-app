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
            name: 'username',
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
            referencedTableName: 'rooms',
            columnNames: ['room'],
            referencedColumnNames: ['messages'],
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
        { name: 'userID', type: 'text', isNullable: false },
        { name: 'connectionID', type: 'text', isNullable: false },
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
    name: 'connections',
    columns: [
        {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
        },
        { name: 'userID', type: 'text' },
        { name: 'roomID', type: 'text' },
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
            columnNames: ['rooms'],
            referencedColumnNames: ['users'],
        },
    ],
});

const tables = [
    userTable,
    roomTable,
    messageTable,
    connectionTable,
    roomUserTable,
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
