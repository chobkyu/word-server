import { EnWordEntity } from "src/Entity/EnWord.entity";
import { CustomRepository } from "src/typeorm-ex/typeorm-ex.decorator";
import { Repository } from "typeorm";

@CustomRepository(EnWordEntity)
export class EnWordRepository extends Repository<EnWordEntity>{}