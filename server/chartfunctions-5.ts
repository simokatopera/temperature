// 2-counterfunctionupdate
// 3-extrafieldsremoved
// 4-some counters combined
// 5-

interface OneDayValues {
    count: number;
    sum: number;
    average: number;

    min: ReadingDate;
    max: ReadingDate;
}
interface AverageCalculated {
    date: Date;
    day: number;
    monthno: number;
    year: number;

    averagevalue: number;

    morning: OneDayValues; // Count, Average, Min, Max
    evening: OneDayValues;
    difference: OneDayValues;
    total: OneDayValues;

    morningfiltered: OneDayValues;
    eveningfiltered: OneDayValues;
    totalfiltered: OneDayValues;
    differencefiltered: OneDayValues;

}

function updateMinMaxTable(counter: OneDayValues, newvalue: number, newdate: Date): boolean {
    if (isNaN(newvalue)) return false;

    counter.count++;
    counter.sum += newvalue;
    counter.average = counter.sum/counter.count;
    if (newvalue > counter.max.value) { 
        counter.max.value = newvalue; 
        counter.max.date = newdate; 
    }
    if (newvalue < counter.min.value) { 
        counter.min.value = newvalue; 
        counter.min.date = newdate; 
    }
    return true;
}
function checkReading(value: number, date: Date, current: OneDayValues, total: OneDayValues): boolean {
    if (isNaN(value) || value == undefined || !isNumeric(value)) return false;

    current.count++;
    current.sum += value;
    if (value < current.min.value) {
        current.min.value = value;
        current.min.date = date;
        if (total && value < total.min.value) {
            total.min.value = value;
            total.min.date = date;
        }
    }
    if (value > current.max.value) {
        current.max.value = value;
        current.max.date = date;
        if (total && value > total.max.value) {
            total.max.value = value;
            total.max.date = date;
        }
    }
    return true;
}
const TempMinDefaultValue = 99999;
const TempMaxDefaultValue = -99999;

export function getTempMinDefaultValue(): number {
    return TempMinDefaultValue;
}
export function getTempMaxDefaultValue(): number {
    return TempMaxDefaultValue;
}
export function roundNumber(value: any, num: number): string {
    if (isNumeric(value)) {
        if (typeof value === 'number') return value.toFixed(num);
        else return value;
    }
    if (isNaN(value)) return 'NaN';
    return '???'
}
export function isNumeric(obj: any): boolean {
    return !Array.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
}
export function getDateTxt(date, short: boolean = false): string {
    if (date == null || date === undefined || isNaN(date)) {
        return '????';
    }
    if (short) return `${date.getDate()}.${date.getMonth() + 1}`;
    return (date) ? `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}` : `-`;
}
// -----------------------------------------------------------------
//
// Data from database
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
// ----------------------------------------------------------------
interface CalculationResult {
    data: any;
    status: number;
    message: string | null;
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
}
function createFiltered(date: Date, morning: number, evening: number, average: number, difference: number,
    filteredmorning: number, filteredevening: number, filteredaverage: number, filtereddifference: number, 
    filterfirstday: Date, filterlastday: Date): Filtered {
    return {date: date, morning: morning, evening: evening, average: average, difference: difference, morningfiltered: filteredmorning, eveningfiltered: filteredevening, averagefiltered: filteredaverage,differencefiltered: filtereddifference, firstdayfilter: filterfirstday, lastdayfilter: filterlastday, index: 0}
}
function createDateOnlyFiltered(date: Date): Filtered {
    return {date: date, morning: NaN, evening: NaN, average: NaN, difference: NaN, morningfiltered: NaN, eveningfiltered: NaN, averagefiltered: NaN, differencefiltered: NaN, firstdayfilter: date, lastdayfilter: date, index: 0}
}
// ----------------------------------------------------
/*

MinMax and HighLow datatypes ?????????????????????????

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
}
interface MonthAverageData {
    monthno: number;
    monthlytemperature: number;
    monthlytemperaturecount: number;
    monthlydifference: number;
    monthlydifferencecount: number;
    averages: AverageCalculated;
}



interface ReadingDate {
    value: number;
    date: Date;
}

// - - - - - - - - - - - - - - - - - - -
interface ValueDate {
    date: Date;
    value: number;
}

// - - - - - - - - - - - - - - - - - - -

function createAverageMinMaxCalculatedEmpty(): AverageMinMaxCalculated {
    return {value: NaN, high: TempMaxDefaultValue, highdate: new Date(0), low: TempMinDefaultValue, lowdate: new Date(0)}
}
function createAverageMinMaxCalculated(value: number, high: number, highdate: Date, low: number, lowdate: Date): AverageMinMaxCalculated {
    return {value: value, high: high, highdate: highdate, low: low, lowdate: lowdate}
}
function createYearlyAverageData(year: number, location: string): YearlyAverageData {
    return {year: year, location: location, yearlyaverage: NaN, yearlyaveragediff: NaN, months: []}
}
function createAverageCalculated(date: Date, average: number, 
    morning: OneDayValues, evening: OneDayValues, difference: OneDayValues, total: OneDayValues, year: number): AverageCalculated {
    return {date: date, day: NaN, averagevalue: average, morning: morning, evening: evening, difference: difference, total: total,
        monthno: 0, morningfiltered: null, eveningfiltered: null, differencefiltered: null, totalfiltered: null, year: year }
}
function createAverageCalculatedEmpty(date: Date): AverageCalculated {
    return {date: date, day: date.getDate(), monthno: date.getMonth()+1, year: date.getFullYear(), averagevalue: NaN, 
        morning: createOneDayValues(0,0,createReadingDate(TempMinDefaultValue, new Date(0)),createReadingDate(TempMaxDefaultValue, new Date(0))), 
        evening: createOneDayValues(0,0,createReadingDate(TempMinDefaultValue, new Date(0)),createReadingDate(TempMaxDefaultValue, new Date(0))), 
        difference: createOneDayValues(0,0,createReadingDate(TempMinDefaultValue, new Date(0)),createReadingDate(TempMaxDefaultValue, new Date(0))), 
        total: createOneDayValues(0,0,createReadingDate(TempMinDefaultValue, new Date(0)),createReadingDate(TempMaxDefaultValue, new Date(0))), 
        morningfiltered: createOneDayValues(0,0,createReadingDate(TempMinDefaultValue, new Date(0)),createReadingDate(TempMaxDefaultValue, new Date(0))), 
        eveningfiltered:  createOneDayValues(0,0,createReadingDate(TempMinDefaultValue, new Date(0)),createReadingDate(TempMaxDefaultValue, new Date(0))), 
        differencefiltered:  createOneDayValues(0,0,createReadingDate(TempMinDefaultValue, new Date(0)),createReadingDate(TempMaxDefaultValue, new Date(0))), 
        totalfiltered:  createOneDayValues(0,0,createReadingDate(TempMinDefaultValue, new Date(0)),createReadingDate(TempMaxDefaultValue, new Date(0))), 
    }
}
function createAverageCalculated2(day: number, month: number): AverageCalculated {

    return {date: new Date(0), day: day, monthno: month, year: 0, averagevalue: NaN, 
        morning: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        evening: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        difference: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        total: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        morningfiltered: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        eveningfiltered: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        totalfiltered: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        differencefiltered: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0)))
    }
}
// function createAverageCalculated2(day: number, month: number): AverageCalculated {

//     return {day: day, date: new Date(0), averagevalue: NaN, month: month, 
//         morning: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
//         evening: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
//         difference: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
//         total: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
//         morningfiltered: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
//         eveningfiltered: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
//         totalfiltered: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
//         differencefiltered: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0)))
//     }
// }

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function createAverageMinMaxCalcValues12MonthsTable(year: number): AverageCalculated[] {
    let yearcounters = [1,2,3,4,5,6,7,8,9,10,11,12].map(m => (createAverageMinMaxCalcValues2(year, m)));
    return yearcounters;
}
function createAverageCalculated366DaysTable(): AverageCalculated[] {
    let minmaxtable: AverageCalculated[]  = [];
    for (let i = 0; i < 366; i++) {
        const d = new Date(temperatureClass.defaultyear, 0, i+1)
        minmaxtable.push(createAverageCalculatedEmpty(d))
    }
    return minmaxtable;
}
// function createAverageMinMaxCalcValues366DaysTable(defaultyear: number): AverageMinMaxCalcValues [] {
//     let minmaxtable: AverageMinMaxCalcValues[] = [];
//     for (let dayindex = 0; dayindex < 366; dayindex++) {
//         let newdate: Date = new Date(defaultyear, 0, dayindex + 1);
//         minmaxtable.push(createAverageMinMaxCalcValues(newdate));
//     }
//     return minmaxtable;
// }

// function createAverageMinMaxCalc(): AverageMinMaxCalc {
//     return {sum: 0, count: 0, average: NaN,
//         monthlyhigh: TempMaxDefaultValue, monthlylow: TempMinDefaultValue, monthlyhighdate: new Date(0), monthlylowdate: new Date(0) }
// }

function createAverageMinMaxCalcValues2(year: number, monthno: number): AverageCalculated {
    return { date: new Date(year, monthno-1, 1), day: NaN, monthno: monthno, year: year, averagevalue: NaN,
        morning: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        evening: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        difference: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        total: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        morningfiltered: null, eveningfiltered: null, differencefiltered: null, totalfiltered: null
    }
}

// -------------------------------------------------------



function createFilterValueEmpty(date: Date): FilterValue {
    return {date: date, morning: createAverageMinMaxCalculatedEmpty(), evening: createAverageMinMaxCalculatedEmpty(), total: createAverageMinMaxCalculatedEmpty(), difference: createAverageMinMaxCalculatedEmpty()}
}
function createFilterValue(date: Date, average: AverageMinMaxCalculated, morning: AverageMinMaxCalculated, evening: AverageMinMaxCalculated, difference: AverageMinMaxCalculated): FilterValue {
    return {date: date, morning: morning, evening: evening, total: average, difference: difference}
}
// --------------------------------------------------------

function createAverageYearsMonths(yearlydata: YearlyAverageData[], monthlydata: FilterValue[]): AverageYearsMonths {
    return {yearlydata: yearlydata, monthlydata: monthlydata}
}

function calculateAverage(counter: AverageCalculated): AverageCalculated {
    const morningvalue = counter.morning.count > 0 ? counter.morning.sum/counter.morning.count : NaN;
    const morningmin = createReadingDate(counter.morning.min.value, counter.morning.min.date);
    const morningmax = createReadingDate(counter.morning.max.value, counter.morning.max.date);
    const morning = createOneDayValues(counter.morning.count, morningvalue, morningmin, morningmax);

    const eveningvalue = counter.evening.count > 0 ? counter.evening.sum/counter.evening.count : NaN;
    const eveningmin = createReadingDate(counter.evening.min.value, counter.evening.min.date);
    const eveningmax = createReadingDate(counter.evening.max.value, counter.evening.max.date);
    const evening = createOneDayValues(counter.evening.count, eveningvalue, eveningmin, eveningmax);

    const differencevalue = counter.difference.count > 0 ? counter.difference.sum/counter.difference.count : NaN;
    const differencemin = createReadingDate(counter.difference.min.value, counter.difference.min.date);
    const differencemax = createReadingDate(counter.difference.max.value, counter.difference.max.date);
    const difference = createOneDayValues(counter.difference.count, differencevalue, differencemin, differencemax);

    const totalvalue = counter.total.count > 0 ? counter.total.sum/counter.total.count : NaN;
    const totalmin = createReadingDate(counter.total.min.value, counter.total.min.date);
    const totalmax = createReadingDate(counter.total.max.value, counter.total.max.date);
    const total = createOneDayValues(counter.total.count, totalvalue, totalmin, totalmax);


    let average = isNaN(morningvalue) || isNaN(eveningvalue) ? NaN : (morningvalue+eveningvalue)/2;

    let newitem = createAverageCalculated(new Date(0), average, morning, evening, difference, total, counter.year);
    newitem.morning.max.value = counter.morning.max.value;
    newitem.morning.max.date = counter.morning.max.date;
    newitem.morning.min.value = counter.morning.min.value;
    newitem.morning.min.date = counter.morning.min.date;
    newitem.evening.max.value = counter.evening.max.value;
    newitem.evening.max.date = counter.evening.max.date;
    newitem.evening.min.value = counter.evening.min.value;
    newitem.evening.min.date = counter.evening.min.date;
    newitem.difference.max.value = counter.difference.max.value;
    newitem.difference.max.date = counter.difference.max.date;
    newitem.difference.min.value = counter.difference.min.value;
    newitem.difference.min.date = counter.difference.min.date;

    return newitem;
}

function createMonthAverageData(monthno: number, monthlytemperature: number, monthlytemperaturecount: number, monthlydifference: number, monthlydifferencecount: number, averages: AverageCalculated): MonthAverageData {
    return {monthno: monthno, 
        monthlytemperaturecount: monthlytemperaturecount, 
        monthlytemperature: monthlytemperature, 
        monthlydifferencecount: monthlydifferencecount, 
        monthlydifference: monthlydifference,
        averages: averages}
}
// --------------------------------------------------------


function createOneDayValues(count: number, sum: number, min: ReadingDate, max: ReadingDate): OneDayValues {
    return {count: count, sum: sum, min: min, max: max, average: NaN}
}
// function createDailyValues(date: Date, morning: OneDayValues, evening: OneDayValues, difference: OneDayValues, total: OneDayValues): Average {
//     return {date: date, morning: morning, evening: evening, difference: difference, total: total}
// }

function createReadingDate(value: number, date: Date): ReadingDate {
    return {value: value, date: date}
}
// --------------------------------------------------------
interface GraphItem {
    value: [Date, number];
    tooltip: string
}  
function createGraphItem(d: Date, v: number): [Date, number] {
    return [d, v];
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

export function calculateTrend(valuearray): {k: number, b: number} {
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

// ========================================================================================
class Temperatures {
    //temperatures: TemperatureMsg;
    defaultyear: number = 1976;
    filterlength: number = 10;

    filteredValues: Filtered[] = [];
    filteredValuesValid:  Filtered[] = [];

    yearlyMonthlyAverages: AverageYearsMonths = createAverageYearsMonths([],[]);
    dailyValues: AverageCalculated[] = [];

    constructor () { }
    getValidFilteredValues(): Filtered[] {
        if (this.filteredValuesValid.length == 0) {
            this.filteredValuesValid = this.filteredValues.filter(v => !(isNaN(v.morning) || isNaN(v.evening)));
            this.filteredValuesValid.forEach((fv,i) => fv.index = i)
        }
        return this.filteredValuesValid;
    }
    getMonthlyvaluesForYear(currentyear: DbTemperature): AverageCalculated[] {
        let monthlycounters: AverageCalculated[] = createAverageMinMaxCalcValues12MonthsTable(currentyear.info.year);

        currentyear.data.forEach(dailytemp => {
            const month = dailytemp.datetimeLocal.getMonth();
            const morningvalueexists = updateMinMaxTable(monthlycounters[month].morning, dailytemp.morning, dailytemp.datetimeLocal);
            const eveningvalueexists = updateMinMaxTable(monthlycounters[month].evening, dailytemp.evening, dailytemp.datetimeLocal);
            if (eveningvalueexists && morningvalueexists) {
                const diff = (dailytemp.evening - dailytemp.morning);
                const aver = (dailytemp.evening + dailytemp.morning)/2;
                updateMinMaxTable(monthlycounters[month].difference, diff, dailytemp.datetimeLocal);
                updateMinMaxTable(monthlycounters[month].total, aver, dailytemp.datetimeLocal);
            }
        })
        monthlycounters.forEach(month =>{
            month.morning.average = month.morning.count > 0 ? month.morning.sum / month.morning.count : NaN;
            month.evening.average = month.evening.count > 0 ? month.evening.sum / month.evening.count : NaN;
            month.difference.average = month.difference.count > 0 ? month.difference.sum / month.difference.count : NaN;
        })
        return monthlycounters;
    }

    updateYearCounters(yearcounters: AverageCalculated[], monthlycounters: AverageCalculated[]): MonthAverageData[] {
        const monthlyvalues = monthlycounters.map((counter, index) => {
            let averages: AverageCalculated = calculateAverage(counter);
            const morningstatus = updateMinMaxTable(yearcounters[index].morning, averages.morning.sum, new Date(counter.year, counter.monthno, 1));
            const everningstatus = updateMinMaxTable(yearcounters[index].evening, averages.evening.sum, new Date(counter.year, counter.monthno, 1));
            if (morningstatus && everningstatus) {
                updateMinMaxTable(yearcounters[index].difference, averages.difference.sum, new Date(counter.year, counter.monthno, 1));
                updateMinMaxTable(yearcounters[index].total, averages.total.sum, new Date(counter.year, counter.monthno, 1));
            }
            return createMonthAverageData(counter.monthno, NaN, 0, NaN, 0, averages);
        });       
        return monthlyvalues;
    }
    calculateYearlyAndMonthlyAverages(temperatures: TemperatureMsg): CalculationResult {
        let yearcounters = createAverageMinMaxCalcValues12MonthsTable(0);
        const yearlyvalues: YearlyAverageData[] = temperatures.data.map(currentyear => {
            const averagedata = createYearlyAverageData(currentyear.info.year, currentyear.info.location);
            const monthlycounters: AverageCalculated[] = this.getMonthlyvaluesForYear(currentyear);
            averagedata.months = this.updateYearCounters(yearcounters, monthlycounters);
            return averagedata;
        })
        // calculate monthly averages
        let monthcounters = createAverageMinMaxCalcValues12MonthsTable(0);
        // calculate monthly values
        yearlyvalues.forEach(year => {
            year.months.forEach(month => {
                const morningok = updateMinMaxTable(monthcounters[month.monthno-1].morning, month.averages.morning.sum, new Date(year.year, month.monthno, 1));
                const eveningok = updateMinMaxTable(monthcounters[month.monthno-1].evening, month.averages.evening.sum, new Date(year.year, month.monthno, 1));
                if (morningok && eveningok) {
                    // let average =  (month.averages.morning.sum + month.averages.evening.sum)/2
                    // let value: OneDayValues = createOneDayValues(0, average, createReadingDate(TempMaxDefaultValue, new Date(0)), createReadingDate(TempMinDefaultValue, new Date(0)));
                    updateMinMaxTable(monthcounters[month.monthno-1].difference, month.averages.difference.sum, new Date(year.year, month.monthno, 1));
                    updateMinMaxTable(monthcounters[month.monthno-1].total, month.averages.total.sum, new Date(year.year, month.monthno, 1));
                }
            })
        })
        // add monthly values
        const monthlyvalues: FilterValue[] = monthcounters.map(counter => {
            return createFilterValue(new Date(this.defaultyear, counter.monthno-1, 1), 
                createAverageMinMaxCalculated(counter.total.count > 0 ? counter.total.sum/counter.total.count:NaN, counter.total.max.value, counter.total.max.date, counter.total.min.value, counter.total.min.date),
                createAverageMinMaxCalculated(counter.morning.count > 0 ? counter.morning.sum/counter.morning.count:NaN, counter.morning.max.value, counter.morning.max.date, counter.morning.min.value, counter.morning.min.date), 
                createAverageMinMaxCalculated(counter.evening.count > 0 ? counter.evening.sum/counter.evening.count:NaN, counter.evening.max.value, counter.evening.max.date, counter.evening.min.value, counter.evening.min.date),
                createAverageMinMaxCalculated(counter.difference.count > 0 ? counter.difference.sum/counter.difference.count:NaN, counter.difference.max.value, counter.difference.max.date, counter.difference.min.value, counter.difference.min.date)
            );
        })

        // calculate and add yearly averages
        yearlyvalues.forEach(year => {
            let sum = 0;
            let count = 0;
            let diffsum = 0;
            let diffcount = 0;
            year.months.forEach(month => {
                if (!isNaN(month.averages.averagevalue)) {
                    sum += month.averages.averagevalue;
                    count++;
                }
                if (!isNaN(month.averages.difference.sum)) {
                    diffsum += month.averages.difference.sum;
                    diffcount++;
                }                
            })
            year.yearlyaverage = count == 12 ? sum/count : NaN;     
            year.yearlyaveragediff = diffcount == 12 ? diffsum/diffcount : NaN;     
        })

        this.yearlyMonthlyAverages = createAverageYearsMonths(yearlyvalues, monthlyvalues);

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

                    const value1ok = checkReading(dayreadings.morning, dayreadings.datetimeLocal, foundsum.morning, foundsum.total);
                    const value2ok = checkReading(dayreadings.evening, dayreadings.datetimeLocal, foundsum.evening, foundsum.total);

                    if (value1ok && value2ok) {
                        let difference = dayreadings.evening - dayreadings.morning;
                        checkReading(difference, dayreadings.datetimeLocal, foundsum.difference, null);
                    }
                }
            })
        }
        for (let dayindex: number = 0; dayindex < calculationtable.length; dayindex++) {
            if (calculationtable[dayindex].morning.count > 0) {
                calculationtable[dayindex].morning.average = calculationtable[dayindex].morning.sum / (calculationtable[dayindex].morning.count > 0 ? calculationtable[dayindex].morning.count : 1);
            }
            if (calculationtable[dayindex].evening.count > 0) {
                calculationtable[dayindex].evening.average = calculationtable[dayindex].evening.sum / (calculationtable[dayindex].evening.count > 0 ? calculationtable[dayindex].evening.count : 1);
            }
            if (calculationtable[dayindex].difference.count > 0) {
                calculationtable[dayindex].difference.average = calculationtable[dayindex].difference.sum / (calculationtable[dayindex].difference.count > 0 ? calculationtable[dayindex].difference.count : 1);
            }
            if (calculationtable[dayindex].morning.count > 0 && calculationtable[dayindex].evening.count > 0) {
                calculationtable[dayindex].total.average = (calculationtable[dayindex].morning.average + calculationtable[dayindex].evening.average) / 2;
            }
        }
        const returnvalue: AverageCalculated[] = calculationtable.map(sum => {
            let morning: OneDayValues = createOneDayValues(sum.morning.count, sum.morning.average, { date: sum.morning.min.date, value: sum.morning.min.value }, { date: sum.morning.max.date, value: sum.morning.max.value });
            let evening: OneDayValues = createOneDayValues(sum.evening.count, sum.evening.average, { date: sum.evening.min.date, value: sum.evening.min.value }, { date: sum.evening.max.date, value: sum.evening.max.value });
            let difference: OneDayValues = createOneDayValues(sum.difference.count, sum.difference.average, { date: sum.difference.min.date, value: sum.difference.min.value }, { date: sum.difference.max.date, value: sum.difference.max.value });
            let total: OneDayValues = createOneDayValues(sum.difference.count, sum.total.average, { date: sum.total.min.date, value: sum.total.min.value }, { date: sum.total.max.date, value: sum.total.max.value });
            return createAverageCalculated(sum.date, NaN, morning, evening, difference, total, 0);
        })
        this.dailyValues = returnvalue;
        return { status: 0, message: null, data: returnvalue };
    }
    
    calculateMonthlyTrends(temperatures: TemperatureMsg): CalculationResult {
        return { status: 0, message: null, data: null};
    }
    getEstimate(): number {
        return 0;
    }
}

// --------------------------------------------------------------------------------------------

let temperatureClass: Temperatures;

//-------------------------------------------------------------------------------------------
// Data interfaces
//-------------------------------------------------------------------------------------------
interface ReturnDataValue {
    date: Date;
    value: number;
    year: number;
    tooltipfunction: any;
}
function createReturnDataValue(date: Date, value: number, year: number, tooltipfunction: any = null): ReturnDataValue {
    return {date: date, value: value, tooltipfunction: tooltipfunction, year: year}
}
interface ReturnDataType {
    name: string;
    values: ReturnDataValue[];
}
function createReturnDataType(name: string, values: ReturnDataValue[]): ReturnDataType {
    return {name: name, values: values}
}
interface GraphSerieType {
    data: GraphSerie[];
    params: any;
}
function createGraphSerieType(data: GraphSerie[], params: any): GraphSerieType {
    return {data: data, params: params}
}

function createValueDate(value: number): ValueDate {
    return {date: new Date(0), value: value}
}
function createStatValues() {
    return {average: NaN, averagecount: 0, averagesum: 0,
        high: createValueDate(TempMaxDefaultValue), low: createValueDate(TempMinDefaultValue)}
}


//-------------------------------------------------------------------------------------------
// Local functions
//-------------------------------------------------------------------------------------------
let allFilteredDataYearlyArranged = [];

function getAllFilteredDataYearlyArranged(): NameValues[] {
    if (allFilteredDataYearlyArranged.length == 0) allFilteredDataYearlyArranged = getFilteredDataYearlyArranged(temperatureClass.getValidFilteredValues());
    return allFilteredDataYearlyArranged;
}
function getFilteredDataYearlyArranged(data: Filtered[]): NameValues[] {
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
//-------------------------------------------------------------------------------------------
// Exported functions
//-------------------------------------------------------------------------------------------
export function CFinitTemperature() {
    temperatureClass = new Temperatures();
}

export function CFcalculateTemperatures(temperaturevalues: TemperatureMsg) {
    const status1 = temperatureClass.calculateYearlyAndMonthlyAverages(temperaturevalues); // this.YearlyAverages
    const status3 = temperatureClass.calculateFilteredValues(temperaturevalues); // this.filteredValues
    const status2 = temperatureClass.calculateDailyAverages(temperaturevalues);  // this.dailyValues

    //const status5 = temperatureClass.calculateYearlyTrend(temperaturevalues);    // this.yearlyTrend
    // const status4 = temperatureClass.calculateMonthlyTrends(temperaturevalues);
}
export function CFgetAllReadings() {
    const values = temperatureClass.getValidFilteredValues();
    const values2: Filtered[] = values.map(v => {return createFiltered(v.date, v.morning, v.evening, v.average, v.difference,
        v.morningfiltered, v.eveningfiltered, v.averagefiltered, v.differencefiltered, v.firstdayfilter, v.lastdayfilter)}).reverse();
    for (let i = 0; i < values2.length; i++) values2[i].index = i;

    return {values: values2, filtersize: temperatureClass.filterlength}
}
export function getAllFilteredReadings(temperatures)  {
    return {values: temperatureClass.createLinearContTable(temperatures), filtersize: 10};
}

interface NameValues {
    name: string;
    date: Date;
    values: Filtered[];
}
function createNameValues(name: string,date: Date, values: Filtered[]): NameValues {
    return {name: name, date: date, values: values}
}
export function CFcreateAllYearsFilteredSeriedata(): GraphSerieType {
    const yearlyarrangeddata = getAllFilteredDataYearlyArranged();

    let returnvalues: GraphSerie[] = yearlyarrangeddata.map(yeardata => {
        return createGraphSerie(yeardata.name, '',0, yeardata.values.map(value => ({
            value: createGraphItem(value.date, value.average), 
            tooltip: `${getDateTxt(value.date)} ${roundNumber(value.average, 1)}°C`,
        })), false, 0)
    })

    return createGraphSerieType(returnvalues, { series: [{ name: '', markersize: 1 }] });
}
let dailyminimumsandmaximums = {count: 0, data: []};

function getDailyMinMaxValues(data: NameValues[]): AverageCalculated[] {
    if (dailyminimumsandmaximums.count == data.length) {
        return dailyminimumsandmaximums.data;
    }
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
    dailyminimumsandmaximums.data = dailyminmaxtable;
    dailyminimumsandmaximums.count = data.length;
    return dailyminmaxtable;
}
export function CFcreateYearlyFilteredSeriedata(): GraphSerieType {
    function serietooltipcallback(value: ReturnDataValue): string {
        return `${getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()))} ${roundNumber(value.value, 1)}°C`;
    }   
    const yearlyarrangeddata = getAllFilteredDataYearlyArranged();
    let lastyear = yearlyarrangeddata.length > 0 ? yearlyarrangeddata[yearlyarrangeddata.length-1].date.getFullYear(): 0;
 
     let yearlydata: ReturnDataType[] = [];
    // add high and low curves to graphics
    const dailyminmaxtable = getDailyMinMaxValues(yearlyarrangeddata);
    yearlydata.push(createReturnDataType('Korkein', dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, minmax.monthno, minmax.total.max.date.getDate()),
            minmax.totalfiltered.max.value, 
            minmax.totalfiltered.max.date.getFullYear(), 
            serietooltipcallback)
    })));
    yearlydata.push(createReturnDataType('Matalin', dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, minmax.monthno, minmax.total.min.date.getDate()),
        minmax.totalfiltered.min.value, 
        minmax.totalfiltered.min.date.getFullYear(), 
        serietooltipcallback)
    })));
    // add yearly graphs
    let seriedata = yearlyarrangeddata.map(yearlydata => {
        return createReturnDataType(`Vuosi ${yearlydata.date.getFullYear()}`,
            yearlydata.values.map(value => {
                return createReturnDataValue(new Date(temperatureClass.defaultyear, value.date.getMonth(), value.date.getDate()), value.averagefiltered, value.date.getFullYear(), serietooltipcallback);
            }))
     })
     seriedata.forEach(s => yearlydata.push(s))

    const returnvalues: GraphSerie[] = yearlydata.map(dd => {
        return createGraphSerie(dd.name, '',0, dd.values.map(value => ({
                value: createGraphItem(value.date, value.value), 
                tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0)
    })
    return createGraphSerieType(returnvalues, { showlegend: true, 
        selection: [`Vuosi ${lastyear}`, 'Korkein', 'Matalin'], series: [{ name: 'Matalin', color: '#777777' }, { 'name': 'Korkein', color: '#777777' }] });
}
function getReadingsBetween(startdate: Date, enddate: Date, readings: Filtered[]): Filtered[] {
    let retvalues = readings.map(val => val.date >= startdate && val.date <= enddate ? val : null).filter(v => v !== null);
    return retvalues;
}
export function CFcreateLastYearsSeriedata(): GraphSerieType {
    function serietooltipcallback(value: ReturnDataValue): string {
        return `${getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()))} ${roundNumber(value.value, 1)}°C`;
    } 
    const allvalues = getAllFilteredDataYearlyArranged();

    const dailyminmaxtable: AverageCalculated[] = getDailyMinMaxValues(allvalues);

    const lastdate = allvalues[allvalues.length - 1].values[allvalues[allvalues.length - 1].values.length-1].date;
    const firstdate = new Date(lastdate.getFullYear() - 1, lastdate.getMonth(), lastdate.getDate());

    const readings: Filtered[] = temperatureClass.getValidFilteredValues();
    const lastyearreadings = getReadingsBetween(firstdate, lastdate, readings);

    const morningserie = createReturnDataType('Aamu', lastyearreadings.map(reading => {
        return createReturnDataValue(reading.date, reading.morning, reading.date.getFullYear(), serietooltipcallback);
    }));
    const eveningserie = createReturnDataType('Ilta', lastyearreadings.map(reading => {
        return createReturnDataValue(reading.date, reading.evening, reading.date.getFullYear(), serietooltipcallback);
    }));
    // get minmax filler data for previous year values
    const startyear = firstdate.getFullYear();
    let maxdataarray: ReturnDataValue[] = [];
    let mindataarray: ReturnDataValue[] = [];
    let dateindex = dailyminmaxtable.findIndex(item => item.day == firstdate.getDate() && item.monthno == firstdate.getMonth());
    if (dateindex >= 0) {
        while (dateindex < dailyminmaxtable.length) {
            const minmax = dailyminmaxtable[dateindex];
            const newitemmax = createReturnDataValue(new Date(startyear, minmax.monthno, minmax.day), 
                minmax.evening.max.value>minmax.morning.max.value?minmax.evening.max.value:minmax.morning.max.value, 
                minmax.evening.max.value>minmax.morning.max.date.getFullYear()?minmax.evening.max.value:minmax.morning.max.date.getFullYear(), 
                serietooltipcallback);
            maxdataarray.push(newitemmax);
            const newitemmin = createReturnDataValue(new Date(startyear, minmax.monthno, minmax.day), 
                minmax.evening.min.value<minmax.morning.min.value?minmax.evening.min.value:minmax.morning.min.value, 
                minmax.evening.min.value<minmax.morning.min.value?minmax.evening.min.date.getFullYear():minmax.morning.min.date.getFullYear(), 
                serietooltipcallback);
            mindataarray.push(newitemmin);

            dateindex++;
        }
    }

    let maxdata = dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(startyear+1, minmax.monthno, minmax.day), 
            minmax.evening.max.value>minmax.morning.max.value?minmax.evening.max.value:minmax.morning.max.value, 
            minmax.evening.max.value>minmax.morning.max.date.getFullYear()?minmax.evening.max.value:minmax.morning.max.date.getFullYear(), 
            serietooltipcallback);
        });
    maxdataarray = maxdataarray.concat(maxdata);
    const maxserie = createReturnDataType('Korkein', maxdataarray);

    const mindata = dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(startyear+1, minmax.monthno, minmax.day), 
        minmax.evening.min.value<minmax.morning.min.value?minmax.evening.min.value:minmax.morning.min.value, 
        minmax.evening.min.value<minmax.morning.min.value?minmax.evening.min.date.getFullYear():minmax.morning.min.date.getFullYear(), 
        serietooltipcallback);
    })
    mindataarray = mindataarray.concat(mindata);
    const minserie = createReturnDataType('Matalin', mindataarray);

    const allseries = [morningserie, eveningserie, maxserie, minserie];
    const returnvalues: GraphSerie[] = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
                value: createGraphItem(value.date, value.value), 
                tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0)
    })
    return createGraphSerieType(returnvalues, { showlegend: true, 
        selection: [`Aamu`, 'Ilta', 'Korkein', 'Matalin'], series: [{ name: 'Matalin', color: '#777777' }, { 'name': 'Korkein', color: '#777777' }] });
}
export function CFcreateDailyDiffdata(): GraphSerieType {
    function serietooltipcallback(value: ReturnDataValue): string {
        let daytxt = isNaN(value.year) ? 
            `${value.date.getDate()}.${value.date.getMonth()+1}` : 
            getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()));
        return `${daytxt} ${roundNumber(value.value, 1)}°C`;
    } 
    const yearlyarrangeddata = getAllFilteredDataYearlyArranged();
    const dailyminmaxtable = getDailyMinMaxValues(yearlyarrangeddata);

    const diffserie = createReturnDataType('Keskiarvo', dailyminmaxtable.map(reading => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.monthno, reading.day), 
            reading.differencefiltered.average, NaN, serietooltipcallback);
        }));   
    const maxserie = createReturnDataType('Maksimi', dailyminmaxtable.map(reading => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.monthno, reading.day), 
            reading.differencefiltered.max.value, reading.differencefiltered.max.date.getFullYear(), serietooltipcallback);
        }));         
    const minserie = createReturnDataType('Minimi', dailyminmaxtable.map(reading => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.monthno, reading.day), 
            reading.differencefiltered.min.value, reading.differencefiltered.min.date.getFullYear(), serietooltipcallback);
        }));   
        let lastyear = '';
        const yearseries = yearlyarrangeddata.map(year => {
            lastyear = year.name;
            return createReturnDataType(year.name, year.values.map(reading => {
                return createReturnDataValue(new Date(temperatureClass.defaultyear,reading.date.getMonth(), reading.date.getDate()), 
                    reading.differencefiltered, reading.date.getFullYear(), serietooltipcallback);
            }));
        })
    
        let allseries = [diffserie, maxserie, minserie];
        allseries = allseries.concat(yearseries);
    
        const returnvalues: GraphSerie[] = allseries.map(serie => {
            return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
                    value: createGraphItem(value.date, value.value), 
                    tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
            })), false, 0)
        })
        const selection = [lastyear, 'Keskiarvo', 'Maksimi', 'Minimi']
        //const selection = allseries.map(c => (c.name));
        const seriedata = {
            data: returnvalues,
            params: { showlegend: true, series: [{ name: 'Minimi', color: '#777777' }, { name: 'Maksimi', color: '#777777' }], selection: selection }
        };
        return seriedata;
}

export function CFcreateYearlyHighValuedata(): GraphSerieType {
    function serietooltipcallback(value: ReturnDataValue): string {
        let daytxt = isNaN(value.year) ? 
            `???` : 
            value.year.toString();
        return `${daytxt} ${roundNumber(value.value, 1)} kpl`;
    } 

    const yearlyarrangeddata = getAllFilteredDataYearlyArranged();
    const dailyminmaxtable = getDailyMinMaxValues(yearlyarrangeddata);

    let values = yearlyarrangeddata.map(y => ({year: y.date.getFullYear(), high: 0, low: 0}));
    dailyminmaxtable.forEach(day => { 
        values[day.morning.max.date.getFullYear()].high++;
        values[day.evening.max.date.getFullYear()].high++;
        values[day.morning.min.date.getFullYear()].low++;
        values[day.evening.min.date.getFullYear()].low++;
    });
    const highserie = createReturnDataType('Ylin', values.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), 
            value.high, value.year, serietooltipcallback);
    }));   
    const lowserie = createReturnDataType('Alin', values.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), 
            value.low, value.year, serietooltipcallback);
    }));   
    //---------------
    let highvalues = {data: []}
    highvalues.data = values.map(v => ({
        value: v.high,
        year: v.year,
    }))
    let hightrendserie: ReturnDataType;
    const trendhigh = calculateTrend([highvalues]);
    if (!isNaN(trendhigh.k) && !isNaN(trendhigh.b)) {
        hightrendserie = createReturnDataType('Ylimpien suuntaus', values.map(value => {
            return createReturnDataValue(new Date(value.year, 0, 1), 
                trendhigh.k * value.year + trendhigh.b, value.year, serietooltipcallback);
        }));  
    }
    //---------------
    let lowvalues = {data: []}
    lowvalues.data = values.map(v => ({
        value: v.low,
        year: v.year,
    }))
    let lowtrendserie: ReturnDataType;
    const trendlow = calculateTrend([lowvalues]);
    if (!isNaN(trendlow.k) && !isNaN(trendlow.b)) {
        lowtrendserie = createReturnDataType('Alimpien suuntaus', values.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), 
            trendlow.k * value.year + trendlow.b, value.year, serietooltipcallback);
        }));  
    }
    //---------------
    const allseries = [lowserie, highserie, hightrendserie, lowtrendserie];
    const returnvalues: GraphSerie[] = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value), 
            tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0)
    })
    return createGraphSerieType(returnvalues, { showlegend: true })
}

// _______________________________________________________________________
interface YearlyAveragesEstimates {
    values: YearlyAverage[],
    averages: TempDiffTable,
}
function createYearlyAveragesEstimates(values: YearlyAverage[], averages: TempDiffTable): YearlyAveragesEstimates {
    return {values: values, averages: averages}
}
interface MonthlyAverage {
    temperature: number;
    difference: number;
}
function createMonthlyAverage(temperature: number, difference: number): MonthlyAverage {
    return {temperature: temperature, difference: difference}
}
interface YearlyAverage {
    year: number; 
    yearaverage: number;
    yearaveragediff: number;
    months: MonthlyAverage[];
    estimate: boolean;
}
interface TempDiffTable {
    temp: number[];
    diff: number[];
}
function createTempDiffTable(temp: number[], diff: number[]): TempDiffTable {
    return {temp: temp, diff: diff}
}
function createYearlyAverage(year: number, yearaverage: number, yearaveragediff: number, months: MonthlyAverage[]): YearlyAverage {
    return {year: year, yearaverage: yearaverage, yearaveragediff: yearaveragediff, months: months, estimate: false}
}
export function CFcalculateMonthlyAverages(): YearlyAveragesEstimates {
    const months = temperatureClass.yearlyMonthlyAverages.monthlydata;
    const years = temperatureClass.yearlyMonthlyAverages.yearlydata;
    let tempaverages = months.map(month => month.total.value);
    let diffvalues = months.map(month => month.difference.value);

    let yearlyaverages: YearlyAverage[] = years.map(year => {
        return createYearlyAverage(year.year, year.yearlyaverage, year.yearlyaveragediff, year.months.map(month => {
            return createMonthlyAverage(month.averages.averagevalue, month.averages.difference.sum);
        }))
    })

    return createYearlyAveragesEstimates(yearlyaverages, createTempDiffTable(tempaverages, diffvalues));
}
export function CFcreateYearlyTrendSeriedata(): GraphSerieType {
    function serietooltipcallback(value: ReturnDataValue): string {
        return `${value.year} ${roundNumber(value.value, 1)}°C`;
    } 
    const years = temperatureClass.yearlyMonthlyAverages.yearlydata;
    const yeartemperatureserie = createReturnDataType('Lämpötila', years.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), 
            value.yearlyaverage, value.year, serietooltipcallback);
    }));   
    const yeardiffserie = createReturnDataType('Illan ja aamun ero', years.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), 
            value.yearlyaveragediff, value.year, serietooltipcallback);
    }));   

    // --------------------------
    // calculate temperature trend
    const tempdata = yeartemperatureserie.values.map(val => ({
        year: val.year,
        value: val.value
    }))
    const trendcalc = {data: tempdata}
    const trend = calculateTrend([trendcalc]);
    let values = [];
    if (!(isNaN(trend.k) || isNaN(trend.b))) {
        values = yeartemperatureserie.values.map(val => ({
            year: val.year,
            value: val.year * trend.k + trend.b,
        }))
    }
    const trendserie = createReturnDataType(`Suuntaus ${trend.k>0?'+':'-'}${roundNumber(trend.k*10,1)} °C/10v`, values.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), 
            value.value, value.year, serietooltipcallback);
    }));   
    // --------------------------
    // calculate difference trend
    const diffdata = yeardiffserie.values.map(val => ({
        year: val.year,
        value: val.value,
    }))
    const difftrendcalc = {data: diffdata}
    const difftrend = calculateTrend([difftrendcalc]);
    let diffvalues = [];
    if (!(isNaN(difftrend.k) || isNaN(difftrend.b))) {
        diffvalues = yeardiffserie.values.map(val => ({
            year: val.year,
            value: val.year * difftrend.k + difftrend.b,
        }))
    }
    const difftrendserie = createReturnDataType(`Erosuuntaus ${difftrend.k>0?'+':'-'}${roundNumber(difftrend.k*10,1)} °C/10v`, diffvalues.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), 
            value.value, value.year, serietooltipcallback);
    }));   
    // --------------------------

    const allseries = [yeartemperatureserie, trendserie, yeardiffserie, difftrendserie];

    const returnvalues: GraphSerie[] = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value), 
            tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0)
    })

    let params = { rangeoffset: 1, showlegend: true };
    // if (!isNaN(lastyearestimate)) {
    //     params.series = [{ name: data[0].name, symbol: 'arrow', symbolsize: 14, symbolindex: 'last' }];
    // }
    return createGraphSerieType(returnvalues, params)

}
// _______________________________________________________________________
interface MonthDataPair {
    month: number;
    data: ValueDataValue[]
}
function createMonthDataPair(month: number, data: ValueDataValue[]): MonthDataPair {
    return {month: month, data: data}
}
interface ValueDataValue {
    value: number;
    year: number;
    month: number;
}
function createValueDataValue(value: number, year:  number, month: number): ValueDataValue {
    return {value: value, year: year, month: month}
}
export function createTrendForGivenMonths(monthnumbers: number[], monthnames: string[]): GraphSerie[] {
    let datavalues: GraphSerie[] = [];

    const years = temperatureClass.yearlyMonthlyAverages.yearlydata;
    const monthlydata = monthnumbers.map(m => {
        return createMonthDataPair(m-1, years.map(y => {
            return createValueDataValue(y.months[m-1].averages.averagevalue, y.year, m-1)
        }))
    });
    // create series
    monthlydata.forEach(month => {
        let found = monthnumbers.indexOf(month.month+1);
        if (found >= 0) {
            let values = month.data.map(value => ({
                value: createGraphItem(new Date(value.year, 0, 1), value.value), 
                tooltip: `${value.year} ${monthnames[found]} ${roundNumber(value.value, 1)}`
            }));
            datavalues.push( createGraphSerie( monthnames[datavalues.length], 'location', 0, values, false, monthnumbers[found]));
        }
    });
    // calculate and create trend line
    let trend = calculateTrend(monthlydata);
    let newvalues = years.map((ser, serieindex) => ({ 
        value: createGraphItem(new Date(ser.year, 0, 1), isNaN(trend.k) ? NaN : ser.year * trend.k + trend.b), 
        tooltip: `${ser.year} Suuntaus ${isNaN(trend.k) ? '???' : roundNumber(ser.year * trend.k + trend.b, 1)}`
    }))
    if (isNaN(trend.k)) datavalues.push( createGraphSerie( `Trendi --- °C/10v`, 'location', 0, newvalues, true, -1));
    else datavalues.push( createGraphSerie( `Trendi ${trend.k > 0 ? '+' : ''}${roundNumber(trend.k * 10, 1)}°C/10v`, 'location', 0, newvalues, true, -1));

    return datavalues;
}
export function CFcreateMonthlySummerTrendSeriedata(): GraphSerieType {
    const returnvalues = createTrendForGivenMonths([6, 7, 8], ['Kesäkuu', 'Heinäkuu', 'Elokuu'])
    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true })    
}
export function CFcreateMonthlyWinterTrendSeriedata(): GraphSerieType {
    const returnvalues = createTrendForGivenMonths([1, 2, 12], ['Tammikuu', 'Helmikuu', 'Joulukuu'])
    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true })    
}
export function CFcreateMonthlyFallTrendSeriedata(): GraphSerieType {
    const returnvalues = createTrendForGivenMonths([9, 10, 11], ['Syyskuu', 'Lokakuu', 'Marraskuu'])
    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true })    
}
export function CFcreateMonthlySpringTrendSeriedata(): GraphSerieType {
    const returnvalues = createTrendForGivenMonths([3, 4, 5], ['Maaliskuu', 'Huhtikuu', 'Toukokuu'])
    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true })    
}

export function CFcreateAllYearsAverageSeriedata(): GraphSerieType {
    function serietooltipcallback(value: ReturnDataValue): string {
        let daytxt = isNaN(value.year) ? 
            `${value.date.getDate()}.${value.date.getMonth()+1}` : 
            getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()));
        return `${daytxt} ${roundNumber(value.value, 1)}°C`;
    } 

    const days = temperatureClass.dailyValues.map(day => ({average: day.total.sum, max: day.total.max, min: day.total.min, maxday: day.total.max.date}));
    const yearlyarrangeddata = getAllFilteredDataYearlyArranged();

    const minserie = createReturnDataType(`Matalin`,days.map(day => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, day.min.date.getMonth(), day.min.date.getDate()),
        day.min.value, day.min.date.getFullYear(), serietooltipcallback) 
    }));   
    const maxserie = createReturnDataType(`Korkein`,days.map(day => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, day.max.date.getMonth(), day.max.date.getDate()),
        day.max.value, day.max.date.getFullYear(), serietooltipcallback) 
    }));   
    const curyearno = new Date().getFullYear();

    const curyear = createReturnDataType(`Vuosi ${curyearno}`,yearlyarrangeddata[yearlyarrangeddata.length-1].values.map(day => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, day.date.getMonth(), day.date.getDate()),
        day.average, day.date.getFullYear(), serietooltipcallback) 
    }));   

    const allseries = [minserie, maxserie, curyear];

    const returnvalues: GraphSerie[] = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value), 
            tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0)
    })
    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true })    
}

export function CFcreateAllYearsMonthlyAverageSeriedata(): GraphSerieType {
    function serietooltipcallback(value: ReturnDataValue): string {
        let daytxt = isNaN(value.year) ? `${value.date.getDate()}.${value.date.getMonth()+1}` : `${value.date.getMonth()+1}/${value.year}`;
        return `${daytxt} ${roundNumber(value.value, 1)}°C`;
    } 
    const months = temperatureClass.yearlyMonthlyAverages.monthlydata;
    const years = temperatureClass.yearlyMonthlyAverages.yearlydata;

    const maxserie = createReturnDataType(`Korkein`,months.map(month => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, month.date.getMonth(), month.date.getDate()),
        month.total.high, month.total.highdate.getFullYear(), serietooltipcallback) 
    }));       
    const minserie = createReturnDataType(`Matalin`,months.map(month => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, month.date.getMonth(), month.date.getDate()),
        month.total.low, month.total.lowdate.getFullYear(), serietooltipcallback) 
    }));       

    let lastyear = 0;
    const allyears = years.map(year => {
        lastyear = year.year;
        return createReturnDataType(`Vuosi ${year.year}`,year.months.map(month => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, month.monthno-1, 1),
                month.averages.averagevalue, years[years.length-1].year, serietooltipcallback) 
        }))
    });       

    const allseries: ReturnDataType[] = [minserie, maxserie];
    for (let i = 0; i < allyears.length; i++) allseries.push(allyears[i]);

    const returnvalues: GraphSerie[] = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value), 
            tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0)
    })

    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true, selection: [`Vuosi ${lastyear}`, 'Korkein', 'Matalin'] })    
}    