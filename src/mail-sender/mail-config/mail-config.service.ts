import { Injectable } from "@nestjs/common";
import { User } from "../../users/entity/user.entity";
import { IMailConfigService } from "./IMailConfigService";
import { UsersContentService } from "../users-content/users-content-service";
import { MailConfig } from "../../configuration/types/MailConfig";

@Injectable()
export class MailConfigService implements IMailConfigService {

  constructor(private readonly contentService: UsersContentService) {
  }

  async getMailConfig(user: User) {
    return await this.contentService.getUsersMailConfig(user);
  }

  async setMailConfig(user, mailConfig: MailConfig){
    return await this.contentService.setUsersMailConfig(user, mailConfig);
  }
}