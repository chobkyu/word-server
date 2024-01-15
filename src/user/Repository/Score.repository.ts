import { ScoreEntity } from "src/Entity/Score.entity";
import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { Repository } from "typeorm";

@CustomRepository(ScoreEntity)
export class ScoreRepository extends Repository<ScoreEntity>{}