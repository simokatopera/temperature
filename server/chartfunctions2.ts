const TempMinDefaultValue = 99999;
const TempMaxDefaultValue = -99999;

/*

- Alldata
    -month&year averages
        2001, average, 1..12aver
        2002,  ...
    -month&year trends
- Yearly data
    -day averages
    -month averages
    -month trends
- Alldata filtered


*/

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
interface FilteredNew {
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
function createFilteredNew(date: Date, morning: number, evening: number, average: number, difference: number,
    filteredmorning: number, filteredevening: number, filteredaverage: number, filtereddifference: number, 
    filterfirstday: Date, filterlastday: Date): FilteredNew {
    return {date: date, morning: morning, evening: evening, average: average, difference: difference, morningfiltered: filteredmorning, eveningfiltered: filteredevening, averagefiltered: filteredaverage,differencefiltered: filtereddifference, firstdayfilter: filterfirstday, lastdayfilter: filterlastday, index: 0}
}
function createDateOnlyFilteredNew(date: Date): FilteredNew {
    return {date: date, morning: NaN, evening: NaN, average: NaN, difference: NaN, morningfiltered: NaN, eveningfiltered: NaN, averagefiltered: NaN, differencefiltered: NaN, firstdayfilter: date, lastdayfilter: date, index: 0}
}
interface FilterValueNew {
    date: Date;
    average: number;
    morning: number;
    evening: number;
    difference: number;
}
function createFilteredValueNew(date: Date): FilterValueNew {
    return {date: date, morning: NaN, evening: NaN, average: NaN, difference: NaN}
}
// --------------------------------------------------------
interface AverageDataNew {
    year: number;
    location: string;
    averages: AverageNew;
    months: MonthAverageDataNew[]; // 12
}
function createAverageDataNew(year: number, location: string): AverageDataNew {
    return {year: year, location: location, averages: null, months: []}
}
interface AverageNew {
    morning: OneDayValuesNew;
    evening: OneDayValuesNew;
    difference: OneDayValuesNew;
    average: number;
}
function createAverageNew2(): AverageNew {
    return {morning: createOneDayValuesEmptyNew(), evening: createOneDayValuesEmptyNew(), average: 0, difference: createOneDayValuesEmptyNew()}
}
function createAverageNew(average: number,morning: OneDayValuesNew, evening: OneDayValuesNew, difference: OneDayValuesNew): AverageNew {
    return {average: average, morning: morning, evening: evening, difference: difference}
}
function calculateAverageNew(counter: AverageCounterNew): AverageNew {
    const morningvalue = counter.morning.count > 0 ? counter.morning.sum/counter.morning.count : NaN;
    const morningmin = createReadingDate(counter.morning.low, counter.morning.lowdate);
    const morningmax = createReadingDate(counter.morning.high, counter.morning.highdate);
    const morning = createOneDayValuesNew(counter.morning.count, morningvalue, morningmin, morningmax);

    const eveningvalue = counter.evening.count > 0 ? counter.evening.sum/counter.evening.count : NaN;
    const eveningmin = createReadingDate(counter.evening.low, counter.evening.lowdate);
    const eveningmax = createReadingDate(counter.evening.high, counter.evening.highdate);
    const evening = createOneDayValuesNew(counter.evening.count, eveningvalue, eveningmin, eveningmax);

    const differencevalue = counter.difference.count > 0 ? counter.difference.sum/counter.difference.count : NaN;
    const differencemin = createReadingDate(counter.difference.low, counter.difference.lowdate);
    const differencemax = createReadingDate(counter.difference.high, counter.difference.highdate);
    const difference = createOneDayValuesNew(counter.difference.count, differencevalue, differencemin, differencemax);

    let average = isNaN(morningvalue) || isNaN(eveningvalue) ? NaN : (morningvalue+eveningvalue)/2;

    let newitem = createAverageNew(average, morning, evening, difference);
    newitem.morning.max.value = counter.morning.high;
    newitem.morning.max.date = counter.morning.highdate;
    newitem.morning.min.value = counter.morning.low;
    newitem.morning.min.date = counter.morning.lowdate;
    newitem.evening.max.value = counter.evening.high;
    newitem.evening.max.date = counter.evening.highdate;
    newitem.evening.min.value = counter.evening.low;
    newitem.evening.min.date = counter.evening.lowdate;
    newitem.difference.max.value = counter.difference.high;
    newitem.difference.max.date = counter.difference.highdate;
    newitem.difference.min.value = counter.difference.low;
    newitem.difference.min.date = counter.difference.lowdate;

    return newitem;
}
interface MonthAverageDataNew {
    monthno: number;
    averages: AverageNew;
}
function createMonthAverageDataNew(monthno: number, averages: AverageNew): MonthAverageDataNew {
    return {monthno: monthno, averages: averages}
}
interface YearlySerieNew {
    data: YearlySerieDataNew[];
}    
interface YearlySerieDataNew {
    value: number;
    trend: number;
    estimate: boolean;
    estimatevalue: number;
    year: number;
}
interface MonthlyValueNew {
    monthno: number;
    morning: MonthlyStatisticsNew;
    evening: MonthlyStatisticsNew;
    difference: MonthlyStatisticsNew;
}
function createMonthlyValueNew(monthno: number): MonthlyValueNew {
    return {monthno: monthno, morning: createMonthlyStatisticsNew(), evening: createMonthlyStatisticsNew(), difference: createMonthlyStatisticsNew()};
}
interface MonthlyStatisticsNew {
    average: number;
    high: number;
    highdate: Date;
    low: number;
    lowdate: Date;
}
function setMonthlyStatisticsNew(dest: MonthlyStatisticsNew, source: HiLowNew) {
    dest.high = source.high;
    dest.highdate = source.highdate;
    dest.low = source.low;
    dest.lowdate = source.lowdate;
    dest.average = source.count > 0 ? source.sum/source.count : NaN;
}

function createMonthlyStatisticsNew(): MonthlyStatisticsNew {
    return {average: NaN, high: NaN, highdate: new Date(0), low: NaN, lowdate: new Date(0)};
}
// --------------------------------------------------------
interface DailyAverageDataNew {
    location: string;
    dayindex: number;
    date: Date;             // defaultyear
    averages: AverageNew[]; // 366
}
// --------------------------------------------------------
interface HiLowNew {
    sum: number;
    count: number;
    average: number;
    high: number;
    highdate: Date;
    low: number;
    lowdate: Date;
}
function createHiLowNew(): HiLowNew {
    return {sum: 0, count: 0, average: NaN, high: TempMaxDefaultValue, low: TempMinDefaultValue, highdate: new Date(0), lowdate: new Date(0)}
}
function fillHiLowNew(itemtofill: HiLowNew, sum: number, count: number, average: number, high: number, highdate: Date, low: number, lowdate: Date) {
    itemtofill.sum = sum;
    itemtofill.count = count;
    itemtofill.average = average;
    itemtofill.high = high;
    itemtofill.highdate = highdate;
    itemtofill.low = low;
    itemtofill.lowdate = lowdate;
}
interface HiLowYearlyNew {
    sum: number;
    count: number;
    average: number;
    high: number;
    highdate: Date;
    low: number;
    lowdate: Date;
    monthlyhigh: number;
    monthlyhighdate: Date;
    monthlylow: number;
    monthlylowdate: Date;
}
function createHiLowYearlyNew(): HiLowYearlyNew {
    return {sum: 0, count: 0, average: NaN, high: TempMaxDefaultValue, low: TempMinDefaultValue, highdate: new Date(0), lowdate: new Date(0),
        monthlyhigh: TempMaxDefaultValue, monthlylow: TempMinDefaultValue, monthlyhighdate: new Date(0), monthlylowdate: new Date(0) }
}
interface AverageCounterNew {
    year: number;
    monthno: number;
    morning: HiLowNew;
    evening: HiLowNew;
    difference: HiLowNew;
    total: HiLowNew;
}
function createAverageCounterNew(year: number, monthno: number): AverageCounterNew {
    return { year: year, morning: createHiLowNew(), evening: createHiLowNew(), difference: createHiLowNew(), total: createHiLowNew(), monthno: monthno }
}
interface AverageYearCounterNew {
    year: number;
    monthno: number;
    morning: HiLowYearlyNew;
    evening: HiLowYearlyNew;
    difference: HiLowYearlyNew;
}
function createAverageYearCounterNew(year: number, monthno: number): AverageYearCounterNew {
    return { year: year, monthno: monthno, morning: createHiLowYearlyNew(), evening: createHiLowYearlyNew(), difference: createHiLowYearlyNew() }
}
function createMonthAverageCountersNew(year: number): AverageCounterNew[] {
    let data: AverageCounterNew[] = [];
    for (let i = 0; i < 12; i++) data.push(createAverageCounterNew( year, i + 1));
    return data;
}
// --------------------------------------------------------
interface YearCalcValueNew {
    date: Date;
    day: number;
    month: number;
    morning: MinMaxCalcNew;
    evening: MinMaxCalcNew;
    difference: MinMaxCalcNew;
    total: MinMaxCalcNew;
}
function createYearCalcValueNew(date: Date, dayindex: number): YearCalcValueNew {
    return { 
        date: date,
        morning: createMinMaxCalcNew(), 
        evening: createMinMaxCalcNew(), 
        difference: createMinMaxCalcNew(), 
        total: createMinMaxCalcNew(), 
        day: date.getDate(), month: date.getMonth() + 1,
    };
}
interface MinMaxCalcNew {
    sum: number;
    count: number;
    average: number
    min: number;
    max: number;
    mindate: Date;
    maxdate: Date;
}
function createMinMaxCalcNew(): MinMaxCalcNew {
    return {sum: 0, count: 0, average: NaN, min: TempMinDefaultValue, max: TempMaxDefaultValue, mindate: new Date(0), maxdate: new Date(0)}
}
export function createDefaultYearTableNew(defaultyear: number): YearCalcValueNew [] {
    let sums: YearCalcValueNew[] = [];
    for (let dayindex = 0; dayindex < 366; dayindex++) {
        let newdate: Date = new Date(defaultyear, 0, dayindex + 1);
        sums.push(createYearCalcValueNew(newdate, dayindex));
    }
    return sums;
}
interface DailyValuesNew {
    date: Date;
    morning: OneDayValuesNew;
    evening: OneDayValuesNew;
    difference: OneDayValuesNew;
    total: OneDayValuesNew;
}
function createOneDayValuesNew(count: number, average: number, min: ReadingDate, max: ReadingDate): OneDayValuesNew {
    return {count: count, average: average, min: min, max: max}
}
function createDailyValuesNew(date: Date, morning: OneDayValuesNew, evening: OneDayValuesNew, difference: OneDayValuesNew, total: OneDayValuesNew): DailyValuesNew {
    return {date: date, morning: morning, evening: evening, difference: difference, total: total}
}
interface OneDayValuesNew {
    count: number;
    average: number
    min: ReadingDate;
    max: ReadingDate;
}
function createOneDayValuesEmptyNew(): OneDayValuesNew {
    return {count: 0, average: 0, min: createReadingDateEmpty(), max: createReadingDateEmpty()}
}
interface ReadingDate {
    value: number;
    date: Date;
}
function createReadingDateEmpty(): ReadingDate {
    return {value: 0, date: new Date(0)}
}
function createReadingDate(value: number, date: Date): ReadingDate {
    return {value: value, date: date}
}
// --------------------------------------------------------
interface GraphItemNew {
    value: [Date, number];
    tooltip: string
}  
function createGraphItemNew(d: Date, v: number): [Date, number] {
    return [d, v];
}
interface GraphSerieNew {
    name: string;
    location: string;
    year: number;
    values: GraphItemNew[];
    trend: boolean;
    index: number;
}
function createGraphSerieNew(name: string, location: string, year: number, values: GraphItemNew[], trend: boolean, index: number): GraphSerieNew {
    return {name: name, location: location, year: year, values: values, trend: trend, index: index}
}
export function roundNumber(value: any, num: number): string {
    if (isNumeric(value)) {
        if (typeof value === 'number') return value.toFixed(num);
        else return value;
    }
    if (isNaN(value)) return 'NaN';
    return 'kummaa'
}
export function isNumeric(obj: any): boolean {
    return !Array.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
}
export function calculateTrendTS(valuearray): {k: number, b: number} {
    let k = 0;
    let b = 0;
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
    k = (n * sumxy - sumx * sumy) / (n * sumxsqr - sumx * sumx);
    b = (sumy - k * sumx) / n;

    return { k, b }
}

// ========================================================================================
class Temperatures {
    //temperatures: TemperatureMsg;
    defaultyear: number = 1976;
    filterlength: number = 10;
    yearlyAverages: AverageDataNew[] = [];
    monthlyValues: MonthlyValueNew[] = [];
    filteredValues: FilteredNew[] = [];
    filteredValuesValid:  FilteredNew[] = [];
    dailyValues: DailyValuesNew[] = [];
    yearlyTrend: YearlySerieNew = null;
    constructor () {
    }
    getValidFilteredValues(): FilteredNew[] {
        if (this.filteredValuesValid.length == 0) {
            this.filteredValuesValid = this.filteredValues.filter(v => !(isNaN(v.morning) || isNaN(v.evening)));
            this.filteredValuesValid.forEach((fv,i) => fv.index = i)
        }
        return this.filteredValuesValid;
    }
    getMonthlyvaluesForYear(currentyear: DbTemperature): AverageCounterNew[] {
        let monthlycounters: AverageCounterNew[] = createMonthAverageCountersNew(currentyear.info.year);

        function updateHiLo(dest, newvalue, newdate) {
            let valueexists = false;
            if (!isNaN(newvalue) && newvalue !== undefined) {
                dest.sum += newvalue;
                dest.count++;
                if (newvalue > dest.high) {
                    dest.high = newvalue;
                    dest.highdate = newdate;
                }
                if (newvalue < dest.low) {
                    dest.low = newvalue;
                    dest.lowdate = newdate;
                }
                valueexists = true;
            }  
            return valueexists;
        }

        currentyear.data.forEach(dailytemp => {
            const month = dailytemp.datetimeLocal.getMonth();
            const morningvalueexists = updateHiLo(monthlycounters[month].morning, dailytemp.morning, dailytemp.datetimeLocal);
            const eveningvalueexists = updateHiLo(monthlycounters[month].evening, dailytemp.evening, dailytemp.datetimeLocal);
            if (eveningvalueexists && morningvalueexists) {
                const diff = (dailytemp.evening - dailytemp.morning);
                updateHiLo(monthlycounters[month].difference, diff, dailytemp.datetimeLocal);
            }
        })
        monthlycounters.forEach(month =>{
            month.morning.average = month.morning.count > 0 ? month.morning.sum / month.morning.count : NaN;
            month.evening.average = month.evening.count > 0 ? month.evening.sum / month.evening.count : NaN;
            month.difference.average = month.difference.count > 0 ? month.difference.sum / month.difference.count : NaN;
        })
        return monthlycounters;
    }
    updateCounters(counter: HiLowYearlyNew, sourcevalue: OneDayValuesNew, year: number, month: number): boolean {
        let status = false;
        if (!isNaN(sourcevalue.average)) {
            status = true;
            counter.count++;
            counter.sum += sourcevalue.average;
            if (sourcevalue.average > counter.monthlyhigh) {
                counter.monthlyhigh = sourcevalue.average;
                counter.monthlyhighdate = new Date(year, month-1, 1);
            }
            if (sourcevalue.average < counter.monthlylow) {
                counter.monthlylow = sourcevalue.average;
                counter.monthlylowdate = new Date(year, month-1, 1);
            }
            if (sourcevalue.max.value > counter.high) {
                counter.high = sourcevalue.max.value;
                counter.highdate = sourcevalue.max.date;
            }
            if (sourcevalue.min.value < counter.low) {
                counter.low = sourcevalue.min.value;
                counter.lowdate = sourcevalue.min.date;
            }            
        }
        return status;
    }
    updateYearCounters(yearcounters: AverageYearCounterNew[], monthlycounters: AverageCounterNew[]): MonthAverageDataNew[] {
        const counters = monthlycounters.map((counter, index) => {
            let averages: AverageNew = calculateAverageNew(counter);
            const morningstatus = this.updateCounters(yearcounters[index].morning, averages.morning, counter.year, counter.monthno);
            const everningstatus = this.updateCounters(yearcounters[index].evening, averages.evening, counter.year, counter.monthno);
            if (morningstatus && everningstatus) {
                this.updateCounters(yearcounters[index].difference, averages.difference, counter.year, counter.monthno);
            }
            return createMonthAverageDataNew(counter.monthno, averages);
        });
        // Calculate yearly averages
        
        return counters;
    }
    calculateYearlyAverages(temperatures: TemperatureMsg): CalculationResult {
        //let allYearsMonthlyAveragesHighsLows: AverageNew[] = createAverageNew2();
        let yearcounters = [1,2,3,4,5,6,7,8,9,10,11,12].map(m => (createAverageYearCounterNew(0, m)));
        const data: AverageDataNew[] = temperatures.data.map(currentyear => {

            const averagedata = createAverageDataNew(currentyear.info.year, currentyear.info.location);
            /*
            AverageDataNew
                year
                location
                averages: AverageNew
                months: MonthAverageDataNew[]
            */


            // calculate monthly values for current year
            let monthlycounters: AverageCounterNew[] = this.getMonthlyvaluesForYear(currentyear);
            // vuoden jokaisen kuukauden keskiarvot, korkeimmat ja matalimmat
            /*
            AverageCounterNew[12]
                year
                month
                morning: HiLowNew
                evening: HiLowNew
                difference: HiLowNew
                    sum, count, average, high, highdate, low, lowdate
            */

            // update yearcounters
            averagedata.months = this.updateYearCounters(yearcounters, monthlycounters);
            /*
            AverageYearCounterNew
                year
                monthno (1..12)
                morning: HiLowYearlyNew
                evening: HiLowYearlyNew
                difference: HiLowYearlyNew
                    sum, count, average, high, highdate, low, lowdate, monthlyhigh, monthlyhighdate, monthlylow, monthlylowdate

            MonthAverageDataNew[]
                monthno (1..12)
                averages: AverageNew
                    average
                    morning: OneDayValuesNew
                    evening: OneDayValuesNew
                    difference: OneDayValuesNew
                        count
                        average
                        min: ReadingDate
                            value, date
                        max: ReadingDate
            */


            // calculate yearly averages
            // for (let monthindex = 0; monthindex < 12; monthindex++) {
            //     updateHiLo(yearlyAverages.morning, monthlycounters[monthindex].morning);
            //     updateHiLo(yearlyAverages.evening, monthlycounters[monthindex].evening);
            //     updateHiLo(yearlyAverages.difference, monthlycounters[monthindex].difference);
            // }
            // averagedata.averages = yearlyAverages;

            // -----------------
            return averagedata;
        })
        this.yearlyAverages = data;
        // set monthly values
        // this.monthlyValues = [];
        // monthlyAverages.forEach(month => {
        //     const newmonth = createMonthlyValueNew(month.monthno);
        //     setMonthlyStatisticsNew(newmonth.morning, month.morning);
        //     setMonthlyStatisticsNew(newmonth.evening, month.evening);
        //     setMonthlyStatisticsNew(newmonth.difference, month.difference);
        //     this.monthlyValues.push(newmonth);
        // })

        return {status: 0, message: null, data: data};


        function updateHiLo(dest, source) {
            dest.average += source.average;
            dest.count++;
            dest.sum += source.sum;

            if (dest.high < source.high) {
                dest.high = source.high;
                dest.highdate = source.highdate;
            }
            if (dest.low > source.low) {
                dest.low = source.low;
                dest.lowdate = source.lowdate;
            }
        }
    }
    createLinearContTable(temperatures: TemperatureMsg): FilterValueNew[] {
        let lineartable:FilterValueNew[] = [];
        for (let year: number = temperatures.data[0].info.year; year <= temperatures.data[temperatures.data.length - 1].info.year; year++) {
            const lastday = year % 4 == 0 ? 366 : 365;
            for (let day: number = 1; day <= lastday; day++) lineartable.push(createFilteredValueNew(new Date(year, 0, day)));
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
                                    lineartable[currindex].average = value;
                                    lineartable[currindex].morning = yearserie.data[currdateindex].morning;
                                    lineartable[currindex].evening = yearserie.data[currdateindex].evening;
                                    lineartable[currindex].difference = yearserie.data[currdateindex].evening - yearserie.data[currdateindex].morning;;
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
        const filteredserie: FilterValueNew[] = this.createLinearContTable(temperatures);

        let firstindex: number = 0;
        let lastindex: number = 0;
        let negoffset: number = this.filterlength % 2 ? -this.filterlength / 2 + 0.5 : -this.filterlength / 2;
        let posoffset: number = negoffset + this.filterlength;
        let filtered: FilteredNew[] = filteredserie.map(ss => {
            if (!isNaN(ss.average)) {
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
                    if (isNaN(filteredserie[index].average)) dec++;
                    else sum += filteredserie[index].average;
                    if (isNaN(filteredserie[index].difference)) diffdec++;
                    else diffsum += filteredserie[index].difference;
                    if (isNaN(filteredserie[index].morning)) morningdec++;
                    else morningsum += filteredserie[index].morning;
                    if (isNaN(filteredserie[index].evening)) eveningdec++;
                    else eveningsum += filteredserie[index].evening;
                }
                let filteredmorning = (lastindex - firstindex - morningdec) > 0 ? morningsum / (lastindex - firstindex - morningdec) : NaN;
                let filteredevening = (lastindex - firstindex - eveningdec) > 0 ? eveningsum / (lastindex - firstindex - eveningdec) : NaN;
                let filteredaverage = (lastindex - firstindex - dec) > 0 ? sum / (lastindex - firstindex - dec) : NaN;
                let filtereddifference = (lastindex - firstindex - diffdec) > 0 ? diffsum / (lastindex - firstindex - diffdec) : NaN;

                return createFilteredNew(ss.date, ss.morning, ss.evening, !isNaN(ss.morning) && 
                    !isNaN(ss.evening) ? (ss.morning + ss.evening) / 2 : NaN,  
                    !isNaN(ss.morning) && !isNaN(ss.evening) ? (ss.evening - ss.morning) : NaN, 
                    filteredmorning, filteredevening, filteredaverage, filtereddifference, first, last);
            }
            return createDateOnlyFilteredNew(ss.date);
        })

        this.filteredValues = filtered;
        return {status: 0, message: null, data: filtered};
    }
    checkReading(value: number, date: Date, current: MinMaxCalcNew, total: MinMaxCalcNew): boolean {
        let valueok: boolean = false;
        if (!isNaN(value) && value !== undefined && isNumeric(value)) {
            valueok = true;
            current.count += 1;
            current.sum += value;
            if (value < current.min) {
                current.min = value;
                current.mindate = date;
                if (total && value < total.min) {
                    total.min = value;
                    total.mindate = date;
                }
            }
            if (value > current.max) {
                current.max = value;
                current.maxdate = date;
                if (total && value > total.max) {
                    total.max = value;
                    total.maxdate = date;
                }
            }
        }
        return valueok;
    }
    
    calculateDailyAverages(temperatures: TemperatureMsg, year: number = null): CalculationResult {
        let calculationtable: YearCalcValueNew[] = createDefaultYearTableNew(this.defaultyear);
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
                while (sumindex < calculationtable.length && (calculationtable[sumindex].day != day || calculationtable[sumindex].month != month)) sumindex++;
                if (sumindex < calculationtable.length) {
                    let foundsum = calculationtable[sumindex];
                    sumindex++;

                    const value1ok = this.checkReading(dayreadings.morning, dayreadings.datetimeLocal, foundsum.morning, foundsum.total);
                    const value2ok = this.checkReading(dayreadings.evening, dayreadings.datetimeLocal, foundsum.evening, foundsum.total);

                    if (value1ok && value2ok) {
                        let difference = dayreadings.evening - dayreadings.morning;
                        this.checkReading(difference, dayreadings.datetimeLocal, foundsum.difference, null);
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
        const returnvalue: DailyValuesNew[] = calculationtable.map(sum => {
            let morning: OneDayValuesNew = createOneDayValuesNew(sum.morning.count, sum.morning.average, { date: sum.morning.mindate, value: sum.morning.min }, { date: sum.morning.maxdate, value: sum.morning.max });
            let evening: OneDayValuesNew = createOneDayValuesNew(sum.evening.count, sum.evening.average, { date: sum.evening.mindate, value: sum.evening.min }, { date: sum.evening.maxdate, value: sum.evening.max });
            let difference: OneDayValuesNew = createOneDayValuesNew(sum.difference.count, sum.difference.average, { date: sum.difference.mindate, value: sum.difference.min }, { date: sum.difference.maxdate, value: sum.difference.max });
            let total: OneDayValuesNew = createOneDayValuesNew(sum.difference.count, sum.total.average, { date: sum.total.mindate, value: sum.total.min }, { date: sum.total.maxdate, value: sum.total.max });
            return createDailyValuesNew(sum.date, morning, evening, difference, total);
        })
        /*
        DailyValuesNew[0..365]
            date
            morning: OneDayValuesNew
            evening: OneDayValuesNew
            difference: OneDayValuesNew
            total: OneDayValuesNew
                count, average
                min: ReadingDate
                    value, date
                max: ReadingDate
                    value, date

        */
        this.dailyValues = returnvalue;
        return { status: 0, message: null, data: returnvalue };
    }
    
    calculateMonthlyTrends(temperatures: TemperatureMsg): CalculationResult {
        return { status: 0, message: null, data: null};
    }
    getEstimate(): number {
        return 0;
    }
    calculateYearlyTrend(temperatures: TemperatureMsg): CalculationResult {
        let yearlyaverages = this.yearlyAverages;
        let yearlyserie: YearlySerieNew = {
            data: yearlyaverages.map(val => ({
                value: NaN, //val.averages ? val.averages.morning.count == 12 ? val.averages.average : NaN : NaN,
                estimate: false, //val.averages ? val.averages.morning.count !== 12 : false,
                estimatevalue: NaN,
                trend: 0,
                year: val.year,
            })),
        }
        const trend = calculateTrendTS([yearlyserie]);
        if (!(isNaN(trend.k) || isNaN(trend.b))) {
            // update estimated values
            yearlyserie.data.forEach(yeardata => {
                if (yeardata.estimate) {
                    yeardata.estimatevalue = this.getEstimate();
                }
            })
            yearlyserie.data.forEach(ser => (
                ser.trend = ser.year * trend.k + trend.b
            ))
        }
        this.yearlyTrend = yearlyserie;
        return { status: 0, message: null, data: yearlyserie };
    }

    getMonthChartValues(): AverageCounterNew[] {
        let values: AverageCounterNew[] = this.monthlyValues.map(m => {
            let newvalue: AverageCounterNew = createAverageCounterNew(0, m.monthno);
            const high = (isNaN(m.morning.high) || isNaN(m.evening.high)) ? NaN : m.morning.high > m.evening.high ? m.morning.high : m.evening.high;
            const low = (isNaN(m.morning.low) || isNaN(m.evening.low)) ? NaN :  m.morning.low < m.evening.low ? m.morning.low : m.evening.low;
            const highdate =  (isNaN(m.morning.high) || isNaN(m.evening.high)) ? new Date(0) : m.morning.high > m.evening.high ? m.morning.highdate : m.evening.highdate;
            const lowdate = (isNaN(m.morning.low) || isNaN(m.evening.low)) ? new Date(0) : m.morning.low < m.evening.low ? m.morning.lowdate : m.evening.lowdate;
            fillHiLowNew(newvalue.total, NaN, NaN, NaN, high, highdate, low, lowdate);
            return newvalue;
        })
        let lastyear = this.yearlyAverages[this.yearlyAverages.length-1].months.map(m => ({
            month: m.monthno,
            value: m.averages.average
        }))
        return values;
        
    }
    getDefaultYear(): number {
        return this.defaultyear;
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
    data: GraphSerieNew[];
    params: any;
}
function createGraphSerieType(data: GraphSerieNew[], params: any): GraphSerieType {
    return {data: data, params: params}
}
interface ValueDate {
    date: Date;
    value: number;
}
function createValueDate(value: number): ValueDate {
    return {date: new Date(0), value: value}
}
interface StatValues {
    average: number;
    averagecount: number;
    averagesum: number;
    high: ValueDate;
    low: ValueDate;
}
function createStatValues() {
    return {average: NaN, averagecount: 0, averagesum: 0,
        high: createValueDate(TempMaxDefaultValue), low: createValueDate(TempMinDefaultValue)}
}
interface MinMaxDataType {
    date: number;
    month: number;
    morning: StatValues;
    evening: StatValues;
    average: StatValues;
    difference: StatValues;

    morningfiltered: StatValues;
    eveningfiltered: StatValues;
    averagefiltered: StatValues;
    differencefiltered: StatValues;
}
function createMinMaxDataType(date: number, month: number): MinMaxDataType {
    return {date: date, month: month, morning: createStatValues(), evening: createStatValues(), average: createStatValues(), difference: createStatValues(),
        morningfiltered: createStatValues(), eveningfiltered: createStatValues(), averagefiltered: createStatValues(), differencefiltered: createStatValues()
    }
}

//-------------------------------------------------------------------------------------------
// Local functions
//-------------------------------------------------------------------------------------------
function getFilteredDataYearlyArranged(data: FilteredNew[]): NameValues[] {
    let yearlydata: FilteredNew[][] = [];
    data.forEach(val => {
        const year = val.date.getFullYear();
        if (!yearlydata[year]) yearlydata[year] = [];
        yearlydata[year].push(val);
    })
    return yearlydata.map(yeardata => {
        return createNameValues(`Vuosi ${yeardata[0].date.getFullYear()}`, yeardata[0].date, yeardata.map(v => 
            createFilteredNew(v.date,v.morning,v.evening,v.average,v.difference,v.morningfiltered,v.eveningfiltered,
                v.averagefiltered,v.differencefiltered,v.firstdayfilter,v.lastdayfilter)))
    });
}
function getDateTxt(date) {
    if (date == null || date === undefined || isNaN(date)) {
        return '????';
    }
    return (date) ? `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}` : `-`;
}
//-------------------------------------------------------------------------------------------
// Exported functions
//-------------------------------------------------------------------------------------------
export function initTemperature() {
    temperatureClass = new Temperatures();
}

export function calculateTemperatures(temperaturevalues: TemperatureMsg) {
    const status1 = temperatureClass.calculateYearlyAverages(temperaturevalues); // this.YearlyAverages
    const status3 = temperatureClass.calculateFilteredValues(temperaturevalues); // this.filteredValues
    const status2 = temperatureClass.calculateDailyAverages(temperaturevalues);  // this.dailyValues
    const status5 = temperatureClass.calculateYearlyTrend(temperaturevalues);    // this.yearlyTrend

    // const status4 = temperatureClass.calculateMonthlyTrends(temperaturevalues);
}
export function getYearAverages() {
}

export function getAllReadings() {
    const values = temperatureClass.getValidFilteredValues();
    return {values: values.map(v => v), filtersize: temperatureClass.filterlength}
}

function createMinMaxDataTypeTable(): MinMaxDataType[] {
    let minmaxtable: MinMaxDataType[]  = [];
    for (let i = 0; i < 366; i++) {
        const d = new Date(temperatureClass.defaultyear, 0, i+1)
        minmaxtable.push(createMinMaxDataType(d.getDate(), d.getMonth()));
    }
    return minmaxtable;
}
interface NameValues {
    name: string;
    date: Date;
    values: FilteredNew[];
}
function createNameValues(name: string,date: Date, values: FilteredNew[]): NameValues {
    return {name: name, date: date, values: values}
}
export function createAllYearsFilteredSeriedata(): GraphSerieType {
    const alldata = temperatureClass.getValidFilteredValues();
    const yearlyarrangeddata = getFilteredDataYearlyArranged(alldata);

    let returnvalues: GraphSerieNew[] = yearlyarrangeddata.map(yeardata => {
        return createGraphSerieNew(yeardata.name, '',0, yeardata.values.map(value => ({
            value: createGraphItemNew(value.date, value.average), 
            tooltip: `${getDateTxt(value.date)} ${roundNumber(value.average, 1)}°C`,
        })), false, 0)
    })

    return createGraphSerieType(returnvalues, { series: [{ name: '', markersize: 1 }] });
}

function getDailyMinMaxValues(data: NameValues[]): MinMaxDataType[] {
    // find daily minimums and maximums
    const dailyminmaxtable = createMinMaxDataTypeTable();
    data.forEach(year => {
        let minmaxindex = 0;
        year.values.forEach(day => {
            const date = day.date.getDate();
            const month = day.date.getMonth();
            while (minmaxindex < dailyminmaxtable.length && (dailyminmaxtable[minmaxindex].month != month || dailyminmaxtable[minmaxindex].date != date)) minmaxindex++;
            if (minmaxindex < dailyminmaxtable.length) {
                updateMinMaxTable(dailyminmaxtable[minmaxindex].morning, day.morning, day.date);
                updateMinMaxTable(dailyminmaxtable[minmaxindex].evening, day.evening, day.date);
                updateMinMaxTable(dailyminmaxtable[minmaxindex].morningfiltered, day.morningfiltered, day.date);
                updateMinMaxTable(dailyminmaxtable[minmaxindex].eveningfiltered, day.eveningfiltered, day.date);
                updateMinMaxTable(dailyminmaxtable[minmaxindex].average, (day.morning+day.evening)/2, day.date);
                updateMinMaxTable(dailyminmaxtable[minmaxindex].averagefiltered, (day.eveningfiltered+day.morningfiltered)/2, day.date);
                updateMinMaxTable(dailyminmaxtable[minmaxindex].difference, (day.evening-day.morning), day.date);
                updateMinMaxTable(dailyminmaxtable[minmaxindex].differencefiltered, (day.eveningfiltered-day.morningfiltered), day.date);
            }
        })
    })
    function updateMinMaxTable(dest: StatValues, newvalue: number, newdate: Date) {
        dest.averagecount++;
        dest.averagesum += newvalue;
        dest.average = dest.averagesum/dest.averagecount;
        if (newvalue > dest.high.value) { 
            dest.high.value = newvalue; 
            dest.high.date = newdate; 
        }
        if (newvalue < dest.low.value) { 
            dest.low.value = newvalue; 
            dest.low.date = newdate; 
        }
    }
    return dailyminmaxtable;
}
export function createYearlyFilteredSeriedata(): GraphSerieType {
    const alldata = temperatureClass.getValidFilteredValues();
    const yearlyarrangeddata = getFilteredDataYearlyArranged(alldata);
    function serietooltipcallback(value: ReturnDataValue): string {
        return `${getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()))} ${roundNumber(value.value, 1)}°C`;
    }   
    let lastyear = alldata.length == 0 ? 0 : alldata[alldata.length - 1].date.getFullYear();
 
     let yearlydata: ReturnDataType[] = [];
    // add high and low curves to graphics
    const dailyminmaxtable = getDailyMinMaxValues(yearlyarrangeddata);
    yearlydata.push(createReturnDataType('Korkein', dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, minmax.month, minmax.date),
            minmax.averagefiltered.high.value, 
            minmax.averagefiltered.high.date.getFullYear(), 
            serietooltipcallback)
    })));
    yearlydata.push(createReturnDataType('Matalin', dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, minmax.month, minmax.date),
        minmax.averagefiltered.low.value, 
        minmax.averagefiltered.low.date.getFullYear(), 
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

    const returnvalues: GraphSerieNew[] = yearlydata.map(dd => {
        return createGraphSerieNew(dd.name, '',0, dd.values.map(value => ({
                value: createGraphItemNew(value.date, value.value), 
                tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0)
    })
    return createGraphSerieType(returnvalues, { showlegend: true, 
        selection: [`Vuosi ${lastyear}`, 'Korkein', 'Matalin'], series: [{ name: 'Matalin', color: '#777777' }, { 'name': 'Korkein', color: '#777777' }] });
}
function getReadingsBetween(startdate: Date, enddate: Date, readings: FilteredNew[]): FilteredNew[] {
    let retvalues = readings.map(val => val.date >= startdate && val.date <= enddate ? val : null).filter(v => v !== null);
    return retvalues;
}
export function createLastYearsSeriedata(): GraphSerieType {
    function serietooltipcallback(value: ReturnDataValue): string {
        return `${getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()))} ${roundNumber(value.value, 1)}°C`;
    } 
    const alldata = temperatureClass.getValidFilteredValues();
    const allvalues = getFilteredDataYearlyArranged(alldata);

    const dailyminmaxtable: MinMaxDataType[] = getDailyMinMaxValues(allvalues);

    const lastdate = allvalues[allvalues.length - 1].values[allvalues[allvalues.length - 1].values.length-1].date;
    const firstdate = new Date(lastdate.getFullYear() - 1, lastdate.getMonth(), lastdate.getDate());

    const readings: FilteredNew[] = temperatureClass.getValidFilteredValues();
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
    let dateindex = dailyminmaxtable.findIndex(item => item.date == firstdate.getDate() && item.month == firstdate.getMonth());
    if (dateindex >= 0) {
        while (dateindex < dailyminmaxtable.length) {
            const minmax = dailyminmaxtable[dateindex];
            const newitemmax = createReturnDataValue(new Date(startyear, minmax.month, minmax.date), 
                minmax.evening.high.value>minmax.morning.high.value?minmax.evening.high.value:minmax.morning.high.value, 
                minmax.evening.high.value>minmax.morning.high.date.getFullYear()?minmax.evening.high.value:minmax.morning.high.date.getFullYear(), 
                serietooltipcallback);
            maxdataarray.push(newitemmax);
            const newitemmin = createReturnDataValue(new Date(startyear, minmax.month, minmax.date), 
                minmax.evening.low.value<minmax.morning.low.value?minmax.evening.low.value:minmax.morning.low.value, 
                minmax.evening.low.value<minmax.morning.low.value?minmax.evening.low.date.getFullYear():minmax.morning.low.date.getFullYear(), 
                serietooltipcallback);
            mindataarray.push(newitemmin);

            dateindex++;
        }
    }

    let maxdata = dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(startyear+1, minmax.month, minmax.date), 
            minmax.evening.high.value>minmax.morning.high.value?minmax.evening.high.value:minmax.morning.high.value, 
            minmax.evening.high.value>minmax.morning.high.date.getFullYear()?minmax.evening.high.value:minmax.morning.high.date.getFullYear(), 
            serietooltipcallback);
        });
    maxdataarray = maxdataarray.concat(maxdata);
    const maxserie = createReturnDataType('Korkein', maxdataarray);

    const mindata = dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(startyear+1, minmax.month, minmax.date), 
        minmax.evening.low.value<minmax.morning.low.value?minmax.evening.low.value:minmax.morning.low.value, 
        minmax.evening.low.value<minmax.morning.low.value?minmax.evening.low.date.getFullYear():minmax.morning.low.date.getFullYear(), 
        serietooltipcallback);
    })
    mindataarray = mindataarray.concat(mindata);
    const minserie = createReturnDataType('Matalin', mindataarray);

    const allseries = [morningserie, eveningserie, maxserie, minserie];
    const returnvalues: GraphSerieNew[] = allseries.map(serie => {
        return createGraphSerieNew(serie.name, '', 0, serie.values.map(value => ({
                value: createGraphItemNew(value.date, value.value), 
                tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0)
    })
    return createGraphSerieType(returnvalues, { showlegend: true, 
        selection: [`Aamu`, 'Ilta', 'Korkein', 'Matalin'], series: [{ name: 'Matalin', color: '#777777' }, { 'name': 'Korkein', color: '#777777' }] });
}
export function createDailyDiffdata() {
    function serietooltipcallback(value: ReturnDataValue): string {
        let daytxt = isNaN(value.year) ? 
            `${value.date.getDate()}.${value.date.getMonth()+1}` : 
            getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()));
        return `${daytxt} ${roundNumber(value.value, 1)}°C`;
    } 
    const alldata = temperatureClass.getValidFilteredValues();
    const yearlyarrangeddata = getFilteredDataYearlyArranged(alldata);
    const dailyminmaxtable = getDailyMinMaxValues(yearlyarrangeddata);

    const diffserie = createReturnDataType('Keskiarvo', dailyminmaxtable.map(reading => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.month, reading.date), 
            reading.differencefiltered.average, NaN, serietooltipcallback);
        }));   
    const maxserie = createReturnDataType('Maksimi', dailyminmaxtable.map(reading => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.month, reading.date), 
            reading.differencefiltered.high.value, reading.differencefiltered.high.date.getFullYear(), serietooltipcallback);
        }));         
    const minserie = createReturnDataType('Minimi', dailyminmaxtable.map(reading => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.month, reading.date), 
            reading.differencefiltered.low.value, reading.differencefiltered.low.date.getFullYear(), serietooltipcallback);
        }));   
    const lastyear = yearlyarrangeddata[yearlyarrangeddata.length-1].values[yearlyarrangeddata[yearlyarrangeddata.length-1].values.length-1].date.getFullYear();
    const lastyearserie = createReturnDataType(lastyear.toString(), yearlyarrangeddata[yearlyarrangeddata.length-1].values.map(reading => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear,reading.date.getMonth(), reading.date.getDate()), 
            reading.differencefiltered, reading.date.getFullYear(), serietooltipcallback);
        }));

    const allseries = [diffserie, maxserie, minserie, lastyearserie];
    const returnvalues: GraphSerieNew[] = allseries.map(serie => {
        return createGraphSerieNew(serie.name, '', 0, serie.values.map(value => ({
                value: createGraphItemNew(value.date, value.value), 
                tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0)
    })
    let selection = '';
    const seriedata = {
        data: returnvalues,
        params: { showlegend: true, series: [{ name: 'Minimi', color: '#777777' }, { name: 'Maksimi', color: '#777777' }], selection: selection }
    };
    return seriedata;
}





export function createAllYearsMonthlyAverageSeriedata() {

    //const datavalues = createAllYearsMonthlySeriedataTS(series, this.calculated.monthlyaverages.values, this.defaultyear, this.monthnamesLong);

    // Kuukausittainen keskiarvo
    // Korkein Matalin 2024
    temperatureClass.getMonthChartValues();

    /*
    let valueshigh: GraphChartData[] = monthmonthlyhigh.map(high => ({
        value: createGraphItemNew(new Date(temperatureClass.getDefaultYear(), high.month, 1), high.value),
        tooltip: `Korkein ${high.year} ${monthnames[high.month]} ${roundNumber(high.value, 1)}`
    }))
    */
    let datavalues: GraphSerieNew[] = [];
    let valueshigh: GraphItemNew[] = [];

    //datavalues.push(createGraphSerieNew( 1, 'Korkein', '', valueshigh));
    //datavalues.push(createGraphSerie( 'Matalin', series.data[0].info.location, 0, valueslow, -1))
    //datavalues.push(createGraphSerie( monthly[monthly.length - 1].year.toString(), series.data[0].info.location, 0, valuesthisyear, -1))


    return {data: datavalues, params: {showlegend: true}};
}

