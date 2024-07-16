import {DbApiClass} from "./DbApiClass.js";
import { TemperatureType } from "./definitions.js";

export class TemperatureApi {
    db: DbApiClass | null = null;

    constructor (dbapi: DbApiClass) {
        this.db = dbapi;
    }
    async version(): Promise<string>{
        if (this.db === null) return '';
        return await this.db.version();
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