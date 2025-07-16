import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddMinOrderToDiscountCodesTable1690000000002 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("discount_codes");
        if (table && !table.findColumnByName("min_order")) {
            await queryRunner.addColumn("discount_codes", new TableColumn({
                name: "min_order",
                type: "int",
                isNullable: true,
            }));
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("discount_codes");
        if (table && table.findColumnByName("min_order")) {
            await queryRunner.dropColumn("discount_codes", "min_order");
        }
    }
}
