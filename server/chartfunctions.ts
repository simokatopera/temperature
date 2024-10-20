// 2-counterfunctionupdate
// 3-extrafieldsremoved
// 4-some counters combines
// 5-pushed version
// 6-cleaning tooltipparameters
// 7-trendcalculation cleaning
// 8-pushed to git
// 9-some code rewritten

const TempMinDefaultValue = 99999;
const TempMaxDefaultValue = -99999;
const MonthlyEstimateLimit = 25;

export function getTempMinDefaultValue(): number { return TempMinDefaultValue; }
export function getTempMaxDefaultValue(): number { return TempMaxDefaultValue; }

export function roundNumber(value: any, num: number): string {
    if (isNaN(value)) return 'NaN';
    if (isNumeric(value)) {
        if (typeof value === 'number') return value.toFixed(num);
        else return value;
    }
    return '???'
}
export function isNumeric(obj: any): boolean {
    return !Array.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
}
export function getDateTxt(date, short: boolean = false): string {
    if (date == null || date === undefined || isNaN(date)) {
        return '????';
    }
    if (short) return (date) ? `${date.getDate()}.${date.getMonth() + 1}` : `-`;
    return (date) ? `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}` : `-`;
}


// --------------------------------------------------------------
// MinMax and HighLow datatypes and functions
// --------------------------------------------------------------
interface AverageCalculated {
    date: Date;
    day: number;
    monthno: number;
    year: number;

    averagevalue: number;

    morning: MinMaxAverageCount;
    evening: MinMaxAverageCount;
    difference: MinMaxAverageCount;
    total: MinMaxAverageCount;

    morningfiltered: MinMaxAverageCount;
    eveningfiltered: MinMaxAverageCount;
    differencefiltered: MinMaxAverageCount;
    totalfiltered: MinMaxAverageCount;
}
interface MinMaxAverageCount {
    count: number;
    sum: number;
    average: number;

    min: ReadingDate;
    max: ReadingDate;
}
interface ReadingDate {
    value: number;
    date: Date;
}
function createMinMaxAverageCount(count: number, sum: number, min: ReadingDate, max: ReadingDate): MinMaxAverageCount {
    return {count: count, sum: sum, average: count>0?sum/count:NaN, min: min, max: max}
}
function createReadingDate(value: number, date: Date): ReadingDate {
    return {value: value, date: date}
}
function createOneDayValuesEmpty() {
    return createMinMaxAverageCount(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0)));
}
function createAverageMinMaxCalcValues(date: Date): AverageCalculated {
    return { date: date, day: date.getDate(), monthno: date.getMonth()+1, year: date.getFullYear(), 
        averagevalue: NaN,
        morning: createOneDayValuesEmpty(),
        evening: createOneDayValuesEmpty(),
        difference: createOneDayValuesEmpty(),
        total: createOneDayValuesEmpty(),
        morningfiltered: createOneDayValuesEmpty(), 
        eveningfiltered: createOneDayValuesEmpty(), 
        differencefiltered: createOneDayValuesEmpty(), 
        totalfiltered: createOneDayValuesEmpty()
    }
}
function createAverageCalculatedTable(year: number, datasize: number, incrmonth: boolean): AverageCalculated[] {
    return Array.from({length:datasize}).map((x,i)=>createAverageMinMaxCalcValues(new Date(year, incrmonth ? i : 0, incrmonth ? 1 : i+1))); 
}
function createAverageCalculated12MonthsTable(year: number): AverageCalculated[] {
    return createAverageCalculatedTable(year, 12, true); 
}
function createAverageCalculated366DaysTable(): AverageCalculated[] {
    return createAverageCalculatedTable(temperatureClass.defaultyear, 366, false); 
}
function createAverageCalculated(date: Date, year: number, average: number, morning: MinMaxAverageCount, evening: MinMaxAverageCount, difference: MinMaxAverageCount, total: MinMaxAverageCount): AverageCalculated {
    return {date: date, year: year, monthno: date.getMonth()+1, day: date.getDate(), averagevalue: average, morning: morning, evening: evening, difference: difference, total: total,
        morningfiltered: null, eveningfiltered: null, differencefiltered: null, totalfiltered: null }
}
function updateMinMaxTable(minmaxvalues: MinMaxAverageCount, newvalue: number, newdate: Date): boolean {
    if (newvalue == null || isNaN(newvalue)) return false;

    minmaxvalues.count++;
    minmaxvalues.sum += newvalue;
    minmaxvalues.average = minmaxvalues.sum/minmaxvalues.count;
    if (newvalue > minmaxvalues.max.value) { 
        minmaxvalues.max.value = newvalue; 
        minmaxvalues.max.date = newdate; 
    }
    if (newvalue < minmaxvalues.min.value) { 
        minmaxvalues.min.value = newvalue; 
        minmaxvalues.min.date = newdate; 
    }
    return true;
}


// -----------------------------------------------------------------
//
// Database structures
//
interface TemperatureMsg {
    data: DbTemperature[];
    statusCode: number;
    message: string;
}
interface DbTemperature {
    data: DbData[];
    info: Info;
}
interface Info {
    location: string;
    year: number;
}
interface DbData {
    date: string;
    morning: number;
    evening: number;
    datetimeLocal: Date;
    datetimeUtc: Date;
}
// -----------------------------------------------------------------
interface Filtered {
    index: number;
    date: Date;
    morning: number;
    evening: number;
    average: number;
    morningfiltered: number;
    eveningfiltered: number;
    averagefiltered: number;
    difference: number;
    differencefiltered: number;
    firstdayfilter: Date;
    lastdayfilter: Date;
    morninghighest: boolean;
    morninglowest: boolean;
    eveninghighest: boolean;
    eveninglowest: boolean;
}
function createFiltered(date: Date, morning: number, evening: number, average: number, difference: number,
    filteredmorning: number, filteredevening: number, filteredaverage: number, filtereddifference: number, 
    filterfirstday: Date, filterlastday: Date): Filtered {
    return {date: date, morning: morning, evening: evening, average: average, difference: difference, morningfiltered: filteredmorning, eveningfiltered: filteredevening, averagefiltered: filteredaverage,differencefiltered: filtereddifference, firstdayfilter: filterfirstday, lastdayfilter: filterlastday, index: 0, morninghighest: false, morninglowest: false, eveninghighest: false, eveninglowest: false}
}
function createDateOnlyFiltered(date: Date): Filtered {
    return {date: date, morning: NaN, evening: NaN, average: NaN, difference: NaN, morningfiltered: NaN, eveningfiltered: NaN, averagefiltered: NaN, differencefiltered: NaN, firstdayfilter: date, lastdayfilter: date, index: 0, morninghighest: false, morninglowest: false, eveninghighest: false, eveninglowest: false}
}
// ----------------------------------------------------
/*

*/
interface FilterValue {
    date: Date;
    morning: AverageMinMaxCalculated;
    evening: AverageMinMaxCalculated;
    difference: AverageMinMaxCalculated;
    total: AverageMinMaxCalculated;
}
// - - - - - - - - - - - - - -
interface AverageMinMaxCalculated{
    value: number;
    high: number;
    low: number;
    highdate: Date;
    lowdate: Date;
}
// - - - - - - - - - - - - - -
interface AverageYearsMonths {
    yearlydata: YearlyAverageData[];
    monthlydata: FilterValue[];
}
interface YearlyAverageData {
    year: number;
    location: string;
    yearlyaverage: number;
    yearlyaveragediff: number;
    months: MonthAverageData[]; // 12
    estimate: boolean;
}
interface MonthAverageData {
    monthno: number;
    monthlytemperature: number;
    monthlytemperaturecount: number;
    monthlydifference: number;
    monthlydifferencecount: number;
    averages: AverageCalculated;
    estimate: boolean;
}

function createAverageMinMaxCalculatedEmpty(): AverageMinMaxCalculated {
    return {value: NaN, high: TempMaxDefaultValue, highdate: new Date(0), low: TempMinDefaultValue, lowdate: new Date(0)}
}
function createAverageMinMaxCalculated(value: number, high: number, highdate: Date, low: number, lowdate: Date): AverageMinMaxCalculated {
    return {value: value, high: high, highdate: highdate, low: low, lowdate: lowdate}
}
function createYearlyAverageData(year: number, location: string, estimate: boolean = false): YearlyAverageData {
    return {year: year, location: location, yearlyaverage: NaN, yearlyaveragediff: NaN, months: [], estimate: estimate}
}
function createFilterValueEmpty(date: Date): FilterValue {
    return {date: date, morning: createAverageMinMaxCalculatedEmpty(), evening: createAverageMinMaxCalculatedEmpty(), total: createAverageMinMaxCalculatedEmpty(), difference: createAverageMinMaxCalculatedEmpty()}
}
function createFilterValue(date: Date, average: AverageMinMaxCalculated, morning: AverageMinMaxCalculated, evening: AverageMinMaxCalculated, difference: AverageMinMaxCalculated): FilterValue {
    return {date: date, morning: morning, evening: evening, total: average, difference: difference}
}
function createAverageYearsMonths(yearlydata: YearlyAverageData[], monthlydata: FilterValue[]): AverageYearsMonths {
    return {yearlydata: yearlydata, monthlydata: monthlydata}
}
function calculateAverage(counter: AverageCalculated): AverageCalculated {
    const morningmin = createReadingDate(counter.morning.min.value, counter.morning.min.date);
    const morningmax = createReadingDate(counter.morning.max.value, counter.morning.max.date);
    const morning = createMinMaxAverageCount(counter.morning.count, counter.morning.sum, morningmin, morningmax);

    const eveningmin = createReadingDate(counter.evening.min.value, counter.evening.min.date);
    const eveningmax = createReadingDate(counter.evening.max.value, counter.evening.max.date);
    const evening = createMinMaxAverageCount(counter.evening.count, counter.evening.sum, eveningmin, eveningmax);

    const differencemin = createReadingDate(counter.difference.min.value, counter.difference.min.date);
    const differencemax = createReadingDate(counter.difference.max.value, counter.difference.max.date);
    const difference = createMinMaxAverageCount(counter.difference.count, counter.difference.sum, differencemin, differencemax);

    const totalmin = createReadingDate(counter.total.min.value, counter.total.min.date);
    const totalmax = createReadingDate(counter.total.max.value, counter.total.max.date);
    const total = createMinMaxAverageCount(counter.total.count, counter.total.sum, totalmin, totalmax);

    let newitem = createAverageCalculated(counter.date, counter.year, counter.total.average, morning, evening, difference, total);

    return newitem;
}
function createMonthAverageData(monthno: number, monthlytemperature: number, monthlytemperaturecount: number, monthlydifference: number, monthlydifferencecount: number, averages: AverageCalculated): MonthAverageData {
    return {monthno: monthno, 
        monthlytemperaturecount: monthlytemperaturecount, 
        monthlytemperature: monthlytemperature, 
        monthlydifferencecount: monthlydifferencecount, 
        monthlydifference: monthlydifference,
        averages: averages, estimate: false}
}
// --------------------------------------------------------

interface GraphSerieType {
    data: GraphSerie[];
    params: any;
}
function createGraphSerieType(data: GraphSerie[], params: any): GraphSerieType {
    return {data: data, params: params}
}
interface GraphSerie {
    name: string;
    location: string;
    year: number;
    values: GraphItem[];
    trend: boolean;
    index: number;
}
function createGraphSerie(name: string, location: string, year: number, values: GraphItem[], trend: boolean, index: number): GraphSerie {
    return {name: name, location: location, year: year, values: values, trend: trend, index: index}
}
interface GraphItem {
    value: [Date, number,boolean];
    tooltip: string;
}  
function createGraphItem(d: Date, v: number, e: boolean): [Date, number, boolean] {
    return [d, v, e];
}

// --------------------------------------------------------

// ========================================================================================

interface CalculationResult {
    data: any;
    status: number;
    message: string | null;
}

class Temperatures {
    //temperatures: TemperatureMsg;
    defaultyear: number = 1976;
    filterlength: number;

    filteredValues: Filtered[] = [];
    filteredValuesValid:  Filtered[] = [];

    yearlyMonthlyAverages: AverageYearsMonths = createAverageYearsMonths([],[]);
    dailyValues: AverageCalculated[] = [];

    allFilteredDataYearlyArranged = [];
    monthnames: string[] = [];
    monthnameslong: string[] = [];

    //constructor () { }
    constructor (filterlength: number, monthnames: string[], monthnameslong: string[]) { this.filterlength = filterlength; this.monthnames = monthnames; this.monthnameslong = monthnameslong}

    getValidFilteredValues(): Filtered[] {
        if (this.filteredValuesValid.length == 0) {
            this.filteredValuesValid = this.filteredValues.filter(v => !(isNaN(v.morning) || isNaN(v.evening)));
            this.filteredValuesValid.forEach((fv,i) => fv.index = i)
        }
        return this.filteredValuesValid;
    }

    private updateYearCounters(yearcounters: AverageCalculated[], monthlycounters: AverageCalculated[]): MonthAverageData[] {
        const monthlyvalues = monthlycounters.map((counter, index) => {
            let averages: AverageCalculated = calculateAverage(counter);
            const morningstatus = updateMinMaxTable(yearcounters[index].morning, averages.morning.count>0?averages.morning.sum/averages.morning.count:NaN, new Date(counter.year, counter.monthno, 1));
            const everningstatus = updateMinMaxTable(yearcounters[index].evening, averages.evening.count>0?averages.evening.sum/averages.evening.count:NaN, new Date(counter.year, counter.monthno, 1));
            if (morningstatus && everningstatus) {
                updateMinMaxTable(yearcounters[index].difference, averages.difference.count>0?averages.difference.sum/averages.difference.count:NaN, new Date(counter.year, counter.monthno, 1));
                updateMinMaxTable(yearcounters[index].total, averages.total.count>0?averages.total.sum/averages.total.count:NaN, new Date(counter.year, counter.monthno, 1));
            }
            const monthlytempereature = counter.total.average;
            const monthlytempereaturecount = counter.total.count;
            const monthlydifference = counter.difference.average;
            const monthlydifferencecount = counter.difference.count;
            return createMonthAverageData(counter.monthno, monthlytempereature, monthlytempereaturecount, monthlydifference, monthlydifferencecount, averages);
        });       
        return monthlyvalues;   
    }
    private calculateMonthlyValuesForCurrentYear(currentyear: DbTemperature): AverageCalculated[] {
        /*
        currentyear: data:[366], info: 
        daily data for surrent year
        */
        let monthlycounters: AverageCalculated[] = createAverageCalculated12MonthsTable(currentyear.info.year);
        currentyear.data.forEach(monthlytemp => {
            const monthindex = monthlytemp.datetimeLocal.getMonth();
            const morningvalueexists = updateMinMaxTable(monthlycounters[monthindex].morning, monthlytemp.morning, monthlytemp.datetimeLocal);
            const eveningvalueexists = updateMinMaxTable(monthlycounters[monthindex].evening, monthlytemp.evening, monthlytemp.datetimeLocal);
            if (eveningvalueexists && morningvalueexists) {
                const diff = (monthlytemp.evening - monthlytemp.morning);
                const aver = (monthlytemp.evening + monthlytemp.morning)/2;
                updateMinMaxTable(monthlycounters[monthindex].difference, diff, monthlytemp.datetimeLocal);
                updateMinMaxTable(monthlycounters[monthindex].total, aver, monthlytemp.datetimeLocal);
            }
            monthlycounters[monthindex].averagevalue = monthlycounters[monthindex].total.average;
        })

        return monthlycounters;
    }    
    private getEstimateForMonth(year: number, monthindex: number, monthlyreadings: Filtered[]) {
        // calculate estimation for month
        let dailyindex = 0;
        let estimationcount = 0;
        let estimationdiffsum = 0;
        let estimationsum = 0;
        let countday = new Date(year, monthindex, 1);
        while (countday.getMonth() == monthindex) {
            let curdate = countday.getDate();
            if (dailyindex >= monthlyreadings.length || curdate < monthlyreadings[dailyindex].date.getDate()) {
                // get average temperature for curdate
                let datefound = this.dailyValues.find(d => d.date.getMonth() == monthindex && d.date.getDate() == curdate);
                if (datefound) {
                    estimationcount++;
                    estimationsum += datefound.averagevalue;
                    estimationdiffsum += datefound.difference.average;
                }
                else {
                    console.log(`Estimate calculation for day: ${curdate} failed`)
                }
            }
            else {
                estimationcount++;
                estimationsum += monthlyreadings[dailyindex].average;
                estimationdiffsum += monthlyreadings[dailyindex].difference;
            }
            countday = new Date(year, monthindex, curdate + 1);
    
            while (dailyindex < monthlyreadings.length && curdate >= monthlyreadings[dailyindex].date.getDate()) {
                dailyindex++;
            }
        }
        return {temperature: estimationsum / estimationcount, difference: estimationdiffsum / estimationcount };
    }
    calculateYearlyAndMonthlyAveragesWithEstimates(temperatures: TemperatureMsg): CalculationResult {
        let yearcounters: AverageCalculated[] = createAverageCalculated12MonthsTable(this.defaultyear);
        let allyearsandmonthsstatistics = [];
        const yearlystatistics: YearlyAverageData[] = temperatures.data.map(year => {
            const averagedata = createYearlyAverageData(year.info.year, year.info.location);
            const allmonthsstatistics = this.calculateMonthlyValuesForCurrentYear(year);
            allyearsandmonthsstatistics[year.info.year] = {year: year.info.year, data: allmonthsstatistics};
            averagedata.months = this.updateYearCounters(yearcounters, allmonthsstatistics);
            averagedata.yearlyaverage = 0;
            let sum = 0;
            let count = 0;
            let dsum = 0;
            let dcount = 0;
            let estimates = false;
            averagedata.months.forEach(month => {
                if (month.monthlytemperaturecount >= MonthlyEstimateLimit) {
                    count++;
                    sum += month.monthlytemperature;
                }
                else {
                    month.estimate = true;
                    estimates = true;
                }
                dcount++;
                dsum += month.monthlydifference;
            })
            averagedata.estimate = estimates;
            averagedata.yearlyaverage = estimates ? NaN : sum/count;
            averagedata.yearlyaveragediff = estimates ? NaN : dsum/dcount;
            return averagedata;
        })
        // format monthly statistics
        const monthlystatistics: FilterValue[] = yearcounters.map((monthcounter, monthindex) => {
            return createFilterValue(
                new Date(this.defaultyear, monthindex, 1), 
                createAverageMinMaxCalculated(monthcounter.total.count > 0 ? monthcounter.total.sum/monthcounter.total.count:NaN, monthcounter.total.max.value, monthcounter.total.max.date, monthcounter.total.min.value, monthcounter.total.min.date),
                createAverageMinMaxCalculated(monthcounter.morning.count > 0 ? monthcounter.morning.sum/monthcounter.morning.count:NaN, monthcounter.morning.max.value, monthcounter.morning.max.date, monthcounter.morning.min.value, monthcounter.morning.min.date), 
                createAverageMinMaxCalculated(monthcounter.evening.count > 0 ? monthcounter.evening.sum/monthcounter.evening.count:NaN, monthcounter.evening.max.value, monthcounter.evening.max.date, monthcounter.evening.min.value, monthcounter.evening.min.date),
                createAverageMinMaxCalculated(monthcounter.difference.count > 0 ? monthcounter.difference.sum/monthcounter.difference.count:NaN, monthcounter.difference.max.value, monthcounter.difference.max.date, monthcounter.difference.min.value, monthcounter.difference.min.date)
            )})

        // update estimate values for months
        yearlystatistics.forEach((year) => {
            const allyyearreadings = temperatureClass.getAllFilteredDataYearlyArranged();
            const thisyearreadings = allyyearreadings[year.year];
            if (year.estimate) {
                year.months.forEach((month, monthindex) => {
                    if (month.estimate) {
                        let x = this.getEstimateForMonth(year.year, monthindex, thisyearreadings.values.filter(reading => reading.date.getMonth() == monthindex));
                        month.monthlytemperature = x.temperature;
                        month.monthlydifference = x.difference;
                    }
                })
            }
            let yearsum = year.months.reduce((a, b) => a + b.monthlytemperature, 0);
            year.yearlyaverage = yearsum/12;
            let diffsum = year.months.reduce((a, b) => a + b.monthlydifference, 0);
            year.yearlyaveragediff = diffsum/12;
        })
        
        this.yearlyMonthlyAverages = createAverageYearsMonths(yearlystatistics, monthlystatistics);

        return {status: 0, message: null, data: this.yearlyMonthlyAverages};
    }
    createLinearContTable(temperatures: TemperatureMsg): FilterValue[] {
        let lineartable:FilterValue[] = [];
        for (let year: number = temperatures.data[0].info.year; year <= temperatures.data[temperatures.data.length - 1].info.year; year++) {
            const lastday = year % 4 == 0 ? 366 : 365;
            for (let day: number = 1; day <= lastday; day++) lineartable.push(createFilterValueEmpty(new Date(year, 0, day)));
        }
        let currindex: number = 0;
        temperatures.data.forEach((yearserie: DbTemperature) => {
            while (currindex < lineartable.length && lineartable[currindex].date.getFullYear() < yearserie.info.year) currindex++;
            if (currindex < lineartable.length) {
                for (let currdateindex: number = 0; currdateindex < yearserie.data.length; currdateindex++) {
                    if (yearserie.info.year === lineartable[currindex].date.getFullYear()) {
                        const t = yearserie.data[currdateindex].datetimeLocal;
                        while (currindex < lineartable.length && lineartable[currindex].date < t) currindex++;
                        if (currindex < lineartable.length) {
                            if (t.getDate() === lineartable[currindex].date.getDate()) {
                                if (yearserie.data[currdateindex].evening !== undefined && yearserie.data[currdateindex].morning !== undefined) {
                                    const value = (yearserie.data[currdateindex].evening + yearserie.data[currdateindex].morning) / 2;
                                    lineartable[currindex].total.value = value;
                                    lineartable[currindex].morning.value = yearserie.data[currdateindex].morning;
                                    lineartable[currindex].evening.value = yearserie.data[currdateindex].evening;
                                    lineartable[currindex].difference.value = yearserie.data[currdateindex].evening - yearserie.data[currdateindex].morning;;
                                    currindex++;
                                }
                            }
                        }
                    }
                }
            }
        })
        return lineartable;
    }    
    calculateFilteredValues(temperatures: TemperatureMsg): CalculationResult {
        const filteredserie: FilterValue[] = this.createLinearContTable(temperatures);

        let firstindex: number = 0;
        let lastindex: number = 0;
        let negoffset: number = this.filterlength % 2 ? -this.filterlength / 2 + 0.5 : -this.filterlength / 2;
        let posoffset: number = negoffset + this.filterlength;
        let filtered: Filtered[] = filteredserie.map(ss => {
            if (!isNaN(ss.total.value)) {
                let first = new Date(ss.date.getFullYear(), ss.date.getMonth(), ss.date.getDate() + negoffset);
                let last = new Date(ss.date.getFullYear(), ss.date.getMonth(), ss.date.getDate() + posoffset);
                while (firstindex < filteredserie.length && filteredserie[firstindex].date < first) firstindex++;
                while (lastindex < filteredserie.length && filteredserie[lastindex].date < last) lastindex++;
                let sum: number = 0;
                let dec: number = 0;
                let diffsum: number = 0;
                let diffdec: number = 0;
                let morningsum: number = 0;
                let morningdec: number = 0;
                let eveningsum: number = 0;
                let eveningdec: number = 0;
                for (let index: number = firstindex; index < lastindex; index++) {
                    if (isNaN(filteredserie[index].total.value)) dec++;
                    else sum += filteredserie[index].total.value;
                    if (isNaN(filteredserie[index].difference.value)) diffdec++;
                    else diffsum += filteredserie[index].difference.value;
                    if (isNaN(filteredserie[index].morning.value)) morningdec++;
                    else morningsum += filteredserie[index].morning.value;
                    if (isNaN(filteredserie[index].evening.value)) eveningdec++;
                    else eveningsum += filteredserie[index].evening.value;
                }
                let filteredmorning = (lastindex - firstindex - morningdec) > 0 ? morningsum / (lastindex - firstindex - morningdec) : NaN;
                let filteredevening = (lastindex - firstindex - eveningdec) > 0 ? eveningsum / (lastindex - firstindex - eveningdec) : NaN;
                let filteredaverage = (lastindex - firstindex - dec) > 0 ? sum / (lastindex - firstindex - dec) : NaN;
                let filtereddifference = (lastindex - firstindex - diffdec) > 0 ? diffsum / (lastindex - firstindex - diffdec) : NaN;

                return createFiltered(ss.date, ss.morning.value, ss.evening.value, !isNaN(ss.morning.value) && 
                    !isNaN(ss.evening.value) ? (ss.morning.value + ss.evening.value) / 2 : NaN,  
                    !isNaN(ss.morning.value) && !isNaN(ss.evening.value) ? (ss.evening.value - ss.morning.value) : NaN, 
                    filteredmorning, filteredevening, filteredaverage, filtereddifference, first, last);
            }
            return createDateOnlyFiltered(ss.date);
        })

        this.filteredValues = filtered;
        return {status: 0, message: null, data: filtered};
    }   
    calculateDailyAverages(temperatures: TemperatureMsg, year: number = null): CalculationResult {
        let calculationtable: AverageCalculated[] = createAverageCalculated366DaysTable();
        let firstindex = 0;
        let lastindex = temperatures.data.length;
        if (year) {
            while (firstindex < temperatures.data.length && temperatures.data[firstindex].info.year != year) firstindex++;
            lastindex = firstindex + 1;
        }
        for (let yearindex: number = firstindex; yearindex < lastindex; yearindex++) {
            let sumindex = 0;
            temperatures.data[yearindex].data.forEach(dayreadings => {
                const dt: Date = new Date(dayreadings.datetimeLocal);
                const month = dt.getMonth() + 1;
                const day = dt.getDate();
                while (sumindex < calculationtable.length && (calculationtable[sumindex].day != day || calculationtable[sumindex].monthno != month)) sumindex++;
                if (sumindex < calculationtable.length) {
                    let foundsum = calculationtable[sumindex];
                    sumindex++;

                    const value1ok = updateMinMaxTable(foundsum.morning, dayreadings.morning, dayreadings.datetimeLocal);
                    const value2ok = updateMinMaxTable(foundsum.evening, dayreadings.evening, dayreadings.datetimeLocal);
                    if (value1ok) updateMinMaxTable(foundsum.total, dayreadings.morning, dayreadings.datetimeLocal);
                    if (value2ok) updateMinMaxTable(foundsum.total, dayreadings.evening, dayreadings.datetimeLocal);

                    if (value1ok && value2ok) {
                        updateMinMaxTable(foundsum.difference, dayreadings.evening - dayreadings.morning, dayreadings.datetimeLocal);
                    }
                }
            })
        }
        const dailyvalues: AverageCalculated[] = calculationtable.map(sum => {
            let morning: MinMaxAverageCount = createMinMaxAverageCount(sum.morning.count, sum.morning.sum, { date: sum.morning.min.date, value: sum.morning.min.value }, { date: sum.morning.max.date, value: sum.morning.max.value });
            let evening: MinMaxAverageCount = createMinMaxAverageCount(sum.evening.count, sum.evening.sum, { date: sum.evening.min.date, value: sum.evening.min.value }, { date: sum.evening.max.date, value: sum.evening.max.value });
            let difference: MinMaxAverageCount = createMinMaxAverageCount(sum.difference.count, sum.difference.sum, { date: sum.difference.min.date, value: sum.difference.min.value }, { date: sum.difference.max.date, value: sum.difference.max.value });
            let total: MinMaxAverageCount = createMinMaxAverageCount(sum.total.count, sum.total.sum, { date: sum.total.min.date, value: sum.total.min.value }, { date: sum.total.max.date, value: sum.total.max.value });
            return createAverageCalculated(sum.date, NaN, total.count > 0 ? total.sum/total.count : NaN, morning, evening, difference, total);
        })
        this.dailyValues = dailyvalues;
        return { status: 0, message: null, data: dailyvalues };
    }
    calculateTemperatures(temperaturevalues: TemperatureMsg) {
        const status3 = temperatureClass.calculateFilteredValues(temperaturevalues); // this.filteredValues
        const status2 = temperatureClass.calculateDailyAverages(temperaturevalues);  // this.dailyValues
        const status1 = temperatureClass.calculateYearlyAndMonthlyAveragesWithEstimates(temperaturevalues); // this.YearlyAverages
    }    
    getFilteredDataYearlyArranged(): NameValues[] {
        let data = this.getValidFilteredValues()
        let yearlydata: Filtered[][] = [];
        data.forEach(val => {
            const year = val.date.getFullYear();
            if (!yearlydata[year]) yearlydata[year] = [];
            yearlydata[year].push(val);
        })
        return yearlydata.map(yeardata => {
            return createNameValues(`Vuosi ${yeardata[0].date.getFullYear()}`, yeardata[0].date, yeardata.map(v => 
                createFiltered(v.date,v.morning,v.evening,v.average,v.difference,v.morningfiltered,v.eveningfiltered,
                    v.averagefiltered,v.differencefiltered,v.firstdayfilter,v.lastdayfilter)))
        });
    }
    getAllFilteredDataYearlyArranged(): NameValues[] {
        if (this.allFilteredDataYearlyArranged.length == 0) this.allFilteredDataYearlyArranged = temperatureClass.getFilteredDataYearlyArranged();
        return this.allFilteredDataYearlyArranged;
    }    
    getDailyMinMaxValues(data: NameValues[]): AverageCalculated[] {
        // find daily minimums and maximums
        const dailyminmaxtable = createAverageCalculated366DaysTable();
        data.forEach(year => {
            let minmaxindex = 0;
            year.values.forEach(day => {
                const date = day.date.getDate();
                const month = day.date.getMonth()+1;
                while (minmaxindex < dailyminmaxtable.length && (dailyminmaxtable[minmaxindex].monthno != month || dailyminmaxtable[minmaxindex].day != date)) minmaxindex++;
                if (minmaxindex < dailyminmaxtable.length) {
                    updateMinMaxTable(dailyminmaxtable[minmaxindex].morning, day.morning, day.date);
                    updateMinMaxTable(dailyminmaxtable[minmaxindex].evening, day.evening, day.date);
                    updateMinMaxTable(dailyminmaxtable[minmaxindex].difference, (day.evening-day.morning), day.date);
                    updateMinMaxTable(dailyminmaxtable[minmaxindex].total, (day.evening+day.morning)/2, day.date);
                    updateMinMaxTable(dailyminmaxtable[minmaxindex].morningfiltered, day.morningfiltered, day.date);
                    updateMinMaxTable(dailyminmaxtable[minmaxindex].eveningfiltered, day.eveningfiltered, day.date);
                    updateMinMaxTable(dailyminmaxtable[minmaxindex].totalfiltered, (day.eveningfiltered+day.morningfiltered)/2, day.date);
                    updateMinMaxTable(dailyminmaxtable[minmaxindex].differencefiltered, (day.eveningfiltered-day.morningfiltered), day.date);
                }
            })
        })
        return dailyminmaxtable;
    }

} // class Temperature
// --------------------------------------------------------------------------------------------


// --------------------------------------------------------------------------------------------
let temperatureClass: Temperatures;
//-------------------------------------------------------------------------------------------
// Data interfaces
//-------------------------------------------------------------------------------------------

interface ReturnDataType {
    name: string;
    values: ReturnDataValue[];
}
interface ReturnDataValue {
    date: Date;
    value: number;
    year: number;
    tooltipfunction: any;
    tooltipformat: any;
    estimate: boolean;
}

function createReturnDataValue(date: Date, value: number, year: number, estimate: boolean, tooltipfunction: any = null, tooltipformat: any = null): ReturnDataValue {
    return {date: date, value: value, year: year, estimate: estimate, tooltipfunction: tooltipfunction, tooltipformat: tooltipformat}
}
function createReturnDataType(name: string, values: ReturnDataValue[]): ReturnDataType {
    return {name: name, values: values}
}

interface NameValues {
    name: string;
    date: Date;
    values: Filtered[];
}
function createNameValues(name: string,date: Date, values: Filtered[]): NameValues {
    return {name: name, date: date, values: values}
}
// _______________________________________________________________________
interface YearlyAveragesEstimates {
    yearlyvalues: YearlyAverage[],
    monthlyaverages: TempDiffTable,
}
function createYearlyAveragesEstimates(yearlyvalues: YearlyAverage[], monthlyaverages: TempDiffTable): YearlyAveragesEstimates {
    return {yearlyvalues: yearlyvalues, monthlyaverages: monthlyaverages}
}
interface MonthlyAverage {
    temperature: number;
    difference: number;
    estimate: boolean;
}
function createMonthlyAverage(temperature: number, difference: number, estimate: boolean): MonthlyAverage {
    return {temperature: temperature, difference: difference, estimate: estimate}
}
interface YearlyAverage {
    year: number; 
    yearaverage: number;
    yearaveragediff: number;
    months: MonthlyAverage[];
    estimate: boolean;
}
function createYearlyAverage(year: number, yearaverage: number, yearaveragediff: number, months: MonthlyAverage[], estimate: boolean = false): YearlyAverage {
    return {year: year, yearaverage: yearaverage, yearaveragediff: yearaveragediff, months: months, estimate: estimate}
}
interface TempDiffTable {
    temperature: number[];
    diff: number[];
}
function createTempDiffTable(temp: number[], diff: number[]): TempDiffTable {
    return {temperature: temp, diff: diff}
}
interface MonthDataPair {
    month: number;
    data: ValueDataValue[];
    estimate: boolean;
}
function createMonthDataPair(month: number, data: ValueDataValue[], estimate: boolean = false): MonthDataPair {
    return {month: month, data: data, estimate: estimate}
}
interface ValueDataValue {
    value: number;
    year: number;
    month: number;
    estimate: boolean;
}
function createValueDataValue(value: number, year:  number, month: number, estimate: boolean = false): ValueDataValue {
    return {value: value, year: year, month: month, estimate: estimate}
}
//-------------------------------------------------------------------------------------------
// Local functions
//-------------------------------------------------------------------------------------------

function getReadingsBetween(startdate: Date, enddate: Date, readings: Filtered[]): Filtered[] {
    let retvalues = readings.map(val => val.date >= startdate && val.date <= enddate ? val : null).filter(v => v !== null);
    return retvalues;
}
function createTooltip(value: ReturnDataValue): string {
    if (value.tooltipfunction === null) return '';
    return  value.tooltipfunction(value);
}
//-------------------------------------------------------------------------------------------
// Exported functions
//-------------------------------------------------------------------------------------------
export function CFinitTemperature(temperaturevalues: TemperatureMsg, filtersize: number, monthnames: string[], monthnameslong: string[]) {
    temperatureClass = new Temperatures(filtersize, monthnames, monthnameslong);
    temperatureClass.calculateTemperatures(temperaturevalues);
}
export function CFgetAllReadings() {
    const values = temperatureClass.getValidFilteredValues();
    const values2: Filtered[] = values.map(v => {return createFiltered(v.date, v.morning, v.evening, v.average, v.difference,
        v.morningfiltered, v.eveningfiltered, v.averagefiltered, v.differencefiltered, v.firstdayfilter, v.lastdayfilter)}).reverse();
    const dayshighlowvalues = temperatureClass.dailyValues.map(day => ({average: day.total.sum, max: day.total.max, min: day.total.min, date: day.date}));

    let minmaxindex = dayshighlowvalues.length - 1;
    for (let i = 0; i < values2.length; i++) {
        values2[i].index = i;
        if (dayshighlowvalues.length) {
            while (dayshighlowvalues[minmaxindex].date.getMonth() != values2[i].date.getMonth() ||
                dayshighlowvalues[minmaxindex].date.getDate() != values2[i].date.getDate()) {
                minmaxindex--;
                if (minmaxindex < 0) minmaxindex = dayshighlowvalues.length - 1;
            }

            if (values2[i].morning == dayshighlowvalues[minmaxindex].max.value) values2[i].morninghighest = true;
            if (values2[i].evening == dayshighlowvalues[minmaxindex].max.value) values2[i].eveninghighest = true;
            if (values2[i].morning == dayshighlowvalues[minmaxindex].min.value) values2[i].morninglowest = true;
            if (values2[i].evening == dayshighlowvalues[minmaxindex].min.value) values2[i].eveninglowest = true;
        }
    }
    return {values: values2, filtersize: temperatureClass.filterlength}
}
export function CFcreateAllYearsFilteredSeriedata(): GraphSerieType {
    const yearlyarrangeddata = temperatureClass.getAllFilteredDataYearlyArranged();

    let returnvalues: GraphSerie[] = yearlyarrangeddata.map(yeardata => {
        const item = yeardata.values.map(value => ({
            value: createGraphItem(value.date, value.average, false), 
            tooltip: `${getDateTxt(value.date)} ${roundNumber(value.average, 1)}°C`,
            estimate: false,   
        }))
        return createGraphSerie(yeardata.name, '',0, item, false, 0)
    })

    return createGraphSerieType(returnvalues, { series: [{ name: '', markersize: 1 }] });
}
export function CFcreateYearlyFilteredSeriedata(): GraphSerieType {
    function serietooltipcallback(value: ReturnDataValue): string {
        return `${getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()))} ${roundNumber(value.value, 1)}°C`;
    }   
    const yearlyarrangeddata = temperatureClass.getAllFilteredDataYearlyArranged();
    let lastyear = yearlyarrangeddata.length > 0 ? yearlyarrangeddata[yearlyarrangeddata.length-1].date.getFullYear(): 0;
 
     let yearlydata: ReturnDataType[] = [];
    // add high and low curves to graphics
    const dailyminmaxtable = temperatureClass.getDailyMinMaxValues(yearlyarrangeddata);

    yearlydata.push(createSerie_7('Korkein', dailyminmaxtable, 
        (minmax) => (new Date(temperatureClass.defaultyear, minmax.monthno-1, minmax.totalfiltered.max.value > getTempMaxDefaultValue() ? minmax.total.max.date.getDate():  minmax.date.getDate())),
        (minmax) => (minmax.totalfiltered.max.value > getTempMaxDefaultValue() ? minmax.totalfiltered.max.value : NaN), 
        (minmax) => (minmax.totalfiltered.max.value > getTempMaxDefaultValue() ? minmax.totalfiltered.max.date.getFullYear(): NaN),
        serietooltipcallback));
    yearlydata.push(createSerie_7('Matalin', dailyminmaxtable, 
        (minmax) => (new Date(temperatureClass.defaultyear, minmax.monthno-1, minmax.totalfiltered.min.value < getTempMinDefaultValue() ? minmax.total.min.date.getDate():minmax.date.getDate())),
        (minmax) => (minmax.totalfiltered.min.value < getTempMinDefaultValue() ? minmax.totalfiltered.min.value : NaN), 
        (minmax) => (minmax.totalfiltered.min.value < getTempMinDefaultValue() ? minmax.totalfiltered.min.date.getFullYear() : NaN),
        serietooltipcallback));
    
    // add yearly graphs
    let seriedata = yearlyarrangeddata.map(yearlydata => {
        return createReturnDataType(`Vuosi ${yearlydata.date.getFullYear()}`,
            yearlydata.values.map(value => {
                return createReturnDataValue(new Date(temperatureClass.defaultyear, value.date.getMonth(), value.date.getDate()), value.averagefiltered, value.date.getFullYear(), 
                false, // estimate
                serietooltipcallback);
            }))
    })
    seriedata.forEach(s => yearlydata.push(s))

    const returnvalues: GraphSerie[] = yearlydata.map(dd => {
        return createGraphSerie(dd.name, '',0, dd.values.map(value => ({
                value: createGraphItem(value.date, value.value, false), 
                tooltip: createTooltip(value)
        })), false, 0)
    })
    return createGraphSerieType(returnvalues, { showlegend: true, 
        selection: [`Vuosi ${lastyear}`, 'Korkein', 'Matalin'], series: [{ name: 'Matalin', color: '#777777' }, { 'name': 'Korkein', color: '#777777' }] });
}
export function CFcreateLastYearsSeriedata(): GraphSerieType {
    function serietooltipcallback(value: ReturnDataValue): string {
        return `${getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()))} ${roundNumber(value.value, 1)}°C`;
    } 
    const allvalues = temperatureClass.getAllFilteredDataYearlyArranged();
    const dailyminmaxtable: AverageCalculated[] = temperatureClass.getDailyMinMaxValues(allvalues);

    const lastdate = allvalues[allvalues.length - 1].values[allvalues[allvalues.length - 1].values.length-1].date;
    const firstdate = new Date(lastdate.getFullYear() - 1, lastdate.getMonth(), lastdate.getDate());

    const readings: Filtered[] = temperatureClass.getValidFilteredValues();
    const lastyearreadings = getReadingsBetween(firstdate, lastdate, readings);

    // fill in missing days
    let curdate = firstdate;
    let index = 0;
    const fillledlastyearreadings: Filtered[] = [];
    while (curdate <= lastdate) {
        if (curdate.getDate() == lastyearreadings[index].date.getDate() &&
        curdate.getMonth() == lastyearreadings[index].date.getMonth()) {
            fillledlastyearreadings.push(createFiltered(curdate, lastyearreadings[index].morning,
                lastyearreadings[index].evening, lastyearreadings[index].average, lastyearreadings[index].difference,
                lastyearreadings[index].morningfiltered, lastyearreadings[index].eveningfiltered, 
                lastyearreadings[index].averagefiltered, lastyearreadings[index].differencefiltered, 
                lastyearreadings[index].firstdayfilter, lastyearreadings[index].lastdayfilter));           
            index++;
        }
        else {
            fillledlastyearreadings.push(createFiltered(curdate, NaN,
                NaN, NaN, NaN, NaN, NaN, NaN, NaN, new Date(0),new Date(0)));
        }

        curdate = new Date( curdate.getFullYear(), curdate.getMonth(), curdate.getDate()+1);
    }

    const morningserie = createSerie_4('Aamu', fillledlastyearreadings, (reading) => (reading.morning), null, serietooltipcallback);
    const eveningserie = createSerie_4('Ilta', fillledlastyearreadings, (reading) => (reading.evening), null, serietooltipcallback);

    // get minmax filler data for previous year values
    const startyear = firstdate.getFullYear();
    let maxdataarray: ReturnDataValue[] = [];
    let mindataarray: ReturnDataValue[] = [];
    let dateindex = dailyminmaxtable.findIndex(item => item.day == firstdate.getDate() && item.monthno-1 == firstdate.getMonth());
    if (dateindex >= 0) {
        while (dateindex < dailyminmaxtable.length) {
            const minmax = dailyminmaxtable[dateindex];
            let highvalue = NaN;
            let lowvalue = NaN;
            let highdate = NaN;
            let lowdate = NaN;
            if (minmax.evening.max.value > getTempMaxDefaultValue()) {
                highvalue = minmax.evening.max.value>minmax.morning.max.value?minmax.evening.max.value:minmax.morning.max.value;
                highdate = minmax.evening.max.value>minmax.morning.max.date.getFullYear()?minmax.evening.max.value:minmax.morning.max.date.getFullYear();
                lowvalue = minmax.evening.min.value<minmax.morning.min.value?minmax.evening.min.value:minmax.morning.min.value;
                lowdate = minmax.evening.min.value<minmax.morning.min.value?minmax.evening.min.date.getFullYear():minmax.morning.min.date.getFullYear();
            }

            const newitemmax = createReturnDataValue(new Date(startyear, minmax.monthno-1, minmax.day), 
                highvalue, highdate, false, /* estimate */ serietooltipcallback);
            maxdataarray.push(newitemmax);
            const newitemmin = createReturnDataValue(new Date(startyear, minmax.monthno-1, minmax.day), 
                lowvalue, lowdate, false, /* estimate */ serietooltipcallback);
            mindataarray.push(newitemmin);

            dateindex++;
        }
    }

    maxdataarray = maxdataarray.concat(createSerie_3(dailyminmaxtable, startyear,
        (value) => (value.evening.max.value>value.morning.max.value?value.evening.max.value:value.morning.max.value),
        (value) => (value.evening.max.value>value.morning.max.date.getFullYear()?value.evening.max.value:value.morning.max.date.getFullYear()),
        serietooltipcallback));
    const maxserie = createReturnDataType('Korkein', maxdataarray);

    mindataarray = mindataarray.concat(createSerie_3(dailyminmaxtable, startyear,
        (value) => (value.evening.min.value < value.morning.min.value ? value.evening.min.value : value.morning.min.value),
        (value) => (value.evening.min.value < value.morning.min.value ? value.evening.min.date.getFullYear() : value.morning.min.date.getFullYear()),
        serietooltipcallback))
    const minserie = createReturnDataType('Matalin', mindataarray);

    const allseries = [morningserie, eveningserie, maxserie, minserie];
    const returnvalues: GraphSerie[] = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
                value: createGraphItem(value.date, value.value, false), 
                tooltip: createTooltip(value),
        })), false, 0)
    })
    return createGraphSerieType(returnvalues, { showlegend: true, 
        selection: [`Aamu`, 'Ilta', 'Korkein', 'Matalin'], 
        series: [{ name: 'Matalin', color: '#777777' }, { 'name': 'Korkein', color: '#777777' }],
        legend: {items: temperatureClass.monthnames} 
    });
}
export function CFcreateDailyDiffdata(): GraphSerieType {
    function serietooltipcallback(value: ReturnDataValue): string {
        let daytxt = isNaN(value.year) ? 
            `${value.date.getDate()}.${value.date.getMonth()+1}` : 
            getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()));
        return `${daytxt} ${roundNumber(value.value, 1)}°C`;
    } 
    const yearlyarrangeddata = temperatureClass.getAllFilteredDataYearlyArranged();
    const dailyminmaxtable = temperatureClass.getDailyMinMaxValues(yearlyarrangeddata);

    const averageserie = createSerie_4('Keskiarvo', dailyminmaxtable, (value) => (value.differencefiltered.average), (value) => (NaN), serietooltipcallback);
    const maxserie = createSerie_4('Maksimi', dailyminmaxtable, (value) => (value.differencefiltered.max.value > getTempMaxDefaultValue() ? value.differencefiltered.max.value : NaN), 
        (value) => (value.differencefiltered.max.value > getTempMaxDefaultValue() ? value.differencefiltered.max.date.getFullYear() : NaN), serietooltipcallback);
    const minserie = createSerie_4('Minimi',dailyminmaxtable, (value) => (value.differencefiltered.min.value < getTempMinDefaultValue() ? value.differencefiltered.min.value : NaN), 
        (value) => (value.differencefiltered.min.value < getTempMinDefaultValue() ? value.differencefiltered.min.date.getFullYear(): NaN),serietooltipcallback);

    let lastyear = '';
    const yearseries = yearlyarrangeddata.map(year => {
        lastyear = year.name;
        return createReturnDataType(year.name, year.values.map(reading => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear,reading.date.getMonth(), reading.date.getDate()), 
                reading.differencefiltered, reading.date.getFullYear(), 
                false, // estimate
                serietooltipcallback);
        }));
    })
    
    let allseries = [averageserie, maxserie, minserie];
    allseries = allseries.concat(yearseries);
    
    const returnvalues: GraphSerie[] = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
                value: createGraphItem(value.date, value.value, false), 
                tooltip: createTooltip(value),
        })), false, 0)
    })
    const selection = [lastyear, 'Keskiarvo', 'Maksimi', 'Minimi']
    const seriedata = {
        data: returnvalues,
        params: { showlegend: true, series: [{ name: 'Minimi', color: '#777777' }, { name: 'Maksimi', color: '#777777' }], selection: selection }
    };
    return seriedata;
}
interface YearlyMinMax {
    year: number;
    high: number;
    low: number;
}
function createYearlyMinMax(year: number, min: number, max: number): YearlyMinMax {
    return {year: year, low: min, high: max}
}
export function CFcreateYearlyHighValuedata(): GraphSerieType {
    function serietooltipcallback(value: ReturnDataValue): string {
        let daytxt = isNaN(value.year) ? `???` : `${value.tooltipformat.seriename} vuosi ${value.year}`;
        return `${daytxt} ${roundNumber(value.value, 0)} kpl`;
    } 
    function trendserietooltipcallback(value: ReturnDataValue): string {
        let daytxt = isNaN(value.year) ? `???` : `${value.tooltipformat.seriename} vuosi ${value.year.toString()}`;
        return `${daytxt} ${roundNumber(value.value, 0)} kpl`;
    } 

    const yearlyarrangeddata = temperatureClass.getAllFilteredDataYearlyArranged();
    const dailyminmaxtable = temperatureClass.getDailyMinMaxValues(yearlyarrangeddata);

    // calculate min and max value counts for each year
    let yearlyminmaxvalues: YearlyMinMax[] = yearlyarrangeddata.map(y => (createYearlyMinMax( y.date.getFullYear(), 0, 0)));
    dailyminmaxtable.forEach(day => { 
        if (day.morning.max.date && yearlyminmaxvalues[day.morning.max.date.getFullYear()]){
            yearlyminmaxvalues[day.morning.max.date.getFullYear()].high++;
            yearlyminmaxvalues[day.evening.max.date.getFullYear()].high++;
            yearlyminmaxvalues[day.morning.min.date.getFullYear()].low++;
            yearlyminmaxvalues[day.evening.min.date.getFullYear()].low++;
        }
    });

    // calculate estimate for current year
    let lastyearestimate: boolean = false;
    const years = temperatureClass.yearlyMonthlyAverages.yearlydata;
    if (years[years.length-1].estimate) {
        lastyearestimate = true;
        let lastday = yearlyarrangeddata[yearlyarrangeddata.length-1].values[yearlyarrangeddata[yearlyarrangeddata.length-1].values.length-1].date;
        const curhigh = yearlyminmaxvalues[yearlyminmaxvalues.length-1].high;
        const curlow = yearlyminmaxvalues[yearlyminmaxvalues.length-1].low;
        let firstday = new Date(lastday.getFullYear(), 0, 1);
        let dayno = lastday.valueOf() - firstday.valueOf();
        const oneday = 24 * 60 * 60 * 1000;
        let days = Number(roundNumber(dayno/oneday, 1));
        if (days == 0) days = 365;
        yearlyminmaxvalues[yearlyminmaxvalues.length-1].high = 365 * curhigh/days;
        yearlyminmaxvalues[yearlyminmaxvalues.length-1].low = 365 * curlow/days;
    }
    //---------------
    const highserie = createSerie_8('Ylin', yearlyminmaxvalues, (value) => (value.high), lastyearestimate, serietooltipcallback);
    const lowserie = createSerie_8('Alin', yearlyminmaxvalues, (value) => (value.low), lastyearestimate, serietooltipcallback);

    let hightrendserie = createSerie_9('Ylimpien suuntaus', yearlyminmaxvalues, (v) => (v.high), trendserietooltipcallback)
    let lowtrendserie = createSerie_9('Alimpien suuntaus', yearlyminmaxvalues, (v) => (v.low), trendserietooltipcallback)
    //---------------
    const allseries = [lowserie, highserie, hightrendserie, lowtrendserie];
    const returnvalues: GraphSerie[] = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value, false), 
            tooltip: createTooltip(value),
        })), false, 0)
    })
    let estimateitems = addEstimatesToParameters(allseries);
    const params = {showlegend: true, series: estimateitems};

    return createGraphSerieType(returnvalues, params)
}
function addEstimatesToParameters(series: ReturnDataType[]) {
    let estimateitems = [];
    let currentyear = new Date().getFullYear();
    let currentmonth = new Date().getMonth();
    series.forEach(serie => {
        if (serie.values && serie.values.length) {
            serie.values.forEach((value, index) => {
                if (value.estimate) {
                    if (value.year < currentyear || (value.year == currentyear && value.date.getMonth() <= currentmonth)) {
                        estimateitems.push({
                            name: serie.name,
                            symbol: 'circle',
                            symbolsize: 14, 
                            symbolindex: index,
                        })
                    }
                    else {
                        value.value = NaN;
                    }
                }
            })
        }
    });
    return estimateitems;
}

export function CFcalculateMonthlyAverages(): YearlyAveragesEstimates {
    const months = temperatureClass.yearlyMonthlyAverages.monthlydata;
    const years = temperatureClass.yearlyMonthlyAverages.yearlydata;
    let tempaverages = months.map(month => month.total.value);
    let diffaverages = months.map(month => month.difference.value);

    let yearlyMonthaverages: YearlyAverage[] = years.map(year => {
        return createYearlyAverage(year.year, year.yearlyaverage, year.yearlyaveragediff, year.months.map(month => {
            return createMonthlyAverage(month.monthlytemperature, month.monthlydifference, month.estimate);
        }), year.estimate)
    })
    const sumtemp = tempaverages.reduce((a, b) => a += isNaN(b)?0:b, 0);
    const sumdiff = diffaverages.reduce((a, b) => a += isNaN(b)?0:b, 0);
    tempaverages.push(sumtemp/tempaverages.length)
    diffaverages.push(sumdiff/diffaverages.length)
    return createYearlyAveragesEstimates(yearlyMonthaverages, createTempDiffTable(tempaverages, diffaverages));
}
export function CFcreateYearlyTrendSeriedata(): GraphSerieType {
    function serietooltipcallback(value: ReturnDataValue): string {
        return `${value.year} ${roundNumber(value.value, 1)}°C`;
    } 
    const yeartemperatureserie = createSerie_5('Lämpötila', (value) => (value.yearlyaverage), serietooltipcallback);
    const yeardiffserie = createSerie_5('Illan ja aamun ero', (value) => (value.yearlyaveragediff), serietooltipcallback);

    // --------------------------
    // calculate temperature trend
    let trendserie = createSerie_1('Suuntaus', yeartemperatureserie, serietooltipcallback);
    // calculate difference trend
    let difftrendserie = createSerie_1('Erosuuntaus', yeardiffserie, serietooltipcallback);

    const allseries = [yeartemperatureserie, yeardiffserie];
    allseries.push(trendserie);
    allseries.push(difftrendserie);
    
    const returnvalues: GraphSerie[] = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value, false), 
            tooltip: createTooltip(value),
        })), false, 0)
    })
    let estimateseries = addEstimatesToParameters(allseries);
    let params = { rangeoffset: 1, showlegend: true, series: estimateseries };
    return createGraphSerieType(returnvalues, params)

}
export function createTrendForGivenMonths(monthnumbers: number[], monthnames: string[]): any {
    let datavalues: GraphSerie[] = [];
    const years = temperatureClass.yearlyMonthlyAverages.yearlydata;
    const curyear = new Date().getFullYear();
    const curmonth = new Date().getMonth();
    let toofewvalues = [];
    let ogiginaldestimates = [];
    const monthlydata = monthnumbers.map((monthnumber) => {
        let estimates = false;
        const data =  years.map(y => {
            let i = 0;
            if (y.year < curyear || (y.year == curyear && monthnumber-1 <= curmonth)) {
                let value = y.months[monthnumber-1].monthlytemperature;
                    if (y.months[monthnumber-1].estimate) {
                    estimates = true;
                    if (y.year != curyear) {
                        value = y.months[monthnumber-1].averages.averagevalue;
                        if (!isNaN(value)) {
                            // scpecial characted
                            toofewvalues.push({year: y.year, monthindex: monthnumber-1});
                        }
                        else {
                            y.months[monthnumber-1].estimate = false;
                            ogiginaldestimates.push({year: y.year, monthno: monthnumber, estimate: true});
                        }
                    }
                }
                return createValueDataValue(value, y.year, monthnumber-1, y.months[monthnumber-1].estimate);
            }
            else {
                return createValueDataValue(NaN, y.year, monthnumber-1);
            }
            
        });
        return createMonthDataPair(monthnumber-1, data, estimates);
    });

    // create series
    monthlydata.forEach(month => {
        let found = monthnumbers.indexOf(month.month+1);
        if (found >= 0) {
            let values = month.data.map(value => ({
                value: createGraphItem(new Date(value.year, 0, 1), value.value, value.estimate), 
                tooltip: `${value.year} ${monthnames[found]} ${roundNumber(value.value, 1)}`,
            }));
            datavalues.push( createGraphSerie( monthnames[datavalues.length], 'location', 0, values, false, monthnumbers[found]));
        }
    });
    // calculate and create trend line
    let calctable: TrendCalcTable[] = monthlydata.map(month => (
        createTrendCalcTable(month.data.map(data => ( createTrendCalcData(data.year, data.value))))));
    // ----------------
    // find estimates
    const tempseries = datavalues.map(dvalue => {
        return createReturnDataType( dvalue.name, dvalue.values.map(day => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, day.value[0].getMonth(), day.value[0].getDate()),
                day.value[1], day.value[0].getFullYear(), 
                day.value[2], // estimate
            ) 
        }))
    })
    let estimateparameters = addEstimatesToParameters(tempseries);
    toofewvalues.forEach(par => {
        estimateparameters.push({name: temperatureClass.monthnames[par.monthindex], symbol: 'triangle', symbolindex: par.monthindex, symbolsize: 24});
    })
    ogiginaldestimates.forEach(est => {
        let searchyear = years.find(y => y.year == est.year);
        if (searchyear) {
            searchyear.months[est.monthno].estimate = est.estimate;
        }
    })
    // ----------------
    let trend = CFcalculateTrend(calctable);
    let newvalues = years.map((ser) => ({ 
        value: createGraphItem(new Date(ser.year, 0, 1), isNaN(trend.k) ? NaN : ser.year * trend.k + trend.b, false), 
        tooltip: `${ser.year} Suuntaus ${isNaN(trend.k) ? '???' : roundNumber(ser.year * trend.k + trend.b, 1)}`
    }))
    if (isNaN(trend.k)) datavalues.push( createGraphSerie( `Trendi --- °C/10v`, 'location', 0, newvalues, true, -1));
    else datavalues.push( createGraphSerie( `Trendi ${trend.k > 0 ? '+' : ''}${roundNumber(trend.k * 10, 1)}°C/10v`, 'location', 0, newvalues, true, -1));

    return {values: datavalues, series: estimateparameters};
}
export function CFcreateMonthlySummerTrendSeriedata(): GraphSerieType {
    const returnvalues = createTrendForGivenMonths([6, 7, 8], ['Kesäkuu', 'Heinäkuu', 'Elokuu'])
    let data = createGraphSerieType(returnvalues.values, { rangeoffset: 1, showlegend: true, series: returnvalues.series })    
    return data;
}
export function CFcreateMonthlyWinterTrendSeriedata(): GraphSerieType {
    const returnvalues = createTrendForGivenMonths([1, 2, 12], ['Tammikuu', 'Helmikuu', 'Joulukuu'])
    return createGraphSerieType(returnvalues.values, { rangeoffset: 1, showlegend: true, series: returnvalues.series  })    
}
export function CFcreateMonthlyFallTrendSeriedata(): GraphSerieType {
    const returnvalues = createTrendForGivenMonths([9, 10, 11], ['Syyskuu', 'Lokakuu', 'Marraskuu'])
    return createGraphSerieType(returnvalues.values, { rangeoffset: 1, showlegend: true, series: returnvalues.series  })    
}
function getRecordReadingsSerie(seriename, days, getValue, serietooltipcallback) {
    return createReturnDataType(seriename, days.map(day => {
            return createReturnDataValue(day.date, getValue(day), day.min.date.getFullYear(), false /* estimate */, serietooltipcallback) 
        }));        
}
export function CFcreateMonthlySpringTrendSeriedata(): GraphSerieType {
    const returnvalues = createTrendForGivenMonths([3, 4, 5], ['Maaliskuu', 'Huhtikuu', 'Toukokuu'])
    return createGraphSerieType(returnvalues.values, { rangeoffset: 1, showlegend: true, series: returnvalues.series  })    
}

export function CFcreateAllYearsAverageSeriedata(): GraphSerieType {
    function serietooltipcallback(value: ReturnDataValue): string {
        let daytxt = isNaN(value.year) ? 
            `${value.date.getDate()}.${value.date.getMonth()+1}` : 
            getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()));
        return `${daytxt} ${roundNumber(value.value, 1)}°C`;
    } 

    const days = temperatureClass.dailyValues.map(day => ({average: day.total.sum, max: day.total.max, min: day.total.min, date: day.date}));
    const yearlyarrangeddata = temperatureClass.getAllFilteredDataYearlyArranged();
    const curyearno = yearlyarrangeddata[yearlyarrangeddata.length-1].date.getFullYear();

    const minserie = getRecordReadingsSerie(`Matalin`, days, 
        (day) => (day.min.value < getTempMinDefaultValue() ? day.min.value : NaN), serietooltipcallback);
    const maxserie = getRecordReadingsSerie(`Korkein`, days, 
        (day) => (day.max.value > getTempMaxDefaultValue() ? day.max.value : NaN), serietooltipcallback);

    const curyear = createReturnDataType(`Vuosi ${curyearno}`,yearlyarrangeddata[yearlyarrangeddata.length-1].values.map(day => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, day.date.getMonth(), day.date.getDate()),
            day.average, day.date.getFullYear(), 
            false, // estimate
            serietooltipcallback) 
    }));   

    const allseries = [minserie, maxserie, curyear];

    const returnvalues: GraphSerie[] = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value, false), 
            tooltip: createTooltip(value),
        })), false, 0)
    })
    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true })    
}
export function CFcreateAllYearsMonthlyAverageSeriedata(): GraphSerieType {
    function serietooltipcallback(value: ReturnDataValue): string {
        let daytxt = isNaN(value.year) ? `${value.date.getDate()}.${value.date.getMonth()+1}` : `${value.date.getMonth()+1}/${value.year}`;
        return `${daytxt} ${roundNumber(value.value, 1)}°C`;
    } 
    let maxserie = createSerie_2(`Korkein`, (value) => (value.low < getTempMinDefaultValue() ? value.low : NaN), serietooltipcallback);
    let minserie = createSerie_2(`Matalin`, (value) => (value.high > getTempMaxDefaultValue() ? value.high : NaN), serietooltipcallback);

    const yearsstatistics = temperatureClass.yearlyMonthlyAverages.yearlydata;

    let lastyear = 0;   
    const allyears = yearsstatistics.map(year => {
        lastyear = year.year;
        let estimatedmonthindexes = [];
        const allmonths = createReturnDataType(`Vuosi ${year.year}`,year.months.map(month => {
            if (year.estimate && month.estimate) estimatedmonthindexes.push(month.monthno-1);

            return createReturnDataValue(new Date(temperatureClass.defaultyear, month.monthno-1, 1),
                month.monthlytemperature, yearsstatistics[yearsstatistics.length-1].year, 
                month.estimate, // estimate
                serietooltipcallback) 
        }));      
      
        return allmonths;
    });       
    const allseries: ReturnDataType[] = [minserie, maxserie];
    for (let i = 0; i < allyears.length; i++) allseries.push(allyears[i]);

    let estimateparams = addEstimatesToParameters(allyears);
    const returnvalues: GraphSerie[] = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value, false), 
            tooltip: createTooltip(value),
        })), false, 0)
    })

    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true, series: estimateparams, selection: [`Vuosi ${lastyear}`, 'Korkein', 'Matalin'] })    
}    
interface TrendCalcTable {
    data: TrendCalcData[]
}
function createTrendCalcTable(data: TrendCalcData[]): TrendCalcTable {
    return {data: data};
}
interface TrendCalcData {
    year: number;
    value: number;
}
function createTrendCalcData( year: number, value: number): TrendCalcData {
    return {year: year, value: value}
}
export function CFcalculateTrend(valuearray: TrendCalcTable[]): {k: number, b: number} {
    let k = NaN;
    let b = NaN;
    let sumxy = 0;
    let sumx = 0;
    let sumy = 0;
    let sumxsqr = 0;
    let n = 0;
    valuearray.forEach(values => {
        if (values) {
            values.data.forEach(reading => {
                if (!isNaN(reading.value)) {
                    n++;
                    sumx += reading.year;
                    sumy += reading.value;
                    sumxy += reading.value * reading.year;
                    sumxsqr += reading.year * reading.year;
                }
            })
        }
    })
    if (n * sumxsqr - sumx * sumx != 0) {
        k = (n * sumxy - sumx * sumy) / (n * sumxsqr - sumx * sumx);
        b = (sumy - k * sumx) / n;
    }

    return { k, b }
}



// createSerie -functions -=------------------------------------


    function createSerie_2(seriename: string, dataFunc: any, cbFunc: any): ReturnDataType {
        return createReturnDataType(seriename, temperatureClass.yearlyMonthlyAverages.monthlydata.map(month => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, month.date.getMonth(), month.date.getDate()),
                dataFunc(month.total), month.total.highdate.getFullYear(), false, /* estimate */ cbFunc)
        })); 
    }    
    function createSerie_4(seriename, dailyminmaxtable, dataFunc: any, yearFunc: any, cbFunc: any): ReturnDataType {
        return createReturnDataType(seriename, dailyminmaxtable.map(reading => {
            return createReturnDataValue(reading.date, dataFunc(reading), yearFunc ? yearFunc(reading) : reading.date.getFullYear(), false, /* estimate */ cbFunc);
        }));
    }
    function createSerie_7(seriename, dailyminmaxtable, dateFunc, dataFunc, yearFunc, cbFunc): ReturnDataType {
        return createReturnDataType(seriename, dailyminmaxtable.map(minmax => {
            return createReturnDataValue(dateFunc(minmax), dataFunc(minmax), yearFunc(minmax), false, /* estimate */ cbFunc)
        }))
    }
    function createSerie_8(seriename, yearlyminmaxvalues, dataFunc, lastyearestimate, cbFunc): ReturnDataType {
        return createReturnDataType(seriename, yearlyminmaxvalues.map((value, index) => {
            return createReturnDataValue(new Date(value.year, 0, 1), dataFunc(value), value.year, 
                (index == yearlyminmaxvalues.length-1 && lastyearestimate) ? true : false, /* estimate */ cbFunc, {seriename: seriename});
        }));   
    }

    function createSerie_1(seriename, tempserie, cbFunc): ReturnDataType {
        let trenddata = createTrendCalcTable(tempserie.values.map(v => (createTrendCalcData(v.year, v.value))));
        const trend = CFcalculateTrend([trenddata]);
        let values = [];
        if (!(isNaN(trend.k) || isNaN(trend.b))) {
            values = tempserie.values.map(val => ({
                year: val.year,
                estimate: val.estimate,
                value: val.year * trend.k + trend.b,
            }))
        }
        return createReturnDataType(`${seriename} ${trend.k > 0 ? '+' : '-'}${roundNumber(trend.k * 10, 1)} °C/10v`, values.map(value => {
            return createReturnDataValue(new Date(value.year, 0, 1),
                value.value, value.year, false, /* estimate */ cbFunc);
        }));
    }
    function createSerie_3(dailyminmaxtable, startyear, dataFunc, yearFunc, cbFunc): ReturnDataValue[] {
        return dailyminmaxtable.map(minmax => {
            let highvalue = NaN;
            let highdate = NaN;
            if (minmax.evening.max.value > getTempMaxDefaultValue()) {
                highvalue = dataFunc(minmax);
                highdate = yearFunc(minmax);
            }
            return createReturnDataValue(new Date(startyear + 1, minmax.monthno - 1, minmax.day),
                highvalue, highdate, false, /* estimate */ cbFunc);
        });
    }
    function createSerie_5(seriename, dataFunc, cbFunc): ReturnDataType {
        const years = temperatureClass.yearlyMonthlyAverages.yearlydata;
        const lastindex = years.length - 1;
        return createReturnDataType(seriename, years.map((value, index) => {
            return createReturnDataValue(new Date(value.year, 0, 1),
                value.estimate && index != lastindex ? NaN : dataFunc(value), value.year, value.estimate, /* estimate */ cbFunc);
        }));
    }
    function createSerie_9(seriename: string, yearlyminmaxvalues: YearlyMinMax[], dataFunc: any, cbFunc: any): ReturnDataType {
        let trendserie: ReturnDataType = createReturnDataType(seriename, []);
        let trenddata = createTrendCalcTable(yearlyminmaxvalues.map(v => (createTrendCalcData(v.year, dataFunc(v)))));
        const trend = CFcalculateTrend([trenddata]);
        if (!isNaN(trend.k) && !isNaN(trend.b)) {
            trendserie = createReturnDataType(trendserie.name, yearlyminmaxvalues.map(value => {
                return createReturnDataValue(new Date(value.year, 0, 1), 
                    trend.k * value.year + trend.b, value.year, false, // estimate
                    cbFunc, {seriename: trendserie.name});
            }));  
        }
        return trendserie;
    }


// -------------------------------------------