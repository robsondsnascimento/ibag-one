-- CreateTable
CREATE TABLE "EventServiceArea" (
    "eventId" TEXT NOT NULL,
    "serviceAreaId" TEXT NOT NULL,

    CONSTRAINT "EventServiceArea_pkey" PRIMARY KEY ("eventId","serviceAreaId")
);

-- CreateIndex
CREATE INDEX "EventServiceArea_serviceAreaId_idx" ON "EventServiceArea"("serviceAreaId");

-- AddForeignKey
ALTER TABLE "EventServiceArea" ADD CONSTRAINT "EventServiceArea_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventServiceArea" ADD CONSTRAINT "EventServiceArea_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
