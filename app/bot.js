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
        this.client = new Discord.Client();
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
                    self.refreshInterval = config.refreshInterval;
                    self.serverid = config.serverid;
                    self.platform = config.platform;
                    self.servercallSign = config.servercallSign || "";
                    self.admins = config.admins;
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
                    out += `\`\`\`json\n${JSON.stringify(yield Bot.getServerStats(this.platform, this.serverid))}`;
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
                let data = yield Bot.getServerStats(self.platform, self.serverid);
                if (data) {
                    if (data.status === "found") {
                        if (data.srv) {
                            let srv = data.srv;
                            if (srv.slots != undefined && srv.players != undefined && srv.map_name && srv.battlelog) {
                                let name = self.servercallSign + " | " + srv.players + "/" + srv.slots;
                                self.client.user.setPresence({ game: { name: name, url: srv.battlelog, type: "PLAYING" }, status: "online" });
                            }
                        }
                    }
                }
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