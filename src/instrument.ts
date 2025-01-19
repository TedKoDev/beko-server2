import * as Sentry from '@sentry/nestjs';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  // dsn: process.env.SENTRY_DSN,
  dsn: 'https://233cf5b2bea68cf1e43be786ba873de0@o4508669989617664.ingest.us.sentry.io/4508669991452672',

  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'development',
});
