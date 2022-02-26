import mongoose from 'mongoose';

import { serverHttp } from './app';
import { connectDB } from './config/dbConn';

connectDB();

mongoose.connection.once('open', () => {
  serverHttp.listen(4000, () =>
    console.log(`🚀  Server is running on PORT 4000`)
  );
});
