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

    morning: OneDayValues;
    evening: OneDayValues;
    difference: OneDayValues;
    total: OneDayValues;

    morningfiltered: OneDayValues;
    eveningfiltered: OneDayValues;
    totalfiltered: OneDayValues;
    differencefiltered: OneDayValues;
}
interface OneDayValues {
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
function createOneDayValues(count: number, sum: number, min: ReadingDate, max: ReadingDate): OneDayValues {
    return {count: count, sum: sum, average: count>0?sum/count:NaN, min: min, max: max}
}
function createReadingDate(value: number, date: Date): ReadingDate {
    return {value: value, date: date}
}
function createOneDayValuesEmpty() {
    return createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0)));
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
function createAverageCalculated(date: Date, year: number, average: number, morning: OneDayValues, evening: OneDayValues, difference: OneDayValues, total: OneDayValues): AverageCalculated {
    return {date: date, year: year, monthno: date.getMonth()+1, day: date.getDate(), averagevalue: average, morning: morning, evening: evening, difference: difference, total: total,
        morningfiltered: null, eveningfiltered: null, differencefiltered: null, totalfiltered: null }
}
function updateMinMaxTable(minmaxvalues: OneDayValues, newvalue: number, newdate: Date): boolean {
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
function createYearlyAverageData(year: number, location: string): YearlyAverageData {
    return {year: year, location: location, yearlyaverage: NaN, yearlyaveragediff: NaN, months: [], estimate: false}
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
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    //const morningvalue = counter.morning.count > 0 ? counter.morning.sum/counter.morning.count : NaN;
    const morningmin = createReadingDate(counter.morning.min.value, counter.morning.min.date);
    const morningmax = createReadingDate(counter.morning.max.value, counter.morning.max.date);
    const morning = createOneDayValues(counter.morning.count, counter.morning.sum, morningmin, morningmax);

    //const eveningvalue = counter.evening.count > 0 ? counter.evening.sum/counter.evening.count : NaN;
    const eveningmin = createReadingDate(counter.evening.min.value, counter.evening.min.date);
    const eveningmax = createReadingDate(counter.evening.max.value, counter.evening.max.date);
    const evening = createOneDayValues(counter.evening.count, counter.evening.sum, eveningmin, eveningmax);

    //const differencevalue = counter.difference.count > 0 ? counter.difference.sum/counter.difference.count : NaN;
    const differencemin = createReadingDate(counter.difference.min.value, counter.difference.min.date);
    const differencemax = createReadingDate(counter.difference.max.value, counter.difference.max.date);
    const difference = createOneDayValues(counter.difference.count, counter.difference.sum, differencemin, differencemax);

    //const totalvalue = counter.total.count > 0 ? counter.total.sum/counter.total.count : NaN;
    const totalmin = createReadingDate(counter.total.min.value, counter.total.min.date);
    const totalmax = createReadingDate(counter.total.max.value, counter.total.max.date);
    const total = createOneDayValues(counter.total.count, counter.total.sum, totalmin, totalmax);

   // let average = counter.morning.count==0 || counter.evening.count==0 ? NaN : (counter.morning.sum/counter.morning.count + counter.evening.sum/counter.evening.count)/2;

    let newitem = createAverageCalculated(counter.date, counter.year, counter.total.average, morning, evening, difference, total);
    // newitem.morning.max.value = counter.morning.max.value;
    // newitem.morning.max.date = counter.morning.max.date;
    // newitem.morning.min.value = counter.morning.min.value;
    // newitem.morning.min.date = counter.morning.min.date;
    // newitem.evening.max.value = counter.evening.max.value;
    // newitem.evening.max.date = counter.evening.max.date;
    // newitem.evening.min.value = counter.evening.min.value;
    // newitem.evening.min.date = counter.evening.min.date;
    // newitem.difference.max.value = counter.difference.max.value;
    // newitem.difference.max.date = counter.difference.max.date;
    // newitem.difference.min.value = counter.difference.min.value;
    // newitem.difference.min.date = counter.difference.min.date;

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
    value: [Date, number];
    tooltip: string
}  
function createGraphItem(d: Date, v: number): [Date, number] {
    return [d, v];
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

    //constructor () { }
    constructor (filterlength: number) { this.filterlength = filterlength;}

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
    calculateYearlyAndMonthlyAverages(temperatures: TemperatureMsg): CalculationResult {
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

        // !!!!!!!!!!!!!!!!!!!!
        // calculate monthly statistics
        const monthlystatistics: FilterValue[] = yearcounters.map((monthcounter, monthindex) => {
            return createFilterValue(
                new Date(this.defaultyear, monthindex, 1), 
                createAverageMinMaxCalculated(monthcounter.total.count > 0 ? monthcounter.total.sum/monthcounter.total.count:NaN, monthcounter.total.max.value, monthcounter.total.max.date, monthcounter.total.min.value, monthcounter.total.min.date),
                createAverageMinMaxCalculated(monthcounter.morning.count > 0 ? monthcounter.morning.sum/monthcounter.morning.count:NaN, monthcounter.morning.max.value, monthcounter.morning.max.date, monthcounter.morning.min.value, monthcounter.morning.min.date), 
                createAverageMinMaxCalculated(monthcounter.evening.count > 0 ? monthcounter.evening.sum/monthcounter.evening.count:NaN, monthcounter.evening.max.value, monthcounter.evening.max.date, monthcounter.evening.min.value, monthcounter.evening.min.date),
                createAverageMinMaxCalculated(monthcounter.difference.count > 0 ? monthcounter.difference.sum/monthcounter.difference.count:NaN, monthcounter.difference.max.value, monthcounter.difference.max.date, monthcounter.difference.min.value, monthcounter.difference.min.date)
            )})

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
            let morning: OneDayValues = createOneDayValues(sum.morning.count, sum.morning.sum, { date: sum.morning.min.date, value: sum.morning.min.value }, { date: sum.morning.max.date, value: sum.morning.max.value });
            let evening: OneDayValues = createOneDayValues(sum.evening.count, sum.evening.sum, { date: sum.evening.min.date, value: sum.evening.min.value }, { date: sum.evening.max.date, value: sum.evening.max.value });
            let difference: OneDayValues = createOneDayValues(sum.difference.count, sum.difference.sum, { date: sum.difference.min.date, value: sum.difference.min.value }, { date: sum.difference.max.date, value: sum.difference.max.value });
            let total: OneDayValues = createOneDayValues(sum.total.count, sum.total.sum, { date: sum.total.min.date, value: sum.total.min.value }, { date: sum.total.max.date, value: sum.total.max.value });
            return createAverageCalculated(sum.date, NaN, total.count > 0 ? total.sum/total.count : NaN, morning, evening, difference, total);
        })
        this.dailyValues = dailyvalues;
        return { status: 0, message: null, data: dailyvalues };
    }
    calculateTemperatures(temperaturevalues: TemperatureMsg) {
        const status1 = temperatureClass.calculateYearlyAndMonthlyAverages(temperaturevalues); // this.YearlyAverages
        const status3 = temperatureClass.calculateFilteredValues(temperaturevalues); // this.filteredValues
        const status2 = temperatureClass.calculateDailyAverages(temperaturevalues);  // this.dailyValues
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
        // if (dailyminimumsandmaximums.count == data.length) {
        //     return dailyminimumsandmaximums.data;
        // }
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
        //dailyminimumsandmaximums.data = dailyminmaxtable;
        //dailyminimumsandmaximums.count = data.length;
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
    values: YearlyAverage[],
    averages: TempDiffTable,
}
function createMonthlyAveragesEstimates(values: YearlyAverage[], averages: TempDiffTable): YearlyAveragesEstimates {
    return {values: values, averages: averages}
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
function createYearlyAverage(year: number, yearaverage: number, yearaveragediff: number, months: MonthlyAverage[]): YearlyAverage {
    return {year: year, yearaverage: yearaverage, yearaveragediff: yearaveragediff, months: months, estimate: false}
}
interface TempDiffTable {
    temp: number[];
    diff: number[];
}
function createTempDiffTable(temp: number[], diff: number[]): TempDiffTable {
    return {temp: temp, diff: diff}
}
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
export function CFinitTemperature(temperaturevalues: TemperatureMsg, filtersize: number) {
    temperatureClass = new Temperatures(filtersize);
    temperatureClass.calculateTemperatures(temperaturevalues);
}
export function CFgetAllReadings() {
    const values = temperatureClass.getValidFilteredValues();
    const values2: Filtered[] = values.map(v => {return createFiltered(v.date, v.morning, v.evening, v.average, v.difference,
        v.morningfiltered, v.eveningfiltered, v.averagefiltered, v.differencefiltered, v.firstdayfilter, v.lastdayfilter)}).reverse();
    for (let i = 0; i < values2.length; i++) values2[i].index = i;

    return {values: values2, filtersize: temperatureClass.filterlength}
}
export function CFcreateAllYearsFilteredSeriedata(): GraphSerieType {
    const yearlyarrangeddata = temperatureClass.getAllFilteredDataYearlyArranged();

    let returnvalues: GraphSerie[] = yearlyarrangeddata.map(yeardata => {
        return createGraphSerie(yeardata.name, '',0, yeardata.values.map(value => ({
            value: createGraphItem(value.date, value.average), 
            tooltip: `${getDateTxt(value.date)} ${roundNumber(value.average, 1)}°C`,
        })), false, 0)
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
    yearlydata.push(createReturnDataType('Korkein', dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, minmax.monthno-1, minmax.total.max.date.getDate()),
            minmax.totalfiltered.max.value, 
            minmax.totalfiltered.max.date.getFullYear(), 
            false, // estimate
            serietooltipcallback)
    })));
    yearlydata.push(createReturnDataType('Matalin', dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, minmax.monthno-1, minmax.total.min.date.getDate()),
        minmax.totalfiltered.min.value, 
        minmax.totalfiltered.min.date.getFullYear(), 
        false, // estimate
        serietooltipcallback)
    })));
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
                value: createGraphItem(value.date, value.value), 
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

    const morningserie = createReturnDataType('Aamu', lastyearreadings.map(reading => {
        return createReturnDataValue(reading.date, reading.morning, reading.date.getFullYear(), false, // estimate
        serietooltipcallback);
    }));
    const eveningserie = createReturnDataType('Ilta', lastyearreadings.map(reading => {
        return createReturnDataValue(reading.date, reading.evening, reading.date.getFullYear(), false, // estimate
        serietooltipcallback);
    }));
    // get minmax filler data for previous year values
    const startyear = firstdate.getFullYear();
    let maxdataarray: ReturnDataValue[] = [];
    let mindataarray: ReturnDataValue[] = [];
    let dateindex = dailyminmaxtable.findIndex(item => item.day == firstdate.getDate() && item.monthno-1 == firstdate.getMonth());
    if (dateindex >= 0) {
        while (dateindex < dailyminmaxtable.length) {
            const minmax = dailyminmaxtable[dateindex];
            const newitemmax = createReturnDataValue(new Date(startyear, minmax.monthno-1, minmax.day), 
                minmax.evening.max.value>minmax.morning.max.value?minmax.evening.max.value:minmax.morning.max.value, 
                minmax.evening.max.value>minmax.morning.max.date.getFullYear()?minmax.evening.max.value:minmax.morning.max.date.getFullYear(), 
                false, // estimate
                serietooltipcallback);
            maxdataarray.push(newitemmax);
            const newitemmin = createReturnDataValue(new Date(startyear, minmax.monthno-1, minmax.day), 
                minmax.evening.min.value<minmax.morning.min.value?minmax.evening.min.value:minmax.morning.min.value, 
                minmax.evening.min.value<minmax.morning.min.value?minmax.evening.min.date.getFullYear():minmax.morning.min.date.getFullYear(), 
                false, // estimate
                serietooltipcallback);
            mindataarray.push(newitemmin);

            dateindex++;
        }
    }

    let maxdata = dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(startyear+1, minmax.monthno-1, minmax.day), 
            minmax.evening.max.value>minmax.morning.max.value?minmax.evening.max.value:minmax.morning.max.value, 
            minmax.evening.max.value>minmax.morning.max.date.getFullYear()?minmax.evening.max.value:minmax.morning.max.date.getFullYear(), 
            false, // estimate
            serietooltipcallback);
        });
    maxdataarray = maxdataarray.concat(maxdata);
    const maxserie = createReturnDataType('Korkein', maxdataarray);

    const mindata = dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(startyear+1, minmax.monthno-1, minmax.day), 
        minmax.evening.min.value<minmax.morning.min.value?minmax.evening.min.value:minmax.morning.min.value, 
        minmax.evening.min.value<minmax.morning.min.value?minmax.evening.min.date.getFullYear():minmax.morning.min.date.getFullYear(), 
        false, // estimate
        serietooltipcallback);
    })
    mindataarray = mindataarray.concat(mindata);
    const minserie = createReturnDataType('Matalin', mindataarray);

    const allseries = [morningserie, eveningserie, maxserie, minserie];
    const returnvalues: GraphSerie[] = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
                value: createGraphItem(value.date, value.value), 
                tooltip: createTooltip(value),
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
    const yearlyarrangeddata = temperatureClass.getAllFilteredDataYearlyArranged();
    const dailyminmaxtable = temperatureClass.getDailyMinMaxValues(yearlyarrangeddata);

    const diffserie = createReturnDataType('Keskiarvo', dailyminmaxtable.map(reading => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.monthno, reading.day), 
            reading.differencefiltered.average, NaN, 
            false, // estimate
            serietooltipcallback);
        }));   
    const maxserie = createReturnDataType('Maksimi', dailyminmaxtable.map(reading => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.monthno, reading.day), 
            reading.differencefiltered.max.value, reading.differencefiltered.max.date.getFullYear(), 
            false, // estimate
            serietooltipcallback);
        }));         
    const minserie = createReturnDataType('Minimi', dailyminmaxtable.map(reading => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.monthno, reading.day), 
            reading.differencefiltered.min.value, reading.differencefiltered.min.date.getFullYear(), 
            false, // estimate
            serietooltipcallback);
        }));   
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
    
        let allseries = [diffserie, maxserie, minserie];
        allseries = allseries.concat(yearseries);
    
        const returnvalues: GraphSerie[] = allseries.map(serie => {
            return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
                    value: createGraphItem(value.date, value.value), 
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

    let yearlyminmaxvalues = yearlyarrangeddata.map(y => ({year: y.date.getFullYear(), high: 0, low: 0}));
    dailyminmaxtable.forEach(day => { 
        yearlyminmaxvalues[day.morning.max.date.getFullYear()].high++;
        yearlyminmaxvalues[day.evening.max.date.getFullYear()].high++;
        yearlyminmaxvalues[day.morning.min.date.getFullYear()].low++;
        yearlyminmaxvalues[day.evening.min.date.getFullYear()].low++;
    });

    let lastyearestimate: boolean = false;
    let highestimate = NaN;
    let lowestimage = NaN;
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
    const highserie = createReturnDataType('Ylin', yearlyminmaxvalues.map((value, index) => {
        return createReturnDataValue(new Date(value.year, 0, 1), value.high, value.year, 
        (index == yearlyminmaxvalues.length-1 && lastyearestimate) ? true : false, // estimate
        serietooltipcallback, {seriename: 'Ylin'});
    }));   
    const lowserie = createReturnDataType('Alin', yearlyminmaxvalues.map((value, index) => {
        return createReturnDataValue(new Date(value.year, 0, 1), value.low, value.year, 
        (index == yearlyminmaxvalues.length-1 && lastyearestimate) ? true : false, // estimate
        serietooltipcallback, {seriename: 'Alin'});
    }));   
    //---------------
    let hightrendserie: ReturnDataType = createReturnDataType('Ylimpien suuntaus', []);
    let hightrenddata = createTrendCalcTable(yearlyminmaxvalues.map(v => (createTrendCalcData(v.year, v.high))));
    const trendhigh = CFcalculateTrend([hightrenddata]);
    if (!isNaN(trendhigh.k) && !isNaN(trendhigh.b)) {
        hightrendserie = createReturnDataType(hightrendserie.name, yearlyminmaxvalues.map(value => {
            return createReturnDataValue(new Date(value.year, 0, 1), 
                trendhigh.k * value.year + trendhigh.b, value.year, 
                false, // estimate
                trendserietooltipcallback, {seriename: hightrendserie.name});
        }));  
    }
    //---------------
    let lowtrendserie: ReturnDataType = createReturnDataType('Alimpien suuntaus', []);
    let lowtrenddata = createTrendCalcTable(yearlyminmaxvalues.map(v => (createTrendCalcData(v.year, v.low))));
    const trendlow = CFcalculateTrend([lowtrenddata]);
    if (!isNaN(trendlow.k) && !isNaN(trendlow.b)) {
        lowtrendserie = createReturnDataType(lowtrendserie.name, yearlyminmaxvalues.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), 
            trendlow.k * value.year + trendlow.b, value.year, 
            false, // estimate
            trendserietooltipcallback, {seriename: lowtrendserie.name});
        }));  
    }
    //---------------
    const allseries = [lowserie, highserie, hightrendserie, lowtrendserie];
    const returnvalues: GraphSerie[] = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value), 
            tooltip: createTooltip(value),
        })), false, 0)
    })
    let estimateitems = [];
    allseries.forEach(serie => {
        if (serie.values && serie.values.length) {
            serie.values.map((value, index) => {
                if (value.estimate) {
                    estimateitems.push({
                        name: serie.name,
                        symbol: 'arrow',
                        symbolsize: 14, 
                        symbolindex: index,
                    })
                }
            })
        }
    });

    const params = {showlegend: true, series: estimateitems};

    return createGraphSerieType(returnvalues, params)
}
export function CFcalculateMonthlyAverages(): YearlyAveragesEstimates {
    const months = temperatureClass.yearlyMonthlyAverages.monthlydata;
    const years = temperatureClass.yearlyMonthlyAverages.yearlydata;
    let tempaverages = months.map(month => month.total.value);
    let diffvalues = months.map(month => month.difference.value);

    let yearlyMonthaverages: YearlyAverage[] = years.map(year => {
        return createYearlyAverage(year.year, year.yearlyaverage, year.yearlyaveragediff, year.months.map(month => {
            return createMonthlyAverage(month.averages.averagevalue, month.averages.difference.sum, month.estimate);
        }))
    })

    return createMonthlyAveragesEstimates(yearlyMonthaverages, createTempDiffTable(tempaverages, diffvalues));
}
export function CFcreateYearlyTrendSeriedata(): GraphSerieType {
    function serietooltipcallback(value: ReturnDataValue): string {
        return `${value.year} ${roundNumber(value.value, 1)}°C`;
    } 
    const years = temperatureClass.yearlyMonthlyAverages.yearlydata;
    const yeartemperatureserie = createReturnDataType('Lämpötila', years.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), 
            value.yearlyaverage, value.year, 
            false, // estimate
            serietooltipcallback);
    }));   
    const yeardiffserie = createReturnDataType('Illan ja aamun ero', years.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), 
            value.yearlyaveragediff, value.year, 
            false, // estimate
            serietooltipcallback);
    }));   

    // --------------------------
    // calculate temperature trend
    let trenddata = createTrendCalcTable(yeartemperatureserie.values.map(v => (createTrendCalcData(v.year, v.value))));
    const trend = CFcalculateTrend([trenddata]);
    let values = [];
    if (!(isNaN(trend.k) || isNaN(trend.b))) {
        values = yeartemperatureserie.values.map(val => ({
            year: val.year,
            value: val.year * trend.k + trend.b,
        }))
    }
    const trendserie = createReturnDataType(`Suuntaus ${trend.k>0?'+':'-'}${roundNumber(trend.k*10,1)} °C/10v`, values.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), 
            value.value, value.year, 
            false, // estimate
            serietooltipcallback);
    }));   
    // --------------------------
    // calculate difference trend
    let difftrenddata = createTrendCalcTable(yeardiffserie.values.map(v => (createTrendCalcData(v.year, v.value))));
    const difftrend = CFcalculateTrend([difftrenddata]);
    let diffvalues = [];
    if (!(isNaN(difftrend.k) || isNaN(difftrend.b))) {
        diffvalues = yeardiffserie.values.map(val => ({
            year: val.year,
            value: val.year * difftrend.k + difftrend.b,
        }))
    }
    const difftrendserie = createReturnDataType(`Erosuuntaus ${difftrend.k>0?'+':'-'}${roundNumber(difftrend.k*10,1)} °C/10v`, diffvalues.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), 
            value.value, value.year, 
            false, // estimate
            serietooltipcallback);
    }));   
    // --------------------------

    const allseries = [yeartemperatureserie, trendserie, yeardiffserie, difftrendserie];

    const returnvalues: GraphSerie[] = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value), 
            tooltip: createTooltip(value),
        })), false, 0)
    })

// !!!!!!!!!!!!!!!!!!!!!
// estimate for years

    let params = { rangeoffset: 1, showlegend: true };
    // if (!isNaN(lastyearestimate)) {
    //     params.series = [{ name: data[0].name, symbol: 'arrow', symbolsize: 14, symbolindex: 'last' }];
    // }
    return createGraphSerieType(returnvalues, params)

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
    let calctable: TrendCalcTable[] = monthlydata.map(month => {
        return createTrendCalcTable(month.data.map(data => 
            {
            return createTrendCalcData(data.year, data.value);
            }))
    })
    let trend = CFcalculateTrend(calctable);
    let newvalues = years.map((ser, serieindex) => ({ 
        value: createGraphItem(new Date(ser.year, 0, 1), isNaN(trend.k) ? NaN : ser.year * trend.k + trend.b), 
        tooltip: `${ser.year} Suuntaus ${isNaN(trend.k) ? '???' : roundNumber(ser.year * trend.k + trend.b, 1)}`
    }))
    if (isNaN(trend.k)) datavalues.push( createGraphSerie( `Trendi --- °C/10v`, 'location', 0, newvalues, true, -1));
    else datavalues.push( createGraphSerie( `Trendi ${trend.k > 0 ? '+' : ''}${roundNumber(trend.k * 10, 1)}°C/10v`, 'location', 0, newvalues, true, -1));

// !!!!!!!!!!!!!!!!!!!!!!
// estimate for months

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
    const yearlyarrangeddata = temperatureClass.getAllFilteredDataYearlyArranged();

    const minserie = createReturnDataType(`Matalin`,days.map(day => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, day.min.date.getMonth(), day.min.date.getDate()),
        day.min.value, day.min.date.getFullYear(), 
        false, // estimate
        serietooltipcallback) 
    }));   
    const maxserie = createReturnDataType(`Korkein`,days.map(day => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, day.max.date.getMonth(), day.max.date.getDate()),
        day.max.value, day.max.date.getFullYear(), 
        false, // estimate
        serietooltipcallback) 
    }));   
    const curyearno = new Date().getFullYear();

    const curyear = createReturnDataType(`Vuosi ${curyearno}`,yearlyarrangeddata[yearlyarrangeddata.length-1].values.map(day => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, day.date.getMonth(), day.date.getDate()),
        day.average, day.date.getFullYear(), 
        false, // estimate
        serietooltipcallback) 
    }));   

    const allseries = [minserie, maxserie, curyear];

    const returnvalues: GraphSerie[] = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value), 
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
    const monthstatistics = temperatureClass.yearlyMonthlyAverages.monthlydata;
    const yearsstatistics = temperatureClass.yearlyMonthlyAverages.yearlydata;
    const readings = temperatureClass.allFilteredDataYearlyArranged;

    const maxserie = createReturnDataType(`Korkein`,monthstatistics.map(month => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, month.date.getMonth(), month.date.getDate()),
        month.total.high, month.total.highdate.getFullYear(), 
        false, // estimate
        serietooltipcallback)
    }));       
    const minserie = createReturnDataType(`Matalin`,monthstatistics.map(month => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, month.date.getMonth(), month.date.getDate()),
        month.total.low, month.total.lowdate.getFullYear(), 
        false, // estimate
        serietooltipcallback)
    }));       

    let lastyear = 0;
    
    const allyears = yearsstatistics.map(year => {
        lastyear = year.year;
        let estimatedmonthindexes = [];
        const allmonths = createReturnDataType(`Vuosi ${year.year}`,year.months.map(month => {
            if (year.estimate && month.estimate) estimatedmonthindexes.push(month.monthno-1);

            return createReturnDataValue(new Date(temperatureClass.defaultyear, month.monthno-1, 1),
                month.averages.averagevalue, yearsstatistics[yearsstatistics.length-1].year, 
                month.estimate, // estimate
                serietooltipcallback) 
        }));      
        if (year.estimate && estimatedmonthindexes.length) {
            const thisyearreadings = readings[year.year];
            // update estimate values for months
            let yearsum = 0;
            let yearcount = 0;
            allmonths.values.forEach((month, monthindex) => {
                if (month.estimate) {
                    month.value = getEstimateForMonth(year.year, monthindex, thisyearreadings.values.filter(reading => reading.date.getMonth() == monthindex));
                }
                yearsum += month.value;
                yearcount++;
            })
            year.yearlyaverage = yearsum/yearcount;
        }       
        return allmonths;
    });       
    let estimateitems = [];
    let currentyear = new Date().getFullYear();
    let currentmonth = new Date().getMonth();
    allyears.forEach(serie => {
        if (serie.values && serie.values.length) {
            serie.values.map((value, index) => {
                if (value.estimate) {
                    if (value.year < currentyear || (value.year == currentyear && value.date.getMonth() <= currentmonth)) {
                        estimateitems.push({
                            name: serie.name,
                            symbol: 'arrow',
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
    const allseries: ReturnDataType[] = [minserie, maxserie];
    for (let i = 0; i < allyears.length; i++) allseries.push(allyears[i]);

    const returnvalues: GraphSerie[] = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value), 
            tooltip: createTooltip(value),
        })), false, 0)
    })

    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true, series: estimateitems, selection: [`Vuosi ${lastyear}`, 'Korkein', 'Matalin'] })    
}    

function getEstimateForMonth(year, monthindex, monthlyreadings) {
    // calculate estimation for month
    let dailyindex = 0;
    let estimationcount = 0;
    let estimationsum = 0;
    let countday = new Date(year, monthindex, 1);
    while (countday.getMonth() == monthindex) {
        let curdate = countday.getDate();
        if (dailyindex >= monthlyreadings.length || curdate < monthlyreadings[dailyindex].date.getDate()) {
            // get average temperature for curdate
            let datefound = temperatureClass.dailyValues.find(d => d.date.getMonth() == monthindex && d.date.getDate() == curdate);
            if (datefound) {
                estimationcount++;
                estimationsum += datefound.averagevalue;
            }
            else {
                console.log(`Estimate calculation for day: ${curdate} failed`)
            }
        }
        else {
            estimationcount++;
            estimationsum += monthlyreadings[dailyindex].average;
        }
        countday = new Date(year, monthindex, curdate + 1);

        while (dailyindex < monthlyreadings.length && curdate >= monthlyreadings[dailyindex].date.getDate()) {
            dailyindex++;
        }
    }
    return estimationsum / estimationcount;
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
