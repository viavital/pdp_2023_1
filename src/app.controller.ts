import { Body, Controller, Get, Post, Req, Request, UseGuards } from "@nestjs/common";

import { LocalAuthGuard } from "./auth/local-auth.guard";
import { AuthService } from "./auth/auth.service";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { Public } from "./auth/global-guard-policy";
import { User } from "./users/entity/user.entity";
import { UserDTO } from "./users/entity/userDTO";
import { UsersService } from "./users/users.service";

@Controller()
export class AppController {
  constructor(private authService: AuthService, private userService: UsersService) {}
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Req() req) {
    console.log(req);
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Get('/listUsers')
  findAll() {
    return this.userService.findAll();
  }

  @Public()
  @Post('/createUser')
  createUser(@Body() userEntity: UserDTO) {
    return this.userService.createUser(userEntity);
  }
}
