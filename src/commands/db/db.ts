import PairsResponse from "dexscreener-api/dist/types/PairsResponse";
import { Guild } from "discord.js";
import { Sequelize, DataTypes, Model, Op } from "sequelize";

const db = new Sequelize({
  dialect: "sqlite",
  storage: "database.sqlite",
});

try {
  await db.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

export class Tracker extends Model {
  declare id: string;
  declare guildId: string;
  declare chainId: string;
  declare pairAddress: string;
  declare symbol: string;
  declare pair: PairsResponse;

  static findBySymbol(symbol: string) {
    const trackers = Tracker.findAll({
      where: {
        symbol: {
          [Op.like]: symbol,
        },
      },
    });
    return trackers;
  }

  static findOneBySymbol(symbol: string) {
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

Tracker.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    guildId: {
      type: DataTypes.STRING,
      allowNull: false,
      // allowNull defaults to true
    },
    chainId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pairAddress: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pair: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  { sequelize: db }
);

Tracker.sync();
