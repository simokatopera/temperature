
import {DbSupa} from "./DbSupa";
import {GameFileDataClass} from "./GameFileDataClass";
import {GameApi} from "./GameApi"


export function GetProvider(guid: string): GameApi {
    //let gameApi = new GameFileDataClass(guid);
    let gameApi = new DbSupa(guid);
    return new GameApi(gameApi);
}
