import {
  CategoryChannel,
  Collection,
  CommandInteraction,
  Guild,
  GuildBasedChannel,
  VoiceChannel,
} from "discord.js";
import {
  ArgsOf,
  Client,
  Discord,
  SlashGroup,
  On,
  Slash,
  SlashOption,
} from "discordx";
import { getPairInformationByChain } from "dexscreener-api";
import PairsResponse from "dexscreener-api/dist/types/PairsResponse";
import { Tracker } from "./db/db";
import AsciiTable from "ascii-table";
import _ from "lodash";

const TOKEN_REFRESH_RATE = 60000; // 1 minutes
const TRACKER_CYCLE_RATE = 60000; // 1 minute

enum StatsNameType {
  current,
  m5,
  h1,
  h6,
  h24,
}

const StatsTypes = [
  StatsNameType.current,
  StatsNameType.m5,
  StatsNameType.h1,
  StatsNameType.h6,
  StatsNameType.h24,
];

@Discord()
@SlashGroup({ name: "tracker" })
// @SlashGroup({ name: "frequency", root: "tracker" })
@SlashGroup({ name: "get", root: "tracker" })
@SlashGroup({ name: "set", root: "tracker" })
export class TrackerCommand {
  DEFAULT_TRACKER_CYCLE_RATE = 60000;
  trackerFrequency: number = this.DEFAULT_TRACKER_CYCLE_RATE;

  @On("ready")
  async onReady(params: any, client: Client, guardPayload: any) {
    // Refresh token pairs
    setInterval(() => {
      this.updatePairs(client as Client);
    }, this.trackerFrequency);
  }

  @Slash("frequency")
  @SlashGroup("set", "tracker")
  async setFrequency(
    @SlashOption("freq", {
      description:
        "What should the frequency (in seconds) be for pulling new prices?  Set 0 for default (60s).",
    })
    freq: number,
    i: CommandInteraction
  ) {
    if (freq === 0) this.trackerFrequency = this.DEFAULT_TRACKER_CYCLE_RATE;
    else this.trackerFrequency = freq * 1000;
    i.reply({
      content: `Set tracking frequency to ${this.trackerFrequency / 1000}s`,
      ephemeral: true,
    });
  }

  @Slash("frequency")
  @SlashGroup("get", "tracker")
  async getFrequency(i: CommandInteraction) {
    i.reply({
      content: `Tracking frequency is currently ${
        this.trackerFrequency / 1000
      }s`,
      ephemeral: true,
    });
  }

  @Slash("show")
  @SlashGroup("tracker")
  async show(
    @SlashOption("type", { description: "current | m5 | h1 | h6 | h24" })
    type: string,
    i: CommandInteraction
  ) {
    const types = Object.keys(StatsNameType);
    const selectedType =
      StatsTypes[types.indexOf(type) % Math.ceil(types.length / 2)];

    await this.cycleStats(i.client as Client, selectedType);

    i.reply({ content: "Stats updated!", ephemeral: true });
  }

  @Slash("describe")
  @SlashGroup("tracker")
  async describe(i: CommandInteraction) {
    const channels = this.stats(i.guild as Guild).children.map(
      (ch) => ch
    ) as VoiceChannel[];
    const trackers = await Tracker.findAll();

    const table = new AsciiTable("Describe");
    table
      .setHeading("ID", "Channel ID", "Name", "m5", "h1", "h6", "h24")
      .removeBorder()
      .setAlign(3, AsciiTable.CENTER)
      .setAlign(4, AsciiTable.CENTER)
      .setAlign(5, AsciiTable.CENTER)
      .setAlign(6, AsciiTable.CENTER);

    _.zip(channels, trackers).forEach(([ch, t]) => {
      const { m5, h1, h6, h24 } = t?.pair.pair.priceChange as any;
      table.addRow(
        t?.id,
        ch?.id,
        ch?.name,
        `${this.getIcon(m5)} ${m5}`,
        `${this.getIcon(h1)} ${h1}`,
        `${this.getIcon(h6)} ${h6}`,
        `${this.getIcon(h24)} ${h24}`
      );
    });

    i.reply({ content: `\`\`\`${table.toString()}\`\`\``, ephemeral: true });
  }

  @Slash("add")
  @SlashGroup("tracker")
  async add(
    @SlashOption("chain", { description: "bsc, cronos, eth, polygon, etc..." })
    chainId: string,
    @SlashOption("pair", { description: "0xabc123..." })
    pairAddress: string,
    i: CommandInteraction
  ) {
    try {
      const tracker = await this.createTracker(
        chainId,
        pairAddress,
        i.guild as Guild
      );

      if (tracker)
        i.reply({
          content: `Created tracker: ${tracker.symbol}`,
          ephemeral: true,
        });
      else i.reply(`Oops! Something went wrong...`);
    } catch (e) {
      console.log(e);
      i.reply({
        content:
          "Hmm... Looks like an error occured.  Check your chainid and pair address.",
        ephemeral: true,
      });
    }
  }

  @Slash("remove")
  @SlashGroup("tracker")
  async remove(
    @SlashOption("symbol")
    symbol: string,
    i: CommandInteraction
  ) {
    const tracker = await Tracker.findOneBySymbol(symbol);
    await tracker?.destroy();

    const channel = this.getChannel(tracker?.id as string, i.guild as Guild);
    await channel?.delete();

    i.reply({
      content: `
      Removed: ${tracker?.symbol}
    `,
      ephemeral: true,
    });
  }

  @Slash("refresh")
  @SlashGroup("tracker")
  async refreshTrackers(i: CommandInteraction) {
    await this.refresh(i.guild as Guild);
    await i.reply({ content: "Refresh complete", ephemeral: true });
  }

  async refresh(guild: Guild) {
    try {
      const stats = this.stats(guild);
      stats.children.forEach(async (ch) => await ch.delete());

      const trackers = await Tracker.findAll();
      trackers.forEach(async (tracker) => {
        const pair = await getPairInformationByChain(
          tracker.chainId,
          tracker.pairAddress
        );
        const name = this.makeChannelName(pair);
        const channel = await stats.createChannel(name, {
          type: "GUILD_VOICE",
        });

        await Tracker.create({
          id: channel.id,
          guildId: tracker.guildId,
          chainId: tracker.chainId,
          pairAddress: tracker.pairAddress,
          symbol: tracker.symbol,
          pair: pair,
        });

        await tracker.destroy();
      });
    } catch (e) {
      console.log(e);
    }
  }

  async updatePairs(client: Client) {
    try {
      const trackers = await Tracker.findAll();
      trackers.forEach(async (tracker) => {
        const chainId = tracker.chainId;
        const pairAddress = tracker.pairAddress;
        const pair = await getPairInformationByChain(chainId, pairAddress);
        tracker.update({ pair: pair }).then((newTracker) => {
          this.updateTracker(client, newTracker);
        });
      });
    } catch (e) {}
  }

  async updateTracker(client: Client, tracker: Tracker) {
    const channel = (await client.channels.fetch(tracker.id)) as VoiceChannel;
    const newChannel = await channel.setName(
      this.makeChannelName(tracker.pair)
    );
  }

  async cycleStats(client: Client, statsType: StatsNameType) {
    const trackers = await Tracker.findAll();

    trackers.forEach(async (t) => {
      try {
        const channel = (await client.channels.fetch(t.id)) as VoiceChannel;
        if (channel)
          await channel.setName(this.makeChannelName(t.pair, statsType));
      } catch (e) {
        console.log(e);
      }
    });
  }

  getStatsType(idx: number) {
    return StatsTypes[idx % 5];
  }

  async createTracker(chainId: string, pairAddress: string, guild: Guild) {
    const pair = await getPairInformationByChain(chainId, pairAddress);
    const symbol = pair.pair.baseToken.symbol;
    const trackers = await Tracker.findBySymbol(symbol);

    if (trackers.length <= 0) {
      const name = this.makeChannelName(pair);
      const channel = await this.stats(guild).createChannel(name, {
        type: "GUILD_VOICE",
      });
      const tracker = Tracker.create({
        id: channel.id,
        guildId: guild.id,
        chainId: chainId,
        pairAddress: pairAddress,
        symbol: symbol,
        pair: pair,
      });

      return tracker;
    }
  }

  stats(guild: Guild) {
    return guild.channels.cache
      .filter((ch) => ch.type === "GUILD_CATEGORY")
      .find((ch) => ch.name === "Stats") as CategoryChannel;
  }

  getChannel(channelId: string, guild: Guild) {
    return guild.channels.cache.find((ch) => ch.id === channelId);
  }

  getIcon(change: number) {
    return change > 0 ? "(↗)" : "(↘️)";
  }

  makeChannelName(
    pair: PairsResponse,
    type: StatsNameType = StatsNameType.current
  ): string {
    switch (type) {
      case StatsNameType.m5:
        const m5 = pair.pair.priceChange.m5;
        return `$${pair.pair.baseToken.symbol} ${this.getIcon(m5)} 5m: ${m5}%`;
      case StatsNameType.h1:
        const h1 = pair.pair.priceChange.h1;
        return `$${pair.pair.baseToken.symbol} ${this.getIcon(h1)} h1: ${h1}%`;
      case StatsNameType.h6:
        const h6 = pair.pair.priceChange.h6;
        return `$${pair.pair.baseToken.symbol} ${this.getIcon(h6)} h6: ${h6}%`;
      case StatsNameType.h24:
        const h24 = pair.pair.priceChange.h24;
        return `$${pair.pair.baseToken.symbol} ${this.getIcon(
          h24
        )} h24: ${h24}%`;
      case StatsNameType.current:
      default:
        const change = pair.pair.priceChange.h24;
        return `$${pair.pair.baseToken.symbol} ${this.getIcon(change)} $${
          pair.pair.priceUsd
        }`;
    }
  }
}
