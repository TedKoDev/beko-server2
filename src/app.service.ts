import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getSuccess(): number {
    return 200;
  }
}
