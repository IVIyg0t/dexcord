import discord
from discord.ext import commands, tasks


class ChannelsCog(commands.Cog):
    def __init__(self, bot):
        self.bot: commands.Bot = bot

    @staticmethod
    def _get_category(categories: list, name):
        return next(cat for cat in categories if cat.name == name)

    @staticmethod
    def _get_channels(channels: list, name) -> list[discord.TextChannel]:
        return filter(
            lambda ch: ch.category and ch.category.name == "Stats",
            filter(lambda ch: ch.name == name, channels),
        )

    @commands.command(name="create")
    async def create_channel(self, ctx: commands.Context, name: str):
        guild: discord.Guild = ctx.guild
        category = self._get_category(guild.categories, "Stats")
        await guild.create_voice_channel(name, category=category)
        await ctx.send(f"Created channel: {name}")

    @commands.command()
    async def remove(self, ctx: commands.Context, name: str):
        guild: discord.Guild = ctx.guild
        channels = self._get_channels(guild.channels, name)

        if channels:
            for ch in channels:
                await ch.delete()
                await ctx.send(f"Deleted: {name}")
        else:
            await ctx.send(
                "Error: You can only delete channels from the stats category"
            )


def setup(bot):
    """Every cog needs a setup function like this."""
    bot.add_cog(ChannelsCog(bot))
