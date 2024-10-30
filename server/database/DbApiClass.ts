import {TemperatureType} from "./definitions.js"

export abstract class DbApiClass {
    constructor (guid: string) {

    }
    async version(): Promise<string>{
        return '';
    }
    async savingallowed(): Promise<boolean>{
        return false;
    }
    async savereadings(pwd, data): Promise<number>{
        return -1;
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