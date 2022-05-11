import { CommandInteraction } from "discord.js";
import { GuardFunction } from "discordx";
import { Guild } from "./commands/db/guild";

export const hasGuild: GuardFunction<CommandInteraction> = async (
  i,
  client,
  next,
  guardData
) => {
  if (i.guildId) {
    const guild = await Guild.findByGuildId(i?.guildId as string);
    if (guild) {
      guardData.guild = guild;
      await next();
    }
  }
};
