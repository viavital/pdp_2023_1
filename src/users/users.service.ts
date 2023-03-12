import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "./entity/user.entity";
import { UserDTO } from "./entity/userDTO";
import * as bcrypt from "bcrypt";

export type Userlocal = any;

@Injectable()
export class UsersService {

  constructor(@Inject("USER_REPOSITORY")
              private usersRepository: Repository<User>) {
  }

  async findAll() {
    const results = await this.usersRepository.find();
    const userList: { username: string }[] = [];
    for (const result of results) {
      userList.push({ username: result.username });
    }
    return userList;
  }

  async findOne(username: string): Promise<Userlocal | undefined> {
    return this.usersRepository.findOneBy({ username: username });
  }

  async createUser(user: UserDTO) {
    if (await this._checkIsUserExist(user)) {
      return new BadRequestException({ message: "such user is exist" });
    }
    user.password = await this._hashUserPassword(user.password);
    const userPrepared = this.usersRepository.create(user);
    const savedUser = await this.usersRepository.save(userPrepared);
    return { id: savedUser.id, user: savedUser.username };
  }

  private async _checkIsUserExist(user: UserDTO): Promise<boolean> {
    const seekedUser = await this.usersRepository.findOneBy({ username: user.username });
    return Boolean(seekedUser);
  }

  private async _hashUserPassword(password: string) {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(password, salt);
  }
}
