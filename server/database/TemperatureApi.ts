import {DbApiClass} from "./DbApiClass.js";
import { TemperatureType, TemperatureUpdateData, DBStatus, setFailResult } from "./definitions.js";

export class TemperatureApi {
    db: DbApiClass | null = null;

    constructor (dbapi: DbApiClass) {
        this.db = dbapi;
    }
    async version(): Promise<string>{
        if (this.db === null) return '';
        return await this.db.version();
    }
    async savingallowed(): Promise<boolean>{
        if (this.db === null) return false;
        return await this.db.savingallowed();
    }
    async savereadings(pwd: string, data: TemperatureUpdateData[]): Promise<DBStatus>{
        if (this.db === null || data == null) return setFailResult("Not implemented");
        return await this.db.savereadings(pwd, data);
    }
    async locations(): Promise<string[]> {
        if (this.db === null) return [];
        return await this.db.locations();
    }
    async years(location: string): Promise<number[]> {
        if (this.db === null) return [];
        return await this.db.years(location);
    }
    async temperatures(location: string, years: number[]): Promise<TemperatureType[]> {
        if (this.db === null) return [];
        return await this.db.temperatures(location, years);
    }
}