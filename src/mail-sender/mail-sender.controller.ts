import { Controller, Delete, Get, Post, Req, UseGuards } from "@nestjs/common";
import { UsersContentService } from "./users-content/users-content-service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { MailConfigService } from "./mail-config/mail-config.service";
import { MailSenderService } from "./mail-sender.service";

@Controller('mail-sender')
export class MailSenderController {
 constructor(private readonly userContentService: UsersContentService,
             private readonly mailConfigService: MailConfigService,
             private readonly mailSenderService: MailSenderService) {
 }

  @Get("getMyMailTemplate")
  async getMyMailTemplate(@Req() req) {
    return this.userContentService.getMyMailTemplate(req.user);
  }

 @Post("setMyMailTemplate")
 async setMyMailTemplate(@Req() req) {
  return this.userContentService.setMyMailTemplate(req.user, req.body.mailTemplate);
 }

 @Get("getCurrentContent")
 async getCurrentContent(@Req() req) {
  return this.userContentService.getCurrentContent(req.user);
 }

 @Get("getMailConfig")
 async getMailConfig(@Req() req) {
  return this.mailConfigService.getMailConfig(req.user);
 }

 @Post("setMailConfig")
 async setMailConfig(@Req() req) {
  return this.mailConfigService.setMailConfig(req.user, req.body.mailConfig);
 }

 @Delete("flushContent")
 async flushContent(@Req() req){
  return this.userContentService.flushContent(req.user);
 }

 @Post("sendMails")
 async sendMails(@Req() req) {
  return this.mailSenderService.sendMails(req.user);
 }

}
