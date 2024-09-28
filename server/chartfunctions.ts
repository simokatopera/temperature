const TempMinDefaultValue = 99999;
const TempMaxDefaultValue = -99999;

interface FilteredReadings {
    filtersize: number;
    filtered: Filtered[];
    values: TemperatureValues[];
}
interface TemperatureValues {
    data: Reading[];
}
interface Reading {
    datetimeLocal: Date;
    morning: number;
    evening: number;
}
interface Filtered {
    index: number;
    value: number;
    diffvalue: number;
    morning: number;
    evening: number;
    date: Date;
    firstday: Date;
    lastday: Date;
    datetimeUtc: Date;
    datetimeLocal: Date;
}
function createHalfFilledFiltered(value: number, morning: number, evening: number, date: Date, first: Date, last: Date, diffvalue: number, datetimeUtc: Date, datetimeLocal: Date): Filtered {
    return {index: -1, morning: morning, evening: evening,value: value, date: date, firstday: first, lastday: last, diffvalue: diffvalue, datetimeUtc: datetimeUtc, datetimeLocal: datetimeLocal}
}
interface TemperatureMsg {
    data: DbTemperature[];
    statusCode: number;
    message: string;
}
export function createTemperatureMsg(): TemperatureMsg {
    return {data: [], statusCode: 0, message: ''}
}
interface DbTemperature {
    data: DbData[];
    info: Info;
}
interface Info {
    location: string;
    year: number;
}
export function createInfo(location: string, year: number): Info {
    return {location: location, year: year}
}
interface DbData {
    date: string;
    morning: number;
    evening: number;
    difference: number;
    datetimeLocal: Date;
    datetimeUtc: Date;
}
export function createDbData(date: string, morning: number, evening: number, difference: number, datetimeLocal: Date, datetimeUtc: Date): DbData {
     return {date: date, morning: morning, evening: evening, difference: difference, datetimeLocal: datetimeLocal, datetimeUtc: datetimeUtc}
}
interface YearCalcValue {
    date: Date;
    day: number;
    month: number;
    morning: MinMaxCalc;
    evening: MinMaxCalc;
    difference: MinMaxCalc;
    total: MinMaxCalc;
    dayindex: number;
}
interface MinMaxCalc {
    sum: number;
    count: number;
    average: number
    min: number;
    max: number;
    mindate: Date;
    maxdate: Date;
}
function createMinMaxCalcValue(): MinMaxCalc {
    return {sum: 0, count: 0, average: NaN, min: 999999, max: -999999, mindate: null, maxdate: null}
}

function createYearCalcValue(date: Date, dayindex: number): YearCalcValue {
    return { 
        date: date,
        morning: createMinMaxCalcValue(), 
        evening: createMinMaxCalcValue(), 
        difference: createMinMaxCalcValue(), 
        total: createMinMaxCalcValue(), 
        day: date.getDate(), month: date.getMonth() + 1,
        dayindex: dayindex,
    };
}

let dailyAveragesCalculated: {data: YearCalcValue[], year: number} = null;

export function getTempMinDefaultValue() {
    return TempMinDefaultValue;
}
export function getTempMaxDefaultValue() {
    return TempMaxDefaultValue;
}
export function filterSeriesTS(serie: TemperatureValue[], filterlength: number): Filtered[] {
    let firstindex: number = 0;
    let lastindex: number = 0;
    let negoffset: number = filterlength % 2 ? -filterlength / 2 + 0.5 : -filterlength / 2;
    let posoffset: number = negoffset + filterlength;
    let filtered: Filtered[] = serie.map(ss => {
        if (!isNaN(ss.value)) {
            let first = new Date(ss.date.getFullYear(), ss.date.getMonth(), ss.date.getDate() + negoffset);
            let last = new Date(ss.date.getFullYear(), ss.date.getMonth(), ss.date.getDate() + posoffset);
            while (firstindex < serie.length && serie[firstindex].date < first) firstindex++;
            while (lastindex < serie.length && serie[lastindex].date < last) lastindex++;
            let sum: number = 0;
            let dec: number = 0;
            let diffsum: number = 0;
            let diffdec: number = 0;
            for (let index: number = firstindex; index < lastindex; index++) {
                if (isNaN(serie[index].value)) dec++;
                else sum += serie[index].value;
                if (isNaN(serie[index].difference)) diffdec++;
                else diffsum += serie[index].difference;
            }
            return createHalfFilledFiltered( sum / (lastindex - firstindex - dec), ss.morning, ss.evening, ss.date, first, last, diffsum / (lastindex - firstindex - diffdec), ss.datetimeUtc, ss.datetimeLocal );
        }
        return createHalfFilledFiltered( NaN, NaN, NaN, ss.date, null, null, NaN, null, null);
    })
    return filtered;
}

function increaseDayIndex(dayindex: number, yearindex: number, maxlen: number): {a: number, b: number} {
    dayindex++;
    if (dayindex >= maxlen) {
        dayindex = 0;
        yearindex++;
    }
    let a = dayindex;
    let b = yearindex;
    return {a, b}
}

export function formatFilteredTableTS(readings: DbTemperature[], filtered: Filtered[]): Filtered[] {
    let index: number;
    let dayindex: number = 0;
    let yearindex: number = 0;
    for (index = 0; index < filtered.length && yearindex < readings.length; index++) {
        if (filtered[index].date < readings[yearindex].data[dayindex].datetimeLocal) {
            filtered[index].morning = NaN;
            filtered[index].evening = NaN;
        }
        else {
            let y1 = filtered[index].date.getFullYear();
            let m1 = filtered[index].date.getMonth();
            let d1 = filtered[index].date.getDate();
            let y2 = readings[yearindex].data[dayindex].datetimeLocal.getFullYear();
            let m2 = readings[yearindex].data[dayindex].datetimeLocal.getMonth();
            let d2 = readings[yearindex].data[dayindex].datetimeLocal.getDate();

            if (y1 == y2 && m1 == m2 && d1 == d2) {
                filtered[index].morning = readings[yearindex].data[dayindex].morning;
                filtered[index].evening = readings[yearindex].data[dayindex].evening;
                let {a, b} = increaseDayIndex(dayindex, yearindex, readings[yearindex].data.length);
                dayindex = a;
                yearindex = b;
            }
            else {
                while (yearindex < readings.length && dayindex < readings[yearindex].data.length) {
                    filtered[index].morning = NaN;
                    filtered[index].evening = NaN;
                    let {a, b} = increaseDayIndex(dayindex, yearindex, readings[yearindex].data.length);
                    dayindex = a;
                    yearindex = b;
                }
            }
        }
    }
    filtered = filtered.reverse();
    // remove empty values from the beginning and end
    index = 0;
    while (index < filtered.length && isNaN(filtered[index].value)) index++;
    if (index > 0) filtered.splice(0, index);
    index = filtered.length - 1;
    while (index < filtered.length && isNaN(filtered[index].value)) index--;
    if (index > 0) filtered.splice(index + 1);
    // add index
    filtered.forEach((r, i) => {r.index = i;});

    return filtered;
}

export function getReadingsBetweenTS(startdate: Date, enddate: Date, series: TemperatureMsg): DbData[] {
    if (startdate >= enddate) return [];

    const startyear: number = startdate.getFullYear();
    const endyear: number = enddate.getFullYear();

    let startyearindex: number = 0;
    while (series.data[startyearindex].info.year < startyear) startyearindex++;
    let endyearindex: number = startyearindex;
    while (series.data[endyearindex].info.year < endyear) endyearindex++;

    let startdayindex: number = 0;
    while (series.data[startyearindex].data[startdayindex].datetimeLocal < startdate) startdayindex++;
    let enddayindex: number = 0;
    while (series.data[endyearindex].data[enddayindex].datetimeLocal < enddate) enddayindex++;
    let yearindex: number;
    let dayindex: number;
    let firstindex = startdayindex;
    let readings: DbData[] = [];
    for (yearindex = startyearindex; yearindex <= endyearindex; yearindex++) {
        for (dayindex = firstindex; startyearindex === endyearindex ? dayindex < enddayindex : dayindex < series.data[yearindex].data.length; dayindex++) {
            readings.push(series.data[yearindex].data[dayindex]);
        }
        firstindex = 0;
    }
    return readings;
}
export function createDefaultYearTable(defaultyear: number): YearCalcValue [] {
    let sums: YearCalcValue[] = [];
    for (let dayindex = 0; dayindex < 366; dayindex++) {
        let newdate: Date = new Date(defaultyear, 0, dayindex + 1);
        sums.push(createYearCalcValue(newdate, dayindex));
    }
    return sums;
}
export function createSumTableTS(defaultyear: number): YearCalcValue[] {
    let sums: YearCalcValue[] = [];
    for (let dayindex: number = 0; dayindex < 366; dayindex++) {
        let newdate: Date = new Date(defaultyear, 0, dayindex + 1);
        sums.push(createYearCalcValue(newdate, dayindex));
    }
    return sums;
}

export function getDailyFilteredMinMaxTS(filteredvalues: Filtered[], defaultyear: number): YearCalcValue[] {
    let sums = createSumTableTS(defaultyear);
    sums.forEach((s) => {
        filteredvalues.forEach((f) => {
            if (s.date.getDate() == f.date.getDate() &&
                s.date.getMonth() == f.date.getMonth()) {
                if (!(isNaN(f.value))) {
                    if (f.value > s.total.max) {
                        s.total.max = f.value;
                        s.total.maxdate = f.date;
                    }
                    if (f.value < s.total.min) {
                        s.total.min = f.value;
                        s.total.mindate = f.date;
                    }
                }
                if (!(isNaN(f.diffvalue))) {
                    if (f.diffvalue > s.difference.max) {
                        s.difference.max = f.diffvalue;
                        s.difference.maxdate = f.date;
                    }
                    if (f.diffvalue < s.difference.min) {
                        s.difference.min = f.diffvalue;
                        s.difference.mindate = f.date;
                    }
                }
            }
        })
    })    
    return sums;
}
interface ValueDatePair {
    value: number;
    date: Date;
}
function findMin(dt: Date, serie: YearCalcValue[]): ValueDatePair  {
    let day = dt.getDate();
    let month = dt.getMonth() + 1;
    let value = serie.find(s => day == s.day && month == s.month);

    return value.morning.min < value.evening.min ? { value: value.morning.min, date: value.morning.mindate } : { value: value.evening.min, date: value.evening.mindate };
}
function findMax(dt: Date, serie: YearCalcValue[]): ValueDatePair {
    let day = dt.getDate();
    let month = dt.getMonth() + 1;
    let value = serie.find(s => day == s.day && month == s.month);

    return value.morning.max > value.evening.max ? { value: value.morning.max, date: value.morning.maxdate } : { value: value.evening.max, date: value.evening.maxdate };
}

export function roundNumber(value: any, num: number): string {
    if (isNumeric(value)) {
        if (typeof value === 'number') return value.toFixed(num);
        else return value;
    }
    if (isNaN(value)) return 'NaN';
    return 'kummaa'
}
interface GraphChartData {
    value: any[2];
    tooltip: string
}   
function createValue(d: Date, v: number): [Date, number] {
    return [d, v];
}
export function createReturnValue(d: Date, s: string): [Date, string] {
    return [d, s]
}
interface GraphSerie {
    name: string;
    location: string;
    year: number;
    values: GraphChartData[];
}
function createGraphSerieEmpty(): GraphSerie {
    return {name: '', location: '', year: 0, values: []}
}
export function createGraphSerie(name: string, location: string, year: number, values: GraphChartData[]): GraphSerie {
    return {name: name, location: location, year: year, values: values}
}

// function getDateTxt(date: Date | number): string {
//     if (typeof date !== "object") return '-??-';
//     return (date && date !== undefined) ? `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}` : `-`;
// }
function getDateTxt(date: Date, daymonth: boolean): string {
    if (!date) return '???';
    if (typeof date !== "object") return '-??-';
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if (daymonth === true) return `${day}.${month}`;
    return `${day}.${month}.${date.getFullYear()}`;
}
function getDate(date: string): Date | number {
    if (!date) return NaN;
    let parts = date.split('/');
    if (parts && parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]));
    }
    return NaN;
}
export function isNumeric(obj: any): boolean {
    return !Array.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
}

export function createLastYearsSeriedataTS(readings: DbData[], sums: YearCalcValue[], location: string): GraphSerie[] {
    let data: GraphSerie[] = [];
    const year = readings[readings.length-1].datetimeLocal.getFullYear();
    let morning: GraphSerie = createGraphSerie('Aamu', location, year, readings.map((r: DbData) => ({
        value: createValue(r.datetimeLocal, r.morning),
        tooltip: `Aamu ${getDateTxt(r.datetimeLocal, false)} ${r.morning}`,
    })));

    let evening: GraphSerie = createGraphSerie('llta', location, year, readings.map((r: DbData) => ({
        value: createValue(r.datetimeLocal, r.evening),
        tooltip: `Ilta ${getDateTxt(r.datetimeLocal, false)} ${r.evening}`,
    })));
    let maximum: GraphSerie = createGraphSerie('Maksimi', location, year, morning.values.map(r => {
        let value = findMax(r.value[0], sums);
        return {
            value: createValue(r.value[0], value.value),
            tooltip: `Maksimi ${getDateTxt(value.date, false)} ${value.value}`,
        }
    }) );
    let minimum: GraphSerie = createGraphSerie('Minimi', location, year, morning.values.map(r => {
        let value = findMin(r.value[0], sums);
        return {
            value: createValue(r.value[0], value.value),
            tooltip: `Minimi ${getDateTxt(value.date, false)} ${value.value}`,
        }
    }));

    data = [morning, evening, minimum, maximum];

    return data;
}

export function calculateDailyAveragesTS(series: TemperatureMsg, defaultyear: number, year: number = null): YearCalcValue[] {
    if (dailyAveragesCalculated && dailyAveragesCalculated.year == year) return dailyAveragesCalculated.data;
    let sums: YearCalcValue[] = createDefaultYearTable(defaultyear);
    let firstindex = 0;
    let lastindex = series.data.length;
    if (year) {
        let i: number = 0;
        while (i < series.data.length && series.data[i].info.year != year) i++;
        firstindex = i;
        lastindex = firstindex + 1;
    }
    for (let yearindex: number = firstindex; yearindex < lastindex; yearindex++) {
        let sumindex = 0;
        for (let dayindex: number = 0; dayindex < series.data[yearindex].data.length; dayindex++) {
            const dayreadings: DbData = series.data[yearindex].data[dayindex];
            const dt: Date = new Date(dayreadings.datetimeLocal);
            const month = dt.getMonth() + 1;
            const day = dt.getDate();
            // which is faster ------
            //const foundsum = sums.find(s => s.day == day && s.month == month);
            let foundsum;
            while (sumindex < sums.length && (sums[sumindex].day != day || sums[sumindex].month != month)) {
                sumindex++;
            }
            if (sumindex < sums.length) foundsum = sums[sumindex];
            // ---------
            if (foundsum) {
                sumindex++;
                if (dayreadings.morning !== undefined && isNumeric(dayreadings.morning)) {
                    foundsum.morning.count += 1;
                    foundsum.morning.sum += dayreadings.morning;
                    if (dayreadings.morning < foundsum.morning.min) {
                        foundsum.morning.min = dayreadings.morning;
                        foundsum.morning.mindate = dayreadings.datetimeLocal;
                        if (dayreadings.morning < foundsum.total.min) {
                            foundsum.total.min = dayreadings.morning;
                            foundsum.total.mindate = dayreadings.datetimeLocal;
                        }
                    }
                    if (dayreadings.morning > foundsum.morning.max) {
                        foundsum.morning.max = dayreadings.morning;
                        foundsum.morning.maxdate = dayreadings.datetimeLocal;
                        if (dayreadings.morning > foundsum.total.max) {
                            foundsum.total.max = dayreadings.morning;
                            foundsum.total.maxdate = dayreadings.datetimeLocal;
                        }
                    }
                }
                if (dayreadings.evening !== undefined && isNumeric(dayreadings.evening)) {
                    foundsum.evening.count += 1;
                    foundsum.evening.sum += dayreadings.evening;
                    if (dayreadings.evening < foundsum.evening.min) {
                        foundsum.evening.min = dayreadings.evening;
                        foundsum.evening.mindate = dayreadings.datetimeLocal;
                        if (dayreadings.evening < foundsum.total.min) {
                            foundsum.total.min = dayreadings.evening;
                            foundsum.total.mindate = dayreadings.datetimeLocal;
                        }
                    }
                    if (dayreadings.evening > foundsum.evening.max) {
                        foundsum.evening.max = dayreadings.evening;
                        foundsum.evening.maxdate = dayreadings.datetimeLocal;
                        if (dayreadings.evening > foundsum.total.max) {
                            foundsum.total.max = dayreadings.evening;
                            foundsum.total.maxdate = dayreadings.datetimeLocal;
                        }
                    }

                }
                if (dayreadings.evening !== undefined && isNumeric(dayreadings.evening) &&
                    dayreadings.morning !== undefined && isNumeric(dayreadings.morning)) {
                    let value = dayreadings.evening - dayreadings.morning;
                    foundsum.difference.count++;
                    foundsum.difference.sum += value;
                    if (value < foundsum.difference.min) {
                        foundsum.difference.min = value;
                        foundsum.difference.mindate = dayreadings.datetimeLocal;
                    }
                    if (value > foundsum.difference.max) {
                        foundsum.difference.max = value;
                        foundsum.difference.maxdate = dayreadings.datetimeLocal;
                    }
                }
            }
        }
    }
    for (let dayindex: number = 0; dayindex < sums.length; dayindex++) {
        if (sums[dayindex].morning.count > 0) {
            sums[dayindex].morning.average = sums[dayindex].morning.sum / (sums[dayindex].morning.count > 0 ? sums[dayindex].morning.count : 1);
        }
        if (sums[dayindex].evening.count > 0) {
            sums[dayindex].evening.average = sums[dayindex].evening.sum / (sums[dayindex].evening.count > 0 ? sums[dayindex].evening.count : 1);
        }
        if (sums[dayindex].difference.count > 0) {
            sums[dayindex].difference.average = sums[dayindex].difference.sum / (sums[dayindex].difference.count > 0 ? sums[dayindex].difference.count : 1);
        }
        if (sums[dayindex].morning.count > 0 && sums[dayindex].evening.count > 0) {
            sums[dayindex].total.average = (sums[dayindex].morning.average + sums[dayindex].evening.average)/2;
        }
    }
    if (!dailyAveragesCalculated) dailyAveragesCalculated = {data: sums, year: year};
    return sums;
}

interface TemperatureValue {
    date: Date;
    value: number;
    average: number;
    morning: number;
    evening: number;
    difference: number;
    datetimeUtc: Date;
    datetimeLocal: Date;
}
function createTemperatureValue(day: Date, value: number, datetimeUtc: Date, datetimeLocal: Date): TemperatureValue {
    return { value: value, average: NaN, date: day, morning: NaN, evening: NaN, difference: NaN, datetimeUtc: datetimeUtc, datetimeLocal: datetimeLocal}
}
let linearContTableCreated = [];

export function createLinearContTableTS(series: TemperatureMsg): TemperatureValue[] {
    if (linearContTableCreated.length) return linearContTableCreated;
    let tbl:TemperatureValue[] = [];
    for (let year: number = series.data[0].info.year; year <= series.data[series.data.length - 1].info.year; year++) {
        const lastday = year % 4 == 0 ? 366 : 365;
        for (let day: number = 1; day <= lastday; day++) tbl.push(createTemperatureValue(new Date(year, 0, day), NaN, null, null));
    }
    let currindex: number = 0;
    series.data.forEach((yearserie: DbTemperature) => {
        while (currindex < tbl.length && tbl[currindex].date.getFullYear() < yearserie.info.year) currindex++;
        if (currindex < tbl.length) {
            for (let currdateindex: number = 0; currdateindex < yearserie.data.length; currdateindex++) {
                if (yearserie.info.year === tbl[currindex].date.getFullYear()) {
                    const t = yearserie.data[currdateindex].datetimeLocal;
                    while (currindex < tbl.length && tbl[currindex].date < t) currindex++;
                    if (currindex < tbl.length) {
                        if (t.getDate() === tbl[currindex].date.getDate()) {
                            if (yearserie.data[currdateindex].evening !== undefined && yearserie.data[currdateindex].morning !== undefined) {
                                const value = (yearserie.data[currdateindex].evening + yearserie.data[currdateindex].morning) / 2;
                                tbl[currindex].value = value;
                                tbl[currindex].morning = yearserie.data[currdateindex].morning;
                                tbl[currindex].evening = yearserie.data[currdateindex].evening;
                                tbl[currindex].difference = yearserie.data[currdateindex].evening - yearserie.data[currdateindex].morning;;
                                tbl[currindex].datetimeUtc = yearserie.data[currdateindex].datetimeUtc;
                                tbl[currindex].datetimeLocal = yearserie.data[currdateindex].datetimeLocal;
                                currindex++;
                            }
                        }
                    }
                }
            }
        }
    })
    linearContTableCreated = tbl;
    return tbl;
}

interface YearlyAverage {
    monthcount: number;
    year: number;
    yearaverage: number;
    yearsum: number;
    months: MonthlyAverage[];
    estimate: boolean;
}
export function createYearlyAverage(year: number, monthcount: number, yearsum: number, yearaverage: number, months: MonthlyAverage[]): YearlyAverage {
    return {year: year, monthcount: monthcount, yearsum: yearsum, yearaverage: yearaverage, months: months, estimate: false}
}
interface MonthlyAverage {
    average: number;
}
export function calculateYearlyEstimatesTS(yearindexes: number[], years: YearlyAverage[]) {
    if (yearindexes.length) {
        let sum: number[]=[0,0,0,0,0,0,0,0,0,0,0,0];
        let count: number[]=[0,0,0,0,0,0,0,0,0,0,0,0];
        
        years.forEach(year => {
            for (let i: number = 0; i < year.months.length; i++) {
                if (!isNaN(year.months[i].average)) {
                    sum[i] += year.months[i].average;
                    count[i]++;
                }
            }
        })
        for (let index = 0; index < yearindexes.length; index++) {
            let msum = 0;
            let mcount = 0;
            years[yearindexes[index]].months.forEach((m, monthindex) => {
                mcount++;
                if (isNaN(m.average)) {
                    msum += count[monthindex] > 0 ? sum[monthindex]/count[monthindex] : 0;
                }
                else {
                    msum += m.average;
                }
            })
            years[yearindexes[index]].yearaverage = mcount > 0 ? msum/mcount: NaN;
            years[yearindexes[index]].estimate = true;
        }
    }
}

let monthlyAveragesTScalculated = [];

export function calculateMonthlyAveragesTS(series: TemperatureMsg): YearlyAverage[] {
    if (monthlyAveragesTScalculated.length) return monthlyAveragesTScalculated;
    let months = series.data.map(yearserie => {
        let monthtbl:YearDataValue[] = [];
        for (let i = 0; i < 12; i++) monthtbl.push(createYearDataValue(0));
        for (let i = 0; i < yearserie.data.length; i++) {
            let month = yearserie.data[i].datetimeLocal.getMonth();
            if (!isNaN(yearserie.data[i].morning) && yearserie.data[i].morning !== undefined) {
                monthtbl[month].morningsum += yearserie.data[i].morning;
                monthtbl[month].morningcount++;
            }
            if (!isNaN(yearserie.data[i].evening) && yearserie.data[i].evening !== undefined) {
                monthtbl[month].eveningsum += yearserie.data[i].evening;
                monthtbl[month].eveningcount++;
            }
        }
        let yearlysum = 0;
        let monthcount = 0;
        for (let i = 0; i < monthtbl.length; i++) {
            if (monthtbl[i].morningcount > 0 || monthtbl[i].eveningcount > 0) {
                monthcount++;
                let morning = monthtbl[i].morningsum/ (monthtbl[i].morningcount > 0 ? monthtbl[i].morningcount : 1)
                let evening = monthtbl[i].eveningsum/ (monthtbl[i].eveningcount > 0 ? monthtbl[i].eveningcount : 1);
                yearlysum += (morning + evening) / 2;
                monthtbl[i].average = (morning + evening)/2;
                monthtbl[i].count += monthtbl[i].eveningcount + monthtbl[i].morningcount;
            }
        }
        let data = createYearlyAverage(yearserie.info.year, monthcount, yearlysum, monthcount == 12 ? yearlysum/monthcount : NaN, 
                        monthtbl.map(m => ({average: m.average})));
        return data;
    })
    calculateYearlyEstimatesTS(months.map((y, i) => isNaN(y.yearaverage) ? i : -1).filter(v => v !== -1), months);
    monthlyAveragesTScalculated = months;
    return months;
}

interface DiffData {
    data: DiffValue[],
    name: string,
    showyear: boolean,
}
function createDiffData(name: string, showyear: boolean, data: DiffValue[]): DiffData {
    return {name: name, showyear: showyear, data: data}
}
interface DiffValue {
    date1: Date;
    date2: Date;
    value: number;
}
function createDiffValue(value: number, date1: Date, date2: Date): DiffValue {
    return {date1: date1, date2: date2, value: value}
}

export function getDiffCurveDataTS(allfiltered: Filtered[], sums: YearCalcValue[], lastyear: number, defaultyear: number, location: string): GraphSerie[] {
    let curves: DiffData[] = [];
    curves.push(createDiffData('Keskiarvo', false, sums.map(daydata => (
        createDiffValue(daydata.difference.count > 0 ? daydata.difference.sum / daydata.difference.count : NaN, daydata.date, daydata.date)
        ))));

    curves.push(createDiffData('Maksimi', true, sums.map(daydata => (
        createDiffValue(daydata.difference.max, daydata.date, daydata.difference.maxdate)
        ))));
    curves.push(createDiffData('Minimi', true, sums.map(daydata => (
        createDiffValue(daydata.difference.min, daydata.date, daydata.difference.mindate)
        ))));

    let lastyeardata = allfiltered.filter(f => {
        if (f.date.getFullYear() == lastyear) return f;
    })

    curves.push(createDiffData(`${lastyear.toString()} (suod)`, true, lastyeardata.map(daydata => (
        createDiffValue(daydata.diffvalue, new Date(defaultyear, daydata.date.getMonth(), daydata.date.getDate()), daydata.date)
        ))));
    let curvedata: GraphSerie[] = curves.map(c => ({
        values: c.data.map(d => ({
            value: [d.date1, d.value],
            tooltip: `${c.name} ${location} ${c.showyear==true ? getDateTxt(d.date2, false) : getDateTxt(d.date2, true)} ${roundNumber(d.value, 1)}°`,
        })),
        name: c.name,
        year: 0,
        location: location,
    }))

    return curvedata;
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
        values.data.forEach(reading => {
            if (!isNaN(reading.value)) {
                n++;
                sumx += reading.year;
                sumy += reading.value;
                sumxy += reading.value * reading.year;
                sumxsqr += reading.year * reading.year;
            }
        })
    })
    k = (n * sumxy - sumx * sumy) / (n * sumxsqr - sumx * sumx);
    b = (sumy - k * sumx) / n;

    return { k, b }
}
interface YearSum {
    year: number;
    sum: number;
    count: number;
}
export function getYearlyTrendTS(series: TemperatureMsg, monthlytrend: MonthDataPair[]): GraphSerie[] {
    let yearsums: YearSum[] = [];
    monthlytrend.forEach(month => {
        month.data.forEach((m, i) => {
            if (!yearsums[m.year]) yearsums[m.year] = {year: m.year, sum: 0, count: 0};
            yearsums[m.year].count++;
            yearsums[m.year].sum += m.value;
        })
    });
    let yearlyaverages = yearsums.map(y => (
        { value: createReturnValue(new Date(y.year, 0, 1), y.count == 12 ? roundNumber(y.sum/y.count, 2) : 'NaN'), 
            tooltip: `Vuosikeskiarvo ${y.year} ${y.count == 12 ? roundNumber(y.sum/y.count, 1): ''}` })
    )
    yearlyaverages = yearlyaverages.filter(val => val);
    let yearlyserie = {
        month: 0,
        data: yearlyaverages.map(val => ({
            month:0,
            value: Number(val.value[1]),
            year: Number(val.value[0].getFullYear()),
        })),
    }
    const trend = calculateTrendTS([yearlyserie]);
    let yearlytrend = series.data.map(ser => (
        { value: createReturnValue(new Date(ser.info.year, 0, 1), roundNumber(ser.info.year * trend.k + trend.b, 1)), 
            tooltip: `Suuntaus ${ser.info.year} ${roundNumber(ser.info.year * trend.k + trend.b, 1)}` })
    )
    const yearlyvalues = createGraphSerie(`Vuosikeskiarvo`, series.data[0].info.location, 0, yearlyaverages );
    const trendvalues = createGraphSerie(`Suuntaus ${trend.k > 0 ? '+' : ''}${roundNumber(trend.k * 10, 1)}°C/10v`, '', 0, yearlytrend);

    return [yearlyvalues, trendvalues];
}
export function getSeasonTrendsTS(series: TemperatureMsg, monthnumbers: number[], monthnames: string[], monthlytrends: MonthDataPair[]): GraphSerie[] {
    let datavalues: GraphSerie[] = [];
    monthlytrends.forEach(month => {
        if (month.month == monthnumbers[0] || month.month == monthnumbers[1] || month.month == monthnumbers[2]) {
            let values = month.data.map(value => (
                { value: [new Date(value.year, 0, 1), roundNumber(value.value, 2)], tooltip: `${value.year} ${value.month} ${roundNumber(value.value, 2)}` }
            ));
            datavalues.push( createGraphSerie( monthnames[datavalues.length], series.data[0].info.location, 0, values));
        }
    });
    let trend = calculateTrendTS([monthlytrends[monthnumbers[0] - 1], monthlytrends[monthnumbers[1] - 1], monthlytrends[monthnumbers[2] - 1]]);
    let newvalues = series.data.map((ser, serieindex) => (
        { value: [new Date(ser.info.year, 0, 1), roundNumber(ser.info.year * trend.k + trend.b, 2)], tooltip: `${ser.info.year} Suuntaus ${roundNumber(ser.info.year * trend.k + trend.b, 2)}` })
    )
    datavalues.push( createGraphSerie( `Trendi ${trend.k > 0 ? '+' : ''}${roundNumber(trend.k * 10, 1)}°C/10v`, series.data[0].info.location, 0, newvalues ));

    return datavalues;
}

export function createAllYearsMonthlySeriedataTS(series: TemperatureMsg, monthlyaverages: YearlyAverage[], defaultyear: number): GraphSerie[] {
    let monthly = monthlyaverages;
    // find highest and lowest months
    let monthhighest = [];
    let monthlowest = [];
    for (let index = 0; index < 12; index++) {
        monthhighest.push({ value: -9999, year: 0, month: 0, date: 0 });
        monthlowest.push({ value: 9999, year: 0, month: 0, date: 0 })
    }
    monthly.forEach(year => {
        year.months.forEach((m, i) => {
            if (m.average > monthhighest[i].value) { monthhighest[i].value = m.average, monthhighest[i].year = year.year, monthhighest[i].month = i };
            if (m.average < monthlowest[i].value) { monthlowest[i].value = m.average, monthlowest[i].year = year.year, monthlowest[i].month = i };
        })
    })
    let valueshigh: GraphChartData[] = monthhighest.map(high => ({
        value: [new Date(defaultyear, high.month, 1), high.value],
        tooltip: `Korkein ${getDateTxt(new Date(high.year, high.month, 1), false)} ${roundNumber(high.value, 1)}`
    }))

    let valueslow: GraphChartData[] = monthlowest.map(low => ({
        value: [new Date(defaultyear, low.month, 1), low.value],
        tooltip: `Matalin ${getDateTxt(new Date(low.year, low.month, 1), false)} ${roundNumber(low.value, 1)}`
    }))
    let valuesthisyear: GraphChartData[] = [];
    if (monthly[monthly.length - 1].year == new Date().getFullYear()) {
        valuesthisyear = monthly[monthly.length - 1].months.map((m, i) => ({
            value: [new Date(defaultyear, i, 1), m.average],
            tooltip: `Vuosi ${monthly[monthly.length - 1].year} ${getDateTxt(new Date(monthly[monthly.length - 1].year, i, 1), false)} ${roundNumber(m.average, 1)}`
        }));
    }
    let datavalues = [];
    datavalues.push(createGraphSerie( 'Korkein', series.data[0].info.location, 0,  valueshigh))
    datavalues.push(createGraphSerie( 'Matalin', series.data[0].info.location, 0, valueslow))
    datavalues.push(createGraphSerie( monthly[monthly.length - 1].year.toString(), series.data[0].info.location, 0, valuesthisyear ))

    return datavalues;
}

export function createAllYearsFilteredSerieTS(series: TemperatureMsg, filtered: Filtered[], defaultyear: number): GraphSerie[] {
    let valuearray: GraphSerie[] = [];
    let curryear: number = 0;
    filtered.forEach((f: Filtered) => {
        if (f.date.getFullYear() != curryear) {
            curryear = f.date.getFullYear();
            valuearray.push(createGraphSerie(curryear.toString(), series.data[0].info.location, curryear, []));
        }
        let dt = new Date(defaultyear, f.date.getMonth(), f.date.getDate());
        valuearray[valuearray.length - 1].values.push({ value: [dt, f.value], tooltip: `${getDateTxt(f.date, false)} ${roundNumber(f.value, 1)}` });
    })
    // add minimum and maximum values to screen data
    let minimum = createGraphSerie('Minimi', series.data[0].info.location, 0, []);
    let maximum = createGraphSerie('Maksimi', series.data[0].info.location, 0, []);
    let minmax = getDailyFilteredMinMaxTS(filtered, defaultyear);
    maximum.values = minmax.map(r => {
        return {
            value: [r.date, r.total.max],
            tooltip: `Maksimi ${getDateTxt(r.total.maxdate, false)} ${roundNumber(r.total.max, 1)}`,
        }
    });
    minimum.values = minmax.map(r => {
        return {
            value: [r.date, r.total.min],
            tooltip: `Minimi ${getDateTxt(r.total.mindate, false)} ${roundNumber(r.total.min, 1)}`,
        }
    });

    valuearray.push(minimum);
    valuearray.push(maximum);

    return valuearray;
}

export function createAllyearsAverageSerieTS(series: TemperatureMsg, sums: YearCalcValue[]): GraphSerie[] {
    let loc: string | null = null;
    for (let index = 0; index < series.data.length; index++) {
        if (series.data[index].info.location !== loc) {
            if (loc === null) loc = series.data[index].info.location;
            else loc = loc + ', ' + series.data[index].info.location;
        }
    }
    if (loc === null) loc = '';

    let valuearraymorning: GraphChartData[] = sums.map(s => ({
        value: [s.date, s.morning.average],
        tooltip: `Aamu ${getDateTxt(s.date, true)} ${roundNumber(s.morning.average, 2)}`,
    }))
    let valuearrayevening: GraphChartData[] = sums.map(s => ({
        value: [s.date, s.evening.average],
        tooltip: `Ilta ${getDateTxt(s.date, true)} ${roundNumber(s.evening.average, 2)}`,
    }))
    let valuearrayaverage: GraphChartData[] = sums.map(s => ({
        value: [s.date, (s.morning.average + s.evening.average)/2],
        tooltip: `Keskiarvo ${getDateTxt(s.date, true)} ${roundNumber((s.morning.average + s.evening.average)/2, 2)}`,
    }))
    let valuearrayhigh: GraphChartData[] = sums.map(s => ({
        value: [s.date, s.morning.max > s.evening.max ? s.morning.max : s.evening.max],
        tooltip: `Korkein ${getDateTxt(s.morning.max > s.evening.max ? s.morning.maxdate : s.evening.maxdate, false)} ${roundNumber(s.morning.max > s.evening.max ? s.morning.max : s.evening.max, 2)}`,
    }))
    let valuearraylow: GraphChartData[] = sums.map(s => ({
        value: [s.date, s.morning.min < s.evening.min ? s.morning.min : s.evening.min],
        tooltip: `Matalin ${getDateTxt(s.morning.min < s.evening.min ? s.morning.mindate : s.evening.mindate, false)} ${roundNumber(s.morning.min < s.evening.min ? s.morning.min : s.evening.min, 2)}`,
    }))
    let returnvalues1 = createGraphSerie( 'Aamu', loc, 0, valuearraymorning);
    let returnvalues2 = createGraphSerie( 'Ilta', loc, 0, valuearrayevening);
    let returnvalues3 = createGraphSerie( 'Keskiarvo', loc, 0, valuearrayaverage);
    let returnvalues4 = createGraphSerie( 'Korkein', loc, 0, valuearrayhigh);
    let returnvalues5 = createGraphSerie( 'Matalin', loc, 0, valuearraylow);

    return [returnvalues1, returnvalues2, returnvalues3, returnvalues4, returnvalues5];
}

let calculatedMonthlytrends = [];

interface YearData {
    year: number;
    data: YearDataValue[];
}
function createYearData(year: number): YearData {
    let data: YearDataValue[] = createYearDataValues();
    return {year: year, data: data}
}
interface YearDataValue {
    morningsum: number;
    morningcount: number;
    eveningsum: number;
    eveningcount: number;
    month: number;
    average: number;
    count: number;
}
function createYearDataValue(month: number): YearDataValue {
    return { morningsum: 0, morningcount: 0, eveningsum: 0, eveningcount: 0, month: month, average: NaN, count: 0 }
}
function createYearDataValues(): YearDataValue[] {
    let data = [];
    for (let i = 0; i < 12; i++) data.push(createYearDataValue(i + 1));
    return data;
}
interface MonthDataPair {
    month: number;
    data: ValueDataValue[]
}
function createMonthDataPair(month: number): MonthDataPair {
    return {month: month, data: []}
}
interface ValueDataValue {
    value: number;
    year: number;
    month: number;
}
function createValueDataValue(value: number, year: number, month: number): ValueDataValue {
    return {value: value, year: year, month: month}
}

export function calculateMonthlyTrendsTS(series: TemperatureMsg): MonthDataPair[] {
    if (calculatedMonthlytrends.length > 0) return calculatedMonthlytrends;

    let monthlyaverages: YearData[] = [];
    series.data.forEach((year, yearindex) => {
        monthlyaverages.push(createYearData(year.info.year));
        year.data.forEach(tempdata => {
            let d = getDate(tempdata.date);
            let monthindex = (typeof d === "number") ? 0 : d.getMonth();
            if (tempdata.morning !== undefined) {
                monthlyaverages[yearindex].data[monthindex].morningcount++;
                monthlyaverages[yearindex].data[monthindex].morningsum += tempdata.morning;
            }
            if (tempdata.evening !== undefined) {
                monthlyaverages[yearindex].data[monthindex].eveningcount++;
                monthlyaverages[yearindex].data[monthindex].eveningsum += tempdata.evening;
            }
        })
    });

    monthlyaverages.forEach(m => {
        m.data.forEach(d => {
            d.average = (d.morningsum / (d.morningcount > 0 ? d.morningcount : 1) + (d.eveningsum / (d.eveningcount > 0 ? d.eveningcount : 1))) / 2;
        })
    })

    let monthlytrenddata: MonthDataPair[] = [];
    for (let monthindex = 0; monthindex < 12; monthindex++) {
        monthlytrenddata.push(createMonthDataPair(monthindex + 1));
        monthlyaverages.forEach(year => {
            if (year.data[monthindex].eveningcount > 0 || year.data[monthindex].morningcount > 0) {
                let value = (year.data[monthindex].eveningsum + year.data[monthindex].morningsum) / (year.data[monthindex].eveningcount + year.data[monthindex].morningcount);
                monthlytrenddata[monthindex].data.push(createValueDataValue(value, year.year, monthindex + 1));
            }
        })
    }
    calculatedMonthlytrends = monthlytrenddata;

    return monthlytrenddata;
}
