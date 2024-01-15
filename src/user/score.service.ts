import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WrongAnswerEntity } from "src/Entity/WrongAnswer.entity";
import { ScoreRepository } from "./Repository/Score.repository";
import { WorngAnswerRepository } from "./Repository/WrongAnswer.repository";

@Injectable()
export class ScoreService{
    private readonly logger = new Logger(ScoreService.name);
    constructor(
        private readonly scoreRepository : ScoreRepository,
        private readonly jwtService : JwtService,
        private readonly wrongAnswerRepository : WorngAnswerRepository
    ){}

    
    async getAllScore(header){
        try{
            const token = this.jwtService.decode(header);
            
            const seq = token['seq'];
            console.log(seq);
            const res = await this.scoreRepository.createQueryBuilder('score')
                        .orderBy("score.date","DESC")
                        .leftJoinAndSelect('score.user','user.seq')
                        .where("userSeq=:seq",{seq:seq})
                        .getMany();
            console.log(res);
            return res;

        }catch(err){
            this.logger.error(err);
            return {success:false};
        }
    }

    async getWrongAnswer(seq:number):Promise<WrongAnswerEntity[]|object>{
        try{
            const res = await this.wrongAnswerRepository.createQueryBuilder('wrongAnswer')
                        .leftJoinAndSelect('wrongAnswer.score','score.seq')
                        .where("scoreSeq=:seq",{seq:seq})
                        .getMany();

            return res;
        }catch(err){
            this.logger.error(err);
            return {success:false};
        }
    }
}