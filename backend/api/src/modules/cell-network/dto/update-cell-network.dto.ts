import { PartialType } from '@nestjs/mapped-types';

import {
  CreateCellNetworkDto,
} from './create-cell-network.dto';

export class UpdateCellNetworkDto extends PartialType(
  CreateCellNetworkDto,
) {}
