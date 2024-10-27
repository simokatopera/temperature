
// require('dotenv').config();
// const {
//     DATABASE_URL,
//     SUPABASE_SERVICE_API_KEY
// } = process.env;
// import { createDbGame, createDbGame2, DbGame, DbGame2, DBGameData, createDbGameData, DBVideo, DbPair, createDbPair, 
//     DbTeam, createDbTeam, createDbSeason, createDbSerie, DbAccess, DbLog,createDbLog } from "../interfaces/Datatypes.js";


const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://stehwqimpfcpzydxovha.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0ZWh3cWltcGZjcHp5ZHhvdmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwNTc0NzksImV4cCI6MjA0NTYzMzQ3OX0.Q4R4HZbaHs4sAw8KCvZKpp8LOMu148OPb9-gMUzceyk");


    import {DbApiClass} from "./DbApiClass.js";
    import { guidValid } from "../utils.js";
    import { TemperatureType, TemperatureDataType } from "./definitions.js";

/*
psql -h db.ziroytwehkawnclhcyyz.supabase.co -p 5432 -d postgres -U postgres
*/
/*
*

npm install @supabase/supabase-js --save-dev

Supa database

project url:
https://stehwqimpfcpzydxovha.supabase.co
temperature
SalonSeudunSanomat100#
api key:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0ZWh3cWltcGZjcHp5ZHhvdmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwNTc0NzksImV4cCI6MjA0NTYzMzQ3OX0.Q4R4HZbaHs4sAw8KCvZKpp8LOMu148OPb9-gMUzceyk

row level security paasword
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0ZWh3cWltcGZjcHp5ZHhvdmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwNTc0NzksImV4cCI6MjA0NTYzMzQ3OX0.Q4R4HZbaHs4sAw8KCvZKpp8LOMu148OPb9-gMUzceyk


*/

export class DbSupaClass implements DbApiClass {
    readonly driverversion: string = 'DbSupa-0.01';

    guid: string | null = null;
    
    constructor(guid: string) {
        this.guid = guid;
    }

    private operationAllowed(funct: string, operation: string) {
        return true;
        //if (!this.guid || this.guid === '') return false;
        //return guidValid(this.guid);
    }
    private onlyUnique(value: any, index: number, self: any) {
        return self.indexOf(value) === index;
    }
    
    
    async version(): Promise<string>{
        return this.driverversion;
    }
    async locations(): Promise<string[]> {
        if (this.operationAllowed('get', 'location')) {
            let dbdata = await supabase
                .from('temperatures')

            let locations: string[] = ['kukku', 'luuru'];
            return locations.filter(this.onlyUnique);
        }
        return [];
    }
    async years(location: string): Promise<number[]> {
        console.log('years')
        if (this.operationAllowed('get', 'years')) {
            let i: number;
            let years: number[] = [];
            let yearnums: number[] = [2001,2002,2003];
            let dbdata = await supabase
                .from('temperatures')
            // for (i = 0; i < temperaturedata.length; i++) {
            //     if (temperaturedata[i].info.year &&  !isNaN(Number(temperaturedata[i].info.year))) {
            //         years.push(temperaturedata[i].info.year);
            //     }
            // }
            // years = years.filter(this.onlyUnique);
            // for (i = 0; i < years.length; i++) {
            //     yearnums.push(Number(years[i]));
            // }
            console.log(yearnums)
            return yearnums;
        }
        return [];
    }
    async temperatures(location: string, years: number[]): Promise<TemperatureType[]> {
        console.log('temperatures')
        console.log(years);
        if (this.operationAllowed('get', 'temperatures')) {
            let dataindex, yearindex: number;
            let temperatures: TemperatureType[] = [];
            for (yearindex = 0; yearindex < years.length; yearindex++) {
                // for (dataindex = 0; dataindex < temperaturedata.length; dataindex++) {
                //     if (temperaturedata[dataindex].info.location == location && temperaturedata[dataindex].info.year == years[yearindex]) {
                //         let dailyreadings: TemperatureDataType[] = temperaturedata[dataindex].data;
                //         dailyreadings.map(reading => {
                //             //;console.log(reading.date)
                //             reading.datetimeUtc = getDate(reading.date);
                //         })

                //         temperatures.push(temperaturedata[dataindex]);
                //         break;
                //     }
                // }
            }
            temperatures = [{info: {year: 2000, location: ''}, data: [{date: '1/1/2000', datetimeLocal: new Date(2000, 0, 1), datetimeUtc: new Date(0), morning: 1, evening: 2}, 
                    {date: '2/1/2000', datetimeLocal: new Date(2000, 0, 2), datetimeUtc: new Date(0), morning:3, evening: 4}]}];
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
}
