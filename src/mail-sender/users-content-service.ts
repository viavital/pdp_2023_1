import { Inject, Injectable } from "@nestjs/common";
import { access, constants } from "node:fs";
import * as fs from "fs";
import { UsersFolderTree } from "../configuration/types/UsersFolderTree";
import { ConfigurationRecord } from "../configuration/configuration.record";
@Injectable()
export class UsersContentService {
  private readonly _configuration: UsersFolderTree;

  constructor(@Inject("ConfigurationRecord")configuration: ConfigurationRecord) {
    this._configuration = configuration.getUsersFolders();
  }
  public async checkUsersFolderExists(username: string){
    const basePath = `${this._configuration.baseContentFolder}/${username}`
    await this._checkSpecialFolders(basePath);
  }

  private async _checkSpecialFolders(basePath: string){
    for (const [,folder] of Object.entries(this._configuration.usersFolders)) {
     await this._createFolderIfNotExists(`${basePath}/${folder}`);
    }
  }

  private _createFolderIfNotExists(seekedPath: string):Promise<void> {
    return new Promise((resolve)=>{
      access(seekedPath, constants.R_OK | constants.W_OK, (err) => {
        if(err){
          fs.mkdirSync(seekedPath, { recursive: true });
          resolve();
        }
        resolve();
      });
    })
  }



}