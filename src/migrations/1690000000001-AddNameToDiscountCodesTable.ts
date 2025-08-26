import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddNameToDiscountCodesTable1690000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'discount_codes',
      new TableColumn({
        name: 'name',
        type: 'varchar',
        length: '255',
        isNullable: false,
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('discount_codes', 'name');
  }
}
