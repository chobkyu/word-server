import { IsString } from "class-validator";

export class UserDataDto{
    @IsString()
    name : string;

    @IsString()
    userId :string;

    @IsString()
    school : string;
}