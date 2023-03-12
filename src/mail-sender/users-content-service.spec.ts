import { UsersContentService } from "./users-content-service";
import { access, constants } from "node:fs";
import { ConfigurationRecord } from "../configuration/configuration.record";
import * as fs from 'fs'

describe("test UsersContentService", () => {
  test("is base folder exist", async () => {
    const jestFn = jest.fn();
    const content = fs.readFileSync("config.json")
    const service = new UsersContentService(new ConfigurationRecord());
    const baseContentFolder = "./users-contentTest";
    const checkPath = (path: string) => new Promise((resolve, reject) => {
      access(path, constants.R_OK | constants.W_OK, (err) => {
        if (err) {
          jestFn();
          resolve("ok");
        }
        resolve("ok");
      });
    });
    await service.checkUsersFolderExists("testUser");
    await checkPath(baseContentFolder);
    expect(jestFn).toHaveBeenCalledTimes(1);
  });
});