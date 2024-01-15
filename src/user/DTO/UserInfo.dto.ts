import { IsString } from "class-validator";

export class UserInfoDto{
    @IsString()
    userId:string;

    @IsString()
    password:string;

    @IsString()
    name : string;

    @IsString()
    school : string;

    @IsString()
    motherEmail : string;
}