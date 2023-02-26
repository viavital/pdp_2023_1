import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from "../database/database.module";
import { usersProviders } from "../database/users.providers";

@Module({imports: [DatabaseModule],
  providers: [UsersService, ...usersProviders],
  exports: [UsersService],
})
export class UsersModule {}
