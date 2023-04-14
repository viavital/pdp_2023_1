import { User } from "../../users/entity/user.entity";

export interface IMailConfigService {
  getMailConfig(user: User): Promise<{ "mail": string, passwords: Array<string> }>;
  setMailConfig(user: User, config: { "mail": string, passwords: Array<string> }): Promise<{message: string}>;
}