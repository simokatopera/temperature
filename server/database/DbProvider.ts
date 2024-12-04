
import {DbSupaClass} from "./DbSupaClass";
//import {DbFileClass} from "./DbFileClass";
import {TemperatureApi} from "./TemperatureApi"


export function GetProvider(guid: string): TemperatureApi {
    let gameApi = new DbSupaClass(guid);
    //let gameApi = new DbFileClass(guid);
    return new TemperatureApi(gameApi);
}
