-- AlterTable
ALTER TABLE "Cell" ADD COLUMN     "motherCellId" TEXT;

-- AddForeignKey
ALTER TABLE "Cell" ADD CONSTRAINT "Cell_motherCellId_fkey" FOREIGN KEY ("motherCellId") REFERENCES "Cell"("id") ON DELETE SET NULL ON UPDATE CASCADE;
