import { Request, Response } from 'express';
import bcrypt from 'bcrypt';

import { UserModel } from '../model/schemas/Users';

export interface RegistrationUserDTO {
  user: string;
  pwd: string;
}

export interface User {
  username: string;
  password: string;
  refreshToken?: string;
  roles?: { [key: string]: number };
}

export class RegisterController {
  async handleNewUser(
    req: Request<{}, {}, RegistrationUserDTO>,
    res: Response
  ) {
    const { user, pwd } = req.body;

    if (!user || !pwd) {
      return res
        .status(400)
        .json({ message: 'Username and password are required.' });
    }

    const duplicate = await UserModel.findOne({ username: user }).exec();

    if (duplicate) {
      return res.sendStatus(409);
    }

    try {
      const hashedPwd = await bcrypt.hash(pwd, 10);

      const newUser: User = await UserModel.create({
        username: user,
        password: hashedPwd,
      });

      console.log(newUser);

      return res.status(201).json({ message: `New user ${user} created!` });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}
