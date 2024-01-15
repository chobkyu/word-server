import { Body, Controller, Get, Logger, Post, Req, Headers, UseGuards, Param } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/jwt/jwt.guard';
import { GetToken } from 'src/util/getToken';
import { LoginDto } from './DTO/Login.dto';
import { UserInfoDto } from './DTO/UserInfo.dto';
import { ScoreService } from './score.service';
import { UserService } from './user.service';

@Controller('api/user')
export class UserController {
    private readonly logger = new Logger(UserController.name);
    constructor(
        private readonly userService:UserService,
        private readonly scoreService:ScoreService
    ){};

    @ApiOperation({summary:"점수 불러오기"})
    @UseGuards(JwtAuthGuard)
    @Get('/scoreAll')
    async scoreAll(@Headers() header){
        return await this.scoreService.getAllScore(GetToken.getToken(header));
    }

    @ApiOperation({summary:"로그인"})
    @Post('/login')
    async login(@Body() login : LoginDto) {
        this.logger.log('login');
        return await this.userService.login(login);
    }

    @ApiOperation({summary:"회원가입"})
    @Post('/signUp')
    async signUp(@Body() userInfo : UserInfoDto){
        this.logger.log('sign up');
        return await this.userService.signUp(userInfo);
    }

    @ApiOperation({summary:"유저 정보 불러오기"})
    @UseGuards(JwtAuthGuard)
    @Get('/getUser')
    async getUser(@Headers() header){
        this.logger.log('get User info');
        return await this.userService.getUserInfo(header);
    }

    @Get('/s3url')
    async s3url(){
        return await this.userService.s3url();
    }

    @Post('/modifyImg')
    async modifyImg(@Param() imgUrl :string, @Headers() header){
        this.logger.log("modify userImage");
        return await this.userService.modifyImg(imgUrl,GetToken.getToken(header));
    }

    @ApiOperation({summary:"오답 불러오기"})
    @Get('/wrongAnswer/:seq')
    async getWrongAnswer(@Param("seq") seq:number){
        this.logger.log("get wrong answers "+seq);
        return await this.scoreService.getWrongAnswer(seq);
    }
}
