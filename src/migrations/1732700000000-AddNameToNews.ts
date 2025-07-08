import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddNameToNews1732700000000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn("news", new TableColumn({
            name: "name",
            type: "varchar",
            isNullable: false,
            default: "''"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn("news", "name");
    }
}
