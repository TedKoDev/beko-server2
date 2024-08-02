import { Provider } from '@nestjs/common';
import { POST_SERVICE_TOKEN, PostService } from './post.service';

export const PostProvider: Provider = {
  provide: POST_SERVICE_TOKEN,
  useClass: PostService,
};
