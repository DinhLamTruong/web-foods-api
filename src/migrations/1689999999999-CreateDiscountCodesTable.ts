import { MigrationInterface, QueryRunner, Table } from 'typeorm'

export class CreateDiscountCodesTable1689999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'discount_codes',
        columns: [
          {
            name: 'id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'code',
            type: 'varchar',
            length: '50',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'discount_type',
            type: 'enum',
            enum: ['percent', 'fixed', 'free_shipping'],
            default: "'percent'",
          },
          {
            name: 'discount_value',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'usage_limit',
            type: 'int',
            default: 1,
          },
          {
            name: 'used_count',
            type: 'int',
            default: 0,
          },
          {
            name: 'start_date',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'end_date',
            type: 'datetime',
            isNullable: true,
          },
          {
            name: 'active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('discount_codes')
  }
}
