import { Body, Controller, Get, Logger, Param, Post, UseGuards ,Headers} from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt/jwt.guard';
import { GetToken } from 'src/util/getToken';
import { ScoringDto } from './DTO/Scoring';
import { WordService } from './word.service';

@Controller('api/word')
export class WordController {
    private readonly logger = new Logger(WordController.name);
    constructor(
        private readonly wordService: WordService
    ){}

    @ApiOperation({summary:"전체 불러오기"})
    @Get('/')
    async find(){
        this.logger.log("select all");
        return await this.wordService.find();
    }

    @ApiOperation({summary:"전체 챕터 길이 구해오기"})
    @Get('/getLength')
    async listLength(){
        this.logger.log("get last chapter");
        return await this.wordService.listLength();
    }

    @ApiOperation({summary:"테스트 불러오기"})
    @UseGuards(JwtAuthGuard) 
    @Get('/getTest/:id')
    async getTest(@Param("id") id:number){  
        this.logger.log("get Test");
        return await this.wordService.getTest(id); 
    }

    @ApiOperation({summary:"모바일 테스트"})
    @UseGuards(JwtAuthGuard)
    @Get('/mobileTest/:id')
    async mobileTest(@Param("id") id:number){
        this.logger.log("mobile Test");
        return await this.wordService.mobileTest(id);
    }

    @ApiOperation({summary:"공부하기"})
    @Get('/getStudy/:id')
    async getStudy(@Param("id") id:number){
        this.logger.log("get study");
        return await this.wordService.getStudy(id);
    }

    @ApiOperation({summary:"채점하기"})
    @UseGuards(JwtAuthGuard)
    @Post('/scoring')
    async scoring(@Body() answers:ScoringDto[], @Headers() header){
        this.logger.log("scoring");
        return await this.wordService.scoring(answers,GetToken.getToken(header));
    }

    // @Get('/testMail')
    // async testMail(){
    //     await this.wordService.example();
    // }
}
