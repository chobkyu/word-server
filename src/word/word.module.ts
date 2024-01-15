import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmExModule } from 'src/typeorm-ex/typeorm-ex.module';
import { ScoreRepository } from 'src/user/Repository/Score.repository';
import { EnWordRepository } from './Repository/Word.repository';
import { WordController } from './word.controller';
import { WordService } from './word.service';

@Module({
    imports:[
         // session을 사용하지 않을 예정이기 때문에 false
         PassportModule.register({ defaultStrategy: 'jwt', session: false }),
         // jwt 생성할 때 사용할 시크릿 키와 만료일자 적어주기
         JwtModule.register({
             secret: 'secret',
             signOptions: { expiresIn: '1y' },
         }),
 
        TypeOrmExModule.forCustomRepository([EnWordRepository,ScoreRepository])
    ],
    controllers:[WordController],
    providers:[WordService]
})
export class WordModule {}
