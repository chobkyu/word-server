import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { EnWordEntity } from 'src/Entity/EnWord.entity';
import { ScoreEntity } from 'src/Entity/Score.entity';
import { WrongAnswerEntity } from 'src/Entity/WrongAnswer.entity';
import { ScoreRepository } from 'src/user/Repository/Score.repository';
import { grade } from 'src/util/grade.enum';
import { DataSource } from 'typeorm';
import { AnswerDto,  } from './DTO/Answer';
import { ScoringDto } from './DTO/Scoring';
import { EnWordRepository } from './Repository/Word.repository';

@Injectable()
export class WordService {
    private readonly logger = new Logger(WordService.name);
    constructor(
        private readonly enWordRepository : EnWordRepository,
        private readonly jwtService : JwtService,
        private dataSource : DataSource,
        private readonly mailerService : MailerService,
    ){}

    async find(){
        return await this.enWordRepository.find();
    }

    async listLength():Promise<number[]|object>{
        try{
            const res = await this.enWordRepository.createQueryBuilder()
                        .select("distinct(level)")
                        .orderBy("level")
                        .getRawMany();
            
            const wordTestList = res.slice(1,-1);
            return wordTestList;
        }catch(err){
            this.logger.error(err);
            return {success:false};
        }
     
    }

    async getStudy(id:number){
        try{
            const res = await this.enWordRepository.createQueryBuilder()
                        .where("level=:id",{id:id})
                        .getMany();
            
            return res;
            
        }catch(err){
            this.logger.error(err);
            return {success:false};
        }
    }

    async getTest(id:number){
        try{
           const wordList = await this.getChapterOne(id); //해당 챕터 가져오기
             
           const list = this.shuffle(wordList);//랜덤으로 섞기
           const randomDivision = this.randomDivision(list);
           console.log(randomDivision);

           return randomDivision;
        }catch(err){
            this.logger.error(err);
            return {success:false};
        }
    }

    async getChapterOne(id:number):Promise<EnWordEntity[]|object>{
        try{
            const res = await this.getChapterOneQuery(id);

            if(res.length>0){
                return res;
            }else{
                return {success:false};
            }
            
        }catch(err){
            this.logger.error(err);
            return {success:false};
        }
    }

    async getChapterOneQuery(id:number):Promise<EnWordEntity[]>{
        return await this.enWordRepository.createQueryBuilder()
                .where("level=:id",{id:id})
                .getMany();
    }

    /**랜덤 섞기 */
    shuffle(array) {
        return array.sort(() => Math.random() - 0.5);        
    }

    /**세개로 나누기 */
    randomDivision(array){
        // console.log(array)
        const len = array.length;
        const trigger = len%3;
        switch (trigger){
            case 0 :
                array = this.splitIntoChunk(array,len/3);
                break;
            case 1 :
                array = this.splitIntoChunk(array,len/3);
                break;
            case 2 :
                array = this.splitIntoChunk(array,len/3+1);

                break;
        }
        
        return array;

    }

    async mobileTest(id:number){
        try{
            const words = await this.getChapterOne(id);
            const wordList = this.shuffle(words);

            return wordList;
        }catch(err){
            this.logger.error(err);
            return {success:false}
        }
    }

    splitIntoChunk(arr, chunk) {
        // 빈 배열 생성
        const result = [];
        
        for (let index=0; index < arr.length; index += chunk) {
          let tempArray =[];
          // slice() 메서드를 사용하여 특정 길이만큼 배열을 분리함
          tempArray = arr.slice(index, index + chunk);
          // 빈 배열에 특정 길이만큼 분리된 배열을 추가
          result.push(tempArray);
        }
        
        return result;
      }


      /**채점하기 */
      async scoring(answers:ScoringDto[], header):Promise<object>{
        this.logger.log(answers);
        let answerLen = answers['len'];
        let chapter = answers['chapter'];
        let score = 0;
        
        const wrongAnswer = [];

        console.log(answers['answer'].length);
        if(answerLen!==answers['answer'].length){
            const nullAnswer = await this.checkNullAnswer(answers['answer'],chapter);
            // wrongAnswer.push({...nullAnswer[0]});
            for(let i =0; i<nullAnswer.length; i++){
                wrongAnswer.push(nullAnswer[i]);
            }
        }

        const token = this.jwtService.decode(header);

        answers['answer'].forEach((answer)=>{
            switch(answer.type){
                case 1 :
                    let resKr= this.countType1(answer);
                    if(resKr['success']){
                        score+=1;
                    }else{
                        wrongAnswer.push(answer);
                    }
                    break;
                case 2 :
                    let resEn = this.countType2(answer);
                    if(resEn['success']){
                        score+=1;
                    }else{
                        wrongAnswer.push(answer);
                    }
                    break;
                case 3 :
                    let resSetence = this.countType2(answer);
                    if(resSetence['success']){
                        score+=1;
                    }else{
                        wrongAnswer.push(answer);
                    }
                    break;
              
            }
        });
        
        let lastScore = score/answerLen*100;    
      
        const res = await this.insertScore(lastScore, chapter, token['seq'], wrongAnswer);

        this.mailToMother(lastScore, chapter,token['name']);
        
        return res; 

      }

      /**점수 입력 */
      async insertScore(score:number, chapter, id, wrongAnswer){
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try{
            
            const grade = this.getGrade(score);
            
            const scoreEntity = new ScoreEntity();
            
            scoreEntity.chapter = chapter;
            scoreEntity.date = new Date();
            scoreEntity.user = id;
            scoreEntity.grade = grade;
            scoreEntity.score = score;

            const res = await queryRunner.query(
                `insert into score(score,grade,userSeq,date,chapter) values (${scoreEntity.score},'${scoreEntity.grade}',${scoreEntity.user},CURRENT_TIMESTAMP,${scoreEntity.chapter})`
            );
            // await this.scoreRepository.save(scoreEntity);
          
            const scoreId = res['insertId'];

            await this.insertWrongAnswer(scoreId,wrongAnswer,queryRunner);
            
            await queryRunner.commitTransaction();
            return {success:true};

        }catch(err){
            this.logger.error(err);
            await queryRunner.rollbackTransaction();

        }finally{
            await queryRunner.release();
        }

      }

      /**오답 입력 */
      async insertWrongAnswer(scoreId, wrongAnswer, queryRunner){
        try{
            
            for(let i = 0; i<wrongAnswer.length; i++){
                const wrongAnswerEntity = new WrongAnswerEntity();
                wrongAnswerEntity.en = wrongAnswer[i].en;
                wrongAnswerEntity.kr = wrongAnswer[i].kr;
                wrongAnswerEntity.score = scoreId;
                wrongAnswerEntity.answer = wrongAnswer[i]['answer']!==undefined ? wrongAnswer[i].answer:'-';
                
                await queryRunner.query(
                    `insert into wrongAnswer(en,kr,scoreSeq,answer) values ('${wrongAnswerEntity.en}','${wrongAnswerEntity.kr}',${wrongAnswerEntity.score},'${wrongAnswerEntity.answer}')`
                )
            }

            

        }catch(err){
            this.logger.error(err);
            return {success:false};
        }
      }

      /**채점 타입 1 */
      countType1(answer:AnswerDto){
        return answer.kr.includes(answer.answer) ? {success:true} : {success:false}
      }

      /**채점 타입 2 */
      countType2(answer:AnswerDto){
        return answer.en===answer.answer.toLowerCase() ? {success:true} : {success:false}
      }

      /**등급 가져오기 */
      getGrade(score:number):grade{
        let gradeStudent:grade;
        if(score>=90){
            gradeStudent = grade['A'];
        }else if(score<90 && score>=80){
            gradeStudent = grade['B'];
        }else if(score<80 && score>=70){
            gradeStudent = grade['C'];
        }else if(score<70 && score>=60){
            gradeStudent = grade['D'];
        }else{
            gradeStudent = grade['F'];
        }

        return gradeStudent;
      }

      /**빈 칸 제출 정답 가려내기 */
      async checkNullAnswer(answers:AnswerDto[], chapter:number){
        
        const chapterAnswer = await this.getChapterOneQuery(chapter);

        const nullAnswer = [];

        chapterAnswer.forEach((Answer)=>{
            let flag = 0;
            for(let i = 0; i<answers.length; i++){
                if(answers[i].en === Answer.en){
                    flag = 1;
                    break;
                }
            }

            if(flag === 0){
                nullAnswer.push(Answer);
            }
        });

        return nullAnswer;
    }

    public mailToMother(score:number, chapter:number, name:string): void {
        const date = new Date();

        const stringDate = this.getDate(date);
        this.mailerService
          .sendMail({
            to: 'rtw2343@naver.com', // list of receivers
            from: process.env.EMAIL_ID, // sender address
            subject: `${name} 학생의 ${stringDate} 의 ${chapter}과 점수입니다.`, // Subject line
            text: `${name} 학생의 ${stringDate}에 응시한 ${chapter}과 점수입니다.`, // plaintext body
            html: `<b>${name} 학생의 ${stringDate} 의 ${chapter}과 점수는 ${Math.ceil(score)}입니다.</b>`, // HTML body content
          })
          .then(() => {})
          .catch(() => {});
      }
      
      getDate(date:Date){
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDay();

        const allDay = `${year}년 ${month}월 ${day}일 `;
        
        return allDay;
      }



        
      
}
