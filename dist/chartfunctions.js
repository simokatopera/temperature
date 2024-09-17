"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDailyFilteredMinMaxTS = exports.getReadingsBetweenTS = exports.formatFilteredTableTS = exports.filterSeriesTS = void 0;
function createHalfFilledFiltered(value, date, first, last) {
    return { index: -1, value: value, morning: NaN, evening: NaN, date: date, firstday: first, lastday: last };
}
function createFilteredSum() {
    return { min: 999999, max: -999999, mindate: null, maxdate: null };
}
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
function getDailyFilteredMinMaxTS(filteredvalues, defaultyear) {
    let sums = [];
    let dayindex;
    let index;
    let value;
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
exports.getDailyFilteredMinMaxTS = getDailyFilteredMinMaxTS;
