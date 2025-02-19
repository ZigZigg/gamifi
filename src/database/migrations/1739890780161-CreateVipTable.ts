import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateVipTable1739890780161 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."reward_vip_status" AS ENUM('PENDING', 'REDEEMED')`);
        await queryRunner.query(`CREATE TABLE "reward_vip" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "phone_number" character varying(15), "rewardId" integer NOT NULL, "status" "public"."reward_vip_status" NOT NULL, CONSTRAINT "PK_1890d3b4570b3f09a5d486b8193" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "reward_vip" ADD CONSTRAINT "FK_747f3311def9d9f8d46b0c330dc" FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
