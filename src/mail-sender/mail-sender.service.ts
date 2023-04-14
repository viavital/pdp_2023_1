import { Injectable } from "@nestjs/common";
import { User } from "../users/entity/user.entity";
import { UsersContentService } from "./users-content/users-content-service";
import { ISender } from "./Sender/ISender";
import { LimitedSender } from "./Sender/LimitedSender";
import { MailConfig } from "../configuration/types/MailConfig";

@Injectable()
export class MailSenderService {
  constructor(private readonly contentService: UsersContentService, private readonly _sender: LimitedSender) {
  }

  async sendMails(user: User) {
    const mailConfig: MailConfig = await this.contentService.getUsersMailConfig(user);
    const content = await this.contentService.getCurrentContent(user);
    const baseBillsPath = this.contentService.getBaseBillsPath(user);
    const messageTemplate = this.contentService.getMyMailTemplate(user);
    return await this._sender.completeSending({
      user: user,
      content: content,
      billsPath: baseBillsPath,
      template: messageTemplate.template,
      mailConfig: mailConfig
    });
  }
}
