from typing import Optional
import discord
from discord.ext import commands, tasks
from pydexscreener.dex import DexScreenerClient, PairsResponse


class TTickerCog(commands.Cog):
    def __init__(self, bot):
        self.bot: commands.Bot = bot
        self.client = DexScreenerClient()
        self.chain_id = "polygon"
        self.pair_address = "0xf305242c46Cfa2A07965eFBD68B167C99173B496"

        self.poll_ticker.start()

    def _get_pair(self):
        return self.client.pairs(self.chain_id, self.pair_address)

    async def _reply_to_user(self, ctx, pair: PairsResponse):
        await ctx.send(
            f"The current price of {pair.pair.baseToken.symbol} is ${pair.pair.priceUsd}"
        )

    async def _update_nickname(self, pair: PairsResponse):
        await self.bot.guilds[0].get_member(self.bot.user.id).edit(
            nick=f"${pair.pair.priceUsd}"
        )

    async def _update_presence(self, pair: PairsResponse):
        await self.bot.change_presence(activity=discord.Game(f"$SPHERE"))

    @commands.command(name="sphere")
    async def sphere(self, ctx):
        r = self._get_pair()
        await self._reply_to_user(ctx, r)

    @tasks.loop(seconds=10.0)
    async def poll_ticker(self):
        try:
            r = self._get_pair()

            print(f"{r.pair.baseToken.symbol}: {r.pair.priceUsd}")
            await self._update_nickname(r)
            await self._update_presence(r)

        except:
            print("Error getting pair")

    @poll_ticker.before_loop
    async def wait_for_bot(self):
        await self.bot.wait_until_ready()
        print("bot ready")


def setup(bot):
    """Every cog needs a setup function like this."""
    bot.add_cog(TTickerCog(bot))
