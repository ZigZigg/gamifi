import { MigrationInterface, QueryRunner } from "typeorm";

export class InitData1736657137374 implements MigrationInterface {
    name = 'InitData1736657137374'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "time_log" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "start_time" TIMESTAMP NOT NULL DEFAULT now(), "end_time" TIMESTAMP, "duration" integer, CONSTRAINT "PK_b74817f73944f78f239601069f2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_b74817f73944f78f239601069f" ON "time_log" ("id") `);
        await queryRunner.query(`CREATE TYPE "public"."user_activity_type_enum" AS ENUM('ON_NETWORK', 'ON_PUBLISHER_NETWORK')`);
        await queryRunner.query(`CREATE TABLE "user_activity" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer, "type" "public"."user_activity_type_enum" NOT NULL, CONSTRAINT "PK_daec6d19443689bda7d7785dff5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_daec6d19443689bda7d7785dff" ON "user_activity" ("id") `);
        await queryRunner.query(`CREATE TYPE "public"."account_type_enum" AS ENUM('FACEBOOK', 'GOOGLE', 'APPLE', 'INSTAGRAM', 'TWITTER', 'MICROSOFT')`);
        await queryRunner.query(`CREATE TABLE "account" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "name" character varying, "token" character varying, "account_id" character varying(255), "type" "public"."account_type_enum" NOT NULL, CONSTRAINT "PK_54115ee388cdb6d86bb4bf5b2ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_54115ee388cdb6d86bb4bf5b2e" ON "account" ("id") `);
        await queryRunner.query(`CREATE TABLE "master" ("id" SERIAL NOT NULL, "key" character varying(50) NOT NULL, "value" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1ad656927ad7cd2b8a20c27e44c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."email_status_enum" AS ENUM('PENDING', 'DONE', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "email" ("id" SERIAL NOT NULL, "to" character varying NOT NULL, "title" character varying NOT NULL, "content" character varying NOT NULL, "type" character varying NOT NULL DEFAULT 'WELCOME', "status" "public"."email_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1e7ed8734ee054ef18002e29b1c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('SYSTEM_NOTICE', 'WEBVIEW')`);
        await queryRunner.query(`CREATE TYPE "public"."notification_status_enum" AS ENUM('PENDING', 'DONE')`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" SERIAL NOT NULL, "account_id" integer NOT NULL, "title" character varying NOT NULL, "body" character varying NOT NULL, "type" "public"."notification_type_enum" NOT NULL DEFAULT 'SYSTEM_NOTICE', "status" "public"."notification_status_enum" NOT NULL DEFAULT 'PENDING', "readed_at" TIMESTAMP, "metadata" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_campaign" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" integer NOT NULL, "campaign" character varying(100) NOT NULL, CONSTRAINT "REL_c7d596fde61f180bbcf69acc13" UNIQUE ("user_id"), CONSTRAINT "PK_27741aef78dd54dc0645520b311" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_27741aef78dd54dc0645520b31" ON "user_campaign" ("id") `);
        await queryRunner.query(`CREATE TYPE "public"."public_api_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "public_api" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(100) NOT NULL, "url" character varying(500) NOT NULL, "ticket_id" integer DEFAULT '1', "limit" integer NOT NULL DEFAULT '500', "total_used" integer NOT NULL DEFAULT '0', "code" character varying(10) NOT NULL, "status" "public"."public_api_status_enum" NOT NULL DEFAULT 'ACTIVE', "meta_data" jsonb NOT NULL, CONSTRAINT "UQ_e00000640c393806568fba1f6e8" UNIQUE ("name"), CONSTRAINT "PK_fe5a61d32d28696910b96249712" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe5a61d32d28696910b9624971" ON "public_api" ("id") `);
        await queryRunner.query(`CREATE TYPE "public"."public_api_logs_status_enum" AS ENUM('PENDING_LOGIN', 'SUCCESS_LOGIN', 'FAILED_LOGIN')`);
        await queryRunner.query(`CREATE TABLE "public_api_logs" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "code" character varying(10) NOT NULL, "email" character varying(100) NOT NULL, "phone_number" character varying(20) NOT NULL, "action_id" integer NOT NULL, "status" "public"."public_api_logs_status_enum" NOT NULL DEFAULT 'PENDING_LOGIN', CONSTRAINT "UQ_e4eac17b3386a2fd1aac44b29b9" UNIQUE ("phone_number"), CONSTRAINT "UQ_f0a2a438eabe15c995f2057ae18" UNIQUE ("code", "email", "action_id"), CONSTRAINT "PK_5a65c894447f824cff7c2c735da" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5a65c894447f824cff7c2c735d" ON "public_api_logs" ("id") `);
        await queryRunner.query(`CREATE TYPE "public"."permission_request_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "permission_request" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "status" "public"."permission_request_status_enum" NOT NULL DEFAULT 'PENDING', "user_id" integer NOT NULL, CONSTRAINT "PK_0956b53ddae7aef640e8cc5e9c6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0956b53ddae7aef640e8cc5e9c" ON "permission_request" ("id") `);
        await queryRunner.query(`CREATE TYPE "public"."master_data_type_enum" AS ENUM('REWARD')`);
        await queryRunner.query(`CREATE TABLE "master_data" ("id" SERIAL NOT NULL, "name" character varying(100), "value" character varying(255) NOT NULL, "type" "public"."master_data_type_enum" NOT NULL DEFAULT 'REWARD', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ed55f1736986cf68b330d92bfee" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."campaign_status_enum" AS ENUM('ACTIVE', 'INACTIVE')`);
        await queryRunner.query(`CREATE TABLE "campaign" ("id" SERIAL NOT NULL, "name" character varying(200) NOT NULL, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "start_date_hold" TIMESTAMP NOT NULL, "end_date_hold" TIMESTAMP NOT NULL, "status" "public"."campaign_status_enum" NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0ce34d26e7f2eb316a3a592cdc4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."rewards_type_enum" AS ENUM('FREE', 'PAID')`);
        await queryRunner.query(`CREATE TABLE "rewards" ("id" SERIAL NOT NULL, "value" bigint NOT NULL, "quantity" bigint NOT NULL DEFAULT '0', "hold_quantity" bigint NOT NULL DEFAULT '0', "winning_rate" numeric(12,8) NOT NULL, "type" "public"."rewards_type_enum" NOT NULL DEFAULT 'FREE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "turnTypeId" integer NOT NULL, "campaignId" integer NOT NULL, CONSTRAINT "PK_3d947441a48debeb9b7366f8b8c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "reward_history" ("id" SERIAL NOT NULL, "receive_date" TIMESTAMP NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer NOT NULL, "rewardId" integer NOT NULL, CONSTRAINT "PK_1790d3b4570b3f09a5d486b8193" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_gender_enum" AS ENUM('MALE', 'FEMALE', 'OTHER')`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('ADMIN', 'FRANCHISE', 'USER', 'SUPER_ADMIN', 'PUBLISHER', 'ADVERTISER')`);
        await queryRunner.query(`CREATE TYPE "public"."user_status_enum" AS ENUM('PENDING', 'ACTIVE', 'BANNED', 'DELETED')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "email" character varying(255), "password" character varying(255), "first_name" character varying(100) DEFAULT '', "last_name" character varying(100) DEFAULT '', "avatar" character varying, "phone_code" character varying(5), "phone_number" character varying(15), "gender" "public"."user_gender_enum", "role" "public"."user_role_enum" NOT NULL DEFAULT 'USER', "status" "public"."user_status_enum" NOT NULL DEFAULT 'ACTIVE', "email_verified" boolean NOT NULL DEFAULT false, "username" character varying(255), "full_name" character varying(255), "date_of_birth" date, "country" character varying(255), "province" character varying(255), "last_active" TIMESTAMP, "deleted_at" TIMESTAMP, "login_time" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "UQ_01eea41349b6c9275aec646eee0" UNIQUE ("phone_number"), CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_cace4a159ff9f2512dd4237376" ON "user" ("id") `);
        await queryRunner.query(`ALTER TABLE "account" ADD CONSTRAINT "FK_efef1e5fdbe318a379c06678c51" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_campaign" ADD CONSTRAINT "FK_c7d596fde61f180bbcf69acc133" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "permission_request" ADD CONSTRAINT "FK_f3694dfa41a4358823e8d0a17a9" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rewards" ADD CONSTRAINT "FK_ddd4d918d8b0d156d48381d9eca" FOREIGN KEY ("turnTypeId") REFERENCES "master_data"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rewards" ADD CONSTRAINT "FK_62f95934203af9a1ff8db3b29c2" FOREIGN KEY ("campaignId") REFERENCES "campaign"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reward_history" ADD CONSTRAINT "FK_c8c51bce1a96ca7af60664a6953" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "reward_history" ADD CONSTRAINT "FK_647f3311def9d9f8d46b0c330dc" FOREIGN KEY ("rewardId") REFERENCES "rewards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);

        // Seed data in master_data table with the following data:
        const seedData = [
            { name: 'Điểm Mypoint', value: 'MP_SCORE', type: 'REWARD' },
            { name: 'Nạp thẻ điện thoại', value: 'PHONE_CARD', type: 'REWARD' },
            { name: 'Voucher MyPoint', value: 'VOUCHER_MP', type: 'REWARD' },
            { name: 'Mảnh ghép Airpod (1)', value: 'AIRPOD_PIECE_1', type: 'REWARD' },
            { name: 'Mảnh ghép Airpod (2)', value: 'AIRPOD_PIECE_2', type: 'REWARD' },
            { name: 'Mảnh ghép Airpod (3)', value: 'AIRPOD_PIECE_3', type: 'REWARD' },
            { name: 'Mảnh ghép Iphone (1)', value: 'IP_PIECE_1', type: 'REWARD' },
            { name: 'Mảnh ghép Iphone (2)', value: 'IP_PIECE_2', type: 'REWARD' },
            { name: 'Mảnh ghép Iphone (3)', value: 'IP_PIECE_3', type: 'REWARD' },
            { name: 'Chúc bạn may mắn lần sau', value: 'GOOD_LUCK', type: 'REWARD' },
          ];
      
          for (const data of seedData) {
            await queryRunner.query(
                `INSERT INTO master_data (name, value, type) 
                 SELECT $1, $2::varchar, $3
                 WHERE NOT EXISTS (
                   SELECT 1 FROM master_data WHERE value = $2::varchar
                 )`,
                [data.name, data.value, data.type]
              );
          }
    
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "reward_history" DROP CONSTRAINT "FK_647f3311def9d9f8d46b0c330dc"`);
        await queryRunner.query(`ALTER TABLE "reward_history" DROP CONSTRAINT "FK_c8c51bce1a96ca7af60664a6953"`);
        await queryRunner.query(`ALTER TABLE "rewards" DROP CONSTRAINT "FK_62f95934203af9a1ff8db3b29c2"`);
        await queryRunner.query(`ALTER TABLE "rewards" DROP CONSTRAINT "FK_ddd4d918d8b0d156d48381d9eca"`);
        await queryRunner.query(`ALTER TABLE "permission_request" DROP CONSTRAINT "FK_f3694dfa41a4358823e8d0a17a9"`);
        await queryRunner.query(`ALTER TABLE "user_campaign" DROP CONSTRAINT "FK_c7d596fde61f180bbcf69acc133"`);
        await queryRunner.query(`ALTER TABLE "account" DROP CONSTRAINT "FK_efef1e5fdbe318a379c06678c51"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cace4a159ff9f2512dd4237376"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_gender_enum"`);
        await queryRunner.query(`DROP TABLE "reward_history"`);
        await queryRunner.query(`DROP TABLE "rewards"`);
        await queryRunner.query(`DROP TYPE "public"."rewards_type_enum"`);
        await queryRunner.query(`DROP TABLE "campaign"`);
        await queryRunner.query(`DROP TYPE "public"."campaign_status_enum"`);
        await queryRunner.query(`DROP TABLE "master_data"`);
        await queryRunner.query(`DROP TYPE "public"."master_data_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0956b53ddae7aef640e8cc5e9c"`);
        await queryRunner.query(`DROP TABLE "permission_request"`);
        await queryRunner.query(`DROP TYPE "public"."permission_request_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5a65c894447f824cff7c2c735d"`);
        await queryRunner.query(`DROP TABLE "public_api_logs"`);
        await queryRunner.query(`DROP TYPE "public"."public_api_logs_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe5a61d32d28696910b9624971"`);
        await queryRunner.query(`DROP TABLE "public_api"`);
        await queryRunner.query(`DROP TYPE "public"."public_api_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_27741aef78dd54dc0645520b31"`);
        await queryRunner.query(`DROP TABLE "user_campaign"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TYPE "public"."notification_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
        await queryRunner.query(`DROP TABLE "email"`);
        await queryRunner.query(`DROP TYPE "public"."email_status_enum"`);
        await queryRunner.query(`DROP TABLE "master"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_54115ee388cdb6d86bb4bf5b2e"`);
        await queryRunner.query(`DROP TABLE "account"`);
        await queryRunner.query(`DROP TYPE "public"."account_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_daec6d19443689bda7d7785dff"`);
        await queryRunner.query(`DROP TABLE "user_activity"`);
        await queryRunner.query(`DROP TYPE "public"."user_activity_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b74817f73944f78f239601069f"`);
        await queryRunner.query(`DROP TABLE "time_log"`);
    }

}
