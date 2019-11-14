// import { User } from './models/User';
import { getConnection as getDbConnection } from './helpers/db';
import { createServer } from './helpers/server';
import { logger } from './helpers/logger';

async function bootstrap() {
  try {
    await getDbConnection();
    await createServer();

    logger.log('info', 'APP bootsrapped');
  } catch (e) {
    logger.log('error', e);
  }
}

bootstrap();

// (async () => {
//   try {
//     const newUser = new User({
//       email: 'rshashkov@icloud.com',
//       passwordHash: 'asdasdasdasdasd',
//     });
//     await newUser.save();

//     const user = await User.findOne({
//       email: 'rshashkov@icloud.com',
//     });

//     console.log(user);
//   } catch (e) {
//     console.log(e);
//   }
// })();
