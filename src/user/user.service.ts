import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from 'src/Entity/User.entity';
import { GetToken } from 'src/util/getToken';
import { LoginDto } from './DTO/Login.dto';
import { UserDataDto } from './DTO/UserData.dto';
import { UserInfoDto } from './DTO/UserInfo.dto';
import { ScoreRepository } from './Repository/Score.repository';
import { UserRepository } from './Repository/User.repository';
const { generateUploadURL } = require('../util/s3');

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name)
    constructor(
        private readonly userRepository : UserRepository,
        private readonly jwtService : JwtService
    ){}

    async getUserInfo(header){
        try{
            const token = GetToken.getToken(header);
            
            const decode = this.jwtService.decode(token);

            const id = decode['seq'];
            const res = await this.getUserQuery(id);

            if(res!==null){
                return res;
            }else{
                return {success:false};
            }

        }catch(err){
            this.logger.error(err);
            return {success:false};
        }
    } 

    async getUserQuery(seq:number):Promise<UserDataDto|object>{
        try{
            const res = await this.userRepository.createQueryBuilder()
                        .where("seq=:seq",{seq:seq})
                        .getOne();

            const userData = new UserDataDto();
            
            userData.name = res.name;
            userData.userId = res.userId;
            userData.school = res.school;

            return userData;
            
        }catch(err){
            this.logger.error(err);
            return {success:false};
        }
    }


    async login(login:LoginDto) {
        const check = await this.getUserData(login);

        if(check!=null){
            const payload = {userId:check['userId'], name:check['name'],seq:check['seq'],sub:'0'};
            const res = this.jwtService.sign(payload);
            console.log(res);
            return {success:true, msg:'존재하는 사용자',token : res};

        }else if(check==null){
            return {success:false};
        }
        
        throw new UnauthorizedException('인증되지 않은 사용자입니다.');
    }

    async getUserData(login:LoginDto){
        try{
            const res = await this.userRepository.createQueryBuilder()
                        .where("userId=:id",{id:login.userId})
                        .andWhere("password=:pw",{pw:login.password})
                        .getOne();
            
            return res;
            
        }catch(err){
            return {success:false};
        }
    }

    async signUp(userInfo : UserInfoDto){
        try{
            const check = await this.checkId(userInfo.userId);
            let res;
            !check['success'] ? ()=>{return check}:res = await this.insertUser(userInfo); 
            
            if(res['success']){
                return {success:true};            
            }else{
                return {success:false};
            }

        }catch(err){
            this.logger.error(err);
            return {success:false}
        }
    }

    async insertUser(userInfo : UserInfoDto){
        try{
            const userEntity = new UserEntity();

            userEntity.userId = userInfo.userId;
            userEntity.password = userInfo.password;
            userEntity.name = userInfo.name;
            userEntity.school = userInfo.school;
            userEntity.isApproved = false;
            userEntity.motherEmail = userInfo.motherEmail;

            await this.userRepository.insert(userEntity);

            return {success:true};
        }catch(err){
            this.logger.error(err);
            return {success:false};
        }
    }

    /**아이디 중복체크 */
    async checkId(userId:string){
        try{
            const res = await this.userRepository.createQueryBuilder()
                        .where("userId=:userId",{userId:userId})
                        .getOne();

            if(res !== null){
                return {success:false,msg:"중복된 사용자"};
            }else{
                return {success:true};
            }

        }catch(err){
            this.logger.error(err);
            return {success:false};
        }
    }

    async s3url() {
        console.log('fucking s3')
        const url = await generateUploadURL();
        return { data: url };
    }

    async modifyImg(imgUrl:string, token){
        try{
            const seq = token['seq'];
            await this.userRepository.createQueryBuilder()
                  .update('user')
                  .set({ imgUrl: imgUrl })
                  .where("seq=:seq", { seq: seq })
                  .execute();

            return {success:true};
        }catch(err){
            this.logger.error(err);
            return {success:false};
        }
    }
}
