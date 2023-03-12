import { Controller, Inject, Post, Req, UseGuards } from "@nestjs/common";

import { LocalAuthGuard } from "./auth/local-auth.guard";
import { AuthService } from "./auth/auth.service";
import { Public } from "./auth/global-guard-policy";
import { UsersContentService } from "./mail-sender/users-content-service";

@Controller()
export class AppController {
  constructor(private readonly authService: AuthService,@Inject("UsersContentService") private readonly userContentService: UsersContentService ) {
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Req() req) {
    const access = this.authService.login(req.user);
    if(access){
      await this.userContentService.checkUsersFolderExists(req.user.username)
    }
    return access;
  }

}
