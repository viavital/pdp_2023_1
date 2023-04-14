import { User } from "../../users/entity/user.entity";
import { MailTemplate } from "../../configuration/types/MailTemplate";
import { MailConfig } from "../../configuration/types/MailConfig";

export interface IContentService {
  checkUsersFolderExists(username: string): Promise<void>;

  getMyMailTemplate(user: User): { message: string, template: any };

  setMyMailTemplate(user: User, mailTemplate: MailTemplate): { message: string };

  getCurrentContent(user: User): Promise<{ bills: string[], listSubscribers: string[][] }>;

  getUsersMailConfig(user: User): Promise<MailConfig>;

  setUsersMailConfig(user: User, mailConfig: MailConfig): Promise<{ message: string }>;
}