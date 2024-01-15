import { IsNumber, IsString } from "class-validator";

export class AnswerDto{
    @IsString()
    readonly en:string;

    @IsString()
    readonly kr:string;

    @IsString()
    readonly answer:string;

    @IsNumber()
    readonly type:number;
}