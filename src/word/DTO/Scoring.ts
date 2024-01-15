import { IsArray, IsNumber } from "class-validator";
import { AnswerDto } from "./Answer";

export class ScoringDto{
    @IsArray()
    readonly answers:AnswerDto[];

    @IsNumber()
    readonly len : number;

    @IsNumber()
    readonly chapter :number;
}