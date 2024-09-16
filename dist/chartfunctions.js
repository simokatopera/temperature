"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatFilteredTableTS = exports.filterSeriesTS = void 0;
function createHalfFilledFiltered(value, date, first, last) {
    return { index: -1, value: value, morning: NaN, evening: NaN, date: date, firstday: first, lastday: last };
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
