import { Sequelize, DataTypes } from "sequelize";
import { Tracker } from "./tracker";
import { Guild } from "./guild";

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

Guild.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    guildId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  { sequelize: db }
);

Tracker.init(
  {
    // Model attributes are defined here
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    channelId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // guildId: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    //   // allowNull defaults to true
    // },
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

Guild.hasMany(Tracker);
Tracker.belongsTo(Guild);

Guild.sync();
Tracker.sync();
