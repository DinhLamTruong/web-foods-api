import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class CreateProductDiscountsTable1690000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('product_discounts')
    if (!tableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'product_discounts',
          columns: [
            {
              name: 'id',
              type: 'bigint',
              isPrimary: true,
              isGenerated: true,
              generationStrategy: 'increment',
            },
            {
              name: 'product_id',
              type: 'bigint',
              isNullable: false,
            },
            {
              name: 'discount_id',
              type: 'bigint',
              isNullable: false,
            },
          ],
        }),
        true,
      )

      await queryRunner.createForeignKey(
        'product_discounts',
        new TableForeignKey({
          columnNames: ['product_id'],
          referencedTableName: 'products',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      )

      await queryRunner.createForeignKey(
        'product_discounts',
        new TableForeignKey({
          columnNames: ['discount_id'],
          referencedTableName: 'discount_codes',
          referencedColumnNames: ['id'],
          onDelete: 'CASCADE',
        }),
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableExists = await queryRunner.hasTable('product_discounts')
    if (tableExists) {
      await queryRunner.dropTable('product_discounts')
    }
  }
}
