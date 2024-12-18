import {TemperatureType, TemperatureUpdateData, DBStatus, setFailResult} from "./definitions.js"

export abstract class DbApiClass {
    constructor (guid: string) {

    }
    async version(): Promise<string>{
        return '';
    }
    async savingallowed(): Promise<boolean>{
        return false;
    }
    async admin(): Promise<boolean>{
        return false;
    }
    async savereadings(pwd: string, data: TemperatureUpdateData[]): Promise<DBStatus>{
        return setFailResult("Not implemented");
    }
    async locations(): Promise<string[]> {
        return [];
    }
    async years(location: string): Promise<number[]> {
        return [];
    }    
    async temperatures(location: string, years: number[]): Promise<TemperatureType[]>{
        return [];
    }
}