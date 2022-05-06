from sys import prefix
from typing import Optional
import discord
from discord.ext import commands
import os
from pydexscreener.dex import DexScreenerClient
from dotenv import load_dotenv
from cogwatch import Watcher

load_dotenv()

TOKEN = os.getenv("TOKEN")

bot = commands.Bot(command_prefix="/")

# bot.load_extension("cogs.sphere")
bot.load_extension("cogs.channels")


@bot.event
async def on_ready():
    print("Bot ready.")

    watcher = Watcher(bot, path="cogs", preload=False)
    await watcher.start()


bot.run(TOKEN)
