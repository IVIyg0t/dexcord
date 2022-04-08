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

    async def _update_presence(self, pair: PairsResponse):
        await self.bot.change_presence(activity=discord.Game(f"${pair.pair.priceUsd}"))

    async def _reply_to_user(self, ctx, pair: PairsResponse):
        await ctx.send(
            f"The current price of {pair.pair.baseToken.symbol} is ${pair.pair.priceUsd}"
        )

    async def _update_nickname(self, pair: PairsResponse):
        await self.bot.guilds[0].get_member(self.bot.user.id).edit(
            nick=f"${pair.pair.baseToken.symbol} -> $USD"
        )

    @commands.command(name="tticker")
    async def t_ticker(self, ctx, chain_id: Optional[str], pair_address: Optional[str]):
        if not chain_id or not pair_address:
            await ctx.send("Usage: !tticker <chain_id> <pair_address>")

        if ctx.author.guild_permissions.administrator:
            print("Admin command")
            self.poll_ticker.stop()

            self.chain_id = chain_id
            self.pair_address = pair_address

            self.poll_ticker.start()

    @tasks.loop(seconds=5.0)
    async def poll_ticker(self):
        try:
            r = self._get_pair()
        except:
            print("Error getting pair")

        print(f"{r.pair.baseToken.symbol}: {r.pair.priceUsd}")
        await self._update_nickname(r)
        await self._update_presence(r)

    @poll_ticker.before_loop
    async def wait_for_bot(self):
        await self.bot.wait_until_ready()
        print("bot ready")


def setup(bot):
    """Every cog needs a setup function like this."""
    bot.add_cog(TTickerCog(bot))
