
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://stehwqimpfcpzydxovha.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0ZWh3cWltcGZjcHp5ZHhvdmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwNTc0NzksImV4cCI6MjA0NTYzMzQ3OX0.Q4R4HZbaHs4sAw8KCvZKpp8LOMu148OPb9-gMUzceyk");

    import {DbApiClass} from "./DbApiClass.js";
    import { guidValid } from "../utils.js";
    import { TemperatureType, TemperatureDataType, createTemperatureType, createTemperatureDataType } from "./definitions.js";

/*
npm install @supabase/supabase-js --save-dev

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
            let dbdata = await supabase
                .from('temperatures')
                .select('year')
            if (dbdata.error || dbdata.data.length == 0) return [];
            const years = dbdata.data.map(d => d.year);
            return years;
        }
        return [];
    }
    async temperatures(location: string, years: number[]): Promise<TemperatureType[]> {
        console.log('temperatures')
        if (this.operationAllowed('get', 'temperatures')) {
            let dataindex, yearindex: number;
            let temperatures: TemperatureType[] = [];
            for (yearindex = 0; yearindex < years.length; yearindex++) {
                try {
                    let dbdata = await supabase
                        .from('temperatures')
                        .select('year, readings')
                        .eq('year', years[yearindex])
                    /*
                    error
                    data[] {
                        year
                        readings
                            info
                            data[]
                                date
                                morning
                                evening
                    }
                    */
                    if (dbdata.error || dbdata.data.length == 0) return [];
                    if (dbdata.data && dbdata.data.length && dbdata.data[0].readings) {
                        const readings =  dbdata.data[0].readings.data.map(d => {
                            return createTemperatureDataType(d.date, d.morning, d.evening, getDate(d.date), null)
                        })
                        temperatures.push(createTemperatureType(dbdata.data[0].readings.info.year, dbdata.data[0].readings.info.location, readings));
                    }                    
                }
                catch(err) {
                    console.log(`Error: ${err}`)
                }
            }
            function getDate(date: string): Date | null {
                let parts = date.split('/');
                if (parts && parts.length === 3) {
                    return new Date(Number(parts[2]), Number(parts[0])-1, Number(parts[1]), 0, 0, 0, 0);
                 }
                return null;
            }

            return temperatures;
        }
        return [];
    }
}
