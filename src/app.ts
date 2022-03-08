import express from 'express';
import cors from 'cors';
import http from 'http';
import cookieParser from 'cookie-parser';
import { config } from 'dotenv';

import { corsOptions } from './config/corsOptions';
import { logger } from './middleware/logger';
import { ensureAuthenticated } from './middleware/verifyJWT';
import { credentials } from './middleware/credentials';
import { routerEmployees } from './routers/employee';
import { routerRegister } from './routers/register';
import { routerUsers } from './routers/user';
import { routerAuth } from './routers/auth';

config();

const app = express();

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(logger);

app.use('/register', routerRegister);
app.use('/auth', routerAuth);
app.use(ensureAuthenticated);
app.use('/users', routerUsers);
app.use('/employees', routerEmployees);

app.all('*', (req, res) => {
  res.status(404);
  if (req.accepts('json')) {
    res.send({ error: '404 Not found' });
  } else {
    res.type('txt').send('404 Not found');
  }
});

const serverHttp = http.createServer(app);

export { serverHttp };
