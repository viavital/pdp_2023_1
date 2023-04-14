import { ISender } from "./ISender";
import { MailConfig } from "../../configuration/types/MailConfig";
import { Injectable } from "@nestjs/common";
import { User } from "../../users/entity/user.entity";
import { SentMessageInfo, Transporter } from "nodemailer";
import { MailForm } from "../types/MailForm";
import * as path from "path";
import { SubscriberRecord } from "../types/Subscriber";
import { FailedMailsService } from "../failed-mails/FailedMailsService";

const nodemailer = require("nodemailer");

@Injectable()
export class LimitedSender implements ISender {

  private static readonly LIMIT_PER_PASSWORD = 2;

  constructor(private readonly _failedMailsService: FailedMailsService) {
  }

  public async completeSending(param: {
    template: {
      "topic": string,
      "text": string
    };
    billsPath: string;
    user: User;
    mailConfig: MailConfig;
    content: { bills: string[]; listSubscribers: string[][] }
  }) {

    const failedDeliveries: Array<string> = [];

    const { parcelsOfTransports, badPasswords } = await this._completeTransports(param.content, param.mailConfig);


    for (const [subscribers, transport] of parcelsOfTransports) {
      const { failed } = await this._completeSendingForParcel(subscribers, transport, param);
      failedDeliveries.push(...failed);
    }
    this._failedMailsService.writeFails(param.user, failedDeliveries);

    console.log("sending is over");
    return { message: "ok", badPasswords: badPasswords, failedDeliveries: failedDeliveries };
  }

  private _completeParcels(content: { bills: string[]; listSubscribers: string[][] }) {
    const result: SubscriberRecord[][] = new Array<Array<SubscriberRecord>>();
    let counter = 0;
    for (const subscriber of content.listSubscribers) {
      const suitableBill = content.bills.find((item) => item === `${subscriber[0]}.pdf`);
      if (suitableBill) {
        if (!result[counter]) {
          result[counter] = [];
        }
        subscriber.push(suitableBill);
        result[counter].push(subscriber as SubscriberRecord);
        if (result[counter].length == LimitedSender.LIMIT_PER_PASSWORD) {
          counter++;
        }
      }
    }
    return result;
  }


  private async _completeTransports(content: {
    bills: string[],
    listSubscribers: string[][]
  }, mailConfig: MailConfig) {

    const parcelsOfSubscribers: SubscriberRecord[][] = this._completeParcels(content);
    const parcelsOfTransports: [SubscriberRecord[], Transporter][] = [];
    const badPasswords: string[] = [];
    const transports: Transporter[] = [];

    for (const password of mailConfig.passwords) {

      const transport = nodemailer.createTransport({
        host: mailConfig.host,
        port: mailConfig.port,
        secure: true, // true for 465, false for other ports
        auth: {
          user: mailConfig.mail,
          pass: password
        },
        pool: true
      });
      const isVerified = await this._verifyTransport(transport);
      if (isVerified) {
        transports.push(transport);
      } else badPasswords.push(password);
    }

    for (const transport of transports) {
      const currentParcelOfSubscribers = parcelsOfSubscribers[transports.indexOf(transport)];
      if (currentParcelOfSubscribers) {
        parcelsOfTransports.push([currentParcelOfSubscribers, transport]);
      } else {
        break;
      }
    }
    return { parcelsOfTransports: parcelsOfTransports, badPasswords: badPasswords };
  }

  private _fulfillMessageBuffer(subscribers: SubscriberRecord[], param: {
    template: {
      "topic": string,
      "text": string
    };
    billsPath: string;
    user: User;
    mailConfig: MailConfig;
    content: { bills: string[]; listSubscribers: string[][] }
  }) {
    const messagesBuffer: Array<MailForm> = [];
    for (const subscriber of subscribers) {
      messagesBuffer.push({
        from: param.mailConfig.mail,
        to: `${subscriber[1]}`,
        subject: param.template.topic,
        text: param.template.text,
        attachments: [{ path: path.join(param.billsPath, subscriber[3]) }]
      });
    }
    return messagesBuffer;
  }

  private async _completeSendingForParcel(subscribers: SubscriberRecord[], transport: Transporter, param: {
    template: { topic: string; text: string };
    billsPath: string;
    user: User;
    mailConfig: MailConfig;
    content: { bills: string[]; listSubscribers: string[][] }
  }) {
    const failedDeliveries = [];
    const messagesBuffer: Array<MailForm> = this._fulfillMessageBuffer(subscribers, param);

    const promises: Promise<void>[] = [];

    for (const message of messagesBuffer) {
      promises.push(new Promise((resolve, reject) => {
        transport.sendMail(message, (err: Error | null, info: SentMessageInfo) => {
          if (err) {
            console.log(err);
            failedDeliveries.push(message);
            reject("Failed sending to " + message.to);
          } else {
            console.log("sent to", message.to, "bill - ", message.attachments, info);
            resolve();
          }
        });
      }));
    }
    const results = await Promise.allSettled(promises);
    for (const result of results) {
      if (result.status === "rejected") {
        console.log(result.reason);
      }
    }
    console.log("failed sending bills to: ", failedDeliveries);
    return { failed: failedDeliveries };
  }

  private async _verifyTransport(transport: Transporter): Promise<boolean> {
    return new Promise((resolve) => {
      transport.verify((error: any) => {
        if (!error) {
          resolve(true);
        } else {
          resolve(false);
        }
      });
    });
  }
}