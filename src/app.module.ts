import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { WordController } from './word/word.controller';
import { WordService } from './word/word.service';
import { WordModule } from './word/word.module';
import { EnWordEntity } from './Entity/EnWord.entity';
import { ScoreEntity } from './Entity/Score.entity';
import { UserEntity } from './Entity/User.entity';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserModule } from './user/user.module';
import { JwtStrategy } from './jwt/jwt.strategy';
import { WrongAnswerEntity } from './Entity/WrongAnswer.entity';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [WordModule, UserModule,


    ConfigModule.forRoot({
      isGlobal:true
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.RDS_HOST,
      port: 3306,
      username: process.env.RDS_USER,
      password: process.env.RDS_PSWORD,
      database: process.env.RDS_DATABASE,
      entities: [EnWordEntity,ScoreEntity,UserEntity,WrongAnswerEntity],
      synchronize: false,
      logging: true
  }),

  MailerModule.forRootAsync({
    useFactory: () => ({
        transport: {
            host: 'smtp.naver.com',
            port: 465,
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PW
            },
        },
        defaults: {
            from: '"no-reply" <email address>',
        },
        preview: true,

    })
}),
    

  ],
  controllers: [AppController, ],
  providers: [AppService, JwtStrategy ],
})
export class AppModule {}

