# bf3AndDiscordSynergy
get those player counts


# Configuration
Configure it using the config file located at app/config.json
<pre>
{
    "token":"", //discord bot's token
    "refreshInterval":15000, //milliseconds
    "serverid":"7d3adf3a-4675-4d23-a9c1-7713815cc5b0", //bf3 server id from battlelog
    "platform":"pc", //pc, 360, or ps3
    "servercallSign":"Beer&Rush", //what shows up before the player count
    "admins":[""] //userids from discord... only allows the !!debug command to be used
}
</pre>

# Commands
1. !!debug 
<br>displays the api call's response

<br>
<br>

# helpful links<br>
  How to <a href="https://support.discordapp.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-"> get a userid</a>
  <br>
  How to <a href="https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token/">get a token</a> 
