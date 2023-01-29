/*
  Warnings:

  - The primary key for the `bookmarks` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `bookmarks` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `users` table. All the data in the column will be lost.
  - Added the required column `bookmark_id` to the `bookmarks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `bookmarks` DROP FOREIGN KEY `bookmarks_userId_fkey`;

-- AlterTable
ALTER TABLE `bookmarks` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `bookmark_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`bookmark_id`);

-- AlterTable
ALTER TABLE `users` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD COLUMN `refresh_token` VARCHAR(191) NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`user_id`);

-- AddForeignKey
ALTER TABLE `bookmarks` ADD CONSTRAINT `bookmarks_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
