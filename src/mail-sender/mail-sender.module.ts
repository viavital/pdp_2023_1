import { Module } from "@nestjs/common";
import { UsersContentService } from "./users-content/users-content-service";
import { ConfigurationRecord } from "../configuration/configuration.record";
import { ConfigurationModule } from "../configuration/configuration.module";
import { MailSenderController } from './mail-sender.controller';
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { MailSenderService } from './mail-sender.service';
import { MailConfigService } from "./mail-config/mail-config.service";
import { LimitedSender } from "./Sender/LimitedSender";
import { FailedMailsService } from "./failed-mails/FailedMailsService";

@Module({
  imports: [ConfigurationModule],
  providers: [{
    provide: "ConfigurationRecord",
    useExisting: ConfigurationRecord
  }, UsersContentService,FailedMailsService, LimitedSender,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    },
    MailSenderService,MailConfigService ],
  exports: [UsersContentService],
  controllers: [MailSenderController]
})
export class MailSenderModule {
}
