
import {GameApiClass} from "./GameApiClass";
import {Player, formatGametime} from "../interfaces/GameInfo";
import {DBStatus, setFailResult, setOkResult, DBNewGameInfo, DbAdmins} from "./interfaces"
import {createDbGameData, createDbGame2, DbGame, DbGame2, DBGameData, DBVideo, DbPair,DbTeam, DbAccess, DbLog, createDbGame} from "../interfaces/Datatypes.js";
import { GameBaseClass } from "../gameClass/GameBaseClass.js";

const gamedata = require("./gamefiledata/gamedata.json");
const playerdata = require("./gamefiledata/playerdata.json");
const access = require("./gamefiledata/access.json");
const videodata = require("./gamefiledata/gamevideos.json");

gamedata.push(require("../../games/LTUnaiset/2023-2024/N2/gameData_LoimuB1_2023_10_22_2023-2024_N2.json"));
gamedata.push(require("../../games/LTUnaiset/2023-2024/N2/gameData_ViestiN2_2023_10_31_2023-2024_N2.json"));
gamedata.push(require("../../games/LTUnaiset/2023-2024/N2/gameData_LoimuN2_2023_11_18_2023-2024_N2.json"));
gamedata.push(require("../../games/LTUnaiset/2023-2024/N2/gameData_LoimuB1_2023_11_26_2023-2024_N2.json"));
gamedata.push(require("../../games/LTUnaiset/2023-2024/N2/gameData_ViestiN2_2023_02_12_2023-2024_N2.json"));
gamedata.push(require("../../games/LTUnaiset/2023-2024/N2/gameData_KatajaN2_2023_12_09_2023-2024_N2.json"));
gamedata.push(require("../../games/LTUnaiset/2023-2024/N2/gameData_LoimuB1_2024_01_07_2023-2024_N2.json"));
gamedata.push(require("../../games/LTUnaiset/2023-2024/N2/gameData_TIsku_2024_01_20_2023-2024_N2.json"));
gamedata.push(require("../../games/LTUnaiset/2023-2024/N2/gameData_NarPa_2024_02_17_2023-2024_N2.json"));

gamedata.push(require("../../games/LPViesti/2023-2024/Mestaruusliiga/gameData_ver2-0_ArcticVolley_2023_12_12_2023-2024_Mestaruusliiga.json"));
gamedata.push(require("../../games/LPViesti/2023-2024/Mestaruusliiga/gameData_ver2-0_LiigaPloki_20243_2_21_2023-2024_Mestaruusliiga.json"));
gamedata.push(require("../../games/LPViesti/2022-2023/Playoffs/gameData_Kangasala_2023_3_16_N2.json"));
gamedata.push(require("../../games/LPViesti/2022-2023/Playoffs/gameData_Kangasala_2023_3_19_N2.json"));
gamedata.push(require("../../games/LPViesti/2022-2023/Playoffs/gameData_Kangasala_2023_3_21_N2.json"));


export class GameFileDataClass implements GameApiClass {
    readonly driverversion: string = 'GameFileData-1.02';
    readonly adminuserid: string = "00000000-0000-0000-0000-000000001964";
    readonly dummyid: string = "dummy id";
    readonly demouserid: string ='edb96577-1f19-4c9c-bb7f-e5e12dc3969e';
    readonly dummydefaultgameid: string = `00000000-0000-0000-0000-`;
    
    guid: string | null = null;
    
    constructor (guid: string) {
        this.guid = guid;
    }
    async admin_getsavecode(): Promise<string> {
        return 'secret';
    }    
    async version(): Promise<string>{
        return this.driverversion;
    }
    async demoid(): Promise<string> {
        return this.demouserid;
    }
    private async checkaccess(callback: any, team: string, season: string | null = null, serie: string | null = null): Promise<boolean> { 
        let i = 0;
        while (i < access.length) {
            if (access[i].guid == this.guid) {
                for (let j = 0; j < access[i].access.length; j++) {
                    if (callback(access[i].access[j], team, season, serie)) return true;
                }
            }
            i++;
        }
        return false;
    }
    private checkteamaccess(access: any, team: string, season: string | null, serie: string | null) {
        return (access.team == "*" || access.team == team);
    }
    private checkteamseasonaccess(access: any, team: string, season: string | null, serie: string | null) {
        return ((access.team == "*" || access.team == team) && (
                access.season == "*" || access.season == season));
    }
    private checkteamseasonserieaccess(access: any, team: string, season: string | null, serie: string | null) {
        return ((access.team == "*" || access.team == team) &&
                (access.season == "*" || access.season == season) &&
                (access.serie == "*" || access.serie == serie));
    }
    async teams(): Promise<string[]> {
        let teamnames: string[] = [];
        for (let i = 0; i < gamedata.length; i++) {
            if (await this.checkaccess(this.checkteamaccess, gamedata[i].GameData.Teams.Own))
                teamnames.push(gamedata[i].GameData.Teams.Own as string);
        }
       return teamnames.filter(this.onlyUnique);
    }
    async seasons(team: string): Promise<string[]> {
        let seasonnames: string[] = [];
        for (let i = 0; i < gamedata.length; i++) {
            if (gamedata[i].GameData.Teams.Own == team) {
                if (await this.checkaccess(this.checkteamseasonaccess, team, gamedata[i].GameData.Season))
                    seasonnames.push(gamedata[i].GameData.Season as string);
            }
        }
        return seasonnames.filter(this.onlyUnique).sort();
    }
    async series(team: string, season: string): Promise<string[]> {
        let serienames: string[] = [];
        for (let i = 0; i < gamedata.length; i++) {
            if (gamedata[i].GameData.Teams.Own == team && gamedata[i].GameData.Season == season) {
                if (await this.checkaccess(this.checkteamseasonserieaccess, team, season, gamedata[i].GameData.Leaque))
                    serienames.push(gamedata[i].GameData.Leaque as string);
            }
        }
        return serienames.filter(this.onlyUnique);
    }
    async games(team: string, season: string, serie: string): Promise<DbGame[]> {
        let games: any = [];
        let gameno = 1;
        for (let i = 0; i < gamedata.length; i++) {
            if (gamedata[i].GameData.Teams.Own == team && gamedata[i].GameData.Season == season && gamedata[i].GameData.Leaque == serie) {
                if (await this.checkaccess(this.checkteamseasonserieaccess, team, season, serie)) {
                    let dt = formatGametime(gamedata[i].GameData.Date, gamedata[i].GameData.Time);
                    let str: string = (gameno++).toString().padStart(12, '0');
                    const newgame = createDbGame(i + 1, `${this.dummydefaultgameid}${str}`, true, gamedata[i], gamedata[i].GameData.Teams.Opponent, dt ?? '');
                    games.push(newgame);
                }
            }
        }
        return games;
    }  
    async savegame(guid: string, team: string, season: string, serie: string, opponent: string, game: GameBaseClass, update: boolean, lock: boolean): Promise<DBStatus> {
        return setFailResult('No implementation');
    }    
    async gamesbyid(id: number[]): Promise<DbGame2[]> {
        let games: any = [];
        for (let index = 0; index < id.length; index++) {
            if (gamedata[id[index]-1]) {
                if (await this.checkaccess(this.checkteamseasonserieaccess, gamedata[id[index]-1].GameData.Teams.Own, gamedata[id[index]-1].GameData.Season, gamedata[id[index]-1].GameData.Leaque))
                    games.push(createDbGame2( id[index]-1, gamedata[id[index]-1]));
            }
        }
        return games;
    } 
    async gamebyguid(guid: string): Promise<DbGame[]> {
        let games: any = [];
        return games;
    }         
    async players(team: string, season: string, serie: string): Promise<Player[]> {
        let retvalue: Player[] = [];
        if (! await this.checkaccess(this.checkteamseasonserieaccess, team, season, serie)) return retvalue;
        let listofplayers = playerdata.find((p: any) => (p.team == team && p.season == season && p.serie == serie));
        if (listofplayers) {
            listofplayers.file.PlayerList.forEach((p: any) => {
                 retvalue.push({Nro: p.Nro, Name: p.Name});
             });
        }
        return retvalue;
    }    
    async saveplayers(team: string, season: string, serie: string, players: Player[], newonly: boolean): Promise<DBStatus> {
        return setFailResult('No implementation');
    }
    async unlockgame(gameid: string, userid: string): Promise<DBStatus> {
        return setFailResult('No implementation');
    }
    async isadmin(userid: string): Promise<boolean> {
        return userid == this.adminuserid;
    }    
    async creategame(params: DBNewGameInfo): Promise<DBStatus> {
        return setOkResult(this.dummyid, 0);
    }

    async gamedata(id: number): Promise<DBGameData> {
        let retvalue: DBGameData = createDbGameData();
        if (id < 1 || id > gamedata.length) return retvalue;
        const game = gamedata[id-1];
        if (! await this.checkaccess(this.checkteamseasonserieaccess, game.GameData.Teams.Own, game.GameData.Season, game.GameData.Leaque)) return retvalue;
        let index = 0;
        while (index < videodata.length) {
            if (videodata[index].team == game.GameData.Teams.Own && videodata[index].season == game.GameData.Season  && videodata[index].serie == game.GameData.Leaque
                && videodata[index].date == game.GameData.Date && videodata[index].time == game.GameData.Time) {
                    retvalue.video = videodata[index].video;
                    return retvalue;
            }
            index++;
        }
        return retvalue;
    }
    async savevideo(gameid: string, video: DBVideo[]): Promise<DBStatus> {
        return setFailResult('No implementation');
    }
    async admin_allseasons(): Promise<DbPair[]> {
        return [{id: 0, name: 'not'}, {id: 0, name: 'implemented'}];
    } 
    async admin_allseries(): Promise<DbPair[]> {
        return [{id: 0, name: 'not'}, {id: 0, name: 'implemented'}];
    } 
    async admin_users(): Promise<DbAdmins[]> {
        const resp = [
            {id: 1, guid:'1234', team: 'team1', season: 'season1', serie: 'serie1', comment: 'comment1'},
            {id: 2, guid:'1234', team: 'team2', season: 'season2', serie: 'serie2', comment: 'comment2'},
            {id: 3, guid:'1234', team: 'team3', season: 'season3', serie: 'serie3', comment: 'comment3'},
            {id: 4, guid:'1234', team: 'team4', season: 'season4', serie: 'serie4', comment: 'comment4'},
            ]
        return resp;
    }      
    async admin_saveitem(item: string, value: object): Promise<DBStatus> {
        return setFailResult('No implementation');
    }    
    async admin_addconfig(item: string, value: object): Promise<DBStatus> {
        return setFailResult('No implementation');
    }      
    async admin_addaccess(values: DbAccess): Promise<DBStatus> {
        return setFailResult('Invalid parameter');
    }
    async admin_updateaccess(values: DbAdmins): Promise<DBStatus> {
        return setFailResult('Invalid parameter');
    }
    async admin_getteamsetup(): Promise<DbTeam[]> {
        return [];
    }    
    async admin_getlog(startdate: Date, enddate: Date, max: number): Promise<DbLog[]> {
        return [];
    }
    async savelog(userid: string, event: any, status: number, msg: string | null): Promise<DBStatus> {
        return setFailResult('No implementation');
    }
    private onlyUnique(value: any, index: number, self: any) {
        return self.indexOf(value) === index;
      }
}