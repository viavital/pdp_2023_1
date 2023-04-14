import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { access, constants } from "node:fs";
import * as fs from "fs";
import { UsersFolderTree } from "../../configuration/types/UsersFolderTree";
import { ConfigurationRecord } from "../../configuration/configuration.record";
import * as path from "path";
import { MailTemplate } from "../../configuration/types/MailTemplate";
import { User } from "../../users/entity/user.entity";
import { parse } from "csv-parse";
import { IContentService } from "./IContentService";
import { MailConfig } from "../../configuration/types/MailConfig";

@Injectable()
export class UsersContentService implements IContentService {
  private static readonly USERS_CONTENT_FOLDER = "users-content";
  private static readonly MAIL_TEMPLATE_FILE = "mailTemplate.json";
  private static readonly MAIL_CONFIG_FILE = "mailConfig.json";
  private readonly _usersFolderTree: UsersFolderTree;
  private readonly _defaultTemplate: MailTemplate;

  constructor(@Inject("ConfigurationRecord") configuration: ConfigurationRecord) {
    this._usersFolderTree = configuration.getUsersFolders();
    this._defaultTemplate = configuration.getDefaultMailTemplate();
  }

  public async checkUsersFolderExists(username: string) {
    const basePath = `${this._usersFolderTree.baseContentFolder}/${username}`;
    await this._checkSpecialFolders(basePath);
  }

  private async _checkSpecialFolders(basePath: string) {
    for (const [, folder] of Object.entries(this._usersFolderTree.usersFolders)) {
      await this._createFolderIfNotExists(`${basePath}/${folder}`);
    }
  }

  private _createFolderIfNotExists(seekedPath: string): Promise<void> {
    return new Promise((resolve) => {
      access(seekedPath, constants.R_OK | constants.W_OK, (err) => {
        if (err) {
          fs.mkdirSync(seekedPath, { recursive: true });
        }
        resolve();
      });
    });
  }

  getMyMailTemplate(user: User) {
    const filePath = path.join(UsersContentService.USERS_CONTENT_FOLDER, user.username, UsersContentService.MAIL_TEMPLATE_FILE);
    if (!fs.existsSync(filePath)) {
      return { message: "you haven't your custom template", template: this._defaultTemplate };
    } else return { message: "your template", template: JSON.parse(fs.readFileSync(filePath, "utf-8")) };
  }

  setMyMailTemplate(user: User, mailTemplate: MailTemplate) {
    if (!mailTemplate || !mailTemplate.topic || !mailTemplate.topic.length || !mailTemplate.text || !mailTemplate.text.length) {
      throw new HttpException(
        "\"topic\" and \"text\" parameters should be defined example: {\"mailTemplate\": {\"topic\": \"my topic\", \"text\": \"my text\"}}", HttpStatus.BAD_REQUEST);
    }
    fs.writeFileSync(path.join("users-content", user.username, UsersContentService.MAIL_TEMPLATE_FILE), JSON.stringify(mailTemplate, null, 4));
    return { message: "your template was set" };
  }

  async getCurrentContent(user: User): Promise<{ bills: string[], listSubscribers: string[][] }> {
    const dirPath = path.join(`${UsersContentService.USERS_CONTENT_FOLDER}`, `${user.username}`);
    const subscribersPath = path.join(`${dirPath}`, this._usersFolderTree.usersFolders.listSubscribers);
    const billsPath = path.join(`${dirPath}`, this._usersFolderTree.usersFolders.bills);
    const listSubscribers = await this._readSubscribers(subscribersPath);
    const bills = this._readReadyBills(billsPath);
    return { listSubscribers, bills };
  }


  private async _readSubscribers(subscribersPath: string) {
    const files = fs.readdirSync(subscribersPath);
    const result: string[][] = new Array();
    for (const file of files) {
      if (file.split(".").includes("csv", -1)) {
        const fileContent = fs.readFileSync(path.join(subscribersPath, file));
        result.push(...(await this._readCSVFile(fileContent)));
      }
    }
    return result;
  }

  private async _readCSVFile(fileContent: any): Promise<any[]> {
    return new Promise((resolve) => {
      const result = [];
      parse(fileContent, {
        delimiter: ";"
      }, function(err, records) {
        result.push(...records);
        resolve(result);
      });
    });
  }

  private _readReadyBills(billsPath: string): string[] {
    return fs.readdirSync(billsPath);
  }

  public async getUsersMailConfig(user: User): Promise<MailConfig> {
    const dirPath = path.join(`${UsersContentService.USERS_CONTENT_FOLDER}`, `${user.username}`);
    const mailConfigPath = path.join(`${dirPath}`,
      this._usersFolderTree.usersFolders.imapConfig,
      UsersContentService.MAIL_CONFIG_FILE);

    if (!fs.existsSync(mailConfigPath)) {
      throw new HttpException("you didn't set mail config", HttpStatus.BAD_REQUEST);
    } else {
      const config = JSON.parse(fs.readFileSync(mailConfigPath, "utf-8"));
      return { mail: config.mail, passwords: config.passwords, host: config.host, port: config.port };
    }
  }

  async setUsersMailConfig(user: User, mailConfig: MailConfig) {
    const dirPath = path.join(`${UsersContentService.USERS_CONTENT_FOLDER}`, `${user.username}`);
    const mailConfigPath = path.join(`${dirPath}`,
      this._usersFolderTree.usersFolders.imapConfig,
      UsersContentService.MAIL_CONFIG_FILE);
    fs.writeFileSync(mailConfigPath, JSON.stringify(mailConfig, null, 4));
    return { message: "mail config was set" };
  }

  flushContent(user) {
    const dirPath = path.join(`${UsersContentService.USERS_CONTENT_FOLDER}`, `${user.username}`);
    const billsPath = path.join(dirPath, this._usersFolderTree.usersFolders.bills);
    const fileListOfBills = fs.readdirSync(billsPath);
    for (const file of fileListOfBills) {
      fs.rmSync(path.join(billsPath, file));
    }
    const subscribersPath = path.join(dirPath, this._usersFolderTree.usersFolders.listSubscribers);
    const fileListOfSubscribers = fs.readdirSync(subscribersPath);
    for (const file of fileListOfSubscribers) {
      fs.rmSync(path.join(subscribersPath, file));
    }
    return { message: "your content for sending was deleted" };
  }

  public getBaseBillsPath(user: User) {
    const dirPath = path.join(`${UsersContentService.USERS_CONTENT_FOLDER}`, `${user.username}`);
    return path.join(`${dirPath}`, this._usersFolderTree.usersFolders.bills);
  }
}