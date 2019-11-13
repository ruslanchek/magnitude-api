import { User } from './models/User';
import { getConnection } from './db';

(async () => {
  try {
    await getConnection();

    // const newUser = new User({
    //   email: 'rshashkov@icloud.com',
    //   passwordHash: 'asdasdasdasdasd',
    // });
    // await newUser.save();

    const user = await User.findOne({
      email: 'rshashkov@icloud.com',
    });

    console.log(user);
  } catch (e) {
    console.log(e);
  }
})();
