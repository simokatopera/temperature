
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://stehwqimpfcpzydxovha.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0ZWh3cWltcGZjcHp5ZHhvdmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwNTc0NzksImV4cCI6MjA0NTYzMzQ3OX0.Q4R4HZbaHs4sAw8KCvZKpp8LOMu148OPb9-gMUzceyk");

    import {DbApiClass} from "./DbApiClass.js";
    import { guidValid } from "../utils.js";
    import { TemperatureType, createDbTemperatureDataType, createTemperatureType, createTemperatureDataType, DbTemperatureDataType, createDbTemperatureType } from "./definitions.js";

/*
npm install @supabase/supabase-js --save-dev

project url:
https://stehwqimpfcpzydxovha.supabase.co
temperature
SalonSeudunSanomat100#
api key:
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
    async savingallowed(): Promise<boolean>{
        return true;
    }
    private getDate(date: string): Date {
        let parts = date.split('/');
        if (parts && parts.length === 3) {
            return new Date(Number(parts[2]), Number(parts[0])-1, Number(parts[1]), 0, 0, 0, 0);
         }
        return new Date(0);
    }
    private createDbDate(date: Date): string {
        return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
    }
    async savereadings(pwd: string, data: TemperatureUpdateData[]): Promise<number>{
        console.log('savereadings')
        if (this.operationAllowed('post', 'savereadings')) {
            if (data.length == 0) return -7;
            if (!pwd) return -2;
            const curyears = data.map(d => new Date(d.date).getFullYear()).filter(this.onlyUnique);
            let dbreadings: TemperatureType[] = await this.temperatures('', curyears);
            console.log(`Amount of records: ${dbreadings.length}`)
            if (dbreadings.length > curyears.length) return -8;

            let recordstoupdate = dbreadings.length == curyears.length;
            if (dbreadings.length < curyears.length) {
                console.log('-----!!!!!------')
                recordstoupdate = false;
                // some years missing from db
                // create new yearly record
                let yearsread = dbreadings.map(year => year.info.year);
                console.log('yearsread')
                console.log(yearsread)
                let missingyears = curyears.map(y => yearsread.find(yy => y == yy) ? null : y).filter(yyy => yyy !== null);
                console.log('missingyears')
                console.log(missingyears)
                if (missingyears.length != 1) return -11;

                let newreadings: DbTemperatureDataType[]  = data.map(d => {
                    if (new Date(d.date).getFullYear() == missingyears[0]) {
                        let value: any = {date: this.createDbDate(new Date(d.date))};
                        if (!isNaN(d.morning) && d.morning !== null) value.morning = d.morning;
                        if (!isNaN(d.evening) && d.evening !== null) value.evening = d.evening;
                        return value;
                    }
                    return null;
                }).filter(val => val !== null);
                
                // add new year record
                const result = await supabase
                    .from('temperatures')
                    .insert({ year: missingyears[0], readings: {info: {year: missingyears[0], location: ''}, data: newreadings }})
                    .select('id')

                if (result.error) return -3;
                return result.data[0].id; 
            }
            
            if (recordstoupdate) {
                if (dbreadings.length > 1) return -4;
                console.log(`saving...`)

                let readingstobesaved: DbTemperatureDataType[] = dbreadings[0].data.map(r => (createDbTemperatureDataType(r.date, r.morning, r.evening)));
                // date: '1/1/2024', morning, evening
                console.log(`First readingtobesaved: ${JSON.stringify(readingstobesaved[0])}`)

                // add new readings
                data.forEach(d => {
                    let index = readingstobesaved.length - 1;                   
                    while (index >= 0 && this.getDate(readingstobesaved[index].date) >= new Date(d.date)) index--;
                    if (index >= 0) {
                        console.log(`index:${index}`)
                        if (this.getDate(readingstobesaved[index].date) == new Date(d.date)) {
                            if (!isNaN(d.morning) && d.morning !== null) readingstobesaved[index].morning = d.morning;
                            if (!isNaN(d.evening) && d.evening !== null) readingstobesaved[index].evening = d.evening;
                        }
                        else {
                            let newreading: any = {date: this.createDbDate(new Date(d.date))}
                            if (!isNaN(d.morning) && d.morning !== null) newreading.morning = d.morning;
                            if (!isNaN(d.evening) && d.evening != null) newreading.evening = d.evening;
                            readingstobesaved.push(newreading);
                        }
                    }
                    else return -10; // ?????
                })
                // save record
                const result = await supabase
                    .from('temperatures')
                    .update({ year: curyears[0], readings: {info: dbreadings[0].info, data: readingstobesaved }})
                    .select('id')
                    .eq('year', curyears[0])
                console.log('save done')
                console.log(result)
                if (result.error) {
                    console.log(`Error: ${result.error}`)
                    return -5;
                }
                if (result.data.length) {
                    console.log('saving success')
                    return Number(result.data[0].id); 
                }
                console.log('Saving done without saving')
                return -6;
            }
            return -9;
        }
        return -1;
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
            let temperatures: TemperatureType[] = [];
            try {
                const dbdata: DbTemperatureResp = await supabase
                    .from('temperatures')
                    .select('year, readings')
                    .in('year', years)
                if (dbdata.error || dbdata.data.length == 0) return [];

                for (let yearindex = 0; yearindex < dbdata.data.length; yearindex++) {
                    const readings = dbdata.data[yearindex].readings;
                    if (readings !== null) {
                        const tempvalues =  readings.data.map(d => (
                            createTemperatureDataType(d.date, d.morning, d.evening, this.getDate(d.date), null)
                        ))
                        temperatures.push(createTemperatureType(readings.info.year, readings.info.location, tempvalues));
                    }
                }
            }
            catch(err) {
                console.log(`Error: ${err}`)
            }

            // function getDate(date: string): Date | null {
            //     let parts = date.split('/');
            //     if (parts && parts.length === 3) {
            //         return new Date(Number(parts[2]), Number(parts[0])-1, Number(parts[1]), 0, 0, 0, 0);
            //      }
            //     return null;
            // }

            return temperatures;
        }
        return [];
    }
}
interface DbTemperatureResp {
    error: any;
    data: DbTemperature[];
}
interface DbTemperature {
    year: number;
    readings: TemperatureType | null;
}   
interface TemperatureUpdateData {
    date: string;
    morning: number;
    evening: number;
    morningtimeUtc: string;
    eveningtimeUtc: string;
}
