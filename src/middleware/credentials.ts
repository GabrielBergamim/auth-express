import { NextFunction, Request, Response } from 'express';

import { allowerOrigins } from '../config/allowedOrigins';

export function credentials(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;

  if (allowerOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }

  return next();
}
