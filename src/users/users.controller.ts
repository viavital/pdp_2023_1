import { Body, Controller, Post } from "@nestjs/common";
import { Public } from "../auth/global-guard-policy";
import { UserDTO } from "./entity/userDTO";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private userService: UsersService) {
  }

  @Public()
  @Post("/createUser")
  createUser(@Body() userDTO: UserDTO) {
    return this.userService.createUser(userDTO);
  }

}
