class gameApi {
    constructor(guid) {
        this.apipath = '/.netlify/functions/';
        this.guid = guid;
    }
    async sendGetJsonAsync(url) {
        const response = await fetch(`${this.apipath}${url}`, { method: "GET", headers: { "Content-Type": "application/json" } });
        if (response.status == 200)
            return await response.json();
        return await response.json();
    }
    async sendPostJsonAsync(url, data) {
        const response = await fetch(`${this.apipath}${url}`, { method: "POST", body: JSON.stringify(data) });
        if (response.status == 200)
            return await response.json();
        return await response.json();
    }
    async sendGetTxtAsync(url) {
        const response = await fetch(`${this.apipath}${url}`);
        if (response.status == 200)
            return await response.text();
        return await response.text();
    }
    sendGetJson(url, successfulCb, failCb) {
        fetch(`${this.apipath}${url}&userid=${this.guid}`, { method: 'GET', })
            .then(response => response.json())
            .then(res => successfulCb(res))
            .catch(error => failCb(error));
    }
    sendPostJson(path, data, successfulCb, failCb) {
        let url = `${this.apipath}${path}`;
        if (this.guid !== null) {
        }
        fetch(url, {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(resp => successfulCb(resp))
            .catch(error => failCb(error));
    }
    async getGameStatisticsAsync(ids) {
        const path = `statistics?ids=${ids}&userid=${this.guid}`;
        return await this.sendGetJsonAsync(path);
    }
    async apiGetDriverAsync() {
        const path = `driver?userid=${this.guid}`;
        return await this.sendGetJsonAsync(path);
    }
    async getTeamsAsync() {
        const path = `teams?userid=${this.guid}`;
        return await this.sendGetJsonAsync(path);
    }
    async getTeamsAndTreeAsync() {
        const path = `teams?userid=${this.guid}&tree=true`;
        return await this.sendGetJsonAsync(path);
    }
    async getSeasonsAsync(team) {
        const path = `seasons?team=${team}&userid=${this.guid}`;
        return await this.sendGetJsonAsync(path);
    }
    async getSeriesAsync(team, season) {
        const path = `series?team=${team}&season=${season}&userid=${this.guid}`;
        return await this.sendGetJsonAsync(path);
    }
    async getGamesAsync(team, season, serie) {
        const path = `games?team=${team}&season=${season}&serie=${serie}&userid=${this.guid}`;
        return await this.sendGetJsonAsync(path);
    }
    async getGameByGuidAsync(gameid) {
        const path = `games?guid=${gameid}&userid=${this.guid}`;
        return await this.sendGetJsonAsync(path);
    }
    async getGameByIdAsync(gameid) {
        const path = `games?id=${gameid}&userid=${this.guid}`;
        return await this.sendGetJsonAsync(path);
    }
    async getPlayersAsync(team, season, serie) {
        const path = `players?team=${team}&season=${season}&serie=${serie}&userid=${this.guid}`;
        return await this.sendGetJsonAsync(path);
    }
    async getDemoIdAsync() {
        const path = `demoid`;
        return await this.sendGetJsonAsync(path);
    }
    async getGameDataAsync(gameid) {
        const path = `data?id=${gameid}&userid=${this.guid}`;
        return await this.sendGetJsonAsync(path);
    }
    async getAdminOptionsAsync(view) {
        let path = `adminoptions?view=editgame&userid=${this.guid}`;
        return await this.sendGetJsonAsync(path);
    }
    async getStatisticsByIdForGameAsync(gameid) {
        let path = `statistics?ids=${gameid}&userid=${this.guid}`;
        return await this.sendGetJsonAsync(path);
    }
    async unlockGameAsync(data) {
        const path = `unlock`;
        return await this.sendPostJsonAsync(path, data);
    }
    async saveVideosAsync(videos) {
        const path = `data/videos`;
        return await this.sendPostJsonAsync(path, videos);
    }
    async uploadGameAsync(data) {
        const path = `upload`;
        return await this.sendPostJsonAsync(path, data);
    }
    async createGameAsync(data) {
        const path = `creategame`;
        return await this.sendPostJsonAsync(path, data);
    }
    async test(data) {
        const path = `locations`;
        return await this.sendPostJsonAsync(path, data);
    }
}
async function apiGetDriverAsync(userid) {
    return await new gameApi(userid).apiGetDriverAsync();
}
async function apiLoadTeamsAsync(userid) {
    return await new gameApi(userid).getTeamsAsync();
}
async function apiLoadStatisticsForIdsAsync(userid, gameids) {
    return await new gameApi(userid).getGameStatisticsAsync(gameids);
}
async function apiLoadTeamNamesTreeAsync(userid) {
    return await new gameApi(userid).getTeamsAndTreeAsync();
}
async function apiLoadSeasonNamesForTeamAsync(team, userid) {
    return await new gameApi(userid).getSeasonsAsync(team);
}
async function apiLoadSerieNamesForTeamAsync(team, season, userid) {
    return await new gameApi(userid).getSeriesAsync(team, season);
}
async function apiLoadGameNamesForTeamAsync(team, season, serie, userid) {
    return await new gameApi(userid).getGamesAsync(team, season, serie);
}
async function apiLoadGameForTeamAsync(gameid, userid) {
    return await new gameApi(userid).getGameByGuidAsync(gameid);
}
async function apiLoadGameForTeamByIdAsync(gameid, userid) {
    return await new gameApi(userid).getGameByIdAsync(gameid);
}
async function apiLoadPlayerNamesForTeamAsync(team, season, serie, userid) {
    return await new gameApi(userid).getPlayersAsync(team, season, serie);
}
async function apiLoadDemoIdAsync() {
    return await new gameApi("").getDemoIdAsync();
}
async function apiLoadGameDataAsync(gameid, userid) {
    return await new gameApi(userid).getGameDataAsync(gameid);
}
async function apiLoadStatisticsAsync(gameid, userid) {
    return await new gameApi(userid).getStatisticsByIdForGameAsync(gameid);
}
async function apiLoadAdminOptionsAsync(view, userid) {
    return await new gameApi(userid).getAdminOptionsAsync(view);
}
async function apiUnlockGameAsync(data) {
    return await new gameApi('').unlockGameAsync(data);
}
async function apiSaveVideosAsync(videos) {
    return await new gameApi('').saveVideosAsync(videos);
}
async function apiUploadGameAsync(data) {
    return await new gameApi('').uploadGameAsync(data);
}
async function apiCreateGameAsync(data) {
    return await new gameApi('').createGameAsync(data);
}

async function apiTest(data) {
    return await new gameApi('').text(data);
}