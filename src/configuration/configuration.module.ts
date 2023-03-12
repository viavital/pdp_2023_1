import { Module } from "@nestjs/common";
import { ConfigurationRecord } from "./configuration.record";
import * as fs from "fs";
const configurationContent = JSON.parse(fs.readFileSync("config.json", {encoding: "utf-8"} ))
@Module({
  providers: [{
    provide: 'configurationContent',
    useValue: configurationContent
  },
    ConfigurationRecord],
  exports: [ConfigurationRecord]
})
export class ConfigurationModule {
}
