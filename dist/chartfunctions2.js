"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAllYearsMonthlyAverageSeriedata = exports.createDailyDiffdata = exports.createLastYearsSeriedata = exports.createYearlyFilteredSeriedata = exports.createAllYearsFilteredSeriedata = exports.getAllReadings = exports.getYearAverages = exports.calculateTemperatures = exports.initTemperature = exports.calculateTrendTS = exports.isNumeric = exports.roundNumber = exports.createDefaultYearTableNew = void 0;
const TempMinDefaultValue = 99999;
const TempMaxDefaultValue = -99999;
function createFilteredNew(date, morning, evening, average, difference, filteredmorning, filteredevening, filteredaverage, filtereddifference, filterfirstday, filterlastday) {
    return { date: date, morning: morning, evening: evening, average: average, difference: difference, morningfiltered: filteredmorning, eveningfiltered: filteredevening, averagefiltered: filteredaverage, differencefiltered: filtereddifference, firstdayfilter: filterfirstday, lastdayfilter: filterlastday, index: 0 };
}
function createDateOnlyFilteredNew(date) {
    return { date: date, morning: NaN, evening: NaN, average: NaN, difference: NaN, morningfiltered: NaN, eveningfiltered: NaN, averagefiltered: NaN, differencefiltered: NaN, firstdayfilter: date, lastdayfilter: date, index: 0 };
}
function createFilteredValueNew(date) {
    return { date: date, morning: NaN, evening: NaN, average: NaN, difference: NaN };
}
function createAverageDataNew(year, location) {
    return { year: year, location: location, averages: null, months: [] };
}
function createAverageNew2() {
    return { morning: createOneDayValuesEmptyNew(), evening: createOneDayValuesEmptyNew(), average: 0, difference: createOneDayValuesEmptyNew() };
}
function createAverageNew(average, morning, evening, difference) {
    return { average: average, morning: morning, evening: evening, difference: difference };
}
function calculateAverageNew(counter) {
    const morningvalue = counter.morning.count > 0 ? counter.morning.sum / counter.morning.count : NaN;
    const morningmin = createReadingDate(counter.morning.low, counter.morning.lowdate);
    const morningmax = createReadingDate(counter.morning.high, counter.morning.highdate);
    const morning = createOneDayValuesNew(counter.morning.count, morningvalue, morningmin, morningmax);
    const eveningvalue = counter.evening.count > 0 ? counter.evening.sum / counter.evening.count : NaN;
    const eveningmin = createReadingDate(counter.evening.low, counter.evening.lowdate);
    const eveningmax = createReadingDate(counter.evening.high, counter.evening.highdate);
    const evening = createOneDayValuesNew(counter.evening.count, eveningvalue, eveningmin, eveningmax);
    const differencevalue = counter.difference.count > 0 ? counter.difference.sum / counter.difference.count : NaN;
    const differencemin = createReadingDate(counter.difference.low, counter.difference.lowdate);
    const differencemax = createReadingDate(counter.difference.high, counter.difference.highdate);
    const difference = createOneDayValuesNew(counter.difference.count, differencevalue, differencemin, differencemax);
    let average = isNaN(morningvalue) || isNaN(eveningvalue) ? NaN : (morningvalue + eveningvalue) / 2;
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
function createMonthAverageDataNew(monthno, averages) {
    return { monthno: monthno, averages: averages };
}
function createMonthlyValueNew(monthno) {
    return { monthno: monthno, morning: createMonthlyStatisticsNew(), evening: createMonthlyStatisticsNew(), difference: createMonthlyStatisticsNew() };
}
function setMonthlyStatisticsNew(dest, source) {
    dest.high = source.high;
    dest.highdate = source.highdate;
    dest.low = source.low;
    dest.lowdate = source.lowdate;
    dest.average = source.count > 0 ? source.sum / source.count : NaN;
}
function createMonthlyStatisticsNew() {
    return { average: NaN, high: NaN, highdate: new Date(0), low: NaN, lowdate: new Date(0) };
}
function createHiLowNew() {
    return { sum: 0, count: 0, average: NaN, high: TempMaxDefaultValue, low: TempMinDefaultValue, highdate: new Date(0), lowdate: new Date(0) };
}
function fillHiLowNew(itemtofill, sum, count, average, high, highdate, low, lowdate) {
    itemtofill.sum = sum;
    itemtofill.count = count;
    itemtofill.average = average;
    itemtofill.high = high;
    itemtofill.highdate = highdate;
    itemtofill.low = low;
    itemtofill.lowdate = lowdate;
}
function createHiLowYearlyNew() {
    return { sum: 0, count: 0, average: NaN, high: TempMaxDefaultValue, low: TempMinDefaultValue, highdate: new Date(0), lowdate: new Date(0),
        monthlyhigh: TempMaxDefaultValue, monthlylow: TempMinDefaultValue, monthlyhighdate: new Date(0), monthlylowdate: new Date(0) };
}
function createAverageCounterNew(year, monthno) {
    return { year: year, morning: createHiLowNew(), evening: createHiLowNew(), difference: createHiLowNew(), total: createHiLowNew(), monthno: monthno };
}
function createAverageYearCounterNew(year, monthno) {
    return { year: year, monthno: monthno, morning: createHiLowYearlyNew(), evening: createHiLowYearlyNew(), difference: createHiLowYearlyNew() };
}
function createMonthAverageCountersNew(year) {
    let data = [];
    for (let i = 0; i < 12; i++)
        data.push(createAverageCounterNew(year, i + 1));
    return data;
}
function createYearCalcValueNew(date, dayindex) {
    return {
        date: date,
        morning: createMinMaxCalcNew(),
        evening: createMinMaxCalcNew(),
        difference: createMinMaxCalcNew(),
        total: createMinMaxCalcNew(),
        day: date.getDate(), month: date.getMonth() + 1,
    };
}
function createMinMaxCalcNew() {
    return { sum: 0, count: 0, average: NaN, min: TempMinDefaultValue, max: TempMaxDefaultValue, mindate: new Date(0), maxdate: new Date(0) };
}
function createDefaultYearTableNew(defaultyear) {
    let sums = [];
    for (let dayindex = 0; dayindex < 366; dayindex++) {
        let newdate = new Date(defaultyear, 0, dayindex + 1);
        sums.push(createYearCalcValueNew(newdate, dayindex));
    }
    return sums;
}
exports.createDefaultYearTableNew = createDefaultYearTableNew;
function createOneDayValuesNew(count, average, min, max) {
    return { count: count, average: average, min: min, max: max };
}
function createDailyValuesNew(date, morning, evening, difference, total) {
    return { date: date, morning: morning, evening: evening, difference: difference, total: total };
}
function createOneDayValuesEmptyNew() {
    return { count: 0, average: 0, min: createReadingDateEmpty(), max: createReadingDateEmpty() };
}
function createReadingDateEmpty() {
    return { value: 0, date: new Date(0) };
}
function createReadingDate(value, date) {
    return { value: value, date: date };
}
function createGraphItemNew(d, v) {
    return [d, v];
}
function createGraphSerieNew(name, location, year, values, trend, index) {
    return { name: name, location: location, year: year, values: values, trend: trend, index: index };
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
function isNumeric(obj) {
    return !Array.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
}
exports.isNumeric = isNumeric;
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
class Temperatures {
    constructor() {
        this.defaultyear = 1976;
        this.filterlength = 10;
        this.yearlyAverages = [];
        this.monthlyValues = [];
        this.filteredValues = [];
        this.filteredValuesValid = [];
        this.dailyValues = [];
        this.yearlyTrend = null;
    }
    getValidFilteredValues() {
        if (this.filteredValuesValid.length == 0) {
            this.filteredValuesValid = this.filteredValues.filter(v => !(isNaN(v.morning) || isNaN(v.evening)));
            this.filteredValuesValid.forEach((fv, i) => fv.index = i);
        }
        return this.filteredValuesValid;
    }
    getMonthlyvaluesForYear(currentyear) {
        let monthlycounters = createMonthAverageCountersNew(currentyear.info.year);
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
        });
        monthlycounters.forEach(month => {
            month.morning.average = month.morning.count > 0 ? month.morning.sum / month.morning.count : NaN;
            month.evening.average = month.evening.count > 0 ? month.evening.sum / month.evening.count : NaN;
            month.difference.average = month.difference.count > 0 ? month.difference.sum / month.difference.count : NaN;
        });
        return monthlycounters;
    }
    updateCounters(counter, sourcevalue, year, month) {
        let status = false;
        if (!isNaN(sourcevalue.average)) {
            status = true;
            counter.count++;
            counter.sum += sourcevalue.average;
            if (sourcevalue.average > counter.monthlyhigh) {
                counter.monthlyhigh = sourcevalue.average;
                counter.monthlyhighdate = new Date(year, month - 1, 1);
            }
            if (sourcevalue.average < counter.monthlylow) {
                counter.monthlylow = sourcevalue.average;
                counter.monthlylowdate = new Date(year, month - 1, 1);
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
    updateYearCounters(yearcounters, monthlycounters) {
        const counters = monthlycounters.map((counter, index) => {
            let averages = calculateAverageNew(counter);
            const morningstatus = this.updateCounters(yearcounters[index].morning, averages.morning, counter.year, counter.monthno);
            const everningstatus = this.updateCounters(yearcounters[index].evening, averages.evening, counter.year, counter.monthno);
            if (morningstatus && everningstatus) {
                this.updateCounters(yearcounters[index].difference, averages.difference, counter.year, counter.monthno);
            }
            return createMonthAverageDataNew(counter.monthno, averages);
        });
        return counters;
    }
    calculateYearlyAverages(temperatures) {
        let yearcounters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (createAverageYearCounterNew(0, m)));
        const data = temperatures.data.map(currentyear => {
            const averagedata = createAverageDataNew(currentyear.info.year, currentyear.info.location);
            let monthlycounters = this.getMonthlyvaluesForYear(currentyear);
            averagedata.months = this.updateYearCounters(yearcounters, monthlycounters);
            return averagedata;
        });
        this.yearlyAverages = data;
        return { status: 0, message: null, data: data };
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
    createLinearContTable(temperatures) {
        let lineartable = [];
        for (let year = temperatures.data[0].info.year; year <= temperatures.data[temperatures.data.length - 1].info.year; year++) {
            const lastday = year % 4 == 0 ? 366 : 365;
            for (let day = 1; day <= lastday; day++)
                lineartable.push(createFilteredValueNew(new Date(year, 0, day)));
        }
        let currindex = 0;
        temperatures.data.forEach((yearserie) => {
            while (currindex < lineartable.length && lineartable[currindex].date.getFullYear() < yearserie.info.year)
                currindex++;
            if (currindex < lineartable.length) {
                for (let currdateindex = 0; currdateindex < yearserie.data.length; currdateindex++) {
                    if (yearserie.info.year === lineartable[currindex].date.getFullYear()) {
                        const t = yearserie.data[currdateindex].datetimeLocal;
                        while (currindex < lineartable.length && lineartable[currindex].date < t)
                            currindex++;
                        if (currindex < lineartable.length) {
                            if (t.getDate() === lineartable[currindex].date.getDate()) {
                                if (yearserie.data[currdateindex].evening !== undefined && yearserie.data[currdateindex].morning !== undefined) {
                                    const value = (yearserie.data[currdateindex].evening + yearserie.data[currdateindex].morning) / 2;
                                    lineartable[currindex].average = value;
                                    lineartable[currindex].morning = yearserie.data[currdateindex].morning;
                                    lineartable[currindex].evening = yearserie.data[currdateindex].evening;
                                    lineartable[currindex].difference = yearserie.data[currdateindex].evening - yearserie.data[currdateindex].morning;
                                    ;
                                    currindex++;
                                }
                            }
                        }
                    }
                }
            }
        });
        return lineartable;
    }
    calculateFilteredValues(temperatures) {
        const filteredserie = this.createLinearContTable(temperatures);
        let firstindex = 0;
        let lastindex = 0;
        let negoffset = this.filterlength % 2 ? -this.filterlength / 2 + 0.5 : -this.filterlength / 2;
        let posoffset = negoffset + this.filterlength;
        let filtered = filteredserie.map(ss => {
            if (!isNaN(ss.average)) {
                let first = new Date(ss.date.getFullYear(), ss.date.getMonth(), ss.date.getDate() + negoffset);
                let last = new Date(ss.date.getFullYear(), ss.date.getMonth(), ss.date.getDate() + posoffset);
                while (firstindex < filteredserie.length && filteredserie[firstindex].date < first)
                    firstindex++;
                while (lastindex < filteredserie.length && filteredserie[lastindex].date < last)
                    lastindex++;
                let sum = 0;
                let dec = 0;
                let diffsum = 0;
                let diffdec = 0;
                let morningsum = 0;
                let morningdec = 0;
                let eveningsum = 0;
                let eveningdec = 0;
                for (let index = firstindex; index < lastindex; index++) {
                    if (isNaN(filteredserie[index].average))
                        dec++;
                    else
                        sum += filteredserie[index].average;
                    if (isNaN(filteredserie[index].difference))
                        diffdec++;
                    else
                        diffsum += filteredserie[index].difference;
                    if (isNaN(filteredserie[index].morning))
                        morningdec++;
                    else
                        morningsum += filteredserie[index].morning;
                    if (isNaN(filteredserie[index].evening))
                        eveningdec++;
                    else
                        eveningsum += filteredserie[index].evening;
                }
                let filteredmorning = (lastindex - firstindex - morningdec) > 0 ? morningsum / (lastindex - firstindex - morningdec) : NaN;
                let filteredevening = (lastindex - firstindex - eveningdec) > 0 ? eveningsum / (lastindex - firstindex - eveningdec) : NaN;
                let filteredaverage = (lastindex - firstindex - dec) > 0 ? sum / (lastindex - firstindex - dec) : NaN;
                let filtereddifference = (lastindex - firstindex - diffdec) > 0 ? diffsum / (lastindex - firstindex - diffdec) : NaN;
                return createFilteredNew(ss.date, ss.morning, ss.evening, !isNaN(ss.morning) &&
                    !isNaN(ss.evening) ? (ss.morning + ss.evening) / 2 : NaN, !isNaN(ss.morning) && !isNaN(ss.evening) ? (ss.evening - ss.morning) : NaN, filteredmorning, filteredevening, filteredaverage, filtereddifference, first, last);
            }
            return createDateOnlyFilteredNew(ss.date);
        });
        this.filteredValues = filtered;
        return { status: 0, message: null, data: filtered };
    }
    checkReading(value, date, current, total) {
        let valueok = false;
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
    calculateDailyAverages(temperatures, year = null) {
        let calculationtable = createDefaultYearTableNew(this.defaultyear);
        let firstindex = 0;
        let lastindex = temperatures.data.length;
        if (year) {
            while (firstindex < temperatures.data.length && temperatures.data[firstindex].info.year != year)
                firstindex++;
            lastindex = firstindex + 1;
        }
        for (let yearindex = firstindex; yearindex < lastindex; yearindex++) {
            let sumindex = 0;
            temperatures.data[yearindex].data.forEach(dayreadings => {
                const dt = new Date(dayreadings.datetimeLocal);
                const month = dt.getMonth() + 1;
                const day = dt.getDate();
                while (sumindex < calculationtable.length && (calculationtable[sumindex].day != day || calculationtable[sumindex].month != month))
                    sumindex++;
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
            });
        }
        for (let dayindex = 0; dayindex < calculationtable.length; dayindex++) {
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
        const returnvalue = calculationtable.map(sum => {
            let morning = createOneDayValuesNew(sum.morning.count, sum.morning.average, { date: sum.morning.mindate, value: sum.morning.min }, { date: sum.morning.maxdate, value: sum.morning.max });
            let evening = createOneDayValuesNew(sum.evening.count, sum.evening.average, { date: sum.evening.mindate, value: sum.evening.min }, { date: sum.evening.maxdate, value: sum.evening.max });
            let difference = createOneDayValuesNew(sum.difference.count, sum.difference.average, { date: sum.difference.mindate, value: sum.difference.min }, { date: sum.difference.maxdate, value: sum.difference.max });
            let total = createOneDayValuesNew(sum.difference.count, sum.total.average, { date: sum.total.mindate, value: sum.total.min }, { date: sum.total.maxdate, value: sum.total.max });
            return createDailyValuesNew(sum.date, morning, evening, difference, total);
        });
        this.dailyValues = returnvalue;
        return { status: 0, message: null, data: returnvalue };
    }
    calculateMonthlyTrends(temperatures) {
        return { status: 0, message: null, data: null };
    }
    getEstimate() {
        return 0;
    }
    calculateYearlyTrend(temperatures) {
        let yearlyaverages = this.yearlyAverages;
        let yearlyserie = {
            data: yearlyaverages.map(val => ({
                value: NaN,
                estimate: false,
                estimatevalue: NaN,
                trend: 0,
                year: val.year,
            })),
        };
        const trend = calculateTrendTS([yearlyserie]);
        if (!(isNaN(trend.k) || isNaN(trend.b))) {
            yearlyserie.data.forEach(yeardata => {
                if (yeardata.estimate) {
                    yeardata.estimatevalue = this.getEstimate();
                }
            });
            yearlyserie.data.forEach(ser => (ser.trend = ser.year * trend.k + trend.b));
        }
        this.yearlyTrend = yearlyserie;
        return { status: 0, message: null, data: yearlyserie };
    }
    getMonthChartValues() {
        let values = this.monthlyValues.map(m => {
            let newvalue = createAverageCounterNew(0, m.monthno);
            const high = (isNaN(m.morning.high) || isNaN(m.evening.high)) ? NaN : m.morning.high > m.evening.high ? m.morning.high : m.evening.high;
            const low = (isNaN(m.morning.low) || isNaN(m.evening.low)) ? NaN : m.morning.low < m.evening.low ? m.morning.low : m.evening.low;
            const highdate = (isNaN(m.morning.high) || isNaN(m.evening.high)) ? new Date(0) : m.morning.high > m.evening.high ? m.morning.highdate : m.evening.highdate;
            const lowdate = (isNaN(m.morning.low) || isNaN(m.evening.low)) ? new Date(0) : m.morning.low < m.evening.low ? m.morning.lowdate : m.evening.lowdate;
            fillHiLowNew(newvalue.total, NaN, NaN, NaN, high, highdate, low, lowdate);
            return newvalue;
        });
        let lastyear = this.yearlyAverages[this.yearlyAverages.length - 1].months.map(m => ({
            month: m.monthno,
            value: m.averages.average
        }));
        return values;
    }
    getDefaultYear() {
        return this.defaultyear;
    }
}
let temperatureClass;
function createReturnDataValue(date, value, year, tooltipfunction = null) {
    return { date: date, value: value, tooltipfunction: tooltipfunction, year: year };
}
function createReturnDataType(name, values) {
    return { name: name, values: values };
}
function createGraphSerieType(data, params) {
    return { data: data, params: params };
}
function createValueDate(value) {
    return { date: new Date(0), value: value };
}
function createStatValues() {
    return { average: NaN, averagecount: 0, averagesum: 0,
        high: createValueDate(TempMaxDefaultValue), low: createValueDate(TempMinDefaultValue) };
}
function createMinMaxDataType(date, month) {
    return { date: date, month: month, morning: createStatValues(), evening: createStatValues(), average: createStatValues(), difference: createStatValues(),
        morningfiltered: createStatValues(), eveningfiltered: createStatValues(), averagefiltered: createStatValues(), differencefiltered: createStatValues()
    };
}
function getFilteredDataYearlyArranged(data) {
    let yearlydata = [];
    data.forEach(val => {
        const year = val.date.getFullYear();
        if (!yearlydata[year])
            yearlydata[year] = [];
        yearlydata[year].push(val);
    });
    return yearlydata.map(yeardata => {
        return createNameValues(`Vuosi ${yeardata[0].date.getFullYear()}`, yeardata[0].date, yeardata.map(v => createFilteredNew(v.date, v.morning, v.evening, v.average, v.difference, v.morningfiltered, v.eveningfiltered, v.averagefiltered, v.differencefiltered, v.firstdayfilter, v.lastdayfilter)));
    });
}
function getDateTxt(date) {
    if (date == null || date === undefined || isNaN(date)) {
        return '????';
    }
    return (date) ? `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}` : `-`;
}
function initTemperature() {
    temperatureClass = new Temperatures();
}
exports.initTemperature = initTemperature;
function calculateTemperatures(temperaturevalues) {
    const status1 = temperatureClass.calculateYearlyAverages(temperaturevalues);
    const status3 = temperatureClass.calculateFilteredValues(temperaturevalues);
    const status2 = temperatureClass.calculateDailyAverages(temperaturevalues);
    const status5 = temperatureClass.calculateYearlyTrend(temperaturevalues);
}
exports.calculateTemperatures = calculateTemperatures;
function getYearAverages() {
}
exports.getYearAverages = getYearAverages;
function getAllReadings() {
    const values = temperatureClass.getValidFilteredValues();
    return { values: values.map(v => v), filtersize: temperatureClass.filterlength };
}
exports.getAllReadings = getAllReadings;
function createMinMaxDataTypeTable() {
    let minmaxtable = [];
    for (let i = 0; i < 366; i++) {
        const d = new Date(temperatureClass.defaultyear, 0, i + 1);
        minmaxtable.push(createMinMaxDataType(d.getDate(), d.getMonth()));
    }
    return minmaxtable;
}
function createNameValues(name, date, values) {
    return { name: name, date: date, values: values };
}
function createAllYearsFilteredSeriedata() {
    const alldata = temperatureClass.getValidFilteredValues();
    const yearlyarrangeddata = getFilteredDataYearlyArranged(alldata);
    let returnvalues = yearlyarrangeddata.map(yeardata => {
        return createGraphSerieNew(yeardata.name, '', 0, yeardata.values.map(value => ({
            value: createGraphItemNew(value.date, value.average),
            tooltip: `${getDateTxt(value.date)} ${roundNumber(value.average, 1)}°C`,
        })), false, 0);
    });
    return createGraphSerieType(returnvalues, { series: [{ name: '', markersize: 1 }] });
}
exports.createAllYearsFilteredSeriedata = createAllYearsFilteredSeriedata;
function getDailyMinMaxValues(data) {
    const dailyminmaxtable = createMinMaxDataTypeTable();
    data.forEach(year => {
        let minmaxindex = 0;
        year.values.forEach(day => {
            const date = day.date.getDate();
            const month = day.date.getMonth();
            while (minmaxindex < dailyminmaxtable.length && (dailyminmaxtable[minmaxindex].month != month || dailyminmaxtable[minmaxindex].date != date))
                minmaxindex++;
            if (minmaxindex < dailyminmaxtable.length) {
                updateMinMaxTable(dailyminmaxtable[minmaxindex].morning, day.morning, day.date);
                updateMinMaxTable(dailyminmaxtable[minmaxindex].evening, day.evening, day.date);
                updateMinMaxTable(dailyminmaxtable[minmaxindex].morningfiltered, day.morningfiltered, day.date);
                updateMinMaxTable(dailyminmaxtable[minmaxindex].eveningfiltered, day.eveningfiltered, day.date);
                updateMinMaxTable(dailyminmaxtable[minmaxindex].average, (day.morning + day.evening) / 2, day.date);
                updateMinMaxTable(dailyminmaxtable[minmaxindex].averagefiltered, (day.eveningfiltered + day.morningfiltered) / 2, day.date);
                updateMinMaxTable(dailyminmaxtable[minmaxindex].difference, (day.evening - day.morning), day.date);
                updateMinMaxTable(dailyminmaxtable[minmaxindex].differencefiltered, (day.eveningfiltered - day.morningfiltered), day.date);
            }
        });
    });
    function updateMinMaxTable(dest, newvalue, newdate) {
        dest.averagecount++;
        dest.averagesum += newvalue;
        dest.average = dest.averagesum / dest.averagecount;
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
function createYearlyFilteredSeriedata() {
    const alldata = temperatureClass.getValidFilteredValues();
    const yearlyarrangeddata = getFilteredDataYearlyArranged(alldata);
    function serietooltipcallback(value) {
        return `${getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()))} ${roundNumber(value.value, 1)}°C`;
    }
    let lastyear = alldata.length == 0 ? 0 : alldata[alldata.length - 1].date.getFullYear();
    let yearlydata = [];
    const dailyminmaxtable = getDailyMinMaxValues(yearlyarrangeddata);
    yearlydata.push(createReturnDataType('Korkein', dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, minmax.month, minmax.date), minmax.averagefiltered.high.value, minmax.averagefiltered.high.date.getFullYear(), serietooltipcallback);
    })));
    yearlydata.push(createReturnDataType('Matalin', dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, minmax.month, minmax.date), minmax.averagefiltered.low.value, minmax.averagefiltered.low.date.getFullYear(), serietooltipcallback);
    })));
    let seriedata = yearlyarrangeddata.map(yearlydata => {
        return createReturnDataType(`Vuosi ${yearlydata.date.getFullYear()}`, yearlydata.values.map(value => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, value.date.getMonth(), value.date.getDate()), value.averagefiltered, value.date.getFullYear(), serietooltipcallback);
        }));
    });
    seriedata.forEach(s => yearlydata.push(s));
    const returnvalues = yearlydata.map(dd => {
        return createGraphSerieNew(dd.name, '', 0, dd.values.map(value => ({
            value: createGraphItemNew(value.date, value.value),
            tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0);
    });
    return createGraphSerieType(returnvalues, { showlegend: true,
        selection: [`Vuosi ${lastyear}`, 'Korkein', 'Matalin'], series: [{ name: 'Matalin', color: '#777777' }, { 'name': 'Korkein', color: '#777777' }] });
}
exports.createYearlyFilteredSeriedata = createYearlyFilteredSeriedata;
function getReadingsBetween(startdate, enddate, readings) {
    let retvalues = readings.map(val => val.date >= startdate && val.date <= enddate ? val : null).filter(v => v !== null);
    return retvalues;
}
function createLastYearsSeriedata() {
    function serietooltipcallback(value) {
        return `${getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()))} ${roundNumber(value.value, 1)}°C`;
    }
    const alldata = temperatureClass.getValidFilteredValues();
    const allvalues = getFilteredDataYearlyArranged(alldata);
    const dailyminmaxtable = getDailyMinMaxValues(allvalues);
    const lastdate = allvalues[allvalues.length - 1].values[allvalues[allvalues.length - 1].values.length - 1].date;
    const firstdate = new Date(lastdate.getFullYear() - 1, lastdate.getMonth(), lastdate.getDate());
    const readings = temperatureClass.getValidFilteredValues();
    const lastyearreadings = getReadingsBetween(firstdate, lastdate, readings);
    const morningserie = createReturnDataType('Aamu', lastyearreadings.map(reading => {
        return createReturnDataValue(reading.date, reading.morning, reading.date.getFullYear(), serietooltipcallback);
    }));
    const eveningserie = createReturnDataType('Ilta', lastyearreadings.map(reading => {
        return createReturnDataValue(reading.date, reading.evening, reading.date.getFullYear(), serietooltipcallback);
    }));
    const startyear = firstdate.getFullYear();
    let maxdataarray = [];
    let mindataarray = [];
    let dateindex = dailyminmaxtable.findIndex(item => item.date == firstdate.getDate() && item.month == firstdate.getMonth());
    if (dateindex >= 0) {
        while (dateindex < dailyminmaxtable.length) {
            const minmax = dailyminmaxtable[dateindex];
            const newitemmax = createReturnDataValue(new Date(startyear, minmax.month, minmax.date), minmax.evening.high.value > minmax.morning.high.value ? minmax.evening.high.value : minmax.morning.high.value, minmax.evening.high.value > minmax.morning.high.date.getFullYear() ? minmax.evening.high.value : minmax.morning.high.date.getFullYear(), serietooltipcallback);
            maxdataarray.push(newitemmax);
            const newitemmin = createReturnDataValue(new Date(startyear, minmax.month, minmax.date), minmax.evening.low.value < minmax.morning.low.value ? minmax.evening.low.value : minmax.morning.low.value, minmax.evening.low.value < minmax.morning.low.value ? minmax.evening.low.date.getFullYear() : minmax.morning.low.date.getFullYear(), serietooltipcallback);
            mindataarray.push(newitemmin);
            dateindex++;
        }
    }
    let maxdata = dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(startyear + 1, minmax.month, minmax.date), minmax.evening.high.value > minmax.morning.high.value ? minmax.evening.high.value : minmax.morning.high.value, minmax.evening.high.value > minmax.morning.high.date.getFullYear() ? minmax.evening.high.value : minmax.morning.high.date.getFullYear(), serietooltipcallback);
    });
    maxdataarray = maxdataarray.concat(maxdata);
    const maxserie = createReturnDataType('Korkein', maxdataarray);
    const mindata = dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(startyear + 1, minmax.month, minmax.date), minmax.evening.low.value < minmax.morning.low.value ? minmax.evening.low.value : minmax.morning.low.value, minmax.evening.low.value < minmax.morning.low.value ? minmax.evening.low.date.getFullYear() : minmax.morning.low.date.getFullYear(), serietooltipcallback);
    });
    mindataarray = mindataarray.concat(mindata);
    const minserie = createReturnDataType('Matalin', mindataarray);
    const allseries = [morningserie, eveningserie, maxserie, minserie];
    const returnvalues = allseries.map(serie => {
        return createGraphSerieNew(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItemNew(value.date, value.value),
            tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0);
    });
    return createGraphSerieType(returnvalues, { showlegend: true,
        selection: [`Aamu`, 'Ilta', 'Korkein', 'Matalin'], series: [{ name: 'Matalin', color: '#777777' }, { 'name': 'Korkein', color: '#777777' }] });
}
exports.createLastYearsSeriedata = createLastYearsSeriedata;
function createDailyDiffdata() {
    function serietooltipcallback(value) {
        let daytxt = isNaN(value.year) ?
            `${value.date.getDate()}.${value.date.getMonth() + 1}` :
            getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()));
        return `${daytxt} ${roundNumber(value.value, 1)}°C`;
    }
    const alldata = temperatureClass.getValidFilteredValues();
    const yearlyarrangeddata = getFilteredDataYearlyArranged(alldata);
    const dailyminmaxtable = getDailyMinMaxValues(yearlyarrangeddata);
    const diffserie = createReturnDataType('Keskiarvo', dailyminmaxtable.map(reading => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.month, reading.date), reading.differencefiltered.average, NaN, serietooltipcallback);
    }));
    const maxserie = createReturnDataType('Maksimi', dailyminmaxtable.map(reading => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.month, reading.date), reading.differencefiltered.high.value, reading.differencefiltered.high.date.getFullYear(), serietooltipcallback);
    }));
    const minserie = createReturnDataType('Minimi', dailyminmaxtable.map(reading => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.month, reading.date), reading.differencefiltered.low.value, reading.differencefiltered.low.date.getFullYear(), serietooltipcallback);
    }));
    const lastyear = yearlyarrangeddata[yearlyarrangeddata.length - 1].values[yearlyarrangeddata[yearlyarrangeddata.length - 1].values.length - 1].date.getFullYear();
    const lastyearserie = createReturnDataType(lastyear.toString(), yearlyarrangeddata[yearlyarrangeddata.length - 1].values.map(reading => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.date.getMonth(), reading.date.getDate()), reading.differencefiltered, reading.date.getFullYear(), serietooltipcallback);
    }));
    const allseries = [diffserie, maxserie, minserie, lastyearserie];
    const returnvalues = allseries.map(serie => {
        return createGraphSerieNew(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItemNew(value.date, value.value),
            tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0);
    });
    let selection = '';
    const seriedata = {
        data: returnvalues,
        params: { showlegend: true, series: [{ name: 'Minimi', color: '#777777' }, { name: 'Maksimi', color: '#777777' }], selection: selection }
    };
    return seriedata;
}
exports.createDailyDiffdata = createDailyDiffdata;
function createAllYearsMonthlyAverageSeriedata() {
    temperatureClass.getMonthChartValues();
    let datavalues = [];
    let valueshigh = [];
    return { data: datavalues, params: { showlegend: true } };
}
exports.createAllYearsMonthlyAverageSeriedata = createAllYearsMonthlyAverageSeriedata;
