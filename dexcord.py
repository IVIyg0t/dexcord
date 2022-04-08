from sys import prefix
from typing import Optional
import discord
from discord.ext import commands
import os
from pydexscreener.dex import DexScreenerClient
from dotenv import load_dotenv

load_dotenv()

TOKEN = os.getenv("TOKEN")

bot = commands.Bot(command_prefix="$")

bot.load_extension("cogs.sphere")

bot.run(TOKEN)
