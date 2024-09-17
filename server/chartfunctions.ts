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
interface FilteredCalc {
    date: Date;
    day: number;
    month: number;
    total: FilteredSum;
}
interface FilteredSum {
    min: number;
    max: number;
    mindate: Date;
    maxdate: Date;
}
function createFilteredSum(): FilteredSum {
    return { min: 999999, max: -999999, mindate: null, maxdate: null }
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
                dayindex++;
                if (dayindex >= readings[yearindex].data.length) {
                    dayindex = 0;
                    yearindex++;
                }
            }
            else {
                while (yearindex < readings.length && dayindex < readings[yearindex].data.length) {
                    filtered[index].morning = NaN;
                    filtered[index].evening = NaN;
                    dayindex++;
                    if (dayindex > readings[yearindex].data.length) {
                        dayindex = 0;
                        yearindex++;
                    }
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

export function getDailyFilteredMinMaxTS(filteredvalues: Filtered[], defaultyear: number) {
    let sums: FilteredCalc[] = [];
    let dayindex: number;
    let index: number;
    let value: FilteredCalc;
    for (dayindex = 0; dayindex < 366; dayindex++) {
        value = { date: new Date(defaultyear, 0, dayindex + 1), total: createFilteredSum(), day: 0, month: 0 };
        value.month = value.date.getMonth() + 1;
        value.day = value.date.getDate();
        sums.push(value);
    }
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

function findMin(dt, serie) {
    let day = dt.getDate();
    let month = dt.getMonth() + 1;
    let value = serie.find(s => day == s.day && month == s.month);

    return value.morning.min < value.evening.min ? { value: value.morning.min, date: value.morning.mindate } : { value: value.evening.min, date: value.evening.mindate };
}
function findMax(dt, serie) {
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

export function createLastYearsSeriedataTS(readings: DbData[], series, year: number, defaultyear: number): GraphSerie[] {
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
    morning.year = year;
    morning.name = "Aamu";

    evening.values = readings.map((r: DbData) => ({
        value: createValue(r.datetimeLocal, r.evening),
        tooltip: `Ilta ${getDateTxt(r.datetimeLocal)} ${r.evening}`,
    }));
    //evening.location = morning.location;
    evening.year = year;
    evening.name = "Ilta";

    // add minimum and maximum values to screen data
    let sums = calculateDailyAveragesTS(series, defaultyear);
    maximum.values = morning.values.map(r => {
        let value = findMax(r.value[0], sums);
        return {
            value: createValue(r.value[0], value.value),
            tooltip: `Maksimi ${getDateTxt(getDate(value.date))} ${value.value}`,
        }
    });
    maximum.name = 'Maksimi';
    minimum.values = morning.values.map(r => {
        let value = findMin(r.value[0], sums);
        return {
            value: createValue(r.value[0], value.value),
            tooltip: `Minimi ${getDateTxt(getDate(value.date))} ${value.value}`,
        }
    });
    minimum.name = 'Minimi';

    data = [morning, evening, minimum, maximum];

    return data;
}

function calculateDailyAveragesTS(series, defaultyear) {

    //if (this.calculatedDailyAverages.length > 0) return this.calculatedDailyAverages;
    let sums = [];
    let dayindex;
    let yearindex;
    let index;
    let value;
    for (dayindex = 0; dayindex < 366; dayindex++) {
        value = { date: new Date(defaultyear, 0, dayindex + 1), morning: { sum: 0, count: 0, average: NaN, min: 999999, max: -999999, mindate: null, maxdate: null }, evening: { sum: 0, count: 0, average: NaN, min: 999999, max: -999999, mindate: null, maxdate: null }, total: { sum: 0, count: 0, average: NaN, min: 999999, max: -999999, mindate: null, maxdate: null }, day: 0, month: 0 };
        value.month = value.date.getMonth() + 1;
        value.day = value.date.getDate();
        sums.push(value);
    }
    let dayreadings;
    let dt;
    let month;
    let day;
    for (yearindex = 0; yearindex < series.data.length; yearindex++) {
        for (dayindex = 0; dayindex < series.data[yearindex].data.length; dayindex++) {
            dayreadings = series.data[yearindex].data[dayindex];
            dt = new Date(dayreadings.datetimeUtc);
            month = dt.getMonth() + 1;
            day = dt.getDate();
            let foundsum = sums.find(s => s.day == day && s.month == month);
            if (foundsum) {
                if (dayreadings.morning !== undefined && isNumeric(dayreadings.morning)) {
                    foundsum.morning.count += 1;
                    foundsum.morning.sum += dayreadings.morning;
                    foundsum.total.count += 1;
                    foundsum.total.sum += dayreadings.morning;
                    if (dayreadings.morning < foundsum.morning.min) {
                        foundsum.morning.min = dayreadings.morning;
                        foundsum.morning.mindate = dayreadings.date;
                    }
                    if (dayreadings.morning > foundsum.morning.max) {
                        foundsum.morning.max = dayreadings.morning;
                        foundsum.morning.maxdate = dayreadings.date;
                    }
                }
                if (dayreadings.evening !== undefined && isNumeric(dayreadings.evening)) {
                    foundsum.evening.count += 1;
                    foundsum.evening.sum += dayreadings.evening;
                    foundsum.total.count += 1;
                    foundsum.total.sum += dayreadings.evening;
                    if (dayreadings.evening < foundsum.evening.min) {
                        foundsum.evening.min = dayreadings.evening;
                        foundsum.evening.mindate = dayreadings.date;
                    }
                    if (dayreadings.evening > foundsum.evening.max) {
                        foundsum.evening.max = dayreadings.evening;
                        foundsum.evening.maxdate = dayreadings.date;
                    }
                }
                if (dayreadings.evening !== undefined && isNumeric(dayreadings.evening) &&
                    dayreadings.morning !== undefined && isNumeric(dayreadings.morning)) {
                    let value = (dayreadings.morning + dayreadings.evening) / 2;
                    if (value < foundsum.total.min) {
                        foundsum.total.min = value;
                        foundsum.total.mindate = dayreadings.date;
                    }
                    if (value > foundsum.total.max) {
                        foundsum.total.max = value;
                        foundsum.total.maxdate = dayreadings.date;
                    }
                }
            }
        }
    }
    for (dayindex = 0; dayindex < sums.length; dayindex++) {
        if (sums[dayindex].morning.count > 0) {
            sums[dayindex].morning.average = sums[dayindex].morning.sum / sums[dayindex].morning.count;
        }
        if (sums[dayindex].evening.count > 0) {
            sums[dayindex].evening.average = sums[dayindex].evening.sum / sums[dayindex].evening.count;
        }
        if (sums[dayindex].total.count > 0) {
            sums[dayindex].total.average = sums[dayindex].total.sum / sums[dayindex].total.count;
        }
    }
    //this.calculatedDailyAverages = sums;
    return sums;
}
