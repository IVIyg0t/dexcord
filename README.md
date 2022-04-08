# Dexcord

A Discord bot for Dexscreener.

## Setup

Install requirements:

`pip install -r requirements.txt`

Create a `.env` file:

`touch .env`

Add your Discord bot's Token to the env file:

`TOKEN=abc123lalalookatme`

## Commands

Get the current price of SPHERE with `!sphere`.

```
$0.04414 BOT
 — Yesterday at 9:35 PM
The current price of SPHERE is $0.05008
```

## Extending Capabilities

If you'd like to add a new command to this bot, simply create a new cog under the `/cogs` directory. Use the existing `sphere` cog as a guide.

Once your cog is created, simply load it in `dexcord.py` using:

`bot.load_extension("cogs.<your_cog_name>")`
