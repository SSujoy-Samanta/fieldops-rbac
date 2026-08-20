/*
  Warnings:

  - You are about to drop the column `isSystem` on the `roles` table. All the data in the column will be lost.
  - Changed the type of `name` on the `roles` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "SYSTEM_ROLE" AS ENUM ('OWNER', 'MANAGER', 'FIELD_EMPLOYEE');

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "isSystem",
DROP COLUMN "name",
ADD COLUMN     "name" "SYSTEM_ROLE" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");
