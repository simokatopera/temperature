import {Player} from "../interfaces/GameInfo";
import {DBStatus, setFailResult, DBNewGameInfo, DbAdmins } from "./interfaces"
import {DbGame, DbGame2, DBGameData, createDbGameData, DBVideo, DbPair, DbTeam, DbAccess,DbLog} from "../interfaces/Datatypes.js";
import { GameBaseClass } from "../gameClass/GameBaseClass.js";

export abstract class GameApiClass {
    constructor (guid: string) {

    }
    async version(): Promise<string>{
        return '';
    }
    async demoid(): Promise<string> {
        return '';
    }
    async teams(): Promise<string[]> {
        return [];
    }
    async seasons(team: string): Promise<string[]> {
        return [];
    }
    async series(team: string, season: string): Promise<string[]> {
        return [];
    }
    async games(team: string, season: string, serie: string): Promise<DbGame[]> {
        return [];
    }   
    async savegame(guid: string, team: string, season: string, serie: string, opponent: string, game: GameBaseClass, update: boolean, lock: boolean): Promise<DBStatus> {
        return setFailResult('No implementation');
    }     
    async gamesbyid(id: number[]): Promise<DbGame2[]> {
        return [];
    }        
    async gamebyguid(guid: string): Promise<DbGame[]> {
        return [];
    }        
    async players(team: string, season: string, serie: string): Promise<Player[]> {
        return [];
    }    
    async saveplayers(team: string, season: string, serie: string, players: Player[], newonly: boolean): Promise<DBStatus> {
        return setFailResult('No implementation');
    }
    async unlockgame(gameid: string, userid: string): Promise<DBStatus> {
        return setFailResult('No implementation');
    }
    async creategame(params: DBNewGameInfo): Promise<DBStatus> {
        return setFailResult('No implementation');
    }
    async savevideo(gameid: string, video: DBVideo[]): Promise<DBStatus> {
        return setFailResult('No implementation');
    }
    // async teamtree(): Promise<DbTeamTree> {
    //     return createDbTeamTree();
    // }
    async isadmin(userid: string): Promise<boolean> {
        return false;
    }
    async savelog(userid: string, event: object, status: number, msg: string | null): Promise<DBStatus> {
        return setFailResult('No implementation');
    }
    async gamedata(id: number, locked: boolean | null): Promise<DBGameData> {
        return createDbGameData();
    }
    async admin_addaccess(values: DbAccess): Promise<DBStatus> {
        return setFailResult('No implementation');
    }        
    async admin_updateaccess(values: DbAdmins): Promise<DBStatus> {
        return setFailResult('No implementation');
    }        
    async admin_allseasons(): Promise<DbPair[]> {
        return [];
    }       
    async admin_allseries(): Promise<DbPair[]> {
        return [];
    }       
    async admin_users(): Promise<DbAdmins[]> {
        return [];
    }       
    async admin_saveitem(item: string, value: object): Promise<DBStatus> {
        return setFailResult('No implementation');
    }
    async admin_addconfig(item: string, value: object): Promise<DBStatus> {
        return setFailResult('No implementation');
    }  
    async admin_getteamsetup(): Promise<DbTeam[]> {
        return [];
    }
    async admin_getlog(startdate: Date, enddate: Date, max: number): Promise<DbLog[]> {
        return [];
    }
    async admin_getsavecode(): Promise<string> {
        return '';
    }
}