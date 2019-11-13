// import { User } from './models/User';
import { getConnection as getDbConnection } from './db';
import { createApp } from './app';
import { logger } from './logger';
import { createSocket } from './socket';

async function bootstrap() {
  try {
    await getDbConnection();
    const app = await createApp();
    await createSocket(app);

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
