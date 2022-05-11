import { ArgsOf, Client, Discord, On, SlashGroup } from "discordx";
import { Guild } from "./db/guild";
import { getPairInformationByChain } from "dexscreener-api";
import PairsResponse from "dexscreener-api/dist/types/PairsResponse";
import {
  CategoryChannel,
  CommandInteraction,
  Guild as dGuild,
  VoiceChannel,
} from "discord.js";

const DEFAULT_STATS_CHANNEL_CATEGORY = "Stats";

enum StatsTypes {
  current,
  m5,
  h1,
  h6,
  h24,
}

const STATS = [
  StatsTypes.current,
  StatsTypes.m5,
  StatsTypes.h1,
  StatsTypes.h6,
  StatsTypes.h24,
];

const getStatsType = (idx: number) => {
  return STATS[idx % 5];
};

@Discord()
export class BaseCommand {
  @On("ready")
  async onReady(args: any, client: Client) {
    const guilds = client.guilds.cache;

    guilds.forEach(async (guild) => {
      try {
        const g = await Guild.findByGuildId(guild.id);
        console.log(g);
        if (!g) {
          throw "Guild doesn't exit";
        }
      } catch (e) {
        // ? Guild doesn't exist in DB
        console.log(`Adding guild: ${guild.name} to db`);
        Guild.create({
          guildId: guild.id,
        });
      }
    });
  }

  getStatsChannel = (guild: dGuild): CategoryChannel => {
    return guild.channels.cache
      .filter((ch) => ch.type === "GUILD_CATEGORY")
      .find((ch) =>
        ch.name.includes(DEFAULT_STATS_CHANNEL_CATEGORY)
      ) as CategoryChannel;
  };

  getIcon = (change: number) => {
    return change > 0 ? "(↗)" : "(↘️)";
  };

  createChannelName = (
    pair: PairsResponse,
    type: StatsTypes = StatsTypes.current
  ): string => {
    switch (type) {
      case StatsTypes.m5:
        const m5 = pair.pair.priceChange.m5;
        return `$${pair.pair.baseToken.symbol} ${this.getIcon(m5)} 5m: ${m5}%`;
      case StatsTypes.h1:
        const h1 = pair.pair.priceChange.h1;
        return `$${pair.pair.baseToken.symbol} ${this.getIcon(h1)} h1: ${h1}%`;
      case StatsTypes.h6:
        const h6 = pair.pair.priceChange.h6;
        return `$${pair.pair.baseToken.symbol} ${this.getIcon(h6)} h6: ${h6}%`;
      case StatsTypes.h24:
        const h24 = pair.pair.priceChange.h24;
        return `$${pair.pair.baseToken.symbol} ${this.getIcon(
          h24
        )} h24: ${h24}%`;
      case StatsTypes.current:
      default:
        const change = pair.pair.priceChange.h24;
        return `$${pair.pair.baseToken.symbol} ${this.getIcon(change)} $${
          pair.pair.priceUsd
        }`;
    }
  };

  createTracker = async (
    guild: Guild,
    dxGuild: dGuild,
    chainId: string,
    pairAddress: string
  ) => {
    const pair = await getPairInformationByChain(chainId, pairAddress);
    const symbol = pair.pair.baseToken.symbol;
    const trackers = (await guild.getTrackers()).find(
      (t) => t.symbol === symbol
    );
    if (!trackers) {
      const name = this.createChannelName(pair);
      const statsChannel = this.getStatsChannel(dxGuild as dGuild);
      const newChannel = await statsChannel.createChannel(name, {
        type: "GUILD_VOICE",
      });
      const tracker = await guild.createTracker({
        channelId: newChannel.id,
        guildId: guild.id,
        chainId: chainId,
        pairAddress: pairAddress,
        symbol: symbol,
        pair: pair,
      });

      return tracker;
    }
  };

  refreshDB = async (guild: Guild, dxGuild: dGuild) => {
    try {
      const stats = this.getStatsChannel(dxGuild);

      // ? Delete all stats channels
      stats.children.forEach(async (ch) => await ch.delete());

      // ? Loop through all trackers and recreate channels.
      const trackers = await guild.getTrackers();
      trackers.forEach(async (t) => {
        const pair = await getPairInformationByChain(t.chainId, t.pairAddress);
        const name = this.createChannelName(pair);
        const channel = await stats.createChannel(name, {
          type: "GUILD_VOICE",
        });

        await guild.createTracker({
          channelId: channel.id,
          guildId: guild.guildId,
          chainId: t.chainId,
          pairAddress: t.pairAddress,
          symbol: t.symbol,
          pair: pair,
        });

        await t.destroy();
      });
    } catch (e) {
      console.log(e);
    }
  };
}
