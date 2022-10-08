import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableColumnOptions,
} from 'typeorm';

const sharedColumns: TableColumnOptions[] = [
    {
        name: 'id',
        type: 'integer',
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
});

export class Initial1665232666748 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(userTable);
        await queryRunner.createTable(roomTable);
        await queryRunner.createTable(messageTable);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(userTable);
        await queryRunner.dropTable(roomTable);
        await queryRunner.dropTable(messageTable);
    }
}
