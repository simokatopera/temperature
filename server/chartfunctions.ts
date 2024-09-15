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

export function formatReadingsTS(readings: FilteredReadings): FilteredReadings {
    let index: number;
    let dayindex: number = 0;
    let yearindex: number = 0;
    for (index = 0; index < readings.filtered.length && yearindex < readings.values.length; index++) {
        if (readings.filtered[index].date < readings.values[yearindex].data[dayindex].datetimeLocal) {
            readings.filtered[index].morning = NaN;
            readings.filtered[index].evening = NaN;
        }
        else {
            let y1 = readings.filtered[index].date.getFullYear();
            let m1 = readings.filtered[index].date.getMonth();
            let d1 = readings.filtered[index].date.getDate();
            let y2 = readings.values[yearindex].data[dayindex].datetimeLocal.getFullYear();
            let m2 = readings.values[yearindex].data[dayindex].datetimeLocal.getMonth();
            let d2 = readings.values[yearindex].data[dayindex].datetimeLocal.getDate();

            if (y1 == y2 && m1 == m2 && d1 == d2) {
                readings.filtered[index].morning = readings.values[yearindex].data[dayindex].morning;
                readings.filtered[index].evening = readings.values[yearindex].data[dayindex].evening;
                dayindex++;
                if (dayindex >= readings.values[yearindex].data.length) {
                    dayindex = 0;
                    yearindex++;
                }
            }
            else {
                while (yearindex < readings.values.length && dayindex < readings.values[yearindex].data.length) {
                    readings.filtered[index].morning = NaN;
                    readings.filtered[index].evening = NaN;
                    dayindex++;
                    if (dayindex > readings.values[yearindex].data.length) {
                        dayindex = 0;
                        yearindex++;
                    }
                }
            }
        }
    }
    readings.filtered = readings.filtered.reverse();
    // remove empty values from the beginning and end
    index = 0;
    while (index < readings.filtered.length && isNaN(readings.filtered[index].value)) index++;
    if (index > 0) readings.filtered.splice(0, index);
    index = readings.filtered.length - 1;
    while (index < readings.filtered.length && isNaN(readings.filtered[index].value)) index--;
    if (index > 0) readings.filtered.splice(index + 1);
    // add index
    readings.filtered.forEach((r, i) => {r.index = i;})
    return readings;
}
