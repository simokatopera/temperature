
import {DbApiClass} from "./DbApiClass.js";
import { guidValid } from "../utils.js";
import { TemperatureType } from "./definitions.js";


let temperaturedata: TemperatureType[] = [];

temperaturedata.push(require("./files/Salo_2020.json"));
temperaturedata.push(require("./files/Salo_2024.json"));


export class FileDbClass implements DbApiClass {
    readonly driverversion: string = 'FileDb-0.01';
    //readonly adminuserid: string = "00000000-0000-0000-0000-000000001964";
    //readonly dummyid: string = "dummy id";
    //readonly demouserid: string ='edb96577-1f19-4c9c-bb7f-e5e12dc3969e';
    //readonly dummydefaultgameid: string = `00000000-0000-0000-0000-`;
    
    guid: string | null = null;
    
    constructor (guid: string) {
        this.guid = guid;
    }
    private operationAllowed(funct: string, operation: string) {
        if (!this.guid || this.guid === '') return false;
        return guidValid(this.guid);
    }
    async version(): Promise<string>{
        return this.driverversion;
    }
    async locations(): Promise<string[]> {
        if (this.operationAllowed('get', 'location')) {
            let i: number;
            let locations: string[] = [];
            for (i = 0; i < temperaturedata.length; i++) {
                locations.push(temperaturedata[i].info.location);
            }
            return locations.filter(this.onlyUnique);
        }
        return [];
    }
    async years(location: string): Promise<number[]> {
        if (this.operationAllowed('get', 'years')) {
            let i: number;
            let years: number[] = [];
            let yearnums: number[] = [];
            for (i = 0; i < temperaturedata.length; i++) {
                if (temperaturedata[i].info.year &&  !isNaN(Number(temperaturedata[i].info.year))) {
                    years.push(temperaturedata[i].info.year);
                }
            }
            years = years.filter(this.onlyUnique);
            for (i = 0; i < years.length; i++) {
                yearnums.push(Number(years[i]));
            }
            return yearnums;
        }
        return [];
    }
    async temperatures(location: string, years: number[]): Promise<TemperatureType[]> {
        if (this.operationAllowed('get', 'temperatures')) {
            let dataindex, yearindex: number;
            let temperatures: TemperatureType[] = [];
            console.log('temperatures')
            for (yearindex = 0; yearindex < years.length; yearindex++) {
                //console.log('yearindex')
                for (dataindex = 0; dataindex < temperaturedata.length; dataindex++) {
                    //console.log('dataindex')
                    if (temperaturedata[dataindex].info.location == location && temperaturedata[dataindex].info.year == years[yearindex]) {
                        temperatures.push(temperaturedata[dataindex]);
                        //console.log(temperaturedata[dataindex])
                        break;
                    }
                }
            }
            return temperatures;
        }
        return [];
    }
    private onlyUnique(value: any, index: number, self: any) {
        return self.indexOf(value) === index;
    }
    
}

