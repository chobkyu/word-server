import { Column, Entity,  ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ScoreEntity } from "./Score.entity";

@Entity('wrongAnswer')
export class WrongAnswerEntity{
    @PrimaryGeneratedColumn('increment')
    seq : number;

    @Column({length:45})
    en : string;

    @Column({length:45})
    kr : string;

    @Column({length:60})
    answer : string;

    @ManyToOne((type)=>ScoreEntity,((scoreEntity)=>scoreEntity.wrongAnswerEntitys))
    score : ScoreEntity;
}