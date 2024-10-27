
import {DbApiClass} from "./DbApiClass.js";
import { guidValid } from "../utils.js";
import { TemperatureType, TemperatureDataType } from "./definitions.js";


let temperaturedata: TemperatureType[] = [];

temperaturedata.push(require("./files/Salo_2001.json"));
temperaturedata.push(require("./files/Salo_2002.json"));
temperaturedata.push(require("./files/Salo_2003.json"));
temperaturedata.push(require("./files/Salo_2004.json"));
temperaturedata.push(require("./files/Salo_2005.json"));
temperaturedata.push(require("./files/Salo_2006.json"));
temperaturedata.push(require("./files/Salo_2007.json"));
temperaturedata.push(require("./files/Salo_2008.json"));
temperaturedata.push(require("./files/Salo_2009.json"));
temperaturedata.push(require("./files/Salo_2010.json"));
temperaturedata.push(require("./files/Salo_2011.json"));
temperaturedata.push(require("./files/Salo_2012.json"));
temperaturedata.push(require("./files/Salo_2013.json"));
temperaturedata.push(require("./files/Salo_2014.json"));
temperaturedata.push(require("./files/Salo_2015.json"));
temperaturedata.push(require("./files/Salo_2016.json"));
temperaturedata.push(require("./files/Salo_2017.json"));
temperaturedata.push(require("./files/Salo_2018.json"));
temperaturedata.push(require("./files/Salo_2019.json"));
temperaturedata.push(require("./files/Salo_2020.json"));
temperaturedata.push(require("./files/Salo_2021.json"));
temperaturedata.push(require("./files/Salo_2022.json"));
temperaturedata.push(require("./files/Salo_2023.json"));
temperaturedata.push(require("./files/Salo_2024.json"));


export class DbFileClass implements DbApiClass {
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
            for (yearindex = 0; yearindex < years.length; yearindex++) {
                for (dataindex = 0; dataindex < temperaturedata.length; dataindex++) {
                    if (temperaturedata[dataindex].info.location == location && temperaturedata[dataindex].info.year == years[yearindex]) {
                        let dailyreadings: TemperatureDataType[] = temperaturedata[dataindex].data;
                        dailyreadings.map(reading => {
                            //;console.log(reading.date)
                            reading.datetimeUtc = getDate(reading.date);
                        })

                        temperatures.push(temperaturedata[dataindex]);
                        break;
                    }
                }
            }
            function getDate(date: string): Date | null {
                let parts = date.split('/');
                if (parts && parts.length === 3) {
                    //console.log(`${parts[0]} ${parts[1]} ${parts[2]}`)
                    return new Date(Number(parts[2]), Number(parts[0])-1, Number(parts[1]), 0, 0, 0, 0);
                 }
                return null;
            }
            return temperatures;
        }
        return [];
    }
    private onlyUnique(value: any, index: number, self: any) {
        return self.indexOf(value) === index;
    }
    
}

