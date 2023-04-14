import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { UsersModule } from "./users/users.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { APP_GUARD } from "@nestjs/core";
import { DatabaseModule } from "./database/database.module";
import { MailSenderModule } from "./mail-sender/mail-sender.module";
import { UsersContentService } from "./mail-sender/users-content/users-content-service";
import { ConfigurationModule } from "./configuration/configuration.module";
import { ConfigurationRecord } from "./configuration/configuration.record";
import { MailSenderController } from "./mail-sender/mail-sender.controller";


@Module({
  imports: [ConfigurationModule, AuthModule, UsersModule, DatabaseModule, MailSenderModule],
  controllers: [AppController],
  providers: [AppService, {
    provide: APP_GUARD,
    useClass: JwtAuthGuard
  }, {
    provide: "ConfigurationRecord",
    useExisting: ConfigurationRecord
  },
    {
      provide: "IContentService",
      useExisting: UsersContentService
    }
    ]
})
export class AppModule {
}
