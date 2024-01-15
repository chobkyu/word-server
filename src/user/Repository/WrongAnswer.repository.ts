import { WrongAnswerEntity } from "src/Entity/WrongAnswer.entity";
import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { Repository } from "typeorm";

@CustomRepository(WrongAnswerEntity)
export class WorngAnswerRepository extends Repository<WrongAnswerEntity>{}