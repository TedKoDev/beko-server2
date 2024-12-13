import { ApiProperty } from '@nestjs/swagger';
import { StatsResponse } from './stats-response.dto';

export class DashboardSummaryDto {
  @ApiProperty({ type: StatsResponse })
  users: StatsResponse;

  @ApiProperty({ type: StatsResponse })
  posts: StatsResponse;

  @ApiProperty({ type: StatsResponse })
  comments: StatsResponse;

  @ApiProperty({ type: StatsResponse })
  games: StatsResponse;

  @ApiProperty({ type: StatsResponse })
  points: StatsResponse;

  @ApiProperty({ type: StatsResponse })
  reports: StatsResponse;

  @ApiProperty({ type: StatsResponse })
  banners: StatsResponse;
}
