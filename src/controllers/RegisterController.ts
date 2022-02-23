import { Request, Response } from 'express';
import fsPromises from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

import dataApi from '../model/users.json';

export interface RegistrationUserDTO {
  user: string;
  pwd: string;
}

export interface User {
  username: string;
  password: string;
  refreshToken?: string;
  roles?: {[key: string]: number};
}

export class RegisterController {
  usersDB = {
    users: dataApi as User[],
    setUsers: function (data: User[]) {
      this.users = data;
    },
  };

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

    const duplicate = this.usersDB?.users?.find(
      ({ username }) => username === user
    );

    if (duplicate) {
      return res.sendStatus(409);
    }

    try {
      const hashedPwd = await bcrypt.hash(pwd, 10);

      const newUser: User = { username: user, password: hashedPwd, roles: {"User": 2001} };

      this.usersDB.setUsers([...this.usersDB.users, newUser]);

      fsPromises.writeFile(
        path.join(__dirname, '..', 'model', 'users.json'),
        JSON.stringify(this.usersDB.users),
        (err) => {
          return res.sendStatus(500);
        }
      );
    
      return res.status(201).json({message: `New user ${user} created!`});
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
}
