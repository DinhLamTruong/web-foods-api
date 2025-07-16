import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm'

export class CreateInitialTables1680000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create news table
    await queryRunner.createTable(
      new Table({
        name: 'news',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'title', type: 'varchar', isNullable: false },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'image', type: 'varchar', isNullable: true },
          { name: 'date', type: 'varchar', isNullable: false },
          { name: 'author', type: 'varchar', isNullable: true },
        ],
      }),
      true
    )

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'username', type: 'varchar', length: '100', isNullable: false },
          { name: 'email', type: 'varchar', length: '100', isNullable: false, isUnique: true },
          { name: 'image', type: 'varchar', length: '255', isNullable: true },
          { name: 'password', type: 'varchar', length: '255', isNullable: false },
          { name: 'role', type: 'enum', enum: ['admin', 'user'], default: "'user'" },
          { name: 'refreshToken', type: 'varchar', length: '500', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true
    )

    // Create products table
    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', length: '150', isNullable: false },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'categoryType', type: 'text', isNullable: true },
          { name: 'quantity', type: 'int', default: 0 },
          { name: 'price', type: 'decimal', precision: 10, scale: 0, isNullable: false },
          { name: 'image_url', type: 'varchar', isNullable: true },
          { name: 'bestSelling', type: 'boolean', default: false },
          { name: 'suggestion', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updated_at', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true
    )

    // Create order table
    await queryRunner.createTable(
      new Table({
        name: 'order',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'email', type: 'varchar', default: "''" },
          { name: 'fullName', type: 'varchar', default: "''" },
          { name: 'phone', type: 'varchar', default: "''" },
          { name: 'address', type: 'varchar', default: "''" },
          { name: 'agreeTerms', type: 'boolean', default: false },
          { name: 'discountCode', type: 'varchar', isNullable: true },
          { name: 'district', type: 'varchar', default: "''" },
          { name: 'province', type: 'varchar', default: "''" },
          { name: 'ward', type: 'varchar', default: "''" },
          { name: 'paymentMethod', type: 'varchar', default: "''" },
          { name: 'paymentStatus', type: 'varchar', default: "'pending'" },
          { name: 'shippingMethod', type: 'varchar', default: "''" },
          { name: 'note', type: 'varchar', isNullable: true },
          { name: 'status', type: 'varchar', default: "'pending'" },
          { name: 'totalPrice', type: 'decimal', precision: 10, scale: 0, default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true
    )

    // Create order_item table
    await queryRunner.createTable(
      new Table({
        name: 'order_item',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'description', type: 'varchar', isNullable: false },
          { name: 'imageUrl', type: 'varchar', isNullable: false },
          { name: 'price', type: 'decimal', precision: 10, scale: 0, isNullable: false },
          { name: 'quantity', type: 'int', isNullable: false },
          { name: 'productId', type: 'int', isNullable: false },
          { name: 'orderId', type: 'int', isNullable: false },
        ],
      }),
      true
    )

    // Create contact table
    await queryRunner.createTable(
      new Table({
        name: 'contact',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'email', type: 'varchar', isNullable: false },
          { name: 'message', type: 'text', isNullable: false },
          { name: 'phone', type: 'varchar', isNullable: false },
        ],
      }),
      true
    )

    // Add foreign keys for order_item
    const table = await queryRunner.getTable('order_item')
    if (table) {
      const hasForeignKeyOrder = table.foreignKeys.some(
        (fk) => fk.columnNames.indexOf('orderId') !== -1
      )
      if (!hasForeignKeyOrder) {
        await queryRunner.createForeignKey(
          'order_item',
          new TableForeignKey({
            columnNames: ['orderId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'order',
            onDelete: 'CASCADE',
          })
        )
      }
      const hasForeignKeyProduct = table.foreignKeys.some(
        (fk) => fk.columnNames.indexOf('productId') !== -1
      )
      if (!hasForeignKeyProduct) {
        await queryRunner.createForeignKey(
          'order_item',
          new TableForeignKey({
            columnNames: ['productId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'products',
            onDelete: 'NO ACTION',
          })
        )
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    const table = await queryRunner.getTable('order_item')
    if (table) {
      const foreignKeyOrder = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('orderId') !== -1
      )
      if (foreignKeyOrder) {
        await queryRunner.dropForeignKey('order_item', foreignKeyOrder)
      }
      const foreignKeyProduct = table.foreignKeys.find(
        (fk) => fk.columnNames.indexOf('productId') !== -1
      )
      if (foreignKeyProduct) {
        await queryRunner.dropForeignKey('order_item', foreignKeyProduct)
      }
    }

    // Drop tables in reverse order
    await queryRunner.dropTable('order_item')
    await queryRunner.dropTable('order')
    await queryRunner.dropTable('products')
    await queryRunner.dropTable('users')
    await queryRunner.dropTable('news')
  }
}
