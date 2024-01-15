import { Column, Entity, OneToMany, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { ScoreEntity } from "./Score.entity";

@Entity('user')
export class UserEntity{
    @PrimaryGeneratedColumn('increment')
    seq: number;

    @Column({length:100})
    userId : string;
    
    @Column({length:100})
    password : string;

    @Column({length:100})
    name : string;

    @Column({length:100})
    school : string;

    @Column({length:200})
    imgUrl :string;

    @Column({length:80})
    motherEmail :string;

    @Column()
    isApproved : boolean;

    @OneToMany((type)=>ScoreEntity,(scoreEntity)=>scoreEntity.user)
    scoreEntitys : ScoreEntity[];
}