import { CorsOptions } from 'cors';

import { allowerOrigins } from './allowedOrigins';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (allowerOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS!'));
    }
  },
  optionsSuccessStatus: 200,
};
