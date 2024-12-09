
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient("https://stehwqimpfcpzydxovha.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0ZWh3cWltcGZjcHp5ZHhvdmhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAwNTc0NzksImV4cCI6MjA0NTYzMzQ3OX0.Q4R4HZbaHs4sAw8KCvZKpp8LOMu148OPb9-gMUzceyk");

    import {DbApiClass} from "./DbApiClass.js";
    import { setFailResult, setOkResult, TemperatureUpdateData, DBStatus, TemperatureType, createTemperatureType, createTemperatureDataType, DbTemperatureDataType, TemperatureDataType } from "./definitions.js";

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
    readonly driverversion: string = 'DbSupa-1.00';
    readonly adminpwd_debugnosave = '1eb8859e-21d9-49cd-8fa5-b09ff5d32add';
    readonly adminpwd = '1eb8859e-21d9-49cd-8fa5-b09ff5d32adc'; 

    readonly DbTemperatureTable = 'temperatures';
    guid: string | null = null;
    filetemperaturedata: TemperatureType[] = [];
    
    constructor(guid: string) {
        this.guid = guid;
        this.getFileData();
    }

    private getFileYears(): Number[] {
        let i: number;
        let years: number[] = [];
        let yearnums: number[] = [];
        for (i = 0; i < this.filetemperaturedata.length; i++) {
            if (this.filetemperaturedata[i].info.year &&  !isNaN(Number(this.filetemperaturedata[i].info.year))) {
                years.push(this.filetemperaturedata[i].info.year);
            }
        }
        years = years.filter(this.onlyUnique);
        for (i = 0; i < years.length; i++) {
            yearnums.push(Number(years[i]));
        }
        return yearnums;
    }
    private getFileData() {
        this.filetemperaturedata.push(require("./files/Salo_1960_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1961_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1962_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1963_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1964_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1965_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1966_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1967_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1968_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1969_x.json"));

        this.filetemperaturedata.push(require("./files/Salo_1970_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1971_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1972_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1973_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1974_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1975_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1976_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1977_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1978_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1979_x.json"));

        this.filetemperaturedata.push(require("./files/Salo_1980_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1981_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1982_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1983_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1984_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1985_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1986_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1987_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1988_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1989_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1990_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1991_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1992_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1993_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1994_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1995_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1996_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1997_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1998_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_1999_x.json"));
        this.filetemperaturedata.push(require("./files/Salo_2000_x.json"));

        this.filetemperaturedata.push(require("./files/Salo_2001.json"));
        this.filetemperaturedata.push(require("./files/Salo_2002.json"));
        this.filetemperaturedata.push(require("./files/Salo_2003.json"));
        this.filetemperaturedata.push(require("./files/Salo_2004.json"));
        this.filetemperaturedata.push(require("./files/Salo_2005.json"));
        this.filetemperaturedata.push(require("./files/Salo_2006.json"));
        this.filetemperaturedata.push(require("./files/Salo_2007.json"));
        this.filetemperaturedata.push(require("./files/Salo_2008.json"));
        this.filetemperaturedata.push(require("./files/Salo_2009.json"));
        this.filetemperaturedata.push(require("./files/Salo_2010.json"));
        this.filetemperaturedata.push(require("./files/Salo_2011.json"));
        this.filetemperaturedata.push(require("./files/Salo_2012.json"));
        this.filetemperaturedata.push(require("./files/Salo_2013.json"));
        this.filetemperaturedata.push(require("./files/Salo_2014.json"));
        this.filetemperaturedata.push(require("./files/Salo_2015.json"));
        this.filetemperaturedata.push(require("./files/Salo_2016.json"));
        this.filetemperaturedata.push(require("./files/Salo_2017.json"));
        this.filetemperaturedata.push(require("./files/Salo_2018.json"));
        this.filetemperaturedata.push(require("./files/Salo_2019.json"));
        this.filetemperaturedata.push(require("./files/Salo_2020.json"));        
        this.filetemperaturedata.push(require("./files/Salo_2021.json"));        
        this.filetemperaturedata.push(require("./files/Salo_2022.json"));        
        this.filetemperaturedata.push(require("./files/Salo_2023.json"));        
    }
    async getFileTemperatures(location: string, years: number[]): Promise<TemperatureType[]> {
        if (this.operationAllowed('get', 'temperatures')) {
            let dataindex, yearindex: number;
            let temperatures: TemperatureType[] = [];
            for (yearindex = 0; yearindex < years.length; yearindex++) {
                for (dataindex = 0; dataindex < this.filetemperaturedata.length; dataindex++) {
                    if (this.filetemperaturedata[dataindex].info.location == location && this.filetemperaturedata[dataindex].info.year == years[yearindex]) {
                        let dailyreadings: TemperatureDataType[] = this.filetemperaturedata[dataindex].data;
                        dailyreadings.forEach(reading => {
                            reading.datetimeUtc = getDate(reading.date);
                        })
                        temperatures.push(this.filetemperaturedata[dataindex]);
                        break;
                    }
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
    private operationAllowed(funct: string, operation: string) {
        if (funct == 'post' && operation == 'savereadings') return this.checkAdminGuid();
        if (funct == 'get') {
            if (operation == 'temperatures' || operation == 'years' || operation == 'locations') return true;
        }
        return false;
    }
    private checkAdminGuid() {
        return (this.guid == this.adminpwd || this.guid == this.adminpwd_debugnosave);
    }
    private onlyUnique(value: any, index: number, self: any) {
        return self.indexOf(value) === index;
    } 
    
    async version(): Promise<string>{
        return this.driverversion;
    }
    async savingallowed(): Promise<boolean>{
        return this.checkAdminGuid();
    }
    async admin(): Promise<boolean>{
        return this.checkAdminGuid();
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
    private getYear(date: string): number {
        let parts = date.split('/');
        if (parts && parts.length === 3) return Number(parts[2]);
        return 0;
    }
    async savereadings(pwd: string, data: TemperatureUpdateData[]): Promise<DBStatus> {
        /*
        all data given as parameter must be data for same year
        */
        if (data.length == 0) return setFailResult("Ivalid parameter");

        if (this.operationAllowed('post', 'savereadings')) {
            if (pwd !== this.adminpwd && pwd !== this.adminpwd_debugnosave) return setFailResult("Not allowed");

            const curyears = data.map(d => this.getYear(d.date)).filter(this.onlyUnique);
            if (curyears.length > 1) return setFailResult("Ivalid parameter");

            let dbreadings: TemperatureType[] = await this.temperatures('', curyears);
            if (dbreadings.length > curyears.length) return setFailResult("Ivalid parameter");
            if (dbreadings.length > 0) {
                // there is readings for current year, update record
                let readingstobesaved: DbTemperatureDataType[] = dbreadings[0].data.map(r => {
                    let newdata: any = { date: r.date }
                    if (!isNaN(r.morning)) newdata.morning = r.morning;
                    if (!isNaN(r.evening)) newdata.evening = r.evening;
                    return newdata;
                });
                // add new readings
                data.forEach(itemtoadd => {
                    let index = readingstobesaved.length - 1;
                    while (index >= 0 && this.getDate(readingstobesaved[index].date) > this.getDate(itemtoadd.date)) index--;
                    if (index < 0) {
                        // add first item into list
                        let newreading: any = { date: itemtoadd.date }
                        if (!isNaN(itemtoadd.morning) && itemtoadd.morning !== null) newreading.morning = itemtoadd.morning;
                        if (!isNaN(itemtoadd.evening) && itemtoadd.evening != null) newreading.evening = itemtoadd.evening;

                        readingstobesaved.splice(0, 0, newreading);

                        // console.log('add new readings 1')
                        // for (let i = 0; i < 5; i++)
                        //     console.log(`${i} ${JSON.stringify(readingstobesaved[i])}`)
                    }

                    if (readingstobesaved[index].date == itemtoadd.date) {
                        // change date reading(s)
                        let newreading: any = { date: readingstobesaved[index].date}
                        if (!isNaN(itemtoadd.morning) && itemtoadd.morning !== null) newreading.morning = itemtoadd.morning;
                        if (!isNaN(itemtoadd.evening) && itemtoadd.evening !== null) newreading.evening = itemtoadd.evening;
                        if (newreading.evening || newreading.morning) {
                            // replace date reading
                            readingstobesaved[index] = newreading;
                        }
                        else {
                            // remove date reading
                            readingstobesaved.splice(index, 1);
                        }
                        // console.log('add new readings 3')
                        // for (let i = index - 5; i < index + 5 && i < readingstobesaved.length; i++)
                        //     console.log(`${i} ${JSON.stringify(readingstobesaved[i])}`)
                    }
                    else {
                        let newreading: any = { date: itemtoadd.date }
                        if (!isNaN(itemtoadd.morning) && itemtoadd.morning !== null) newreading.morning = itemtoadd.morning;
                        if (!isNaN(itemtoadd.evening) && itemtoadd.evening != null) newreading.evening = itemtoadd.evening;

                        if (index == readingstobesaved.length - 1) readingstobesaved.push(newreading);
                        else readingstobesaved.splice(index + 1, 0, newreading);

                        // console.log('add new readings 2')
                        // for (let i = index - 5; i < index + 5 && i < readingstobesaved.length; i++)
                        //     console.log(`${i} ${JSON.stringify(readingstobesaved[i])}`)
                    }
                })
                if (pwd == this.adminpwd_debugnosave) {
                    const record = await getUpdatedData(this.DbTemperatureTable, curyears[0]);
                    return setOkResult({ record: record, saved: false }, -1);
                }

                // save record
                const result = await supabase
                    .from(this.DbTemperatureTable)
                    .update({ year: curyears[0], readings: { info: dbreadings[0].info, data: readingstobesaved } })
                    .select('id')
                    .eq('year', curyears[0])
                if (result.error) {
                    return setFailResult("Ivalid parameter");
                }
                if (result.data.length) {
                    const record = await getUpdatedData(this.DbTemperatureTable, curyears[0]);
                    return setOkResult({ record: record, saved: true }, Number(result.data[0].id));
                }
                return setFailResult("Ivalid parameter");
            }

            async function getUpdatedData(table: string, year: number) {
                // local function
                let dbdata = await supabase
                    .from(table)
                    .select('readings')
                    .eq('year', year)
                if (dbdata.error || dbdata.data.length == 0) return null;
                return dbdata.data;
            }

            // create new yearly record (curyears.length is always 1)
            let yearsread = dbreadings.map(year => year.info.year);
            let missingyears = curyears.map(y => yearsread.find(yy => y == yy) ? null : y).filter(yyy => yyy !== null);
            if (missingyears.length != 1) return setFailResult("Ivalid parameter");

            let newreadings: DbTemperatureDataType[] = data.map(d => {
                if (this.getYear(d.date) == missingyears[0]) {
                    let value: any = { date: d.date };
                    if (!isNaN(d.morning) && d.morning !== null) value.morning = d.morning;
                    if (!isNaN(d.evening) && d.evening !== null) value.evening = d.evening;
                    return value;
                }
                return null;
            }).filter(val => val !== null);

            // console.log('add new readings 4')
            // for (let i = 0; i < 10 && i < newreadings.length; i++)
            //     console.log(`${i} ${JSON.stringify(newreadings[i])}`)

            if (pwd == this.adminpwd_debugnosave) {
                const record = await getUpdatedData(this.DbTemperatureTable, curyears[0]);
                return setOkResult({ record: record, saved: false }, -1);
            }

            // create a new record yearly
            const result = await supabase
                .from(this.DbTemperatureTable)
                .insert({ year: missingyears[0], readings: { info: { year: missingyears[0], location: '' }, data: newreadings } })
                .select('id')

            if (result.error) return setFailResult("Ivalid parameter");

            const record = await getUpdatedData(this.DbTemperatureTable, curyears[0]);

            return setOkResult({ record: record, saved: true }, result.data[0].id);

        }
        return setFailResult("Not allowed");
    }
    async locations(): Promise<string[]> {
        if (this.operationAllowed('get', 'location')) {
            let dbdata = await supabase
                .from(this.DbTemperatureTable)

            let locations: string[] = ['kukku', 'luuru'];
            return locations.filter(this.onlyUnique);
        }
        return [];
    }
    async years(location: string): Promise<number[]> {
        console.log('years')
        if (this.operationAllowed('get', 'years')) {
            let dbdata = await supabase
                .from(this.DbTemperatureTable)
                .select('year')
            if (dbdata.error || dbdata.data.length == 0) return [];
            let years = dbdata.data.map(d => Number(d.year));
            years = years.concat(this.getFileYears());
            return years.filter(this.onlyUnique).sort((a, b) => Number(a) - Number(b));
        }
        return [];
    }
    async temperatures(location: string, years: number[]): Promise<TemperatureType[]> {
        console.log('temperatures')
        if (this.operationAllowed('get', 'temperatures')) {
            //let temperatures: TemperatureType[] = [];
            let temperatures = await this.getFileTemperatures(location, years);
            try {               
                const dbdata: DbTemperatureResp = await supabase
                    .from(this.DbTemperatureTable)
                    .select('year, readings')
                    .in('year', years)
                if (dbdata.error || dbdata.data.length == 0) return [];

                for (let yearindex = 0; yearindex < dbdata.data.length; yearindex++) {
                    const readings = dbdata.data[yearindex].readings;
                    if (readings !== null) {
                        if (!temperatures.find(t => t.info.year === readings.info.year)) {
                            const tempvalues =  readings.data.map(d => {
                                return createTemperatureDataType(d.date, d.morning, d.evening, this.getDate(d.date), null)
                            })
                            temperatures.push(createTemperatureType(readings.info.year, readings.info.location, tempvalues));
                        }
                    }
                }
            }
            catch(err) {
                console.log(`Error: ${err}`)
            }
            console.log(`Years: ${temperatures.length}`)

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
// interface TemperatureUpdateData {
//     date: string;
//     morning: number;
//     evening: number;
//     morningtimeUtc: string;
//     eveningtimeUtc: string;
// }
