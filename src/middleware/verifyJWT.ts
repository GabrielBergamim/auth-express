import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export interface IPayload {
  username: string;
}

export function ensureAuthenticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.sendStatus(401);
  }

  const [, token] = authHeader.split(' ');

  try {
    const { username } = verify(token, process.env.ACCESS_TOKEN_SECRET) as IPayload;

    req.user = username;

    return next();
  } catch (err) {
    return res.status(403).json({ errorCode: "token.expired" });
  }
}
