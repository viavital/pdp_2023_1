import { MailConfig } from "../../configuration/types/MailConfig";
import { User } from "../../users/entity/user.entity";
import { Injectable } from "@nestjs/common";

export interface ISender {

  completeSending(param: {
    template: {
      "topic": string,
      "text": string
    };
    billsPath: string;
    user: User;
    mailConfig: MailConfig;
    content: { bills: string[]; listSubscribers: string[][] }
  }) ;
}