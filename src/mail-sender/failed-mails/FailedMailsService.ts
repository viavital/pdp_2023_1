import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import { User } from "../../users/entity/user.entity";
import * as path from "path";

@Injectable()
export class FailedMailsService {

  writeFails(user: User, failedDeliveries: Array<string>) {
    const date = new Date(Date.now());
    const dateStr = `${date.getDate()}_${date.getMonth()}_${date.getFullYear()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}`
    fs.writeFileSync(path.join("failedMails", `${user.username}_failedMails_${dateStr}.json`), JSON.stringify(failedDeliveries));
  }
}