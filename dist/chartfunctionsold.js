"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMonthlyTrendsTS = exports.createAllyearsAverageSerieTS = exports.createAllYearsFilteredSerieTS = exports.createAllYearsMonthlySeriedataTS = exports.getSeasonTrendsTS = exports.getYearlyTrendTS = exports.calculateTrendTS = exports.getDiffCurveDataTS = exports.calculateMonthlyAveragesTS = exports.calculateYearlyEstimatesTS = exports.createYearlyAverage = exports.createLinearContTableTS = exports.calculateDailyAveragesTS = exports.createLastYearsSeriedataTS = exports.isNumeric = exports.createGraphSerie = exports.createReturnValue = exports.roundNumber = exports.getDailyFilteredMinMaxTS = exports.createSumTableTS = exports.createDefaultYearTable = exports.getReadingsBetweenTS = exports.formatFilteredTableTS = exports.filterSeriesTS = exports.getTempMaxDefaultValue = exports.getTempMinDefaultValue = exports.createDbData = exports.createInfo = exports.createTemperatureMsg = void 0;
const TempMinDefaultValue = 99999;
const TempMaxDefaultValue = -99999;
function createHalfFilledFiltered(value, morning, evening, date, first, last, diffvalue, datetimeUtc, datetimeLocal) {
    return { index: -1, morning: morning, evening: evening, value: value, date: date, firstday: first, lastday: last, diffvalue: diffvalue, datetimeUtc: datetimeUtc, datetimeLocal: datetimeLocal };
}
function createTemperatureMsg() {
    return { data: [], statusCode: 0, message: '' };
}
exports.createTemperatureMsg = createTemperatureMsg;
function createInfo(location, year) {
    return { location: location, year: year };
}
exports.createInfo = createInfo;
function createDbData(date, morning, evening, difference, datetimeLocal, datetimeUtc) {
    return { date: date, morning: morning, evening: evening, difference: difference, datetimeLocal: datetimeLocal, datetimeUtc: datetimeUtc };
}
exports.createDbData = createDbData;
function createMinMaxCalcValue() {
    return { sum: 0, count: 0, average: NaN, min: 999999, max: -999999, mindate: null, maxdate: null };
}
function createYearCalcValue(date, dayindex) {
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
let dailyAveragesCalculated = null;
function getTempMinDefaultValue() {
    return TempMinDefaultValue;
}
exports.getTempMinDefaultValue = getTempMinDefaultValue;
function getTempMaxDefaultValue() {
    return TempMaxDefaultValue;
}
exports.getTempMaxDefaultValue = getTempMaxDefaultValue;
function filterSeriesTS(serie, filterlength) {
    let firstindex = 0;
    let lastindex = 0;
    let negoffset = filterlength % 2 ? -filterlength / 2 + 0.5 : -filterlength / 2;
    let posoffset = negoffset + filterlength;
    let filtered = serie.map(ss => {
        if (!isNaN(ss.value)) {
            let first = new Date(ss.date.getFullYear(), ss.date.getMonth(), ss.date.getDate() + negoffset);
            let last = new Date(ss.date.getFullYear(), ss.date.getMonth(), ss.date.getDate() + posoffset);
            while (firstindex < serie.length && serie[firstindex].date < first)
                firstindex++;
            while (lastindex < serie.length && serie[lastindex].date < last)
                lastindex++;
            let sum = 0;
            let dec = 0;
            let diffsum = 0;
            let diffdec = 0;
            for (let index = firstindex; index < lastindex; index++) {
                if (isNaN(serie[index].value))
                    dec++;
                else
                    sum += serie[index].value;
                if (isNaN(serie[index].difference))
                    diffdec++;
                else
                    diffsum += serie[index].difference;
            }
            return createHalfFilledFiltered(sum / (lastindex - firstindex - dec), ss.morning, ss.evening, ss.date, first, last, diffsum / (lastindex - firstindex - diffdec), ss.datetimeUtc, ss.datetimeLocal);
        }
        return createHalfFilledFiltered(NaN, NaN, NaN, ss.date, null, null, NaN, null, null);
    });
    return filtered;
}
exports.filterSeriesTS = filterSeriesTS;
function increaseDayIndex(dayindex, yearindex, maxlen) {
    dayindex++;
    if (dayindex >= maxlen) {
        dayindex = 0;
        yearindex++;
    }
    let a = dayindex;
    let b = yearindex;
    return { a, b };
}
function formatFilteredTableTS(readings, filtered) {
    let index;
    let dayindex = 0;
    let yearindex = 0;
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
                let { a, b } = increaseDayIndex(dayindex, yearindex, readings[yearindex].data.length);
                dayindex = a;
                yearindex = b;
            }
            else {
                while (yearindex < readings.length && dayindex < readings[yearindex].data.length) {
                    filtered[index].morning = NaN;
                    filtered[index].evening = NaN;
                    let { a, b } = increaseDayIndex(dayindex, yearindex, readings[yearindex].data.length);
                    dayindex = a;
                    yearindex = b;
                }
            }
        }
    }
    filtered = filtered.reverse();
    index = 0;
    while (index < filtered.length && isNaN(filtered[index].value))
        index++;
    if (index > 0)
        filtered.splice(0, index);
    index = filtered.length - 1;
    while (index < filtered.length && isNaN(filtered[index].value))
        index--;
    if (index > 0)
        filtered.splice(index + 1);
    filtered.forEach((r, i) => { r.index = i; });
    return filtered;
}
exports.formatFilteredTableTS = formatFilteredTableTS;
function getReadingsBetweenTS(startdate, enddate, series) {
    if (startdate >= enddate)
        return [];
    const startyear = startdate.getFullYear();
    const endyear = enddate.getFullYear();
    let startyearindex = 0;
    while (series.data[startyearindex].info.year < startyear)
        startyearindex++;
    let endyearindex = startyearindex;
    while (series.data[endyearindex].info.year < endyear)
        endyearindex++;
    let startdayindex = 0;
    while (series.data[startyearindex].data[startdayindex].datetimeLocal < startdate)
        startdayindex++;
    let enddayindex = 0;
    while (series.data[endyearindex].data[enddayindex].datetimeLocal < enddate)
        enddayindex++;
    let yearindex;
    let dayindex;
    let firstindex = startdayindex;
    let readings = [];
    for (yearindex = startyearindex; yearindex <= endyearindex; yearindex++) {
        for (dayindex = firstindex; startyearindex === endyearindex ? dayindex < enddayindex : dayindex < series.data[yearindex].data.length; dayindex++) {
            readings.push(series.data[yearindex].data[dayindex]);
        }
        firstindex = 0;
    }
    return readings;
}
exports.getReadingsBetweenTS = getReadingsBetweenTS;
function createDefaultYearTable(defaultyear) {
    let sums = [];
    for (let dayindex = 0; dayindex < 366; dayindex++) {
        let newdate = new Date(defaultyear, 0, dayindex + 1);
        sums.push(createYearCalcValue(newdate, dayindex));
    }
    return sums;
}
exports.createDefaultYearTable = createDefaultYearTable;
function createSumTableTS(defaultyear) {
    let sums = [];
    for (let dayindex = 0; dayindex < 366; dayindex++) {
        let newdate = new Date(defaultyear, 0, dayindex + 1);
        sums.push(createYearCalcValue(newdate, dayindex));
    }
    return sums;
}
exports.createSumTableTS = createSumTableTS;
function getDailyFilteredMinMaxTS(filteredvalues, defaultyear) {
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
        });
    });
    return sums;
}
exports.getDailyFilteredMinMaxTS = getDailyFilteredMinMaxTS;
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
function roundNumber(value, num) {
    if (isNumeric(value)) {
        if (typeof value === 'number')
            return value.toFixed(num);
        else
            return value;
    }
    if (isNaN(value))
        return 'NaN';
    return 'kummaa';
}
exports.roundNumber = roundNumber;
function createValue(d, v) {
    return [d, v];
}
function createReturnValue(d, s) {
    return [d, s];
}
exports.createReturnValue = createReturnValue;
function createGraphSerieEmpty() {
    return { name: '', location: '', year: 0, values: [], trend: false, num: -1 };
}
function createGraphSerie(name, location, year, values, num, trend = false) {
    return { name: name, location: location, year: year, values: values, trend: trend, num: num };
}
exports.createGraphSerie = createGraphSerie;
function getDateTxt(date, daymonth) {
    if (!date)
        return '???';
    if (typeof date !== "object")
        return '-??-';
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if (daymonth === true)
        return `${day}.${month}`;
    return `${day}.${month}.${date.getFullYear()}`;
}
function getDate(date) {
    if (!date)
        return NaN;
    let parts = date.split('/');
    if (parts && parts.length === 3) {
        return new Date(Number(parts[2]), Number(parts[0]) - 1, Number(parts[1]));
    }
    return NaN;
}
function isNumeric(obj) {
    return !Array.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
}
exports.isNumeric = isNumeric;
function createLastYearsSeriedataTS(readings, sums, location) {
    let data = [];
    const year = readings[readings.length - 1].datetimeLocal.getFullYear();
    let morning = createGraphSerie('Aamu', location, year, readings.map((r) => ({
        value: createValue(r.datetimeLocal, r.morning),
        tooltip: `Aamu ${getDateTxt(r.datetimeLocal, false)} ${r.morning}`,
    })), -1);
    let evening = createGraphSerie('llta', location, year, readings.map((r) => ({
        value: createValue(r.datetimeLocal, r.evening),
        tooltip: `Ilta ${getDateTxt(r.datetimeLocal, false)} ${r.evening}`,
    })), -1);
    let maximum = createGraphSerie('Maksimi', location, year, morning.values.map(r => {
        let value = findMax(r.value[0], sums);
        return {
            value: createValue(r.value[0], value.value),
            tooltip: `Maksimi ${getDateTxt(value.date, false)} ${value.value}`,
        };
    }), -1);
    let minimum = createGraphSerie('Minimi', location, year, morning.values.map(r => {
        let value = findMin(r.value[0], sums);
        return {
            value: createValue(r.value[0], value.value),
            tooltip: `Minimi ${getDateTxt(value.date, false)} ${value.value}`,
        };
    }), -1);
    data = [morning, evening, minimum, maximum];
    return data;
}
exports.createLastYearsSeriedataTS = createLastYearsSeriedataTS;
function calculateDailyAveragesTS(series, defaultyear, year = null) {
    if (dailyAveragesCalculated && dailyAveragesCalculated.year == year)
        return dailyAveragesCalculated.data;
    let sums = createDefaultYearTable(defaultyear);
    let firstindex = 0;
    let lastindex = series.data.length;
    if (year) {
        let i = 0;
        while (i < series.data.length && series.data[i].info.year != year)
            i++;
        firstindex = i;
        lastindex = firstindex + 1;
    }
    for (let yearindex = firstindex; yearindex < lastindex; yearindex++) {
        let sumindex = 0;
        for (let dayindex = 0; dayindex < series.data[yearindex].data.length; dayindex++) {
            const dayreadings = series.data[yearindex].data[dayindex];
            const dt = new Date(dayreadings.datetimeLocal);
            const month = dt.getMonth() + 1;
            const day = dt.getDate();
            let foundsum;
            while (sumindex < sums.length && (sums[sumindex].day != day || sums[sumindex].month != month)) {
                sumindex++;
            }
            if (sumindex < sums.length)
                foundsum = sums[sumindex];
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
    for (let dayindex = 0; dayindex < sums.length; dayindex++) {
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
            sums[dayindex].total.average = (sums[dayindex].morning.average + sums[dayindex].evening.average) / 2;
        }
    }
    if (!dailyAveragesCalculated)
        dailyAveragesCalculated = { data: sums, year: year };
    return sums;
}
exports.calculateDailyAveragesTS = calculateDailyAveragesTS;
function createTemperatureValue(day, value, datetimeUtc, datetimeLocal) {
    return { value: value, average: NaN, date: day, morning: NaN, evening: NaN, difference: NaN, datetimeUtc: datetimeUtc, datetimeLocal: datetimeLocal };
}
let linearContTableCreated = [];
function createLinearContTableTS(series) {
    if (linearContTableCreated.length)
        return linearContTableCreated;
    let tbl = [];
    for (let year = series.data[0].info.year; year <= series.data[series.data.length - 1].info.year; year++) {
        const lastday = year % 4 == 0 ? 366 : 365;
        for (let day = 1; day <= lastday; day++)
            tbl.push(createTemperatureValue(new Date(year, 0, day), NaN, null, null));
    }
    let currindex = 0;
    series.data.forEach((yearserie) => {
        while (currindex < tbl.length && tbl[currindex].date.getFullYear() < yearserie.info.year)
            currindex++;
        if (currindex < tbl.length) {
            for (let currdateindex = 0; currdateindex < yearserie.data.length; currdateindex++) {
                if (yearserie.info.year === tbl[currindex].date.getFullYear()) {
                    const t = yearserie.data[currdateindex].datetimeLocal;
                    while (currindex < tbl.length && tbl[currindex].date < t)
                        currindex++;
                    if (currindex < tbl.length) {
                        if (t.getDate() === tbl[currindex].date.getDate()) {
                            if (yearserie.data[currdateindex].evening !== undefined && yearserie.data[currdateindex].morning !== undefined) {
                                const value = (yearserie.data[currdateindex].evening + yearserie.data[currdateindex].morning) / 2;
                                tbl[currindex].value = value;
                                tbl[currindex].morning = yearserie.data[currdateindex].morning;
                                tbl[currindex].evening = yearserie.data[currdateindex].evening;
                                tbl[currindex].difference = yearserie.data[currdateindex].evening - yearserie.data[currdateindex].morning;
                                ;
                                tbl[currindex].datetimeUtc = yearserie.data[currdateindex].datetimeUtc;
                                tbl[currindex].datetimeLocal = yearserie.data[currdateindex].datetimeLocal;
                                currindex++;
                            }
                        }
                    }
                }
            }
        }
    });
    linearContTableCreated = tbl;
    return tbl;
}
exports.createLinearContTableTS = createLinearContTableTS;
function createYearlyAveragesEstimates(values, calculated, averages) {
    return { values: values, calculated: calculated, averages: averages };
}
function createMonthlyEstimate(year, month, value) {
    return { year: year, month: month, value: value };
}
function createYearlyAverage(year, monthcount, yearsum, yearaverage, months) {
    return { year: year, monthcount: monthcount, yearsum: yearsum, yearaverage: yearaverage, months: months, estimate: false };
}
exports.createYearlyAverage = createYearlyAverage;
function calculateYearlyEstimatesTS(yearindexes, years) {
    let estimates = [];
    if (yearindexes.length) {
        let sum = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        let count = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        years.forEach(year => {
            for (let i = 0; i < year.months.length; i++) {
                if (!isNaN(year.months[i].average)) {
                    sum[i] += year.months[i].average;
                    count[i]++;
                }
            }
        });
        for (let index = 0; index < yearindexes.length; index++) {
            let msum = 0;
            let mcount = 0;
            const curyear = years[yearindexes[index]].year;
            years[yearindexes[index]].months.forEach((m, monthindex) => {
                mcount++;
                if (isNaN(m.average)) {
                    let value = count[monthindex] > 0 ? sum[monthindex] / count[monthindex] : 0;
                    msum += value;
                    estimates.push(createMonthlyEstimate(curyear, monthindex, value));
                }
                else {
                    msum += m.average;
                }
            });
            years[yearindexes[index]].yearaverage = mcount > 0 ? msum / mcount : NaN;
            years[yearindexes[index]].estimate = true;
        }
    }
    return estimates;
}
exports.calculateYearlyEstimatesTS = calculateYearlyEstimatesTS;
function calculateMonthlyAveragesTS(series) {
    let months = series.data.map(yearserie => {
        let monthtbl = [];
        for (let i = 0; i < 12; i++)
            monthtbl.push(createYearDataValue(0));
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
                let morning = monthtbl[i].morningsum / (monthtbl[i].morningcount > 0 ? monthtbl[i].morningcount : 1);
                let evening = monthtbl[i].eveningsum / (monthtbl[i].eveningcount > 0 ? monthtbl[i].eveningcount : 1);
                yearlysum += (morning + evening) / 2;
                monthtbl[i].average = (morning + evening) / 2;
                monthtbl[i].count += monthtbl[i].eveningcount + monthtbl[i].morningcount;
            }
        }
        let data = createYearlyAverage(yearserie.info.year, monthcount, yearlysum, monthcount == 12 ? yearlysum / monthcount : NaN, monthtbl.map(m => ({ average: m.average })));
        return data;
    });
    let averages = [];
    for (let i = 0; i < 12; i++)
        averages.push(createYearDataValue(i));
    months.forEach(year => {
        for (let i = 0; i < year.months.length; i++) {
            if (!isNaN(year.months[i].average)) {
                averages[i].morningsum += year.months[i].average;
                averages[i].morningcount++;
            }
        }
    });
    let averageresults = averages.map(a => a.morningcount <= 0 ? NaN : a.morningsum / a.morningcount);
    const monthlyestimates = calculateYearlyEstimatesTS(months.map((y, i) => isNaN(y.yearaverage) ? i : -1).filter(v => v !== -1), months);
    const returnvalue = createYearlyAveragesEstimates(months, monthlyestimates, averageresults);
    return returnvalue;
}
exports.calculateMonthlyAveragesTS = calculateMonthlyAveragesTS;
function createDiffData(name, showyear, data) {
    return { name: name, showyear: showyear, data: data };
}
function createDiffValue(value, date1, date2) {
    return { date1: date1, date2: date2, value: value };
}
function getDiffCurveDataTS(allfiltered, sums, lastyear, defaultyear, location) {
    let curves = [];
    curves.push(createDiffData('Keskiarvo', false, sums.map(daydata => (createDiffValue(daydata.difference.count > 0 ? daydata.difference.sum / daydata.difference.count : NaN, daydata.date, daydata.date)))));
    curves.push(createDiffData('Maksimi', true, sums.map(daydata => (createDiffValue(daydata.difference.max, daydata.date, daydata.difference.maxdate)))));
    curves.push(createDiffData('Minimi', true, sums.map(daydata => (createDiffValue(daydata.difference.min, daydata.date, daydata.difference.mindate)))));
    let lastyeardata = allfiltered.filter(f => {
        if (f.date.getFullYear() == lastyear)
            return f;
    });
    curves.push(createDiffData(`${lastyear.toString()} (suod)`, true, lastyeardata.map(daydata => (createDiffValue(daydata.diffvalue, new Date(defaultyear, daydata.date.getMonth(), daydata.date.getDate()), daydata.date)))));
    let curvedata = curves.map(c => ({
        values: c.data.map(d => ({
            value: [d.date1, d.value],
            tooltip: `${c.name} ${location} ${c.showyear == true ? getDateTxt(d.date2, false) : getDateTxt(d.date2, true)} ${roundNumber(d.value, 1)}°`,
        })),
        name: c.name,
        year: 0,
        location: location,
        num: -1,
        trend: false,
    }));
    return curvedata;
}
exports.getDiffCurveDataTS = getDiffCurveDataTS;
function calculateTrendTS(valuearray) {
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
            });
        }
    });
    k = (n * sumxy - sumx * sumy) / (n * sumxsqr - sumx * sumx);
    b = (sumy - k * sumx) / n;
    return { k, b };
}
exports.calculateTrendTS = calculateTrendTS;
function getYearlyTrendTS(series, monthlytrend, currentyearestimate) {
    let yearsums = [];
    monthlytrend.forEach(month => {
        month.data.forEach((m, i) => {
            if (!yearsums[m.year])
                yearsums[m.year] = { year: m.year, sum: 0, count: 0 };
            yearsums[m.year].count++;
            yearsums[m.year].sum += m.value;
        });
    });
    let yearlyaverages = yearsums.map(y => ({ value: createReturnValue(new Date(y.year, 0, 1), y.count == 12 ? roundNumber(y.sum / y.count, 1) : 'NaN'),
        tooltip: `Vuosikeskiarvo ${y.year} ${y.count == 12 ? roundNumber(y.sum / y.count, 1) : ''}` }));
    yearlyaverages = yearlyaverages.filter(val => val);
    if (!isNaN(currentyearestimate) && yearlyaverages[yearlyaverages.length - 1].value[0].getFullYear() == new Date().getFullYear()) {
        if (yearlyaverages[yearlyaverages.length - 1].value[1] === 'NaN') {
            yearlyaverages[yearlyaverages.length - 1].value[1] = roundNumber(currentyearestimate, 1);
            yearlyaverages[yearlyaverages.length - 1].tooltip = yearlyaverages[yearlyaverages.length - 1].tooltip.replace(`Vuosikeskiarvo`, `Arvioitu vuosikeskiarvo`);
        }
    }
    let yearlyserie = {
        month: 0,
        data: yearlyaverages.map(val => ({
            month: 0,
            value: Number(val.value[1]),
            year: Number(val.value[0].getFullYear()),
        })),
    };
    const trend = calculateTrendTS([yearlyserie]);
    let yearlytrend = series.data.map(ser => ({ value: createReturnValue(new Date(ser.info.year, 0, 1), roundNumber(ser.info.year * trend.k + trend.b, 1)),
        tooltip: `Suuntaus ${ser.info.year} ${roundNumber(ser.info.year * trend.k + trend.b, 1)}` }));
    const yearlyvalues = createGraphSerie(`Vuosikeskiarvo`, series.data[0].info.location, 0, yearlyaverages, -1);
    const trendvalues = createGraphSerie(`Suuntaus ${trend.k > 0 ? '+' : ''}${roundNumber(trend.k * 10, 1)}°C/10v`, '', 0, yearlytrend, -1);
    return [yearlyvalues, trendvalues];
}
exports.getYearlyTrendTS = getYearlyTrendTS;
function getSeasonTrendsTS(series, monthnumbers, monthnames, monthlytrends) {
    let datavalues = [];
    monthlytrends.forEach(month => {
        let found = monthnumbers.indexOf(month.month);
        if (found >= 0) {
            let values = month.data.map(value => ({ value: [new Date(value.year, 0, 1), roundNumber(value.value, 1)], tooltip: `${value.year} ${monthnames[found]} ${roundNumber(value.value, 1)}` }));
            datavalues.push(createGraphSerie(monthnames[datavalues.length], series.data[0].info.location, 0, values, monthnumbers[found]));
        }
    });
    let seriess = [];
    if (monthlytrends[monthnumbers[0] - 1])
        seriess.push(monthlytrends[monthnumbers[0] - 1]);
    if (monthlytrends[monthnumbers[1] - 1])
        seriess.push(monthlytrends[monthnumbers[1] - 1]);
    if (monthlytrends[monthnumbers[2] - 1])
        seriess.push(monthlytrends[monthnumbers[2] - 1]);
    let trend = calculateTrendTS(seriess);
    let newvalues = series.data.map((ser, serieindex) => ({ value: [new Date(ser.info.year, 0, 1), roundNumber(ser.info.year * trend.k + trend.b, 1)], tooltip: `${ser.info.year} Suuntaus ${roundNumber(ser.info.year * trend.k + trend.b, 1)}` }));
    if (isNaN(trend.k)) {
        datavalues.push(createGraphSerie(`Trendi --- °C/10v`, series.data[0].info.location, 0, newvalues, -1, true));
    }
    else {
        datavalues.push(createGraphSerie(`Trendi ${trend.k > 0 ? '+' : ''}${roundNumber(trend.k * 10, 1)}°C/10v`, series.data[0].info.location, 0, newvalues, -1, true));
    }
    return datavalues;
}
exports.getSeasonTrendsTS = getSeasonTrendsTS;
function createAllYearsMonthlySeriedataTS(series, monthlyaverages, defaultyear, monthnames) {
    let monthly = monthlyaverages;
    let monthhighest = [];
    let monthlowest = [];
    for (let index = 0; index < 12; index++) {
        monthhighest.push({ value: -9999, year: 0, month: 0, date: 0 });
        monthlowest.push({ value: 9999, year: 0, month: 0, date: 0 });
    }
    monthly.forEach(year => {
        year.months.forEach((m, i) => {
            if (m.average > monthhighest[i].value) {
                monthhighest[i].value = m.average, monthhighest[i].year = year.year, monthhighest[i].month = i;
            }
            ;
            if (m.average < monthlowest[i].value) {
                monthlowest[i].value = m.average, monthlowest[i].year = year.year, monthlowest[i].month = i;
            }
            ;
        });
    });
    let valueshigh = monthhighest.map(high => ({
        value: [new Date(defaultyear, high.month, 1), high.value],
        tooltip: `Korkein ${high.year} ${monthnames[high.month]} ${roundNumber(high.value, 1)}`
    }));
    let valueslow = monthlowest.map(low => ({
        value: [new Date(defaultyear, low.month, 1), low.value],
        tooltip: `Matalin ${low.year} ${monthnames[low.month]} ${roundNumber(low.value, 1)}`
    }));
    let valuesthisyear = [];
    if (monthly[monthly.length - 1].year == new Date().getFullYear()) {
        valuesthisyear = monthly[monthly.length - 1].months.map((m, i) => ({
            value: [new Date(defaultyear, i, 1), m.average],
            tooltip: `Vuosi ${monthly[monthly.length - 1].year} ${monthly[monthly.length - 1].year} ${monthnames[i]} ${roundNumber(m.average, 1)}`
        }));
    }
    let datavalues = [];
    datavalues.push(createGraphSerie('Korkein', series.data[0].info.location, 0, valueshigh, -1));
    datavalues.push(createGraphSerie('Matalin', series.data[0].info.location, 0, valueslow, -1));
    datavalues.push(createGraphSerie(monthly[monthly.length - 1].year.toString(), series.data[0].info.location, 0, valuesthisyear, -1));
    return datavalues;
}
exports.createAllYearsMonthlySeriedataTS = createAllYearsMonthlySeriedataTS;
function createAllYearsFilteredSerieTS(series, filtered, defaultyear) {
    let valuearray = [];
    let curryear = 0;
    filtered.forEach((f) => {
        if (f.date.getFullYear() != curryear) {
            curryear = f.date.getFullYear();
            valuearray.push(createGraphSerie(curryear.toString(), series.data[0].info.location, curryear, [], -1));
        }
        let dt = new Date(defaultyear, f.date.getMonth(), f.date.getDate());
        valuearray[valuearray.length - 1].values.push({ value: [dt, f.value], tooltip: `${getDateTxt(f.date, false)} ${roundNumber(f.value, 1)}` });
    });
    let minimum = createGraphSerie('Minimi', series.data[0].info.location, 0, [], -1);
    let maximum = createGraphSerie('Maksimi', series.data[0].info.location, 0, [], -1);
    let minmax = getDailyFilteredMinMaxTS(filtered, defaultyear);
    maximum.values = minmax.map(r => {
        return {
            value: [r.date, r.total.max],
            tooltip: `Maksimi ${getDateTxt(r.total.maxdate, false)} ${roundNumber(r.total.max, 1)}`,
        };
    });
    minimum.values = minmax.map(r => {
        return {
            value: [r.date, r.total.min],
            tooltip: `Minimi ${getDateTxt(r.total.mindate, false)} ${roundNumber(r.total.min, 1)}`,
        };
    });
    valuearray.push(minimum);
    valuearray.push(maximum);
    return valuearray;
}
exports.createAllYearsFilteredSerieTS = createAllYearsFilteredSerieTS;
function createAllyearsAverageSerieTS(series, sums) {
    let loc = null;
    for (let index = 0; index < series.data.length; index++) {
        if (series.data[index].info.location !== loc) {
            if (loc === null)
                loc = series.data[index].info.location;
            else
                loc = loc + ', ' + series.data[index].info.location;
        }
    }
    if (loc === null)
        loc = '';
    let valuearraymorning = sums.map(s => ({
        value: [s.date, s.morning.average],
        tooltip: `Aamu ${getDateTxt(s.date, true)} ${roundNumber(s.morning.average, 1)}`,
    }));
    let valuearrayevening = sums.map(s => ({
        value: [s.date, s.evening.average],
        tooltip: `Ilta ${getDateTxt(s.date, true)} ${roundNumber(s.evening.average, 1)}`,
    }));
    let valuearrayaverage = sums.map(s => ({
        value: [s.date, (s.morning.average + s.evening.average) / 2],
        tooltip: `Keskiarvo ${getDateTxt(s.date, true)} ${roundNumber((s.morning.average + s.evening.average) / 2, 1)}`,
    }));
    let valuearrayhigh = sums.map(s => ({
        value: [s.date, s.morning.max > s.evening.max ? s.morning.max : s.evening.max],
        tooltip: `Korkein ${getDateTxt(s.morning.max > s.evening.max ? s.morning.maxdate : s.evening.maxdate, false)} ${roundNumber(s.morning.max > s.evening.max ? s.morning.max : s.evening.max, 1)}`,
    }));
    let valuearraylow = sums.map(s => ({
        value: [s.date, s.morning.min < s.evening.min ? s.morning.min : s.evening.min],
        tooltip: `Matalin ${getDateTxt(s.morning.min < s.evening.min ? s.morning.mindate : s.evening.mindate, false)} ${roundNumber(s.morning.min < s.evening.min ? s.morning.min : s.evening.min, 1)}`,
    }));
    let returnvalues1 = createGraphSerie('Aamu', loc, 0, valuearraymorning, -1);
    let returnvalues2 = createGraphSerie('Ilta', loc, 0, valuearrayevening, -1);
    let returnvalues3 = createGraphSerie('Keskiarvo', loc, 0, valuearrayaverage, -1);
    let returnvalues4 = createGraphSerie('Korkein', loc, 0, valuearrayhigh, -1);
    let returnvalues5 = createGraphSerie('Matalin', loc, 0, valuearraylow, -1);
    return [returnvalues1, returnvalues2, returnvalues3, returnvalues4, returnvalues5];
}
exports.createAllyearsAverageSerieTS = createAllyearsAverageSerieTS;
let calculatedMonthlytrends = [];
function createYearData(year) {
    let data = createYearDataValues();
    return { year: year, data: data };
}
function createYearDataValue(month) {
    return { morningsum: 0, morningcount: 0, eveningsum: 0, eveningcount: 0, month: month, average: NaN, count: 0 };
}
function createYearDataValues() {
    let data = [];
    for (let i = 0; i < 12; i++)
        data.push(createYearDataValue(i + 1));
    return data;
}
function createMonthDataPair(month) {
    return { month: month, data: [] };
}
function createValueDataValue(value, year, month) {
    return { value: value, year: year, month: month };
}
function calculateMonthlyTrendsTS(series) {
    if (calculatedMonthlytrends.length > 0)
        return calculatedMonthlytrends;
    let monthlyaverages = [];
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
        });
    });
    monthlyaverages.forEach(m => {
        m.data.forEach(d => {
            d.average = (d.morningsum / (d.morningcount > 0 ? d.morningcount : 1) + (d.eveningsum / (d.eveningcount > 0 ? d.eveningcount : 1))) / 2;
        });
    });
    let monthlytrenddata = [];
    for (let monthindex = 0; monthindex < 12; monthindex++) {
        monthlytrenddata.push(createMonthDataPair(monthindex + 1));
        monthlyaverages.forEach(year => {
            if (year.data[monthindex].eveningcount > 0 || year.data[monthindex].morningcount > 0) {
                let value = (year.data[monthindex].eveningsum + year.data[monthindex].morningsum) / (year.data[monthindex].eveningcount + year.data[monthindex].morningcount);
                monthlytrenddata[monthindex].data.push(createValueDataValue(value, year.year, monthindex + 1));
            }
        });
    }
    calculatedMonthlytrends = monthlytrenddata;
    return monthlytrenddata;
}
exports.calculateMonthlyTrendsTS = calculateMonthlyTrendsTS;
