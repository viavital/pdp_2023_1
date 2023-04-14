import { Inject, Injectable } from "@nestjs/common";
import { UsersFolderTree } from "./types/UsersFolderTree";
import { MailTemplate } from "./types/MailTemplate";

@Injectable()
export class ConfigurationRecord {
  constructor(@Inject('configurationContent')private configuration: any) {
  }
  public getUsersFolders(): UsersFolderTree {
    return this.configuration.usersFolderTree;
  }

  public getDefaultMailTemplate(): MailTemplate {
    return this.configuration.defaultMailTemplate;
  }
}
