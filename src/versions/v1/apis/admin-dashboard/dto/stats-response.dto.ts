import { ApiProperty } from '@nestjs/swagger';

export class StatsResponse {
  @ApiProperty()
  total: number;

  @ApiProperty()
  today: number;

  @ApiProperty()
  weekly: number;

  @ApiProperty()
  monthly: number;

  @ApiProperty()
  growth: number;
}
