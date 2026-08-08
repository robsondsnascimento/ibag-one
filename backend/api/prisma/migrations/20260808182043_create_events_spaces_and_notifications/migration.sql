-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('PASTORAL', 'SERVICE', 'TRAINING', 'REHEARSAL', 'MEETING', 'WORSHIP', 'CONFERENCE', 'SPECIAL_PROGRAM');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('REQUESTED', 'APPROVED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "NotificationAudience" AS ENUM ('ORGANIZATION', 'CAMPUS', 'SERVICE_AREA', 'SERVICE_TEAM', 'PERSON');

-- AlterTable
ALTER TABLE "ServiceSchedule" ADD COLUMN     "eventId" TEXT;

-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "capacidade" INTEGER,
    "recursos" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "type" "EventType" NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'REQUESTED',
    "inicio" TIMESTAMP(3) NOT NULL,
    "fim" TIMESTAMP(3) NOT NULL,
    "alertEnabled" BOOLEAN NOT NULL DEFAULT false,
    "blocksCampusAgenda" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "organizationId" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "responsiblePersonId" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSpace" (
    "eventId" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,

    CONSTRAINT "EventSpace_pkey" PRIMARY KEY ("eventId","spaceId")
);

-- CreateTable
CREATE TABLE "EventServiceTeam" (
    "eventId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,

    CONSTRAINT "EventServiceTeam_pkey" PRIMARY KEY ("eventId","teamId")
);

-- CreateTable
CREATE TABLE "EventChecklist" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "concluido" BOOLEAN NOT NULL DEFAULT false,
    "concluidoEm" TIMESTAMP(3),
    "eventId" TEXT NOT NULL,

    CONSTRAINT "EventChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventHistory" (
    "id" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "eventId" TEXT NOT NULL,
    "changedByUserId" TEXT NOT NULL,

    CONSTRAINT "EventHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "audience" "NotificationAudience" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organizationId" TEXT NOT NULL,
    "campusId" TEXT,
    "serviceAreaId" TEXT,
    "serviceTeamId" TEXT,
    "eventId" TEXT,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationRecipient" (
    "id" TEXT NOT NULL,
    "deliveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),
    "notificationId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,

    CONSTRAINT "NotificationRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Space_organizationId_idx" ON "Space"("organizationId");

-- CreateIndex
CREATE INDEX "Space_campusId_idx" ON "Space"("campusId");

-- CreateIndex
CREATE INDEX "Space_ativo_idx" ON "Space"("ativo");

-- CreateIndex
CREATE INDEX "Event_organizationId_idx" ON "Event"("organizationId");

-- CreateIndex
CREATE INDEX "Event_campusId_idx" ON "Event"("campusId");

-- CreateIndex
CREATE INDEX "Event_inicio_idx" ON "Event"("inicio");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "EventSpace_spaceId_idx" ON "EventSpace"("spaceId");

-- CreateIndex
CREATE INDEX "EventServiceTeam_teamId_idx" ON "EventServiceTeam"("teamId");

-- CreateIndex
CREATE INDEX "EventChecklist_eventId_idx" ON "EventChecklist"("eventId");

-- CreateIndex
CREATE INDEX "EventHistory_eventId_idx" ON "EventHistory"("eventId");

-- CreateIndex
CREATE INDEX "Notification_organizationId_idx" ON "Notification"("organizationId");

-- CreateIndex
CREATE INDEX "Notification_campusId_idx" ON "Notification"("campusId");

-- CreateIndex
CREATE INDEX "Notification_serviceAreaId_idx" ON "Notification"("serviceAreaId");

-- CreateIndex
CREATE INDEX "Notification_serviceTeamId_idx" ON "Notification"("serviceTeamId");

-- CreateIndex
CREATE INDEX "Notification_eventId_idx" ON "Notification"("eventId");

-- CreateIndex
CREATE INDEX "NotificationRecipient_personId_idx" ON "NotificationRecipient"("personId");

-- CreateIndex
CREATE INDEX "NotificationRecipient_readAt_idx" ON "NotificationRecipient"("readAt");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRecipient_notificationId_personId_key" ON "NotificationRecipient"("notificationId", "personId");

-- CreateIndex
CREATE INDEX "ServiceSchedule_eventId_idx" ON "ServiceSchedule"("eventId");

-- AddForeignKey
ALTER TABLE "ServiceSchedule" ADD CONSTRAINT "ServiceSchedule_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_responsiblePersonId_fkey" FOREIGN KEY ("responsiblePersonId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSpace" ADD CONSTRAINT "EventSpace_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSpace" ADD CONSTRAINT "EventSpace_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "Space"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventServiceTeam" ADD CONSTRAINT "EventServiceTeam_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventServiceTeam" ADD CONSTRAINT "EventServiceTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "ServiceTeam"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventChecklist" ADD CONSTRAINT "EventChecklist_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventHistory" ADD CONSTRAINT "EventHistory_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventHistory" ADD CONSTRAINT "EventHistory_changedByUserId_fkey" FOREIGN KEY ("changedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_serviceAreaId_fkey" FOREIGN KEY ("serviceAreaId") REFERENCES "ServiceArea"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_serviceTeamId_fkey" FOREIGN KEY ("serviceTeamId") REFERENCES "ServiceTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipient" ADD CONSTRAINT "NotificationRecipient_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
