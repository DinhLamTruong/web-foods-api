// import { MigrationInterface, QueryRunner } from "typeorm";

// export class AddBestSellingAndSuggestionToProduct1732696027429 implements MigrationInterface {
//     name = 'AddBestSellingAndSuggestionToProduct1732696027429'

//     public async up(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query("ALTER TABLE \"products\" ADD \"bestSelling\" boolean NOT NULL DEFAULT false");
//         await queryRunner.query("ALTER TABLE \"products\" ADD \"suggestion\" boolean NOT NULL DEFAULT false");
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.query("ALTER TABLE \"products\" DROP COLUMN \"suggestion\"");
//         await queryRunner.query("ALTER TABLE \"products\" DROP COLUMN \"bestSelling\"");
//     }
// }
