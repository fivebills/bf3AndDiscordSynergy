"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Discord = require("discord.js");
const fetch = require("isomorphic-fetch");
const fs = require("fs");
const path = require("path");
class Bot {
    constructor() {
        this.mapmap = { "MP_001": "Grand Bazaar", "MP_003": "Tehran Highway", "MP_007": "Caspian Border", "MP_011": "Seine Crossing", "MP_012": "Operation Firestorm", "MP_013": "Damavand Peak", "MP_017": "Noshahr Canals", "MP_018": "Kharg Island", "MP_Subway": "Operation Metro", "XP1_001": "Strike at Karkand", "XP1_002": "Gulf of Oman", "XP1_003": "Sharqi Peninsula", "XP1_004": "Wake Island", "XP2_Factory": "Scrapmetal", "XP2_Office": "Operation 925", "XP2_Palace": "Donya Fortress", "XP2_Skybar": "Ziba Tower", "XP3_Alborz": "Alborz Mountains", "XP3_Desert": "Bandar Desert", "XP3_Shield": "Armored Shield", "XP3_Valley": "Death Valley", "XP4_FD": "Markaz Monolith", "XP4_Parl": "Azadi Palace", "XP4_Quake": "Epicenter", "XP4_Rubble": "Talah Market", "XP5_001": "Operation Riverside", "XP5_002": "Nebandan Flats", "XP5_003": "Kiasar Railroad", "XP5_004": "Sabalan Pipeline" };
        this.client = new Discord.Client();
        this.usemapname = false;
        this.admins = [];
    }
    login() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.loadDataFile();
                this.client.login(this.token);
                this.client.on("ready", this.onReady.bind(this));
                this.client.on("message", this.onMessage.bind(this));
            }
            catch (e) {
                console.log("Failed to log in because: " + JSON.stringify(e));
            }
        });
    }
    loadDataFile() {
        return __awaiter(this, void 0, void 0, function* () {
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
                    }
                    else {
                        reject("invalid config data");
                    }
                }
                catch (e) {
                    reject(e);
                }
            });
        });
    }
    onMessage(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Bot.existsWithin(msg.author.id, this.admins)) {
                if (msg.content == '!!debug') {
                    let out = `::::DEBUG::::\nplatform:${this.platform}\nserver:${this.serverid}\n`;
                    out += `\`\`\`json\n${JSON.stringify(yield Bot.getServerStatsBattleLog(this.serverid))}`;
                    out = out.slice(0, 1994) + "...```";
                    try {
                        yield msg.channel.send(out);
                    }
                    catch (e) {
                        console.log(JSON.stringify(e));
                    }
                }
            }
        });
    }
    onReady() {
        console.log("Ready");
        this.setPresencePlayerCount();
        setInterval(this.setPresencePlayerCount.bind(this), this.refreshInterval);
    }
    setPresencePlayerCount() {
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            try {
                //let data = await Bot.getServerStats(self.platform, self.serverid);
                let data = yield Bot.getServerStatsBattleLog(self.serverid);
                if (!data)
                    return;
                if (!data.slots['2'])
                    return;
                if (!data.map)
                    return;
                let map = self.mapmap[data.map];
                if (!map)
                    map = "";
                let players = data.slots[2].current;
                let maxplayers = data.slots[2].max;
                let url = data.url;
                let name = "";
                if (this.usemapname && map) {
                    name += map;
                }
                else {
                    name += self.servercallSign;
                }
                name = name.slice(0, 12); //truncate overflow
                name += " | " + players + "/" + maxplayers;
                self.client.user.setPresence({ game: { name: name, url: url, type: "PLAYING" }, status: "online" });
            }
            catch (e) {
                console.log(JSON.stringify(e));
            }
        });
    }
    /**
     * http://bf3stats.com/api#server
     */
    static getServerStats(platform, serverid) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise(function (resolve, reject) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        let res = yield fetch("http://api.bf3stats.com/" + platform + "/server/", {
                            method: "POST",
                            body: `output=json&id=${serverid}&history=0`,
                            headers: {
                                //'Accept': 'application/json',
                                'Content-Type': 'application/x-www-form-urlencoded'
                            },
                        });
                        //console.log(await res.text())
                        resolve(yield res.json());
                    }
                    catch (e) {
                        reject(e);
                    }
                });
            });
        });
    }
    static getServerStatsBattleLog(serverid) {
        return __awaiter(this, void 0, void 0, function* () {
            let res = yield fetch(`http://battlelog.battlefield.com/bf3/servers/getNumPlayersOnServer/pc/${serverid}/`, {
                method: "GET",
                headers: {
                    'Accept': 'application/json'
                }
            });
            let data = yield res.json();
            data.url = `http://battlelog.battlefield.com/bf3/servers/show/pc/${serverid}/`;
            return data;
        });
    }
    static existsWithin(a, b) {
        for (let i = 0; i < b.length; i++) {
            if (b[i] == a) {
                return true;
            }
        }
        return false;
    }
}
new Bot().login();
//# sourceMappingURL=bot.js.map