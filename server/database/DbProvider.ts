
import {DbSupaClass} from "./DbSupaClass";
//import {DbFileClass} from "./DbFileClass";
import {TemperatureApi} from "./TemperatureApi"


export function GetProvider(guid: string): TemperatureApi {
    //let gameApi = new DbFileClass(guid);
    let gameApi = new DbSupaClass(guid);
    return new TemperatureApi(gameApi);
}
