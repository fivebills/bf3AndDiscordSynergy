import * as Discord from "discord.js";
import * as fetch from "isomorphic-fetch";
import * as fs from 'fs';
import * as path from 'path';

class Bot {

    public token: string;
    public refreshInterval: number;
    private client = new Discord.Client();

    private serverid: string;
    private platform: string;

    private servercallSign: string;
    private usemapname:boolean = false;

    private admins: string[] = [];


    public async login() {
        try {
            await this.loadDataFile();
            this.client.login(this.token);
            this.client.on("ready", this.onReady.bind(this));
            this.client.on("message", this.onMessage.bind(this));
        } catch (e) {
            console.log("Failed to log in because: " + JSON.stringify(e));
        }
    }

    public async loadDataFile(): Promise<void> {
        let self = this;
        return new Promise(function (resolve, reject) {
            try {
                let a = fs.readFileSync(path.join(__dirname, "config.json"), 'utf8');
                let config = JSON.parse(a);
                self.token = config.token;
                self.refreshInterval = config.refreshInterval || 15000;
                self.serverid = config.serverid;
                self.platform = config.platform || "pc";
                self.servercallSign = config.servercallSign || "";
                self.admins = config.admins || [];
                self.usemapname = config.usemapname || false;

                let valid = config.token &&
                    config.refreshInterval &&
                    config.serverid &&
                    config.platform &&
                    config.servercallSign != undefined &&
                    Array.isArray(config.admins);
                if (valid) {
                    resolve();
                } else {
                    reject("invalid config data");
                }
            } catch (e) {
                reject(e);
            }
        });

    }


    public async onMessage(msg: Discord.Message) {
        if (Bot.existsWithin(msg.author.id, this.admins)) {
            if (msg.content == '!!debug') {

                let out = `::::DEBUG::::\nplatform:${this.platform}\nserver:${this.serverid}\n`
                out += `\`\`\`json\n${JSON.stringify(await Bot.getServerStats(this.platform, this.serverid))}`;
                out = out.slice(0, 1994) + "...```"
                try {
                    await msg.channel.send(out);
                } catch (e) {
                    console.log(JSON.stringify(e));
                }
            }
        }

    }

    public onReady() {
        console.log("Ready")
        this.setPresencePlayerCount();
        setInterval(this.setPresencePlayerCount.bind(this), this.refreshInterval);
    }

    public async setPresencePlayerCount() {
        let self = this;
        try {
            let data = await Bot.getServerStats(self.platform, self.serverid);
            if (data) {
                if (data.status === "found") {
                    if (data.srv) {
                        let srv = data.srv;
                        if (srv.slots != undefined && srv.players != undefined && srv.map_name && srv.battlelog) {
                            let name = ""; 
                            
                            if(this.usemapname && srv.map_name){
                                name += srv.map_name;
                            }else{
                                name += self.servercallSign;
                            }
                            
                            name = name.slice(0,12); //truncate overflow

                            name += " | " + srv.players + "/" + srv.slots;
                            self.client.user.setPresence({ game: { name: name, url: srv.battlelog, type: "PLAYING" }, status: "online" });
                        }
                    }
                }
            }
        } catch (e) {
            console.log(JSON.stringify(e));
        }
    }
    /**
     * http://bf3stats.com/api#server
     */
    public static async getServerStats(platform: string, serverid: string): Promise<any> {
        return new Promise(async function (resolve, reject) {
            try {

                let res = await fetch("http://api.bf3stats.com/" + platform + "/server/", {
                    method: "POST",
                    body: `output=json&id=${serverid}&history=0`,
                    headers: {
                        //'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                });

                //console.log(await res.text())
                resolve(await res.json());

            } catch (e) {
                reject(e);
            }
        });
    }


    public static existsWithin(a: any, b: any[]): boolean {
        for (let i = 0; i < b.length; i++) {
            if (b[i] == a) {
                return true;
            }
        }
        return false;
    }


}

new Bot().login();