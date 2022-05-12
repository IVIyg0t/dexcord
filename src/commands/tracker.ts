import { getPairInformationByChain } from "dexscreener-api";
import PairsResponse from "dexscreener-api/dist/types/PairsResponse";
import {
  CategoryChannel,
  CommandInteraction,
  Guild as dGuild,
  VoiceChannel,
} from "discord.js";
import {
  Client,
  Discord,
  Guard,
  On,
  Slash,
  SlashGroup,
  SlashOption,
} from "discordx";
import { hasGuild } from "../guard";
import { BaseCommand } from "./base";
import { Guild } from "./db/guild";
import AsciiTable from "ascii-table";
import { Tracker } from "./db/tracker";

@Discord()
@SlashGroup({ name: "tracker" })
@SlashGroup({ name: "get", root: "tracker" })
@SlashGroup({ name: "set", root: "tracker" })
export class TrackerCommands extends BaseCommand {
  DEFAULT_TRACKER_CYCLE_RATE = 60000;
  trackerFrequency: number = this.DEFAULT_TRACKER_CYCLE_RATE;

  @On("ready")
  async onReady(params: any, client: Client) {
    setInterval(() => {
      this.updatePairs(client);
    }, this.trackerFrequency);
  }

  @Slash("add")
  @SlashGroup("tracker")
  @Guard(hasGuild)
  async add(
    @SlashOption("chain", {
      description: "bsc, cronos, eth, polygon, avalanche, etc...",
    })
    chainId: string,
    @SlashOption("pair", { description: "0xabc123" })
    pairAddress: string,
    i: CommandInteraction,
    extras: any,
    guardData: { guild: Guild }
  ) {
    try {
      const { guild } = guardData;
      const tracker = await this.createTracker(
        guild,
        i.guild as dGuild,
        chainId,
        pairAddress
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
        content: `Hmm... Looks like an error occured.  Check your chainid and pair address.
          
          \`\`\`
          ${e}
          \`\`\`
          `,
        ephemeral: true,
      });
    }
  }

  @Slash("remove")
  @SlashGroup("tracker")
  @Guard(hasGuild)
  async remove(
    @SlashOption("symbol")
    symbol: string,
    i: CommandInteraction,
    extras: any,
    guardData: { guild: Guild }
  ) {
    try {
      console.log(`Finding tracker ${symbol}`);
      const { guild } = guardData;
      const tracker = (await guild.getTrackers()).find((t) =>
        t.symbol.includes(symbol)
      );
      const channel = this.getChannel(
        tracker?.channelId as string,
        i.guild as dGuild
      );

      await tracker?.destroy();
      await channel.delete();

      i.reply({
        content: `Removed: ${tracker?.symbol}`,
        ephemeral: true,
      });
    } catch (e) {
      i.reply({
        content: `${e}`,
        ephemeral: true,
      });
    }
  }

  @Slash("frequency")
  @SlashGroup("set", "tracker")
  @Guard(hasGuild)
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
  @Guard(hasGuild)
  async getFrequency(i: CommandInteraction) {
    i.reply({
      content: `Tracking frequency is currently ${
        this.trackerFrequency / 1000
      }s`,
      ephemeral: true,
    });
  }

  @Slash("db")
  @SlashGroup("get", "tracker")
  @Guard(hasGuild)
  async db(i: CommandInteraction, extras: any, guardData: { guild: Guild }) {
    const { guild } = guardData;
    const trackers = await guild.getTrackers();

    const table = new AsciiTable("DB");
    table
      .setHeading("ID", "Guild ID", "symbol", "priceUsd", "pairAddress")
      .removeBorder();

    trackers.forEach(async (t) => {
      table.addRow(
        t.channelId,
        (await t.getGuild()).guildId,
        t.symbol,
        t.pair?.pair?.priceUsd,
        t.pairAddress
      );
    });

    i.reply({ content: `\`\`\`${table.toString()}\`\`\``, ephemeral: true });
  }

  @Slash("refresh")
  @SlashGroup("tracker")
  @Guard(hasGuild)
  async refreshTrackers(
    i: CommandInteraction,
    extras: any,
    guardData: { guild: Guild }
  ) {
    await this.refreshDB(guardData.guild, i.guild as dGuild);
    await i.reply({ content: "Refresh complete", ephemeral: true });
  }

  updatePairs = async (client: Client) => {
    const guilds = await Guild.findAll();
    guilds.forEach(async (g) => {
      const trackers = await g.getTrackers();
      trackers.forEach(async (t) => {
        const { chainId, pairAddress } = t;
        const pair = await getPairInformationByChain(chainId, pairAddress);
        const newTracker = await t.update({ pair: pair });
        await this.updateChannel(client, newTracker);
      });
    });
  };

  updateChannel = async (client: Client, tracker: Tracker) => {
    try {
      const channel = (await client.channels.fetch(
        tracker.channelId
      )) as VoiceChannel;
      await channel.setName(this.createChannelName(tracker.pair));
    } catch (e) {
      console.log(e);
    }
  };

  getChannel = (channelId: string, dxGuild: dGuild): VoiceChannel => {
    return dxGuild.channels.cache.find(
      (ch) => ch.id === channelId
    ) as VoiceChannel;
  };
}
