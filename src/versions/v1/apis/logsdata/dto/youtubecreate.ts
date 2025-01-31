import { IsString } from 'class-validator';

export class YoutubeCreateDto {
  @IsString()
  link: string;

  @IsString()
  name: string;

  @IsString()
  topic: string;

  @IsString()
  filelink: string;
}
