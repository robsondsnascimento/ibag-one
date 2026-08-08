import { IsEnum } from 'class-validator';
import { CellStatus } from '../../../generated/prisma/client';
export class UpdateCellStatusDto { @IsEnum(CellStatus) status: CellStatus; }
