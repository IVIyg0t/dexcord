import {
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  Model,
  Op,
} from "sequelize";
import { Tracker } from "./tracker";

export class Guild extends Model {
  declare id: number;
  declare guildId: string;

  declare getTrackers: HasManyGetAssociationsMixin<Tracker>;
  declare createTracker: HasManyCreateAssociationMixin<Tracker>;

  static async findByGuildId(id: string) {
    return Guild.findOne({
      where: {
        guildId: {
          [Op.like]: id,
        },
      },
    });
  }

  static async findTrackerBySymbol(guildId: string, symbol: string) {
    const guild = await Guild.findByGuildId(guildId);
    return (await guild?.getTrackers())?.find((t) => t.symbol === symbol);
  }
}
