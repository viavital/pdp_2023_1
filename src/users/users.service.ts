import { Inject, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { User } from "./entity/user.entity";
import { UserDTO } from "./entity/userDTO";

export type Userlocal = any;

@Injectable()
export class UsersService {
  constructor(@Inject("USER_REPOSITORY")
              private usersRepository: Repository<User>) {
  }

  private readonly users = [
    {
      userId: 1,
      username: "john",
      password: "changeme"
    },
    {
      userId: 2,
      username: "maria",
      password: "guess"
    }
  ];

  async findAll() {
    const results = await this.usersRepository.find();
    const userList: { username: string }[] = [];
    for (const result of results) {
      userList.push({ username: result.username });
    }
    return userList;
  }

  async findOne(username: string): Promise<Userlocal | undefined> {
    return this.users.find((user) => user.username === username);
  }

  async createUser(user: UserDTO) {
    const userPrepared = this.usersRepository.create(user);
    const savedUser = await this.usersRepository.save(userPrepared);
    return savedUser;
  }
}
