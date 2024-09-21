"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateMonthlyTrendsTS = exports.getDiffCurveDataTS = exports.calculateMonthlyAveragesTS = exports.calculateYearlyEstimatesTS = exports.createYearlyAverage = exports.createLinearContTableTS = exports.calculateDailyAveragesTS = exports.createLastYearsSeriedataTS = exports.getDailyFilteredMinMaxTS = exports.createSumTableTS = exports.createDefaultYearTable = exports.getReadingsBetweenTS = exports.formatFilteredTableTS = exports.filterSeriesTS = exports.getTempMaxDefaultValue = exports.getTempMinDefaultValue = void 0;
const TempMinDefaultValue = 99999;
const TempMaxDefaultValue = -99999;
function createHalfFilledFiltered(value, date, first, last) {
    return { index: -1, value: value, morning: NaN, evening: NaN, date: date, firstday: first, lastday: last };
}
function createMinMaxCalcValue() {
    return { sum: 0, count: 0, average: NaN, min: 999999, max: -999999, mindate: null, maxdate: null };
}
function createYearCalcValue(date) {
    return {
        date: date,
        morning: createMinMaxCalcValue(),
        evening: createMinMaxCalcValue(),
        difference: createMinMaxCalcValue(),
        total: createMinMaxCalcValue(),
        day: date.getDate(), month: date.getMonth() + 1
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
            for (let index = firstindex; index < lastindex; index++) {
                if (isNaN(serie[index].value))
                    dec++;
                else
                    sum += serie[index].value;
            }
            return createHalfFilledFiltered(sum / (lastindex - firstindex - dec), ss.date, first, last);
        }
        return createHalfFilledFiltered(NaN, ss.date, null, null);
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
        sums.push(createYearCalcValue(newdate));
    }
    return sums;
}
exports.createDefaultYearTable = createDefaultYearTable;
function createSumTableTS(defaultyear) {
    let sums = [];
    for (let dayindex = 0; dayindex < 366; dayindex++) {
        let newdate = new Date(defaultyear, 0, dayindex + 1);
        sums.push(createYearCalcValue(newdate));
    }
    return sums;
}
exports.createSumTableTS = createSumTableTS;
function getDailyFilteredMinMaxTS(filteredvalues, defaultyear) {
    let sums = createSumTableTS(defaultyear);
    for (let index = 0; index < sums.length; index++) {
        for (let i = 0; i < filteredvalues.length; i++) {
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
        }
    }
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
function createValue(d, v) {
    return [d, v];
}
function createGraphSerie() {
    return { name: '', location: '', year: 0, values: [] };
}
function getDateTxt(date) {
    if (typeof date !== "object")
        return '-??-';
    return (date && date !== undefined) ? `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}` : `-`;
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
function createLastYearsSeriedataTS(readings, sums) {
    let data = [];
    let morning = createGraphSerie();
    let evening = createGraphSerie();
    let minimum = createGraphSerie();
    let maximum = createGraphSerie();
    morning.values = readings.map((r) => ({
        value: createValue(r.datetimeLocal, r.morning),
        tooltip: `Aamu ${getDateTxt(r.datetimeLocal)} ${r.morning}`,
    }));
    morning.year = 0;
    morning.name = "Aamu";
    evening.values = readings.map((r) => ({
        value: createValue(r.datetimeLocal, r.evening),
        tooltip: `Ilta ${getDateTxt(r.datetimeLocal)} ${r.evening}`,
    }));
    evening.year = 0;
    evening.name = "Ilta";
    maximum.values = morning.values.map(r => {
        let value = findMax(r.value[0], sums);
        return {
            value: createValue(r.value[0], value.value),
            tooltip: `Maksimi ${getDateTxt(value.date)} ${value.value}`,
        };
    });
    maximum.name = 'Maksimi';
    minimum.values = morning.values.map(r => {
        let value = findMin(r.value[0], sums);
        return {
            value: createValue(r.value[0], value.value),
            tooltip: `Minimi ${getDateTxt(value.date)} ${value.value}`,
        };
    });
    minimum.name = 'Minimi';
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
        for (let dayindex = 0; dayindex < series.data[yearindex].data.length; dayindex++) {
            const dayreadings = series.data[yearindex].data[dayindex];
            const dt = new Date(dayreadings.datetimeUtc);
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
function createTemperatureValue(day, value) {
    return { value: value, average: NaN, date: day, morning: NaN, evening: NaN };
}
function createLinearContTableTS(series) {
    let tbl = [];
    for (let year = series.data[0].info.year; year <= series.data[series.data.length - 1].info.year; year++) {
        const lastday = year % 4 == 0 ? 366 : 365;
        for (let day = 1; day <= lastday; day++)
            tbl.push(createTemperatureValue(new Date(year, 0, day), NaN));
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
                                currindex++;
                            }
                        }
                    }
                }
            }
        }
    });
    return tbl;
}
exports.createLinearContTableTS = createLinearContTableTS;
function createYearlyAverage(year, monthcount, yearsum, yearaverage, months) {
    return { year: year, monthcount: monthcount, yearsum: yearsum, yearaverage: yearaverage, months: months, estimate: false };
}
exports.createYearlyAverage = createYearlyAverage;
function calculateYearlyEstimatesTS(yearindexes, years) {
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
            years[yearindexes[index]].months.forEach((m, monthindex) => {
                mcount++;
                if (isNaN(m.average)) {
                    msum += count[monthindex] > 0 ? sum[monthindex] / count[monthindex] : 0;
                }
                else {
                    msum += m.average;
                }
            });
            years[yearindexes[index]].yearaverage = mcount > 0 ? msum / mcount : NaN;
            years[yearindexes[index]].estimate = true;
        }
    }
}
exports.calculateYearlyEstimatesTS = calculateYearlyEstimatesTS;
let monthlyAveragesTScalculated = [];
function calculateMonthlyAveragesTS(series) {
    if (monthlyAveragesTScalculated.length)
        return monthlyAveragesTScalculated;
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
    calculateYearlyEstimatesTS(months.map((y, i) => isNaN(y.yearaverage) ? i : -1).filter(v => v !== -1), months);
    monthlyAveragesTScalculated = months;
    return months;
}
exports.calculateMonthlyAveragesTS = calculateMonthlyAveragesTS;
function createDiffData(name, showyear, data) {
    return { name: name, showyear: showyear, data: data };
}
function createDiffValue(value, date1, date2) {
    return { date1: date1, date2: date2, value: value };
}
function getDiffCurveDataTS(sums, lastyear, lastcurve) {
    let curves = [];
    curves.push(createDiffData('Keskiarvo', false, sums.map(daydata => (createDiffValue(daydata.difference.count > 0 ? daydata.difference.sum / daydata.difference.count : NaN, daydata.date, daydata.date)))));
    curves.push(createDiffData('Maksimi', true, sums.map(daydata => (createDiffValue(daydata.difference.max, daydata.date, daydata.difference.maxdate)))));
    curves.push(createDiffData('Minimi', true, sums.map(daydata => (createDiffValue(daydata.difference.min, daydata.date, daydata.difference.mindate)))));
    curves.push(createDiffData(lastyear.toString(), true, lastcurve.map(daydata => (createDiffValue(daydata.difference.average, daydata.date, daydata.difference.mindate)))));
    return curves;
}
exports.getDiffCurveDataTS = getDiffCurveDataTS;
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
