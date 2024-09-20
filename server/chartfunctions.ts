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
    morning: number;
    evening: number;
    date: Date;
    firstday: Date;
    lastday: Date;
}
function createHalfFilledFiltered(value: number, date: Date, first: Date, last: Date): Filtered {
    return {index: -1, value: value, morning: NaN, evening: NaN, date: date, firstday: first, lastday: last}
}
interface Temperature {
    date: Date;
    value: number;
    average: number;
}
interface TemperatureMsg {
    data: DbTemperature[];
    statusCode; number;
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
interface YearCalcValue {
    date: Date;
    day: number;
    month: number;
    morning: MinMaxCalc;
    evening: MinMaxCalc;
    difference: MinMaxCalc;
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

function createYearCalcValue(date: Date, day: number, month: number): YearCalcValue {
    return { 
        date: date,
        morning: createMinMaxCalcValue(), 
        evening: createMinMaxCalcValue(), 
        difference: createMinMaxCalcValue(), 
        day: day, month: month
    };
}
interface FilteredCalc {
    date: Date;
    day: number;
    month: number;
    morning: FilteredSum;
    evening: FilteredSum;
    total: FilteredSum;
}
function createFilteredCalc(date: Date): FilteredCalc {
    return {date: date, day: date.getDate(), month: date.getMonth() + 1, total: createFilteredSum(), morning: createFilteredSum(), evening: createFilteredSum()}
}
interface FilteredSum {
    sum: number;
    count: number;
    average: number;
    min: number;
    max: number;
    mindate: Date;
    maxdate: Date;
}
function createFilteredSum(): FilteredSum {
    return { min: 999999, max: -999999, mindate: null, maxdate: null, sum: 0, count: 0, average: NaN }
}

let dailyAveragesCalculated: {data: YearCalcValue[], year: number} = null;

export function getTempMinDefaultValue() {
    return TempMinDefaultValue;
}
export function getTempMaxDefaultValue() {
    return TempMaxDefaultValue;
}
export function filterSeriesTS(serie: Temperature[], filterlength: number): Filtered[] {
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
            for (let index: number = firstindex; index < lastindex; index++) {
                if (isNaN(serie[index].value)) dec++;
                else sum += serie[index].value;
            }
            return createHalfFilledFiltered( sum / (lastindex - firstindex - dec), ss.date, first, last );
        }
        return createHalfFilledFiltered( NaN, ss.date, null, null);
    })
    return filtered;
}

function increaseDayIndex(dayindex: number, yearindex: number, maxlen: number) {
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
        sums.push(createYearCalcValue(newdate, newdate.getDate(), newdate.getMonth() + 1));
    }
    return sums;
}
export function createSumTableTS(defaultyear: number): FilteredCalc[] {
    let sums: FilteredCalc[] = [];
    for (let dayindex: number = 0; dayindex < 366; dayindex++) {
        let newdate: Date = new Date(defaultyear, 0, dayindex + 1);
        sums.push(createFilteredCalc(newdate));
    }
    return sums;
}

export function getDailyFilteredMinMaxTS(filteredvalues: Filtered[], defaultyear: number): FilteredCalc[] {
    let sums = createSumTableTS(defaultyear);
    let index: number;
    for (index = 0; index < sums.length; index++) {
        let i = 0;
        while (i < filteredvalues.length) {
            if (sums[index].date.getDate() == filteredvalues[i].date.getDate() &&
                sums[index].date.getMonth() == filteredvalues[i].date.getMonth()) {
                if (!(isNaN(filteredvalues[i].value))) {
                    if (filteredvalues[i].value > sums[index].total.max) {
                        sums[index].total.max = filteredvalues[i].value;
                        sums[index].total.maxdate = filteredvalues[i].date;
                    }
                    if (filteredvalues[i].value < sums[index].total.min) {
                        sums[index].total.min = filteredvalues[i].value;
                        sums[index].total.mindate = filteredvalues[i].date;
                    }
                }
            }
            i++;
        }
    }
    return sums;
}

function findMin(dt: Date, serie: YearCalcValue[]): any  {
    let day = dt.getDate();
    let month = dt.getMonth() + 1;
    let value = serie.find(s => day == s.day && month == s.month);

    return value.morning.min < value.evening.min ? { value: value.morning.min, date: value.morning.mindate } : { value: value.evening.min, date: value.evening.mindate };
}
function findMax(dt: Date, serie: YearCalcValue[]): any {
    let day = dt.getDate();
    let month = dt.getMonth() + 1;
    let value = serie.find(s => day == s.day && month == s.month);

    return value.morning.max > value.evening.max ? { value: value.morning.max, date: value.morning.maxdate } : { value: value.evening.max, date: value.evening.maxdate };
}
// function getDate(date: string): Date | number{
//     if (date && date.length) return NaN;
//     let parts = date.split('/');
//     if (parts && parts.length === 3) {
//         return new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]));
//     }
//     return NaN;
// }

function roundNumber(value, num) {
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
interface GraphSerie {
    name: string;
    location: string;
    year: number;
    values: GraphChartData[];
}
function createGraphSerie(): GraphSerie {
    return {name: '', location: '', year: 0, values: []}
}

function getDateTxt(date: Date | number): string {
    if (typeof date !== "object") return '-??-';
    return (date && date !== undefined) ? `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}` : `-`;
}
function getDate(date: string): Date | number {
    if (!date) return NaN;
    let parts = date.split('/');
    if (parts && parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]));
    }
    return NaN;
}
function isNumeric(obj: any): boolean {
    return !Array.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
}

export function createLastYearsSeriedataTS(readings: DbData[], sums: YearCalcValue[]): GraphSerie[] {
    let data: GraphSerie[] = [];
    let morning: GraphSerie = createGraphSerie();
    let evening: GraphSerie = createGraphSerie();
    let minimum: GraphSerie = createGraphSerie();
    let maximum: GraphSerie = createGraphSerie();
    morning.values = readings.map((r: DbData) => ({
        value: createValue(r.datetimeLocal, r.morning),
        tooltip: `Aamu ${getDateTxt(r.datetimeLocal)} ${r.morning}`,
    }));
    //morning.location = series.data[0].info.location;
    morning.year = 0;
    morning.name = "Aamu";

    evening.values = readings.map((r: DbData) => ({
        value: createValue(r.datetimeLocal, r.evening),
        tooltip: `Ilta ${getDateTxt(r.datetimeLocal)} ${r.evening}`,
    }));
    //evening.location = morning.location;
    evening.year = 0;
    evening.name = "Ilta";

    // add minimum and maximum values to screen data
    maximum.values = morning.values.map(r => {
        let value = findMax(r.value[0], sums);
        return {
            value: createValue(r.value[0], value.value),
            tooltip: `Maksimi ${getDateTxt(value.date)} ${value.value}`,
        }
    });
    maximum.name = 'Maksimi';
    minimum.values = morning.values.map(r => {
        let value = findMin(r.value[0], sums);
        return {
            value: createValue(r.value[0], value.value),
            tooltip: `Minimi ${getDateTxt(value.date)} ${value.value}`,
        }
    });
    minimum.name = 'Minimi';

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
        for (let dayindex: number = 0; dayindex < series.data[yearindex].data.length; dayindex++) {
            const dayreadings: DbData = series.data[yearindex].data[dayindex];
            const dt: Date = new Date(dayreadings.datetimeUtc);
            const month = dt.getMonth() + 1;
            const day = dt.getDate();
            const foundsum = sums.find(s => s.day == day && s.month == month);
            if (foundsum) {
                if (dayreadings.morning !== undefined && isNumeric(dayreadings.morning)) {
                    foundsum.morning.count += 1;
                    foundsum.morning.sum += dayreadings.morning;
                    if (dayreadings.morning < foundsum.morning.min) {
                        foundsum.morning.min = dayreadings.morning;
                        foundsum.morning.mindate = dayreadings.datetimeLocal;
                    }
                    if (dayreadings.morning > foundsum.morning.max) {
                        foundsum.morning.max = dayreadings.morning;
                        foundsum.morning.maxdate = dayreadings.datetimeLocal;
                    }
                }
                if (dayreadings.evening !== undefined && isNumeric(dayreadings.evening)) {
                    foundsum.evening.count += 1;
                    foundsum.evening.sum += dayreadings.evening;
                    if (dayreadings.evening < foundsum.evening.min) {
                        foundsum.evening.min = dayreadings.evening;
                        foundsum.evening.mindate = dayreadings.datetimeLocal;
                    }
                    if (dayreadings.evening > foundsum.evening.max) {
                        foundsum.evening.max = dayreadings.evening;
                        foundsum.evening.maxdate = dayreadings.datetimeLocal;
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
    }
    if (!dailyAveragesCalculated) dailyAveragesCalculated = {data: sums, year: year};
    return sums;
}

interface TemmperatureValue {
    date: Date;
    value: number;
    average: number;
    morning: number;
    evening: number;
}
function createTemperatureValue(day: Date, value: number): TemmperatureValue {
    return { value: value, average: NaN, date: day, morning: NaN, evening: NaN }
}
export function createLinearContTableTS(series: TemperatureMsg) {
    let tbl:TemmperatureValue[] = [];
    for (let year: number = series.data[0].info.year; year <= series.data[series.data.length - 1].info.year; year++) {
        const lastday = year % 4 == 0 ? 366 : 365;
        for (let day: number = 1; day <= lastday; day++) tbl.push(createTemperatureValue(new Date(year, 0, day), NaN));
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
                                currindex++;
                            }
                        }
                    }
                }
            }
        }
    })
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

export function calculateMonthlyAveragesTS(series: TemperatureMsg): YearlyAverage[] {
    let months = series.data.map(yearserie => {
        let monthtbl = [];
        for (let i = 0; i < 12; i++) monthtbl.push({ morningsum: 0, morningcount: 0, eveningsum: 0, eveningcount: 0, count: 0, average: NaN});
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

    return months;
}

export function getDiffCurveDataTS(sums, lastyear, lastcurve) {
    let curves = [];
    curves.push({name: 'Keskiarvo', showyear: false,
        data: sums.map(daydata => ({value: daydata.difference.count > 0 ? daydata.difference.sum / daydata.difference.count : NaN, date1: daydata.date, date2: daydata.date}))})

    curves.push({name: 'Maksimi',  showyear: true,
        data: sums.map(daydata => ({value: daydata.difference.max, date1: daydata.date, date2: daydata.difference.maxdate}))});

    curves.push({name: 'Minimi',  showyear: true,
        data: sums.map(daydata => ({value: daydata.difference.min, date1: daydata.date, date2: daydata.difference.mindate}))});

    // use average value when showing single year
    curves.push({name: lastyear, showyear: true, 
        data: lastcurve.map(daydata => ({value: daydata.difference.average, date1: daydata.date, date2: daydata.difference.mindate}))});

    return curves;
}
// export function calculateDailyAverages(series) {
//     if (this.calculatedDailyAverages.length > 0) return this.calculatedDailyAverages;
//     let sums = createSumTableTS(this.defaultyear);
//     let dayindex;
//     let yearindex;
//     let currentday;
//     let currentdate;
//     let month;
//     let day;
//     for (yearindex = 0; yearindex < series.data.length; yearindex++) {
//         for (dayindex = 0; dayindex < series.data[yearindex].data.length; dayindex++) {
//             currentday = series.data[yearindex].data[dayindex];
//             currentdate = new Date(currentday.datetimeUtc);
//             month = currentdate.getMonth() + 1;
//             day = currentdate.getDate();
//             let daytoupdate = sums.find(s => s.day == day && s.month == month);
//             if (daytoupdate) {
//                 //kkk
//                 if (currentday.morning !== undefined && this.isNumeric(currentday.morning)) {
//                     daytoupdate.morning.count += 1;
//                     daytoupdate.morning.sum += currentday.morning;
//                     daytoupdate.total.count += 1;
//                     daytoupdate.total.sum += currentday.morning;
//                     if (currentday.morning < daytoupdate.morning.min) {
//                         daytoupdate.morning.min = currentday.morning;
//                         daytoupdate.morning.mindate = currentday.date;
//                     }
//                     if (currentday.morning > daytoupdate.morning.max) {
//                         daytoupdate.morning.max = currentday.morning;
//                         daytoupdate.morning.maxdate = currentday.date;
//                     }
//                 }
//                 if (currentday.evening !== undefined && this.isNumeric(currentday.evening)) {
//                     daytoupdate.evening.count += 1;
//                     daytoupdate.evening.sum += currentday.evening;
//                     daytoupdate.total.count += 1;
//                     daytoupdate.total.sum += currentday.evening;
//                     if (currentday.evening < daytoupdate.evening.min) {
//                         daytoupdate.evening.min = currentday.evening;
//                         daytoupdate.evening.mindate = currentday.date;
//                     }
//                     if (currentday.evening > daytoupdate.evening.max) {
//                         daytoupdate.evening.max = currentday.evening;
//                         daytoupdate.evening.maxdate = currentday.date;
//                     }
//                 }
//                 if (currentday.evening !== undefined && this.isNumeric(currentday.evening) &&
//                     currentday.morning !== undefined && this.isNumeric(currentday.morning)) {
//                     let value = (currentday.morning + currentday.evening) / 2;
//                     if (value < daytoupdate.total.min) {
//                         daytoupdate.total.min = value;
//                         daytoupdate.total.mindate = currentday.date;
//                     }
//                     if (value > daytoupdate.total.max) {
//                         daytoupdate.total.max = value;
//                         daytoupdate.total.maxdate = currentday.date;
//                     }
//                 }
//             }
//         }
//     }
//     for (dayindex = 0; dayindex < sums.length; dayindex++) {
//         if (sums[dayindex].morning.count > 0) {
//             sums[dayindex].morning.average = sums[dayindex].morning.sum / sums[dayindex].morning.count;
//         }
//         if (sums[dayindex].evening.count > 0) {
//             sums[dayindex].evening.average = sums[dayindex].evening.sum / sums[dayindex].evening.count;
//         }
//         if (sums[dayindex].total.count > 0) {
//             sums[dayindex].total.average = sums[dayindex].total.sum / sums[dayindex].total.count;
//         }
//     }
//     this.calculatedDailyAverages = sums;
//     return sums;
// }