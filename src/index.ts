import { getDbConnection } from './helpers/db';
import { createServer } from './helpers/server';
import { logger } from './helpers/logger';

async function bootstrap() {
  try {
    await getDbConnection();
    await createServer();

    logger.log('info', 'App bootstrapped');
  } catch (e) {
    logger.log('error', e.message);
  }
}

(async () => {
  await bootstrap();
})();
