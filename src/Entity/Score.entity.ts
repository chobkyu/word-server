import { IsNumber, IsString,  } from "class-validator";
import { grade } from "src/util/grade.enum";
import { Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity";
import { WrongAnswerEntity } from "./WrongAnswer.entity";

@Entity('score')
export class ScoreEntity{
    @PrimaryGeneratedColumn('increment')
    seq : number;

    @Column()
    score : number;

    @Column()
    date : Date;

    @Column({type:'enum',enum:grade})
    grade:grade;

    @Column()
    chapter:number;

    @ManyToOne((type)=>UserEntity,((userEntity)=>userEntity.scoreEntitys))
    user : UserEntity;

    @OneToMany((type)=>WrongAnswerEntity,(wrongAnswerEntity)=>wrongAnswerEntity.score)
    wrongAnswerEntitys : WrongAnswerEntity[];
 
    
}