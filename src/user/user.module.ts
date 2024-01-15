import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { WordController } from 'src/word/word.controller';
import { ScoreRepository } from './Repository/Score.repository';
import { UserRepository } from './Repository/User.repository';
import { WorngAnswerRepository } from './Repository/WrongAnswer.repository';
import { ScoreService } from './score.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
    imports:[
         // session을 사용하지 않을 예정이기 때문에 false
        PassportModule.register({ defaultStrategy: 'jwt', session: false }),
        // jwt 생성할 때 사용할 시크릿 키와 만료일자 적어주기
        JwtModule.register({
            secret: 'secret',
            signOptions: { expiresIn: '1y' },
        }),


        TypeOrmExModule.forCustomRepository([UserRepository,ScoreRepository,WorngAnswerRepository])
    ],
    controllers:[UserController],
    providers:[UserService,ScoreService]
})
export class UserModule {}
