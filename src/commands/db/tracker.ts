import PairsResponse from "dexscreener-api/dist/types/PairsResponse";
import { Model, Op } from "sequelize";

export class Tracker extends Model {
  declare id: number;
  declare channelId: string;
  declare guildId: number;
  declare chainId: string;
  declare pairAddress: string;
  declare symbol: string;
  declare pair: PairsResponse;

  static async findByChannelId(id: string) {
    return Tracker.findAll({
      where: {
        channelId: {
          [Op.like]: id,
        },
      },
    });
  }

  static async findBySymbol(symbol: string) {
    const trackers = Tracker.findAll({
      where: {
        symbol: {
          [Op.like]: symbol,
        },
      },
    });
    return trackers;
  }

  static async findOneBySymbol(symbol: string) {
    const tracker = Tracker.findOne({
      where: {
        symbol: {
          [Op.like]: symbol,
        },
      },
    });
    return tracker;
  }
}
