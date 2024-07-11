
// require('dotenv').config();
// const {
//     DATABASE_URL,
//     SUPABASE_SERVICE_API_KEY
// } = process.env;
import { createDbGame, createDbGame2, DbGame, DbGame2, DBGameData, createDbGameData, DBVideo, DbPair, createDbPair, 
    DbTeam, createDbTeam, createDbSeason, createDbSerie, DbAccess, DbLog,createDbLog } from "../interfaces/Datatypes.js";

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://ziroytwehkawnclhcyyz.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inppcm95dHdlaGthd25jbGhjeXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg4Njc0ODAsImV4cCI6MTk5NDQ0MzQ4MH0.Ql1zrMnBh0QoBwxa5Lg2RGoIfNxDhrds-HQDtLtY3wc");

import { GameApiClass } from "./GameApiClass";
import { Player, formatGametime, formatGametimeToDate } from "../interfaces/GameInfo";
import { DBStatus, setFailResult, setOkResult, DBNewGameInfo, DbAdmins, createDbAdmins } from "./interfaces"
import { v4 as uuidv4 } from 'uuid';
import { GameClass } from '../gameClass/gameClass'
import { GameBaseClass, createGameBaseClass } from "../gameClass/GameBaseClass.js";
import { DBSUPA_GAMES, DBSUPA_PLAYERS, DBSUPA_PLAYERS_PLAYER, DBSUPA_TEAMSERIESEASON, DBSUPA_ACCESS } from "./DbSupaDef.js"
/*
psql -h db.ziroytwehkawnclhcyyz.supabase.co -p 5432 -d postgres -U postgres
*/
/*
*

npm install supabase-js

Supa database
https://app.supabase.com/new/izhuipikkdsalmbpwdrz
https://app.supabase.com/project/ziroytwehkawnclhcyyz
kanta:
vbstat6
Database password:
VGJo2rNYRSzxhIlt

API:
project url:
https://ziroytwehkawnclhcyyz.supabase.co

api key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inppcm95dHdlaGthd25jbGhjeXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Nzg4Njc0ODAsImV4cCI6MTk5NDQ0MzQ4MH0.Ql1zrMnBh0QoBwxa5Lg2RGoIfNxDhrds-HQDtLtY3wc

*/
interface ACCESSTEAMS {
    team: string;
    serie: string;
    season: string;
    teamid: number;
    serieid: number;
    seasonid: number;
}
interface ACCESS {
    all: boolean;
    list: ACCESSTEAMS[];
}
export class DbSupa implements GameApiClass {
    guid: string | null = null;
    access: ACCESS | null;

    constructor(guid: string) {
        this.access = null;
        this.guid = guid;
    }
    async version(): Promise<string>{
        return 'DbSupa-1.10';
    }

    async admin_getsavecode(): Promise<string> {
        return 'secret';
    }    
    async demoid(): Promise<string> {
        let id = '';
        try {
            let dbdata = await supabase
                .from('access')
                .select('id, guid')
                .eq('teamid', 8)
                .eq('seasonid', 9)
                .eq('serieid', 7)
                .is('deleted', null)
            if (dbdata.error) return id;

            const dbData: DBSUPA_ACCESS[] = dbdata.data;

            if (dbData.length > 0) return dbData[0].guid;
            
        } catch (err) {
            console.log(`Error in demoid`)
        }
        return id;
    }
    private async checkaccess(): Promise<boolean | null> {
        if (this.access === null) this.access = await this.getaccess();
        if (!this.access) return false;
        if (this.access.all) return true;
        return null;
    }
    private async accesstoteam(team: string): Promise<boolean> {
        let accessok = await this.checkaccess();
        if (accessok !== null) return accessok;
        accessok = false;
        if (this.access) {
            this.access.list.forEach(acc => {
                if (acc.team === team) accessok = true;
            })
        }
        return accessok;
    }
    private async accesstoteamseason(team: string, season: string): Promise<boolean> {
        let accessok = await this.checkaccess();
        if (accessok !== null) return accessok;
        accessok = false;
        if (this.access) {
            this.access.list.forEach(acc => {
                if (acc.team === team && acc.season === season) {
                    accessok = true;
                }
            })
        }
        return accessok;
    }
    private async accesstoteamseasonserie(team: string, season: string, serie: string): Promise<boolean> {
        let accessok = await this.checkaccess();
        if (accessok !== null) return accessok;
        accessok = false;
        if (this.access) {
            this.access.list.forEach(acc => {
                if (acc.team === team && acc.season === season && acc.serie === serie) {
                    accessok = true;
                }
            })
        }
        return accessok;
    }
    private async accesstoteamid(team: number): Promise<boolean> {
        let status = await this.checkaccess();
        if (status !== null) return status;

        return true;
    }
    private async getaccess(): Promise<ACCESS> {
        let access: ACCESS = { all: false, list: [] };

        if (this.guid === null) {
            return access;
        }

        let dbdata = await supabase
            .from('access')
            .select('teamid, seasonid, serieid')
            .eq('guid', this.guid).is('deleted', null)
        if (dbdata.error) return access;
        const dbData: DBSUPA_ACCESS[] = dbdata.data;
        if (dbData.length == 0) return access;

        dbData.forEach((acc: DBSUPA_ACCESS) => {
            let newacc = { team: '', serie: '', season: '', teamid: acc.teamid, serieid: acc.serieid, seasonid: acc.seasonid };
            access.list.push(newacc);
        })
        for (let index = 0; index < access.list.length; index++) {
            if (access.list[index].teamid === 0 && access.list[index].seasonid === 0 && access.list[index].serieid === 0) {
                access.all = true;
            }
            let team = await this.namebyid(access.list[index].teamid, 'teams');
            let season = await this.namebyid(access.list[index].seasonid, 'seasons');
            let serie = await this.namebyid(access.list[index].serieid, 'series');
            if (team && season && serie) {
                access.list[index].team = team;
                access.list[index].season = season;
                access.list[index].serie = serie;
            }
            else {
                access.list = [];
                return access;
            }
        }
        return access;
    }
    async teams(): Promise<string[]> {
        let teamnames: string[] = [];
        try {
            let dbdata = await supabase
                .from('teams')
                .select('id, name')
                .eq('active', true)
                .is('deleted', null)
            if (dbdata.error) return teamnames;
            if (dbdata.data) {
                for (let index = 0; index < dbdata.data.length; index++) {
                    let status = await this.accesstoteam(dbdata.data[index].name);
                    if (status === true) teamnames.push(dbdata.data[index].name);
                }
            }
        } catch (err) {
            console.log(`ERROR: ${err}`);
        }
        return teamnames.filter(this.onlyUnique);
    }
    private async idbyname(name: string, table: string): Promise<number> {
        try {
            let dbdata = await supabase
                .from(table)
                .select('id')
                .eq('name', name).is('deleted', null)
            if (dbdata.error) return -1;
            if (dbdata.data.length > 0) return dbdata.data[0].id;
        } catch (err) {
            console.log(`ERROR: ${err}`);
        }
        return -1;
    }
    private async namebyid(id: number, table: string): Promise<string | null> {
        try {
            let dbdata = await supabase
                .from(table)
                .select('name')
                .eq('id', id).is('deleted', null)
            if (dbdata.error) return null;
            if (dbdata.data.length > 0) return dbdata.data[0].name;
        } catch (err) {
            console.log(`ERROR: ${err}`);
        }
        return null;
    }
    private async namesbyids(idlist: number[], table: string): Promise<IDNAME[]> {
        let names: IDNAME[] = [];
        let dbdata = await supabase
            .from(table)
            .select('id, name')
            .in('id', idlist).is('deleted', null)
        if (dbdata.error || dbdata.data == null) return names;
        dbdata.data.forEach(tbldata => {
            names.push({ id: tbldata.id, name: tbldata.name });
        })
        return names;
    }
    async seasons(team: string): Promise<string[]> {
        let seasonnames: string[] = [];
        let access = await this.accesstoteam(team);
        if (access) {
            let teamid = await this.idbyname(team, 'teams');
            if (teamid >= 0) {
                try {
                    let seasonidlist: number[] = [];
                    let dbdata = await supabase
                        .from('teamserieseason')
                        .select('teamid, serieid, seasonid')
                        .eq('teamid', teamid)
                        .is('deleted', null)
                    if (dbdata.error) return seasonnames;
                    const dbData: DBSUPA_TEAMSERIESEASON[] = dbdata.data;
                    dbData.forEach((s: DBSUPA_TEAMSERIESEASON) => {
                        seasonidlist.push(s.seasonid);
                    })
                    let namelist = await this.namesbyids(seasonidlist, 'seasons');
                    for (let i = 0; i < namelist.length; i++) {
                        access = await this.accesstoteamseason(team, namelist[i].name);
                        if (access) seasonnames.push(namelist[i].name);
                    }
                } catch (err) {
                    console.log(`ERROR: ${err}`);
                }
            }
        }
        return seasonnames.filter(this.onlyUnique);
    }
    async series(team: string, season: string): Promise<string[]> {
        let serienames: string[] = [];
        let access = await this.accesstoteamseason(team, season);
        if (access) {
            let teamid = await this.idbyname(team, 'teams');
            let seasonid = await this.idbyname(season, 'seasons');
            if (teamid >= 0 && seasonid >= 0) {
                try {
                    let serieidlist: number[] = [];
                    let dbdata = await supabase
                        .from('teamserieseason')
                        .select('teamid, serieid, seasonid')
                        .eq('teamid', teamid)
                        .eq('seasonid', seasonid)
                        .is('deleted', null)
                    if (dbdata.error) return serienames;
                    const dbData: DBSUPA_TEAMSERIESEASON[] = dbdata.data;
                    dbData.forEach((s: DBSUPA_TEAMSERIESEASON) => {
                        serieidlist.push(s.serieid);
                    })
                    let namelist = await this.namesbyids(serieidlist, 'series');
                    for (let i = 0; i < namelist.length; i++) {
                        access = await this.accesstoteamseasonserie(team, season, namelist[i].name);
                        if (access) serienames.push(namelist[i].name);
                    }
                } catch (err) {
                    console.log(`ERROR: ${err}`);
                }
            }
        }
        return serienames.filter(this.onlyUnique);
    }

    async games(team: string, season: string, serie: string): Promise<DbGame[]> {
        let games: DbGame[] = [];
        let access = await this.accesstoteamseasonserie(team, season, serie);
        if (access) {
            let teamid = await this.idbyname(team, 'teams');
            let seasonid = await this.idbyname(season, 'seasons');
            let serieid = await this.idbyname(serie, 'series');
            if (teamid < 0 || seasonid < 0 || serieid < 0) return games;
            let dbdata = await supabase
                .from('games')
                .select('id, game, locked, guid, opponent')
                .eq('teamid', teamid)
                .eq('seasonid', seasonid)
                .eq('serieid', serieid)
            if (dbdata.error) return games;

            const dbData: DBSUPA_GAMES[] = dbdata.data;
            dbData.forEach(g => {
                g.gamejson = g.game ? JSON.parse(g.game) : null;
            });

            dbData.forEach(dbgame => {
                const game: GameBaseClass | null = dbgame.gamejson;
                const dt: string | null = game ? formatGametime(game.GameData.Date, game.GameData.Time) : null;
                let gameok = dbgame.locked;
                if (game && !gameok) {
                    // game is not locked but may be under update
                    const date: Date | null = formatGametimeToDate(game.GameData.Date, game.GameData.Time);
                    if (date) {
                        const dayssincegame = Math.floor(100*(Date.now()-date.getTime())/(24*60*60*1000))/100;
                        if (dayssincegame > -1 && dayssincegame < 7) gameok = true;
                    }
                }

                if (gameok) {
                    games.push(createDbGame(dbgame.id, dbgame.guid, dbgame.locked, dbgame.game ? game : null, dbgame.opponent, dt ?? ''));
                }
            })
        }
        return games;
    }
    async gamesbyid(id: number[]): Promise<DbGame2[]> {
        // returns DbGame2[], only one or none
        let games: DbGame2[] = [];
        let dbdata = await supabase
            .from('games')
            .select('id, game')
            .in('id', id)
        if (dbdata.error) return games;

        const dbData: DBSUPA_GAMES[] = dbdata.data;
        dbData.forEach(g => {
            g.gamejson = g.game ? JSON.parse(g.game) : null;
        });

        if (dbData && dbData.length) {
            for (let i = 0; i < dbData.length; i++) {
                const game = dbData[i].gamejson;
                if (game != null) {
                    let access = await this.accesstoteamseasonserie(game.GameData.Teams.Own, game.GameData.Season, game.GameData.Leaque);
                    if (access) games.push(createDbGame2(dbdata.data[i].id, game));
                }
            }
        }
        return games;
    }

    private async getseasonname(id: number): Promise<string> {
        let dbdata = await supabase.from('seasons').select('name').eq('id', id).is('deleted', null)
        if (dbdata.error) return '';
        if (dbdata.data.length > 0) return dbdata.data[0].name;
        return '';
    }
    private async getseriename(id: number): Promise<string> {
        let dbdata = await supabase.from('series').select('name').eq('id', id).is('deleted', null)
        if (dbdata.error) return '';
        if (dbdata.data.length > 0) return dbdata.data[0].name;
        return '';
    }
    private async getteamname(id: number): Promise<string> {
        let dbdata = await supabase.from('teams').select('name').eq('id', id).is('deleted', null)
        if (dbdata.error) return '';
        if (dbdata.data.length > 0) return dbdata.data[0].name;
        return '';

    }
    async gamebyguid(guid: string): Promise<DbGame[]> {
        // returns DbGame[], only one or none
        let games: DbGame[] = [];
        let dbdata = await supabase
            .from('games')
            .select('id, game, locked, guid, serieid, teamid, seasonid, opponent')
            .eq('guid', guid)
            //.eq('locked', false)
        if (dbdata.error) return games;
        if (dbdata.data.length != 1) return [];

        const dbData: DBSUPA_GAMES[] = dbdata.data;
        dbData.forEach(g => {
            g.gamejson = g.game ? JSON.parse(g.game) : null;
        });

        for (let i = 0; i < dbData.length; i++) {
            let currGame: GameBaseClass;
            const g = dbData[i].gamejson;
            if (g !== null) {
                currGame = g;
            }
            else {
                // create game
                let team: string = await this.getteamname(dbData[i].teamid);
                let serie: string = await this.getseriename(dbData[i].serieid);
                let season: string= await this.getseasonname(dbData[i].seasonid);
                currGame = createGameBaseClass();
                currGame.GameData.Teams = {Own: team, Opponent: dbData[i].opponent};
                currGame.GameData.Season = season;
                currGame.GameData.Leaque = serie;
            }
            let access = await this.accesstoteamseasonserie(currGame.GameData.Teams.Own, currGame.GameData.Season, currGame.GameData.Leaque);
            if (access) {
                let dt = formatGametime(currGame.GameData.Date, currGame.GameData.Time);
                games.push(createDbGame(dbData[i].id, dbData[i].guid, dbData[i].locked, currGame, dbData[i].opponent, dt ?? ''))
            }
        }
        return games;
    }
    async savegame(guid: string, team: string, season: string, serie: string, opponent: string, game: GameBaseClass, update: boolean, lock: boolean): Promise<DBStatus> {
        //console.log(`--savegame update: ${update}`)
        let access = await this.accesstoteamseasonserie(team, season, serie);
        if (access) {
            //console.log(`access ok`)
            if (update && guid.length == 36) {
                if (!(game && game.GameData && game.GameData.Teams && game.GameData.Teams.Own && game.GameData.Leaque && game.GameData.Season)) return setFailResult('Invalid parameter (1)');
                if (game.GameData.Teams.Own != team || game.GameData.Season != season || game.GameData.Leaque != serie) return setFailResult('Invalid parameter (2)');

                const games = await this.gamebyguid(guid);
                if (games === null || games.length === 0) return setFailResult('Invalid parameter (3)');
                if (games[0] && games[0].locked) return setFailResult('Saving not allowed');
                let dt = formatGametime(game.GameData.Date, game.GameData.Time);

                const result = await supabase
                    .from('games')
                    .update([
                        { opponent: opponent, game: JSON.stringify(game),locked: lock, gametime: dt },
                    ]).eq("id", games[0].id).eq('locked', false)
                if (result.error) return setFailResult(result.error);
                if (lock) return setFailResult('locked,' + games[0].id);
                return setOkResult(null, games[0].id);
            }
            else {
                /*
                Kaytettaneen siina tapauksessa etta kopioidaan peleja
                tiedostosta kantaan ja ainoastaan sellaiset ottelut
                joita ei kannassa viela ole, kelpaavat.
                Talloin ilmeisesti guid == '' ja update == false
 
                // save new game given game to database
                ?????????? jotakin tallaista
                ensin pitaa tarkastaa ettei pelia viela ole kannassa
                -            let gameexists = false;
-            let gameid = -1;
-            let gameguid = '';
-            let locked = false;
-            let teamid = await this.idbyname(team, 'teams');
-            let seasonid = await this.idbyname(season, 'seasons');
-            let serieid = await this.idbyname(serie, 'series');
-            if (teamid < 0 || seasonid < 0 || serieid < 0 || opponent.length < 2) {
-                // Error, input data does not match to database
-                return setFailResult(`Invalid data for team: ${team}`);
-            }
-            let currentgames = await this.games(team, season, serie);
-            //console.log(`--savegame games: ${currentgames.length}`)
-            if (currentgames.length > 0) {
-                //let ind: number;
-                //for (ind = 0; ind < currentgames.length; ind++) {
-                //    console.log(`${ind}  ${currentgames[ind].id} ${currentgames[ind].opponent}`)
-                //}
-                // check if this game already exists
-                currentgames.forEach((g: any, index: number) => {
-                    //console.log(`${g.game}`)
-                    if (g.game) {
-                        //console.log(`${index} Game vs : ${g.game.GameData.Teams.Opponent}`)
-                        if (g.game.GameData.Teams.Opponent == game.GameData.Teams.Opponent &&
-                            g.game.GameData.Date == game.GameData.Date &&
-                            g.game.GameData.Time == game.GameData.Time
-                        ) {
-                            //console.log(` Game exists XXXXXX`)
-                            // console.log(`${g.game.GameData.Teams.Own} == ${game.GameData.Teams.Own} &&
-                            //     ${g.game.GameData.Teams.Opponent} == ${game.GameData.Teams.Opponent} &&
-                            //     ${g.game.GameData.Date} == ${game.GameData.Date} &&
-                            //     ${g.game.GameData.Time} == ${game.GameData.Time}`);
-                            if (!gameexists) {
-                                gameexists = true;
-                                gameid = g.id;
-                                locked = g.locked;
-                                gameguid = g.guid;
-                            }
-                        }
-                    }
-                    else {
-                        //console.log(`game exists? ${JSON.stringify(g)} ${update} ${opponent} ${g.opponent}`)
-                        if (g.opponent == opponent && update == true && g.locked == false) {
-                           // console.log(`game exists? YES`)
-                            gameexists = true;
-                            gameid = g.id;
-                            locked = g.locked;
-                            gameguid = g.guid;
-                        }
-                        //else console.log(` NO`)
-                    }
-                })
-                if (gameexists && !update) return setFailResult(`Data already exists for team ${team}`);
-            }
-            if (gameexists) {
                ja sitten:
                let gameuuid = uuidv4();
                let dt = game && game.GameData ? formatGametime(game.GameData.Date, game.GameData.Time) : null;
                const result = await supabase
                    .from('games')
                    .insert([
                        { teamid: teamid, seasonid: seasonid, serieid: serieid, opponent: opponent, locked: false, guid: gameuuid, game: JSON.stringify(game), gametime: dt },
                    ]).select("id", "guid")
                if (result.error) return setFailResult(result.error);
                return setOkResult(gameuuid, result.data[0].id);

                */
                return setFailResult('Not implemented !!!');    
            }
        }
        return setFailResult('Invalid parameter (4)');;
    }
    async players(team: string, season: string, serie: string): Promise<Player[]> {
        let retvalue: Player[] = [];
        let access = await this.accesstoteamseasonserie(team, season, serie);
        if (!access) return retvalue;
        let dbdata = await supabase
            .from('players')
            .select('players, team, season, serie')
            .eq('team', team)
            .eq('serie', serie)
            .eq('season', season)
            .is('deleted', null)
        if (dbdata.error) return retvalue;

        const dbData: DBSUPA_PLAYERS[] = dbdata.data;

        if (dbData.length == 1) {
            try {
                const playerslist: DBSUPA_PLAYERS_PLAYER[] = JSON.parse(dbData[0].players);
                playerslist.forEach((p: DBSUPA_PLAYERS_PLAYER, i: number) => {
                    retvalue.push({ Nro: p.Nro, Name: p.Name });
                })
            } catch (err) {
                console.log(`ERROR: ${err}`);
            }
        }
        return retvalue;
    }
    async saveplayers(team: string, season: string, serie: string, players: Player[], newonly: boolean): Promise<DBStatus> {
        let access = await this.accesstoteamseasonserie(team, season, serie);
        if (!access) return setFailResult('Invalid parameters');

        let dbdata = await supabase
            .from('players')
            .select('players, team, season, serie')
            .eq('team', team)
            .eq('serie', serie)
            .eq('season', season)
            .is('deleted', null)
        if (dbdata.error) return setFailResult(dbdata.error);
        const dbData: DBSUPA_PLAYERS[] = dbdata.data;

        if (dbData.length == 0) {
            const result = await supabase
                .from('players')
                .insert([{ team: team, season: season, serie: serie, players: JSON.stringify(players) }])
                .select('id')
                .eq('team', team)
                .eq('serie', serie)
                .eq('season', season)
                .is('deleted', null)

            if (result.error) return setFailResult(result.error);
            return setOkResult('created', result.data[0].id);
        }
        if (dbData.length == 1) {
            if (newonly) return setFailResult('Already exists');
            const result = await supabase
                .from('players')
                .update([{ team: team, season: season, serie: serie, players: JSON.stringify(players) }])
                .select('id')
                .eq('team', team)
                .eq('serie', serie)
                .eq('season', season)
                .is('deleted', null)
            if (result.error) return setFailResult(result.error);
            return setOkResult('updated', result.data[0].id);
        }
        return setFailResult('Invalid parameter');
    }
    async unlockgame(gameid: string, userid: string): Promise<DBStatus> {
        //console.log(`${gameid} ${userid}`)
        if (! await this.isadmin(userid)) return setFailResult('No access');

        const result = await supabase
            .from('games')
            .update([
                { locked: false },
            ]).eq("guid", gameid).eq('locked', true)
            .select('id, locked')
        if (result.error) return setFailResult(result.error);
        if (result.data.length == 0) {
            // not unlocked
            return setOkResult(null, 0);
        }
        return setOkResult(null, result.data[0].id);
    }
    async creategame(params: DBNewGameInfo): Promise<DBStatus> {
        if (! await this.accesstoteamseasonserie(params.team, params.season, params.serie)) return setFailResult('No access');
        let games = await this.gamesbydetails(params);
        if (!games || games.length > 0) return setFailResult(`No game or game already exists ${games ? games[0].guid : ''}`);

        let teamid = await this.idbyname(params.team, 'teams');
        let seasonid = await this.idbyname(params.season, 'seasons');
        let serieid = await this.idbyname(params.serie, 'series');

        // create new game
        let gameuuid = uuidv4();
        let dt = formatGametime(params.date, params.time);
        let gameclass = new GameClass();
        let game = gameclass.create();

        game.GameData.Season = params.season;
        game.GameData.Leaque = params.serie;
        game.GameData.Teams.Own = params.team;
        game.GameData.Teams.Opponent = params.opponent;
        game.GameData.Date = params.date;
        game.GameData.Time = params.time;
        game.GameData.Location = params.location;
        game.GameData.City = params.city;
        const result = await supabase
            .from('games')
            .insert([
                { teamid: teamid, seasonid: seasonid, serieid: serieid, opponent: params.opponent, locked: false, 
                    guid: gameuuid, game: game, gametime: dt },
            ]).select("id", "guid")
        if (result.error) return setFailResult(result.error);
        return setOkResult(gameuuid, result.data[0].id);
    }
    async isadmin(userid: string): Promise<boolean> {
        try {
            let dbdata = await supabase
                .from('access')
                .select('id')
                .eq('teamid', 0)
                .eq('seasonid', 0)
                .eq('serieid', 0)
                .eq('guid', userid)
                .is('deleted', null)
            if (dbdata.error !== null) return false;
            const dbData: DBSUPA_ACCESS[] = dbdata.data;

            return dbData.length !== 0;

        } catch (err) {
            console.log(`Error in demoid`)
        }

        return false;
    }
    async gamedata(id: number, locked: boolean | null): Promise<DBGameData> {
        let retvalue: DBGameData = createDbGameData();
        let dbdata = await supabase
            .from('games')
            .select('id, game, locked, data')
            .eq('id', id)
        if (dbdata.error) return retvalue;

        const dbData: DBSUPA_GAMES[] = dbdata.data;
        if (dbData.length === 1) {
            const dbgame = dbData[0];
            try {
                if (dbgame.game != null) {
                    const game = JSON.parse(dbgame.game);
                    let access = await this.accesstoteamseasonserie(game.GameData.Teams.Own, game.GameData.Season, game.GameData.Leaque);
                    if (locked != null) {
                        // filter
                        if (dbgame.locked != locked) return retvalue;
                    }
                    if (access && dbgame.data) return dbgame.data;
                }
            }
            catch (err) {
                console.log(err)
            }
        }
        return retvalue;
    }
    async savevideo(gameid: string, video: DBVideo[]): Promise<DBStatus> {
        if (this.guid) {
            let game = await this.gamebyguid(gameid);
            if (game.length == 1) {
                let data = await this.gamedata(game[0].id, null);
                data.video = video;
                // save data to game
                const result = await supabase
                    .from('games')
                    .update([
                        { data: data },
                    ]).eq("id", game[0].id).eq('guid', game[0].guid).select('id, data')
                if (result.error) return setFailResult(result.error);
                return setOkResult(null, Number(result.data[0].id));
            }
        }
        return setFailResult('Invalid parameter');
    }    
    // async teamtree(): Promise<DbTeamTree> {
    //     return createDbTeamTree();
    // }
    async savelog(userid: string, event: any, status: number, msg: string | null): Promise<DBStatus> {
        let location: string = "";
        let agent: string = "";
        let httpmethod: string = '';
        let params: string = '';
        let rawurl: string = '';
        let path: string = '';
        let host: string = '';
        let ip: string = '';
        let platform: string = '';

        rawurl = event.rawUrl;
        path = event.path;
        httpmethod = event.httpMethod
        params = event.queryStringParameters;

        if (event.headers['user-agent']) agent = event.headers['user-agent'];
        if (event.headers.host) host = event.headers.host;
        if (event.headers['x-forwarded-for']) ip = event.headers['x-forwarded-for'];
        if (event.headers['sec-ch-ua-platform']) platform = event.headers['sec-ch-ua-platform'];

        if (host.indexOf('localhost') == 0) return setOkResult(null, 0);

        if (event.headers['x-nf-geo']) {
            // location
            let geoheaders = event.headers['x-nf-geo'];
            try {
                let gh = JSON.parse(geoheaders);
                if (gh.city && gh.country) location = gh.city + ' ' + gh.country;
            }
            catch (err) { 
                //if (event.headers['x-country']) location = event.headers['x-country'];
            }
        }
        const dblog = {
            rawurl: rawurl,
            path: path,
            httpmethod: httpmethod,
            params: params,
            host: host,
            platform: platform,
            ip: ip,
            agent: agent,
            location: location,
            msg: `${status} ${msg ? msg : ''}`,
            userid: userid
        }
        //console.log(dblog);

        const result = await supabase
            .from('log')
            .insert([dblog]).select('id');
        if (result.error) return setFailResult(result.error);
        return setOkResult(null, result.data[0].id);
    }



    async admin_allseasons(): Promise<DbPair[]> {
        if (this.guid && await this.isadmin(this.guid)) {
            try {
                let dbdata = await supabase
                    .from('seasons')
                    .select('id, name')
                    .is('deleted', null)
                if (dbdata.error !== null) return [];
                return dbdata.data.map(item => createDbPair(item.id,item.name));
            } catch (err) {
                console.log(`Error in admin_allseasons`)
            }        
        }
        return [];
    }      
    async admin_allseries(): Promise<DbPair[]> {
        if (this.guid && await this.isadmin(this.guid)) {
            try {
                let dbdata = await supabase
                    .from('series')
                    .select('id, name')
                    .is('deleted', null)
                if (dbdata.error !== null) return [];
                return dbdata.data.map(item => createDbPair(item.id,item.name));
            } catch (err) {
                console.log(`Error in admin_allseries`)
            }        
        }
        return [];
    }     

    async admin_users(): Promise<DbAdmins[]> {
        if (this.guid && await this.isadmin(this.guid)) {
            let seasons: DbPair[] = await this.admin_allseasons();
            let series: DbPair[] = await this.admin_allseries();
            let teams: DbPair[] = [];
            try {
                let dbdata = await supabase
                    .from('access')
                    .select('id, guid, teamid, seasonid, serieid, comment')
                    .is('deleted', null)
                if (dbdata.error !== null) return [];
                let list: DbAdmins[] = [];
                let index = 0;
                for (index = 0; index < dbdata.data.length; index++) {
                    let teamstr: string = 'ADMIN';
                    if (dbdata.data[index].teamid > 0) {
                        let team = teams.find(t => t.id == dbdata.data[index].teamid);
                        if (team === undefined) {
                            teamstr = await this.namebyid( dbdata.data[index].teamid, 'teams') ?? '';
                            teams.push({id: dbdata.data[index].teamid, name: teamstr});
                        }
                        else {teamstr = team.name;}
                    }

                    function getValue(id, itemlist) {
                        let returnvalue: string = 'ADMIN';
                        if (id > 0) {
                            let item = itemlist.find(t => t.id == id);
                            if (item === undefined) returnvalue = '?';
                            else {returnvalue = item.name;}
                        }
                        return returnvalue;
                    }
                    let seasonstr: string = getValue(dbdata.data[index].seasonid, seasons);
                    let seriestr: string = getValue(dbdata.data[index].serieid, series);
                    list.push(createDbAdmins(dbdata.data[index].id, dbdata.data[index].guid, teamstr, seasonstr, seriestr, dbdata.data[index].comment));
                }
                return list;
            } catch (err) {
                console.log(`Error in admin_allseries`)
            }        
        }
        return [];
    }   
    async admin_getlog(startdate: Date, enddate: Date, max: number): Promise<DbLog[]> {
        let log: DbLog[] = [];
        if (this.guid && await this.isadmin(this.guid)) {
            const dbdata = await supabase
                .from('log')
                .select('*')
                .gt('created_at', startdate.toISOString().toLocaleString())
                .lt('created_at', enddate.toISOString().toLocaleString())
            if (dbdata.error !== null) return [];
            if (dbdata.data && dbdata.data.length > 0) {
                let i;
                for (i = 0; i < dbdata.data.length; i++) {
                    log.push(createDbLog(new Date(dbdata.data[i].created_at), dbdata.data[i].path, 
                        dbdata.data[i].platform, dbdata.data[i].ip, dbdata.data[i].msg));
                }
                return log;
            }
        }
        return log;
    }
        
    async admin_saveitem(item: string, value: object): Promise<DBStatus> {
        if (this.guid && await this.isadmin(this.guid)) {
            let table: string | null = null;
            let insertdata: any = null;
            switch (item) {
                case 'team': table = 'teams'; insertdata = { name: value, active: true }; break;
                case 'serie': table = 'series'; insertdata = { name: value }; break;
                case 'season': table = 'seasons'; insertdata = { name: value }; break;
            }
            if (table && insertdata) {
                const dbdata = await supabase
                    .from(table)
                    .select('id, name')
                    .eq('name', value).is('deleted', null)
                if (dbdata.error !== null) return setFailResult(dbdata.error);
                if (dbdata.data.length == 0) {
                    const result = await supabase
                        .from(table)
                        .insert([insertdata])
                        .select("id", "guid").is('deleted', null)
                    if (result.error) return setFailResult(result.error);
                    return setOkResult(null, result.data.id);
                }
                else  return setFailResult('Already exists');
            }
        }
        return setFailResult('Invalid parameter');
    }    
    async admin_addaccess(values: DbAccess): Promise<DBStatus> {
        let teamid = await this.idbyname(values.team, 'teams');
        let serieid = await this.idbyname(values.serie, 'series');
        let seasonid = await this.idbyname(values.season, 'seasons');
        if (teamid < 0 || seasonid < 0 || serieid < 0) return setFailResult('Invalid parameter');
        const dbdata = await supabase
            .from('access')
            .select('id, serieid, seasonid, teamid, guid, comment')
            .eq('serieid', serieid)
            .eq('teamid', teamid)
            .eq('seasonid', seasonid)
            .eq('comment', values.comment)
            .eq('guid', values.guid)
            .is('deleted', null)
        if (dbdata.error !== null) return setFailResult(dbdata.error);
        if (dbdata.data.length == 0) {
            const result = await supabase
                .from('access')
                .insert([{guid: values.guid, teamid: teamid, serieid: serieid, seasonid: seasonid, comment: values.comment}])
                .select("id", "guid")
            if (result.error) return setFailResult(result.error);
            return setOkResult(null, result.data.id);
        }
        return setFailResult('Already exists');
    }
    async admin_updateaccess(values: DbAdmins): Promise<DBStatus> {
        let teamid = await this.idbyname(values.team, 'teams');
        let serieid = await this.idbyname(values.serie, 'series');
        let seasonid = await this.idbyname(values.season, 'seasons');
        if (teamid < 0 || seasonid < 0 || serieid < 0) return setFailResult('Invalid parameter');
        const dbdata = await supabase
            .from('access')
            .select('id, serieid, seasonid, teamid, guid, comment')
            .eq('id', values.id)
            .is('deleted', null)
        if (dbdata.error !== null) return setFailResult(dbdata.error);
        if (dbdata.data.length == 1) {
            const data = {guid: values.guid, teamid: teamid, serieid: serieid, seasonid: seasonid, comment: values.comment};
            const dbdata = await supabase
                .from('access')
                .update([data])
                .eq('id', values.id)
                .select('id')
            if (dbdata.error !== null) return setFailResult(dbdata.error);
            return setOkResult(null, dbdata.data[0].id);
        }

        return setFailResult('Invalid parameter');
    }
    async admin_addconfig(item: string, value: any): Promise<DBStatus> {
        if (this.guid && await this.isadmin(this.guid) && item == 'tss') {
            let teamid = await this.idbyname(value.team, 'teams');
            let seasonid = await this.idbyname(value.season, 'seasons');
            let serieid = await this.idbyname(value.serie, 'series');
            if (teamid < 0 || seasonid < 0 || serieid < 0) return setFailResult('Invalid parameter');

            const dbdata = await supabase
                .from('teamserieseason')
                .select('id, teamid, serieid, seasonid')
                .eq('teamid', teamid)
                .eq('seasonid', seasonid)
                .eq('serieid', serieid)
                .is('deleted', null)
            if (dbdata.error !== null) return setFailResult(dbdata.error);
            if (dbdata.data.length == 0) {
                // ok to add new record
                const result = await supabase
                    .from('teamserieseason')
                    .insert([{teamid: teamid, seasonid: seasonid, serieid: serieid}])
                    .select("id", "guid")
                    .is('deleted', null)
                if (result.error) return setFailResult(result.error);
                return setOkResult(null, result.data.id);
            }
            else  return setFailResult('Already exists');
        }
        return setFailResult('Invalid parameter');
    }    
    private async getItem(id: number, list: any, tbl: string): Promise<DbPair> {
        let item = list.find(t => t.id == id);
        if (item === undefined) {
            item = {id: id, name: await this.namebyid(id, tbl) ?? ''}
        }                    
        return item;
    }
   async admin_getteamsetup(): Promise<DbTeam[]> {
        if (this.guid && await this.isadmin(this.guid)) {
            const dbdata = await supabase
                .from('teamserieseason')
                .select('id, teamid, serieid, seasonid')
                .is('deleted', null)
                .select('teamid, seasonid, serieid')
            if (dbdata.error !== null) return [];
            if (dbdata.data) {
                let sorted = dbdata.data.sort((a, b) => {
                    if (a.teamid > b.teamid) return 1;
                    if (a.teamid < b.teamid) return -1;
                    if (a.seasonid > b.seasonid) return 1;
                    if (a.seasonid < b.seasonid) return -1;
                    return a.serieid - b.serieid;
                    });


                let result: DbTeam[] = [];
                let index: number = 0;
                let prevteam: number = -1;
                let seasons: DbPair[] = [];
                let series: DbPair[] = [];
                let prevseason: number = -1;
                let pair: DbPair;
                while (index < sorted.length) {
                    if (sorted[index].teamid !== prevteam) {
                        prevteam = sorted[index].teamid;
                        let t = await this.namebyid( sorted[index].teamid, 'teams') ?? '';
                        result.push(createDbTeam(t , sorted[index].teamid));
                        prevseason = sorted[index].seasonid;
                        pair = await this.getItem(sorted[index].seasonid, seasons, 'seasons');
                        result[result.length - 1].seasons.push(createDbSeason(pair.name, pair.id));
                        let seriepair = await this.getItem(sorted[index].serieid, series, 'series');
                        result[result.length - 1].seasons[result[result.length - 1].seasons.length-1].series.push(createDbSerie(seriepair.name, seriepair.id));
                    }
                    else {
                        if (sorted[index].seasonid !== prevseason) {
                            prevseason = sorted[index].seasonid;
                            pair = await this.getItem(sorted[index].seasonid, seasons, 'seasons');
                            result[result.length - 1].seasons.push(createDbSeason(pair.name, pair.id));
                            let seriepair = await this.getItem(sorted[index].serieid, series, 'series');
                            result[result.length - 1].seasons[result[result.length - 1].seasons.length-1].series.push(createDbSerie(seriepair.name, seriepair.id));
                        }
                        else {
                            pair = await this.getItem(sorted[index].serieid, series, 'series');
                            result[result.length - 1].seasons[result[result.length - 1].seasons.length-1].series.push(createDbSerie(pair.name, pair.id));
                        }
                    }
                    index++;
                }
                return result;
            }
        }
        return [];
    }
    // async updatePlayers(team: string, season: string, serie: string, players: any): Promise<DBStatus> {
    //     let resp: DBStatus = {errormsg: null, status: null};
    //     console.log(`-----savePlayers ${team} ${JSON.stringify(players)}`)
    //     let currentplayers = await this.players(team, season, serie);
    //     if (currentplayers.length > 0) {
    //         return {errormsg: `Data already exists for team ${team}`, status: "Fail"};
    //     }
    //     const { data, error } = await supabase
    //         .from('players')
    //         .insert([
    //             { team: team, season: season, serie: serie, players: JSON.stringify(players) },
    //         ]);
    //     return resp;
    // }
    private onlyUnique(value: any, index: number, self: any) {
        return self.indexOf(value) === index;
    }

    private async gamesbydetails(params: DBNewGameInfo): Promise<DbGame[]> {
        // returns DbGame[]
        let games: DbGame[] = [];
        if (!await this.accesstoteamseasonserie(params.team, params.season, params.serie)) return games;
        let teamid = await this.idbyname(params.team, 'teams');
        let seasonid = await this.idbyname(params.season, 'seasons');
        let serieid = await this.idbyname(params.serie, 'series');
        if (teamid < 0 || seasonid < 0 || serieid < 0) return games;
        let dbdata = await supabase
            .from('games')
            .select('id, game, locked, guid, opponent')
            .eq('teamid', teamid)
            .eq('seasonid', seasonid)
            .eq('serieid', serieid)
            
        if (dbdata.error) return games;

        const dbData: DBSUPA_GAMES[] = dbdata.data;
        dbData.forEach(g => {
            g.gamejson = g.game ? JSON.parse(g.game) : null;
        });

        dbData.forEach((dbgame: DBSUPA_GAMES) => {
            try {
                dbgame.gamejson = dbgame.game ? JSON.parse(dbgame.game) : null;

                if (dbgame.gamejson) {
                    if (dbgame.gamejson.GameData.Date == params.date &&
                        dbgame.gamejson.GameData.Time == params.time &&
                        dbgame.gamejson.GameData.Location == params.location &&
                        dbgame.gamejson.GameData.City == params.city &&
                        dbgame.gamejson.GameData.Teams.Own == params.team &&
                        dbgame.gamejson.GameData.Teams.Opponent == params.opponent &&
                        dbgame.gamejson.GameData.Season == params.season &&
                        dbgame.gamejson.GameData.Leaque == params.serie
                        ) {
                            let dt = formatGametime(dbgame.gamejson.GameData.Date, dbgame.gamejson.GameData.Time);
                            games.push(createDbGame(dbgame.id, dbgame.guid, dbgame.locked, dbgame.gamejson ? dbgame.gamejson : null, dbgame.opponent, dt ?? ''))
                    }
                }
                else {
                    games.push(createDbGame(dbgame.id, dbgame.guid, dbgame.locked, null, dbgame.opponent, ''))
                }   
            }
            catch (err) {
                console.log(err)
            }
        })
        return games;
    }    
}
interface IDNAME {
    id: number;
    name: string;
}
