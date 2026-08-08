import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { PersonJourneyStage } from '../../../generated/prisma/client';
export class CreatePersonJourneyEventDto { @IsUUID() personId: string; @IsEnum(PersonJourneyStage) stage: PersonJourneyStage; @IsOptional() @IsDateString() data?: string; }
