import {GameApiClass} from "./GameApiClass";
import {Player} from "../interfaces/GameInfo";
import {DBStatus, setFailResult, DBNewGameInfo, DbAdmins} from "./interfaces";
import {createDbGameData, DbGame, DbGame2, DBGameData, DBVideo, DbPair, DbTeam, DbAccess, DbLog} from "../interfaces/Datatypes.js";
import { GameBaseClass } from "../gameClass/GameBaseClass.js";

export class GameApi {
    db: GameApiClass | null = null;

    constructor (dbapi: GameApiClass) {
        this.db = dbapi;
    }
    async version(): Promise<string>{
        if (this.db === null) return '';
        return await this.db.version();
    }
    async demoid(): Promise<string> {
        if (this.db === null) return '';
        return await this.db.demoid();
    }
    async teams(): Promise<string[]> {
        if (this.db === null) return [];
        return await this.db.teams();
    }
    async seasons(team: string): Promise<string[]> {
        if (this.db === null) return [];
        return await this.db.seasons(team);
    }
    async series(team: string, season: string): Promise<string[]> {
        if (this.db === null) return [];
        return await this.db.series(team, season);
    }
    async games(team: string, season: string, serie: string): Promise<DbGame[]> {
        if (this.db === null) return [];
        return await this.db.games(team, season, serie);
    }
    async savegame(guid: string, team: string, season: string, serie: string, opponent: string, game: GameBaseClass, update: boolean, lock: boolean): Promise<DBStatus> {
        if (this.db === null) return setFailResult('Missing provider');
        return await this.db.savegame(guid, team, season, serie, opponent, game, update, lock);
    }
    async gamesbyid(id: number[]): Promise<DbGame2[]> {
        if (this.db === null) return [];
        return await this.db.gamesbyid(id);
    }
    async gamebyguid(guid: string): Promise<DbGame[]> {
        if (this.db === null) return [];
        return await this.db.gamebyguid(guid);
    }
    async players(team: string, season: string, serie: string): Promise<Player[]> {
        if (this.db === null) return [];
        return await this.db.players(team, season, serie);
    }
    async saveplayers(team: string, season: string, serie: string, players: Player[], newonly: boolean): Promise<DBStatus> {
        if (this.db === null) return setFailResult('Missing provider');
        return await this.db.saveplayers(team, season, serie, players, newonly);
    }
    async unlockgame(gameid: string, userid: string): Promise<DBStatus> {
        if (this.db === null) return setFailResult('Missing provider');
        return await this.db.unlockgame(gameid, userid);
    }    
    async isadmin(userid: string): Promise<boolean> {
        if (this.db === null) return false;
        return await this.db.isadmin(userid);
    }
    async savelog(userid: string, event: object, status: number, msg: string | null):Promise<DBStatus> {
        if (this.db === null) return setFailResult('Missing provider');
        return await this.db.savelog(userid, event, status, msg);
    }
    async creategame(params: DBNewGameInfo): Promise<DBStatus> {
        if (this.db === null) return setFailResult('Missing provider');
        return await this.db.creategame(params);
    }
    async gamedata(id: number, locked: boolean | null): Promise<DBGameData> {
        if (this.db === null) return createDbGameData();
        return await this.db.gamedata(id, locked);
    }   
    async savevideo(gameid: string, video: DBVideo[]): Promise<DBStatus> {
        if (this.db === null) return setFailResult('Missing provider');
        return await this.db.savevideo(gameid, video);
    }
    // async teamtree(): Promise<DbTeamTree> {
    //     if (this.db === null) return createDbTeamTree();
    //     return await this.db.teamtree();
    // }
    async admin_allseasons(): Promise<DbPair[]> {
        if (this.db === null) return [];
        return await this.db.admin_allseasons();
    }   
    async admin_allseries(): Promise<DbPair[]> {
        if (this.db === null) return [];
        return await this.db.admin_allseries();
    } 
    async admin_users(): Promise<DbAdmins[]> {
        if (this.db === null) return [];
        return await this.db.admin_users();
    }       
    async admin_saveitem(item: string, value: object): Promise<DBStatus> {
        if (this.db === null) return setFailResult('Missing provider');
        return await this.db.admin_saveitem(item, value);
    }    
    async admin_addconfig(item: string, value: object): Promise<DBStatus> {
        if (this.db === null) return setFailResult('Missing provider');
        return await this.db.admin_addconfig(item, value);
    }    
    async admin_getteamsetup(): Promise<DbTeam[]> {
        if (this.db === null) return [];
        return await this.db.admin_getteamsetup();
    }
    async admin_addaccess(values: DbAccess): Promise<DBStatus> {
        if (this.db === null) return setFailResult('Missing provider');
        return await this.db.admin_addaccess(values);
    }        
    async admin_updateaccess(values: DbAdmins): Promise<DBStatus> {
        if (this.db === null) return setFailResult('Missing provider');
        return await this.db.admin_updateaccess(values);
    }        
    async admin_getlog(startdate: Date, enddate: Date, max: number): Promise<DbLog[]> {
        if (this.db === null) return [];
        return await this.db.admin_getlog(startdate, enddate, max);
    }
    async admin_getsavecode(): Promise<string> {
        if (this.db === null) return '';
        return await this.db.admin_getsavecode();
    }
}

export function structureOk(struct: any, fields: any) {
    if (!struct) return false;
	let status = true;
	fields.forEach(item => {
		if (!struct[item]) status = false;
	})
	return status;
}
// export function loadGames(team: string, season: string, serie: string, func: any) {
//     const container = new GameFileClass();
//     const api = new GameApi(container);

//     const games: any = api.games(team, season, serie).then(games => {
//         let players: any = api.players(team, season, serie).then(players => {
//             const game: GameInfo = {games: games, players: players};
//             func(game);
//         });
//     });
// }