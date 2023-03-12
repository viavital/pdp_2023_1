import { Module } from "@nestjs/common";
import { UsersContentService } from "./users-content-service";
import { ConfigurationRecord } from "../configuration/configuration.record";
import { ConfigurationModule } from "../configuration/configuration.module";

@Module({
  imports: [ConfigurationModule],
  providers: [{
    provide: "ConfigurationRecord",
    useExisting: ConfigurationRecord
  }, UsersContentService],
  exports: [UsersContentService]
})
export class MailSenderModule {
}
