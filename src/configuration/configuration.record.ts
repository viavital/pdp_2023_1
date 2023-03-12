import { Inject, Injectable } from "@nestjs/common";
import { UsersFolderTree } from "./types/UsersFolderTree";

@Injectable()
export class ConfigurationRecord {
  constructor(@Inject('configurationContent')private configuration: any) {
  }
  public getUsersFolders(): UsersFolderTree {
    return this.configuration.usersFolderTree;
  }
}
