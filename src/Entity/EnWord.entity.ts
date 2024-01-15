import { IsNumber, IsString } from "class-validator";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('enWord')
export class EnWordEntity{
    @PrimaryColumn({length:45})
    en : string;

    @Column({length:45})
    kr : string;

    @Column()
    level : number;

    @Column({length:150})
    enSentence : string;

    @Column({length:150})
    krSentence : string;
    
}