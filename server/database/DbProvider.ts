
//import {DbSupa} from "./DbSupa";
import {FileDbClass} from "./DbFileClass";
import {TemperatureApi} from "./TemperatureApi"


export function GetProvider(guid: string): TemperatureApi {
    let gameApi = new FileDbClass(guid);
    //let gameApi = new DbSupa(guid);
    return new TemperatureApi(gameApi);
}
