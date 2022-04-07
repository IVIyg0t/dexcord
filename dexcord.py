import discord
from discord.ext import commands
import os
from pydexscreener.dex import DexScreenerClient
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("TOKEN")
ADMIN_ID = os.getenv("ADMIN_ID")


class Dexcord(discord.Client):
    dex = DexScreenerClient()

    async def on_ready(self):
        pass

    async def on_message(self, message):

        if message.author.id == int(ADMIN_ID):

            if message.content.startswith("!ticker"):
                opts = message.content.split(" ")
                print(opts)

                if len(opts) < 3:
                    await message.reply(
                        "usage: !ticker <chainId> <pairAddress>", mention_author=True
                    )
                    return

                chainId = opts[1]
                pairAddress = opts[2]

                r = self.dex.pairs(chainId, pairAddress)

                await message.reply(
                    f"The current price of {r.pair.baseToken.symbol} is ${r.pair.priceUsd}"
                )

                await self.change_presence(activity=discord.Game(f"${r.pair.priceUsd}"))

                await message.guild.get_member(self.user.id).edit(
                    nick=f"${r.pair.baseToken.symbol} -> $USD"
                )
                return


client = Dexcord()
client.run(TOKEN)
