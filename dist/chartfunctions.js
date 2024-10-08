"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CFcreateAllYearsMonthlyAverageSeriedata = exports.CFcreateAllYearsAverageSeriedata = exports.CFcreateMonthlySpringTrendSeriedata = exports.CFcreateMonthlyFallTrendSeriedata = exports.CFcreateMonthlyWinterTrendSeriedata = exports.CFcreateMonthlySummerTrendSeriedata = exports.createTrendForGivenMonths = exports.CFcreateYearlyTrendSeriedata = exports.CFcalculateMonthlyAverages = exports.CFcreateYearlyHighValuedata = exports.CFcreateDailyDiffdata = exports.CFcreateLastYearsSeriedata = exports.CFcreateYearlyFilteredSeriedata = exports.CFcreateAllYearsFilteredSeriedata = exports.getAllFilteredReadings = exports.CFgetAllReadings = exports.CFcalculateTemperatures = exports.CFinitTemperature = exports.calculateTrend = exports.createDefaultYearTable = exports.getDateTxt = exports.isNumeric = exports.roundNumber = exports.getTempMaxDefaultValue = exports.getTempMinDefaultValue = void 0;
const TempMinDefaultValue = 99999;
const TempMaxDefaultValue = -99999;
function getTempMinDefaultValue() {
    return TempMinDefaultValue;
}
exports.getTempMinDefaultValue = getTempMinDefaultValue;
function getTempMaxDefaultValue() {
    return TempMaxDefaultValue;
}
exports.getTempMaxDefaultValue = getTempMaxDefaultValue;
function roundNumber(value, num) {
    if (isNumeric(value)) {
        if (typeof value === 'number')
            return value.toFixed(num);
        else
            return value;
    }
    if (isNaN(value))
        return 'NaN';
    return '???';
}
exports.roundNumber = roundNumber;
function isNumeric(obj) {
    return !Array.isArray(obj) && (obj - parseFloat(obj) + 1) >= 0;
}
exports.isNumeric = isNumeric;
function getDateTxt(date, short = false) {
    if (date == null || date === undefined || isNaN(date)) {
        return '????';
    }
    if (short)
        return `${date.getDate()}.${date.getMonth() + 1}`;
    return (date) ? `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}` : `-`;
}
exports.getDateTxt = getDateTxt;
function createFiltered(date, morning, evening, average, difference, filteredmorning, filteredevening, filteredaverage, filtereddifference, filterfirstday, filterlastday) {
    return { date: date, morning: morning, evening: evening, average: average, difference: difference, morningfiltered: filteredmorning, eveningfiltered: filteredevening, averagefiltered: filteredaverage, differencefiltered: filtereddifference, firstdayfilter: filterfirstday, lastdayfilter: filterlastday, index: 0 };
}
function createDateOnlyFiltered(date) {
    return { date: date, morning: NaN, evening: NaN, average: NaN, difference: NaN, morningfiltered: NaN, eveningfiltered: NaN, averagefiltered: NaN, differencefiltered: NaN, firstdayfilter: date, lastdayfilter: date, index: 0 };
}
function createAverageMinMaxCalculatedEmpty() {
    return { value: NaN, high: TempMaxDefaultValue, highdate: new Date(0), low: TempMinDefaultValue, lowdate: new Date(0) };
}
function createAverageMinMaxCalculated(value, high, highdate, low, lowdate) {
    return { value: value, high: high, highdate: highdate, low: low, lowdate: lowdate };
}
function createYearlyAverageData(year, location) {
    return { year: year, location: location, yearlyaverage: NaN, yearlyaveragediff: NaN, months: [] };
}
function createAverageCalculated(date, average, morning, evening, difference, total) {
    return { date: date, day: NaN, averagevalue: average, morning: morning, evening: evening, difference: difference, total: total,
        month: 0, average: null, morningfiltered: null, eveningfiltered: null, differencefiltered: null, averagefiltered: null };
}
function createAverageCalculated2(day, month) {
    return { day: day, date: new Date(0), averagevalue: NaN, month: month,
        morning: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        evening: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        average: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        difference: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        total: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        morningfiltered: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        eveningfiltered: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        averagefiltered: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0))),
        differencefiltered: createOneDayValues(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0)))
    };
}
function createAverageCalculated2Table() {
    let minmaxtable = [];
    for (let i = 0; i < 366; i++) {
        const d = new Date(temperatureClass.defaultyear, 0, i + 1);
        minmaxtable.push(createAverageCalculated2(d.getDate(), d.getMonth()));
    }
    return minmaxtable;
}
function createAverageMinMaxCalc() {
    return { sum: 0, count: 0, average: createAverageMinMaxCalculatedEmpty(),
        monthlyhigh: TempMaxDefaultValue, monthlylow: TempMinDefaultValue, monthlyhighdate: new Date(0), monthlylowdate: new Date(0) };
}
function createAverageMinMaxCalcValues(date) {
    return {
        date: date,
        day: date.getDate(),
        monthno: date.getMonth() + 1,
        year: date.getFullYear(),
        morning: createAverageMinMaxCalc(),
        evening: createAverageMinMaxCalc(),
        difference: createAverageMinMaxCalc(),
        total: createAverageMinMaxCalc(),
        average: createAverageMinMaxCalc(),
    };
}
function createAverageMinMaxCalcValues2(year, monthno) {
    return { date: new Date(year, monthno - 1, 1), day: NaN, monthno: monthno, year: year, morning: createAverageMinMaxCalc(), evening: createAverageMinMaxCalc(), difference: createAverageMinMaxCalc(), total: createAverageMinMaxCalc(), average: createAverageMinMaxCalc() };
}
function createAverageYearCounterTable(year) {
    let yearcounters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (createAverageMinMaxCalcValues2(year, m)));
    return yearcounters;
}
function createFilterValueEmpty(date) {
    return { date: date, morning: createAverageMinMaxCalculatedEmpty(), evening: createAverageMinMaxCalculatedEmpty(), average: createAverageMinMaxCalculatedEmpty(), difference: createAverageMinMaxCalculatedEmpty() };
}
function createFilterValue(date, average, morning, evening, difference) {
    return { date: date, morning: morning, evening: evening, average: average, difference: difference };
}
function createAverageYearsMonths(yearlydata, monthlydata) {
    return { yearlydata: yearlydata, monthlydata: monthlydata };
}
function calculateAverage(counter) {
    const morningvalue = counter.morning.count > 0 ? counter.morning.sum / counter.morning.count : NaN;
    const morningmin = createReadingDate(counter.morning.average.low, counter.morning.average.lowdate);
    const morningmax = createReadingDate(counter.morning.average.high, counter.morning.average.highdate);
    const morning = createOneDayValues(counter.morning.count, morningvalue, morningmin, morningmax);
    const eveningvalue = counter.evening.count > 0 ? counter.evening.sum / counter.evening.count : NaN;
    const eveningmin = createReadingDate(counter.evening.average.low, counter.evening.average.lowdate);
    const eveningmax = createReadingDate(counter.evening.average.high, counter.evening.average.highdate);
    const evening = createOneDayValues(counter.evening.count, eveningvalue, eveningmin, eveningmax);
    const differencevalue = counter.difference.count > 0 ? counter.difference.sum / counter.difference.count : NaN;
    const differencemin = createReadingDate(counter.difference.average.low, counter.difference.average.lowdate);
    const differencemax = createReadingDate(counter.difference.average.high, counter.difference.average.highdate);
    const difference = createOneDayValues(counter.difference.count, differencevalue, differencemin, differencemax);
    const total = createOneDayValues(NaN, NaN, createReadingDate(NaN, new Date(0)), createReadingDate(NaN, new Date(0)));
    let average = isNaN(morningvalue) || isNaN(eveningvalue) ? NaN : (morningvalue + eveningvalue) / 2;
    let newitem = createAverageCalculated(new Date(0), average, morning, evening, difference, total);
    newitem.morning.max.value = counter.morning.average.high;
    newitem.morning.max.date = counter.morning.average.highdate;
    newitem.morning.min.value = counter.morning.average.low;
    newitem.morning.min.date = counter.morning.average.lowdate;
    newitem.evening.max.value = counter.evening.average.high;
    newitem.evening.max.date = counter.evening.average.highdate;
    newitem.evening.min.value = counter.evening.average.low;
    newitem.evening.min.date = counter.evening.average.lowdate;
    newitem.difference.max.value = counter.difference.average.high;
    newitem.difference.max.date = counter.difference.average.highdate;
    newitem.difference.min.value = counter.difference.average.low;
    newitem.difference.min.date = counter.difference.average.lowdate;
    return newitem;
}
function createMonthAverageData(monthno, averages) {
    return { monthno: monthno, averages: averages };
}
function createDefaultYearTable(defaultyear) {
    let sums = [];
    for (let dayindex = 0; dayindex < 366; dayindex++) {
        let newdate = new Date(defaultyear, 0, dayindex + 1);
        sums.push(createAverageMinMaxCalcValues(newdate));
    }
    return sums;
}
exports.createDefaultYearTable = createDefaultYearTable;
function createOneDayValues(count, sum, min, max) {
    return { count: count, sum: sum, min: min, max: max, average: NaN };
}
function createReadingDate(value, date) {
    return { value: value, date: date };
}
function createGraphItem(d, v) {
    return [d, v];
}
function createGraphSerie(name, location, year, values, trend, index) {
    return { name: name, location: location, year: year, values: values, trend: trend, index: index };
}
function calculateTrend(valuearray) {
    let k = NaN;
    let b = NaN;
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
    if (n * sumxsqr - sumx * sumx != 0) {
        k = (n * sumxy - sumx * sumy) / (n * sumxsqr - sumx * sumx);
        b = (sumy - k * sumx) / n;
    }
    return { k, b };
}
exports.calculateTrend = calculateTrend;
class Temperatures {
    constructor() {
        this.defaultyear = 1976;
        this.filterlength = 10;
        this.filteredValues = [];
        this.filteredValuesValid = [];
        this.yearlyMonthlyAverages = createAverageYearsMonths([], []);
        this.dailyValues = [];
    }
    getValidFilteredValues() {
        if (this.filteredValuesValid.length == 0) {
            this.filteredValuesValid = this.filteredValues.filter(v => !(isNaN(v.morning) || isNaN(v.evening)));
            this.filteredValuesValid.forEach((fv, i) => fv.index = i);
        }
        return this.filteredValuesValid;
    }
    getMonthlyvaluesForYear(currentyear) {
        let monthlycounters = createAverageYearCounterTable(currentyear.info.year);
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
            month.morning.average.value = month.morning.count > 0 ? month.morning.sum / month.morning.count : NaN;
            month.evening.average.value = month.evening.count > 0 ? month.evening.sum / month.evening.count : NaN;
            month.difference.average.value = month.difference.count > 0 ? month.difference.sum / month.difference.count : NaN;
        });
        return monthlycounters;
    }
    updateCounters(counter, sourcevalue, year, month) {
        if (isNaN(sourcevalue.sum))
            return false;
        counter.count++;
        counter.sum += sourcevalue.sum;
        if (sourcevalue.sum > counter.monthlyhigh) {
            counter.monthlyhigh = sourcevalue.sum;
            counter.monthlyhighdate = new Date(year, month - 1, 1);
        }
        if (sourcevalue.sum < counter.monthlylow) {
            counter.monthlylow = sourcevalue.sum;
            counter.monthlylowdate = new Date(year, month - 1, 1);
        }
        if (sourcevalue.max.value > counter.average.high) {
            counter.average.high = sourcevalue.max.value;
            counter.average.highdate = sourcevalue.max.date;
        }
        if (sourcevalue.min.value < counter.average.low) {
            counter.average.low = sourcevalue.min.value;
            counter.average.lowdate = sourcevalue.min.date;
        }
        return true;
    }
    updateYearCounters(yearcounters, monthlycounters) {
        const monthlyvalues = monthlycounters.map((counter, index) => {
            let averages = calculateAverage(counter);
            const morningstatus = this.updateCounters(yearcounters[index].morning, averages.morning, counter.year, counter.monthno);
            const everningstatus = this.updateCounters(yearcounters[index].evening, averages.evening, counter.year, counter.monthno);
            if (morningstatus && everningstatus) {
                this.updateCounters(yearcounters[index].difference, averages.difference, counter.year, counter.monthno);
            }
            return createMonthAverageData(counter.monthno, averages);
        });
        return monthlyvalues;
    }
    calculateYearlyAndMonthlyAverages(temperatures) {
        let yearcounters = createAverageYearCounterTable(0);
        const returnvalues = temperatures.data.map(currentyear => {
            const averagedata = createYearlyAverageData(currentyear.info.year, currentyear.info.location);
            const monthlycounters = this.getMonthlyvaluesForYear(currentyear);
            averagedata.months = this.updateYearCounters(yearcounters, monthlycounters);
            return averagedata;
        });
        let monthcounters = createAverageYearCounterTable(0);
        function updateCounters(dest, value, year, month) {
            if (isNaN(value))
                return false;
            dest.count++;
            dest.sum += value;
            if (value > dest.average.high) {
                dest.average.high = value;
                dest.average.highdate = new Date(year, month - 1, 1);
            }
            if (value < dest.average.low) {
                dest.average.low = value;
                dest.average.lowdate = new Date(year, month - 1, 1);
            }
            return true;
        }
        returnvalues.forEach(year => {
            year.months.forEach(m => {
                const morningok = updateCounters(monthcounters[m.monthno - 1].morning, m.averages.morning.sum, year.year, m.monthno);
                const eveningok = updateCounters(monthcounters[m.monthno - 1].evening, m.averages.evening.sum, year.year, m.monthno);
                updateCounters(monthcounters[m.monthno - 1].difference, m.averages.difference.sum, year.year, m.monthno);
                if (morningok && eveningok) {
                    updateCounters(monthcounters[m.monthno - 1].average, (m.averages.morning.sum + m.averages.evening.sum) / 2, year.year, m.monthno);
                }
            });
        });
        let monthlydata = monthcounters.map(counter => {
            return createFilterValue(new Date(this.defaultyear, counter.monthno - 1, 1), createAverageMinMaxCalculated(counter.average.count > 0 ? counter.average.sum / counter.average.count : NaN, counter.average.average.high, counter.average.average.highdate, counter.average.average.low, counter.average.average.lowdate), createAverageMinMaxCalculated(counter.morning.count > 0 ? counter.morning.sum / counter.morning.count : NaN, counter.morning.average.high, counter.morning.average.highdate, counter.morning.average.low, counter.morning.average.lowdate), createAverageMinMaxCalculated(counter.evening.count > 0 ? counter.evening.sum / counter.evening.count : NaN, counter.evening.average.high, counter.evening.average.highdate, counter.evening.average.low, counter.evening.average.lowdate), createAverageMinMaxCalculated(counter.difference.count > 0 ? counter.difference.sum / counter.difference.count : NaN, counter.difference.average.high, counter.difference.average.highdate, counter.difference.average.low, counter.difference.average.lowdate));
        });
        returnvalues.forEach(d => {
            let sum = 0;
            let count = 0;
            let diffsum = 0;
            let diffcount = 0;
            d.months.forEach(m => {
                if (!isNaN(m.averages.averagevalue)) {
                    sum += m.averages.averagevalue;
                    count++;
                }
                if (!isNaN(m.averages.difference.sum)) {
                    diffsum += m.averages.difference.sum;
                    diffcount++;
                }
            });
            d.yearlyaverage = count == 12 ? sum / count : NaN;
            d.yearlyaveragediff = diffcount == 12 ? diffsum / diffcount : NaN;
        });
        this.yearlyMonthlyAverages = createAverageYearsMonths(returnvalues, monthlydata);
        return { status: 0, message: null, data: this.yearlyMonthlyAverages };
    }
    createLinearContTable(temperatures) {
        let lineartable = [];
        for (let year = temperatures.data[0].info.year; year <= temperatures.data[temperatures.data.length - 1].info.year; year++) {
            const lastday = year % 4 == 0 ? 366 : 365;
            for (let day = 1; day <= lastday; day++)
                lineartable.push(createFilterValueEmpty(new Date(year, 0, day)));
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
                                    lineartable[currindex].average.value = value;
                                    lineartable[currindex].morning.value = yearserie.data[currdateindex].morning;
                                    lineartable[currindex].evening.value = yearserie.data[currdateindex].evening;
                                    lineartable[currindex].difference.value = yearserie.data[currdateindex].evening - yearserie.data[currdateindex].morning;
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
            if (!isNaN(ss.average.value)) {
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
                    if (isNaN(filteredserie[index].average.value))
                        dec++;
                    else
                        sum += filteredserie[index].average.value;
                    if (isNaN(filteredserie[index].difference.value))
                        diffdec++;
                    else
                        diffsum += filteredserie[index].difference.value;
                    if (isNaN(filteredserie[index].morning.value))
                        morningdec++;
                    else
                        morningsum += filteredserie[index].morning.value;
                    if (isNaN(filteredserie[index].evening.value))
                        eveningdec++;
                    else
                        eveningsum += filteredserie[index].evening.value;
                }
                let filteredmorning = (lastindex - firstindex - morningdec) > 0 ? morningsum / (lastindex - firstindex - morningdec) : NaN;
                let filteredevening = (lastindex - firstindex - eveningdec) > 0 ? eveningsum / (lastindex - firstindex - eveningdec) : NaN;
                let filteredaverage = (lastindex - firstindex - dec) > 0 ? sum / (lastindex - firstindex - dec) : NaN;
                let filtereddifference = (lastindex - firstindex - diffdec) > 0 ? diffsum / (lastindex - firstindex - diffdec) : NaN;
                return createFiltered(ss.date, ss.morning.value, ss.evening.value, !isNaN(ss.morning.value) &&
                    !isNaN(ss.evening.value) ? (ss.morning.value + ss.evening.value) / 2 : NaN, !isNaN(ss.morning.value) && !isNaN(ss.evening.value) ? (ss.evening.value - ss.morning.value) : NaN, filteredmorning, filteredevening, filteredaverage, filtereddifference, first, last);
            }
            return createDateOnlyFiltered(ss.date);
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
            if (value < current.average.low) {
                current.average.low = value;
                current.average.lowdate = date;
                if (total && value < total.average.low) {
                    total.average.low = value;
                    total.average.lowdate = date;
                }
            }
            if (value > current.average.high) {
                current.average.high = value;
                current.average.highdate = date;
                if (total && value > total.average.high) {
                    total.average.high = value;
                    total.average.highdate = date;
                }
            }
        }
        return valueok;
    }
    calculateDailyAverages(temperatures, year = null) {
        let calculationtable = createDefaultYearTable(this.defaultyear);
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
                while (sumindex < calculationtable.length && (calculationtable[sumindex].day != day || calculationtable[sumindex].monthno != month))
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
                calculationtable[dayindex].morning.average.value = calculationtable[dayindex].morning.sum / (calculationtable[dayindex].morning.count > 0 ? calculationtable[dayindex].morning.count : 1);
            }
            if (calculationtable[dayindex].evening.count > 0) {
                calculationtable[dayindex].evening.average.value = calculationtable[dayindex].evening.sum / (calculationtable[dayindex].evening.count > 0 ? calculationtable[dayindex].evening.count : 1);
            }
            if (calculationtable[dayindex].difference.count > 0) {
                calculationtable[dayindex].difference.average.value = calculationtable[dayindex].difference.sum / (calculationtable[dayindex].difference.count > 0 ? calculationtable[dayindex].difference.count : 1);
            }
            if (calculationtable[dayindex].morning.count > 0 && calculationtable[dayindex].evening.count > 0) {
                calculationtable[dayindex].total.average.value = (calculationtable[dayindex].morning.average.value + calculationtable[dayindex].evening.average.value) / 2;
            }
        }
        const returnvalue = calculationtable.map(sum => {
            let morning = createOneDayValues(sum.morning.count, sum.morning.average.value, { date: sum.morning.average.lowdate, value: sum.morning.average.low }, { date: sum.morning.average.highdate, value: sum.morning.average.high });
            let evening = createOneDayValues(sum.evening.count, sum.evening.average.value, { date: sum.evening.average.lowdate, value: sum.evening.average.low }, { date: sum.evening.average.highdate, value: sum.evening.average.high });
            let difference = createOneDayValues(sum.difference.count, sum.difference.average.value, { date: sum.difference.average.lowdate, value: sum.difference.average.low }, { date: sum.difference.average.highdate, value: sum.difference.average.high });
            let total = createOneDayValues(sum.difference.count, sum.total.average.value, { date: sum.total.average.lowdate, value: sum.total.average.low }, { date: sum.total.average.highdate, value: sum.total.average.high });
            return createAverageCalculated(sum.date, NaN, morning, evening, difference, total);
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
let allFilteredDataYearlyArranged = [];
function getAllFilteredDataYearlyArranged() {
    if (allFilteredDataYearlyArranged.length == 0)
        allFilteredDataYearlyArranged = getFilteredDataYearlyArranged(temperatureClass.getValidFilteredValues());
    return allFilteredDataYearlyArranged;
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
        return createNameValues(`Vuosi ${yeardata[0].date.getFullYear()}`, yeardata[0].date, yeardata.map(v => createFiltered(v.date, v.morning, v.evening, v.average, v.difference, v.morningfiltered, v.eveningfiltered, v.averagefiltered, v.differencefiltered, v.firstdayfilter, v.lastdayfilter)));
    });
}
function CFinitTemperature() {
    temperatureClass = new Temperatures();
}
exports.CFinitTemperature = CFinitTemperature;
function CFcalculateTemperatures(temperaturevalues) {
    const status1 = temperatureClass.calculateYearlyAndMonthlyAverages(temperaturevalues);
    const status3 = temperatureClass.calculateFilteredValues(temperaturevalues);
    const status2 = temperatureClass.calculateDailyAverages(temperaturevalues);
}
exports.CFcalculateTemperatures = CFcalculateTemperatures;
function CFgetAllReadings() {
    const values = temperatureClass.getValidFilteredValues();
    const values2 = values.map(v => {
        return createFiltered(v.date, v.morning, v.evening, v.average, v.difference, v.morningfiltered, v.eveningfiltered, v.averagefiltered, v.differencefiltered, v.firstdayfilter, v.lastdayfilter);
    }).reverse();
    for (let i = 0; i < values2.length; i++)
        values2[i].index = i;
    return { values: values2, filtersize: temperatureClass.filterlength };
}
exports.CFgetAllReadings = CFgetAllReadings;
function getAllFilteredReadings(temperatures) {
    return { values: temperatureClass.createLinearContTable(temperatures), filtersize: 10 };
}
exports.getAllFilteredReadings = getAllFilteredReadings;
function createNameValues(name, date, values) {
    return { name: name, date: date, values: values };
}
function CFcreateAllYearsFilteredSeriedata() {
    const yearlyarrangeddata = getAllFilteredDataYearlyArranged();
    let returnvalues = yearlyarrangeddata.map(yeardata => {
        return createGraphSerie(yeardata.name, '', 0, yeardata.values.map(value => ({
            value: createGraphItem(value.date, value.average),
            tooltip: `${getDateTxt(value.date)} ${roundNumber(value.average, 1)}°C`,
        })), false, 0);
    });
    return createGraphSerieType(returnvalues, { series: [{ name: '', markersize: 1 }] });
}
exports.CFcreateAllYearsFilteredSeriedata = CFcreateAllYearsFilteredSeriedata;
function getDailyMinMaxValues(data) {
    const dailyminmaxtable = createAverageCalculated2Table();
    data.forEach(year => {
        let minmaxindex = 0;
        year.values.forEach(day => {
            const date = day.date.getDate();
            const month = day.date.getMonth();
            while (minmaxindex < dailyminmaxtable.length && (dailyminmaxtable[minmaxindex].month != month || dailyminmaxtable[minmaxindex].day != date))
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
        dest.count++;
        dest.sum += newvalue;
        dest.average = dest.sum / dest.count;
        if (newvalue > dest.max.value) {
            dest.max.value = newvalue;
            dest.max.date = newdate;
        }
        if (newvalue < dest.min.value) {
            dest.min.value = newvalue;
            dest.min.date = newdate;
        }
    }
    return dailyminmaxtable;
}
function CFcreateYearlyFilteredSeriedata() {
    function serietooltipcallback(value) {
        return `${getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()))} ${roundNumber(value.value, 1)}°C`;
    }
    const yearlyarrangeddata = getAllFilteredDataYearlyArranged();
    let lastyear = yearlyarrangeddata.length > 0 ? yearlyarrangeddata[yearlyarrangeddata.length - 1].date.getFullYear() : 0;
    let yearlydata = [];
    const dailyminmaxtable = getDailyMinMaxValues(yearlyarrangeddata);
    yearlydata.push(createReturnDataType('Korkein', dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, minmax.month, minmax.average.max.date.getDate()), minmax.averagefiltered.max.value, minmax.averagefiltered.max.date.getFullYear(), serietooltipcallback);
    })));
    yearlydata.push(createReturnDataType('Matalin', dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, minmax.month, minmax.average.min.date.getDate()), minmax.averagefiltered.min.value, minmax.averagefiltered.min.date.getFullYear(), serietooltipcallback);
    })));
    let seriedata = yearlyarrangeddata.map(yearlydata => {
        return createReturnDataType(`Vuosi ${yearlydata.date.getFullYear()}`, yearlydata.values.map(value => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, value.date.getMonth(), value.date.getDate()), value.averagefiltered, value.date.getFullYear(), serietooltipcallback);
        }));
    });
    seriedata.forEach(s => yearlydata.push(s));
    const returnvalues = yearlydata.map(dd => {
        return createGraphSerie(dd.name, '', 0, dd.values.map(value => ({
            value: createGraphItem(value.date, value.value),
            tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0);
    });
    return createGraphSerieType(returnvalues, { showlegend: true,
        selection: [`Vuosi ${lastyear}`, 'Korkein', 'Matalin'], series: [{ name: 'Matalin', color: '#777777' }, { 'name': 'Korkein', color: '#777777' }] });
}
exports.CFcreateYearlyFilteredSeriedata = CFcreateYearlyFilteredSeriedata;
function getReadingsBetween(startdate, enddate, readings) {
    let retvalues = readings.map(val => val.date >= startdate && val.date <= enddate ? val : null).filter(v => v !== null);
    return retvalues;
}
function CFcreateLastYearsSeriedata() {
    function serietooltipcallback(value) {
        return `${getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()))} ${roundNumber(value.value, 1)}°C`;
    }
    const allvalues = getAllFilteredDataYearlyArranged();
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
    let dateindex = dailyminmaxtable.findIndex(item => item.day == firstdate.getDate() && item.month == firstdate.getMonth());
    if (dateindex >= 0) {
        while (dateindex < dailyminmaxtable.length) {
            const minmax = dailyminmaxtable[dateindex];
            const newitemmax = createReturnDataValue(new Date(startyear, minmax.month, minmax.day), minmax.evening.max.value > minmax.morning.max.value ? minmax.evening.max.value : minmax.morning.max.value, minmax.evening.max.value > minmax.morning.max.date.getFullYear() ? minmax.evening.max.value : minmax.morning.max.date.getFullYear(), serietooltipcallback);
            maxdataarray.push(newitemmax);
            const newitemmin = createReturnDataValue(new Date(startyear, minmax.month, minmax.day), minmax.evening.min.value < minmax.morning.min.value ? minmax.evening.min.value : minmax.morning.min.value, minmax.evening.min.value < minmax.morning.min.value ? minmax.evening.min.date.getFullYear() : minmax.morning.min.date.getFullYear(), serietooltipcallback);
            mindataarray.push(newitemmin);
            dateindex++;
        }
    }
    let maxdata = dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(startyear + 1, minmax.month, minmax.day), minmax.evening.max.value > minmax.morning.max.value ? minmax.evening.max.value : minmax.morning.max.value, minmax.evening.max.value > minmax.morning.max.date.getFullYear() ? minmax.evening.max.value : minmax.morning.max.date.getFullYear(), serietooltipcallback);
    });
    maxdataarray = maxdataarray.concat(maxdata);
    const maxserie = createReturnDataType('Korkein', maxdataarray);
    const mindata = dailyminmaxtable.map(minmax => {
        return createReturnDataValue(new Date(startyear + 1, minmax.month, minmax.day), minmax.evening.min.value < minmax.morning.min.value ? minmax.evening.min.value : minmax.morning.min.value, minmax.evening.min.value < minmax.morning.min.value ? minmax.evening.min.date.getFullYear() : minmax.morning.min.date.getFullYear(), serietooltipcallback);
    });
    mindataarray = mindataarray.concat(mindata);
    const minserie = createReturnDataType('Matalin', mindataarray);
    const allseries = [morningserie, eveningserie, maxserie, minserie];
    const returnvalues = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value),
            tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0);
    });
    return createGraphSerieType(returnvalues, { showlegend: true,
        selection: [`Aamu`, 'Ilta', 'Korkein', 'Matalin'], series: [{ name: 'Matalin', color: '#777777' }, { 'name': 'Korkein', color: '#777777' }] });
}
exports.CFcreateLastYearsSeriedata = CFcreateLastYearsSeriedata;
function CFcreateDailyDiffdata() {
    function serietooltipcallback(value) {
        let daytxt = isNaN(value.year) ?
            `${value.date.getDate()}.${value.date.getMonth() + 1}` :
            getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()));
        return `${daytxt} ${roundNumber(value.value, 1)}°C`;
    }
    const yearlyarrangeddata = getAllFilteredDataYearlyArranged();
    const dailyminmaxtable = getDailyMinMaxValues(yearlyarrangeddata);
    const diffserie = createReturnDataType('Keskiarvo', dailyminmaxtable.map(reading => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.month, reading.day), reading.differencefiltered.average, NaN, serietooltipcallback);
    }));
    const maxserie = createReturnDataType('Maksimi', dailyminmaxtable.map(reading => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.month, reading.day), reading.differencefiltered.max.value, reading.differencefiltered.max.date.getFullYear(), serietooltipcallback);
    }));
    const minserie = createReturnDataType('Minimi', dailyminmaxtable.map(reading => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.month, reading.day), reading.differencefiltered.min.value, reading.differencefiltered.min.date.getFullYear(), serietooltipcallback);
    }));
    const lastyear = yearlyarrangeddata[yearlyarrangeddata.length - 1].values[yearlyarrangeddata[yearlyarrangeddata.length - 1].values.length - 1].date.getFullYear();
    const lastyearserie = createReturnDataType(lastyear.toString(), yearlyarrangeddata[yearlyarrangeddata.length - 1].values.map(reading => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.date.getMonth(), reading.date.getDate()), reading.differencefiltered, reading.date.getFullYear(), serietooltipcallback);
    }));
    const allseries = [diffserie, maxserie, minserie, lastyearserie];
    const returnvalues = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value),
            tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0);
    });
    const selection = allseries.map(c => (c.name));
    const seriedata = {
        data: returnvalues,
        params: { showlegend: true, series: [{ name: 'Minimi', color: '#777777' }, { name: 'Maksimi', color: '#777777' }], selection: selection }
    };
    return seriedata;
}
exports.CFcreateDailyDiffdata = CFcreateDailyDiffdata;
function CFcreateYearlyHighValuedata() {
    function serietooltipcallback(value) {
        let daytxt = isNaN(value.year) ?
            `${value.date.getDate()}.${value.date.getMonth() + 1}` :
            getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()));
        return `${daytxt} ${roundNumber(value.value, 1)}°C`;
    }
    const yearlyarrangeddata = getAllFilteredDataYearlyArranged();
    const dailyminmaxtable = getDailyMinMaxValues(yearlyarrangeddata);
    let values = yearlyarrangeddata.map(y => ({ year: y.date.getFullYear(), high: 0, low: 0 }));
    dailyminmaxtable.forEach(day => {
        values[day.morning.max.date.getFullYear()].high++;
        values[day.evening.max.date.getFullYear()].high++;
        values[day.morning.min.date.getFullYear()].low++;
        values[day.evening.min.date.getFullYear()].low++;
    });
    const highserie = createReturnDataType('Korkein', values.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), value.high, value.year, serietooltipcallback);
    }));
    const lowserie = createReturnDataType('Matalin', values.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), value.low, value.year, serietooltipcallback);
    }));
    const allseries = [lowserie, highserie];
    const returnvalues = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value),
            tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0);
    });
    return createGraphSerieType(returnvalues, { showlegend: true });
}
exports.CFcreateYearlyHighValuedata = CFcreateYearlyHighValuedata;
function createYearlyAveragesEstimates(values, averages) {
    return { values: values, averages: averages };
}
function createMonthlyAverage(temperature, difference) {
    return { temperature: temperature, difference: difference };
}
function createTempDiffTable(temp, diff) {
    return { temp: temp, diff: diff };
}
function createYearlyAverage(year, yearaverage, yearaveragediff, months) {
    return { year: year, yearaverage: yearaverage, yearaveragediff: yearaveragediff, months: months, estimate: false };
}
function CFcalculateMonthlyAverages() {
    const months = temperatureClass.yearlyMonthlyAverages.monthlydata;
    const years = temperatureClass.yearlyMonthlyAverages.yearlydata;
    let tempaverages = months.map(month => month.average.value);
    let diffvalues = months.map(month => month.difference.value);
    let yearlyaverages = years.map(year => {
        return createYearlyAverage(year.year, year.yearlyaverage, year.yearlyaveragediff, year.months.map(month => {
            return createMonthlyAverage(month.averages.averagevalue, month.averages.difference.sum);
        }));
    });
    return createYearlyAveragesEstimates(yearlyaverages, createTempDiffTable(tempaverages, diffvalues));
}
exports.CFcalculateMonthlyAverages = CFcalculateMonthlyAverages;
function CFcreateYearlyTrendSeriedata() {
    function serietooltipcallback(value) {
        return `${value.year} ${roundNumber(value.value, 1)}°C`;
    }
    const years = temperatureClass.yearlyMonthlyAverages.yearlydata;
    const yeartemperatureserie = createReturnDataType('Lämpötila', years.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), value.yearlyaverage, value.year, serietooltipcallback);
    }));
    const yeardiffserie = createReturnDataType('Illan ja aamun ero', years.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), value.yearlyaveragediff, value.year, serietooltipcallback);
    }));
    const tempdata = yeartemperatureserie.values.map(val => ({
        year: val.year,
        value: val.value
    }));
    const trendcalc = { data: tempdata };
    const trend = calculateTrend([trendcalc]);
    let values = [];
    if (!(isNaN(trend.k) || isNaN(trend.b))) {
        values = yeartemperatureserie.values.map(val => ({
            year: val.year,
            value: val.year * trend.k + trend.b,
        }));
    }
    const trendserie = createReturnDataType(`Suuntaus ${trend.k > 0 ? '+' : '-'}${roundNumber(trend.k * 10, 1)} °C/10v`, values.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), value.value, value.year, serietooltipcallback);
    }));
    const diffdata = yeardiffserie.values.map(val => ({
        year: val.year,
        value: val.value,
    }));
    const difftrendcalc = { data: diffdata };
    const difftrend = calculateTrend([difftrendcalc]);
    let diffvalues = [];
    if (!(isNaN(difftrend.k) || isNaN(difftrend.b))) {
        diffvalues = yeardiffserie.values.map(val => ({
            year: val.year,
            value: val.year * difftrend.k + difftrend.b,
        }));
    }
    const difftrendserie = createReturnDataType(`Erosuuntaus ${difftrend.k > 0 ? '+' : '-'}${roundNumber(difftrend.k * 10, 1)} °C/10v`, diffvalues.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), value.value, value.year, serietooltipcallback);
    }));
    const allseries = [yeartemperatureserie, trendserie, yeardiffserie, difftrendserie];
    const returnvalues = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value),
            tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0);
    });
    let params = { rangeoffset: 1, showlegend: true };
    return createGraphSerieType(returnvalues, params);
}
exports.CFcreateYearlyTrendSeriedata = CFcreateYearlyTrendSeriedata;
function createMonthDataPair(month, data) {
    return { month: month, data: data };
}
function createValueDataValue(value, year, month) {
    return { value: value, year: year, month: month };
}
function createTrendForGivenMonths(monthnumbers, monthnames) {
    let datavalues = [];
    const years = temperatureClass.yearlyMonthlyAverages.yearlydata;
    const monthlydata = monthnumbers.map(m => {
        return createMonthDataPair(m - 1, years.map(y => {
            return createValueDataValue(y.months[m - 1].averages.averagevalue, y.year, m - 1);
        }));
    });
    monthlydata.forEach(month => {
        let found = monthnumbers.indexOf(month.month + 1);
        if (found >= 0) {
            let values = month.data.map(value => ({
                value: createGraphItem(new Date(value.year, 0, 1), value.value),
                tooltip: `${value.year} ${monthnames[found]} ${roundNumber(value.value, 1)}`
            }));
            datavalues.push(createGraphSerie(monthnames[datavalues.length], 'location', 0, values, false, monthnumbers[found]));
        }
    });
    let trend = calculateTrend(monthlydata);
    let newvalues = years.map((ser, serieindex) => ({
        value: createGraphItem(new Date(ser.year, 0, 1), isNaN(trend.k) ? NaN : ser.year * trend.k + trend.b),
        tooltip: `${ser.year} Suuntaus ${isNaN(trend.k) ? '???' : roundNumber(ser.year * trend.k + trend.b, 1)}`
    }));
    if (isNaN(trend.k))
        datavalues.push(createGraphSerie(`Trendi --- °C/10v`, 'location', 0, newvalues, true, -1));
    else
        datavalues.push(createGraphSerie(`Trendi ${trend.k > 0 ? '+' : ''}${roundNumber(trend.k * 10, 1)}°C/10v`, 'location', 0, newvalues, true, -1));
    return datavalues;
}
exports.createTrendForGivenMonths = createTrendForGivenMonths;
function CFcreateMonthlySummerTrendSeriedata() {
    const returnvalues = createTrendForGivenMonths([6, 7, 8], ['Kesäkuu', 'Heinäkuu', 'Elokuu']);
    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true });
}
exports.CFcreateMonthlySummerTrendSeriedata = CFcreateMonthlySummerTrendSeriedata;
function CFcreateMonthlyWinterTrendSeriedata() {
    const returnvalues = createTrendForGivenMonths([1, 2, 12], ['Tammikuu', 'Helmikuu', 'Joulukuu']);
    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true });
}
exports.CFcreateMonthlyWinterTrendSeriedata = CFcreateMonthlyWinterTrendSeriedata;
function CFcreateMonthlyFallTrendSeriedata() {
    const returnvalues = createTrendForGivenMonths([9, 10, 11], ['Syyskuu', 'Lokakuu', 'Marraskuu']);
    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true });
}
exports.CFcreateMonthlyFallTrendSeriedata = CFcreateMonthlyFallTrendSeriedata;
function CFcreateMonthlySpringTrendSeriedata() {
    const returnvalues = createTrendForGivenMonths([3, 4, 5], ['Maaliskuu', 'Huhtikuu', 'Toukokuu']);
    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true });
}
exports.CFcreateMonthlySpringTrendSeriedata = CFcreateMonthlySpringTrendSeriedata;
function CFcreateAllYearsAverageSeriedata() {
    function serietooltipcallback(value) {
        let daytxt = isNaN(value.year) ?
            `${value.date.getDate()}.${value.date.getMonth() + 1}` :
            getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()));
        return `${daytxt} ${roundNumber(value.value, 1)}°C`;
    }
    const days = temperatureClass.dailyValues.map(day => ({ average: day.total.sum, max: day.total.max, min: day.total.min, maxday: day.total.max.date }));
    const yearlyarrangeddata = getAllFilteredDataYearlyArranged();
    const minserie = createReturnDataType(`Matalin`, days.map(day => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, day.min.date.getMonth(), day.min.date.getDate()), day.min.value, day.min.date.getFullYear(), serietooltipcallback);
    }));
    const maxserie = createReturnDataType(`Korkein`, days.map(day => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, day.max.date.getMonth(), day.max.date.getDate()), day.max.value, day.max.date.getFullYear(), serietooltipcallback);
    }));
    const curyearno = new Date().getFullYear();
    const curyear = createReturnDataType(`Vuosi ${curyearno}`, yearlyarrangeddata[yearlyarrangeddata.length - 1].values.map(day => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, day.date.getMonth(), day.date.getDate()), day.average, day.date.getFullYear(), serietooltipcallback);
    }));
    const allseries = [minserie, maxserie, curyear];
    const returnvalues = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value),
            tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0);
    });
    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true });
}
exports.CFcreateAllYearsAverageSeriedata = CFcreateAllYearsAverageSeriedata;
function CFcreateAllYearsMonthlyAverageSeriedata() {
    function serietooltipcallback(value) {
        let daytxt = isNaN(value.year) ? `${value.date.getDate()}.${value.date.getMonth() + 1}` : `${value.date.getMonth() + 1}/${value.year}`;
        return `${daytxt} ${roundNumber(value.value, 1)}°C`;
    }
    const months = temperatureClass.yearlyMonthlyAverages.monthlydata;
    const years = temperatureClass.yearlyMonthlyAverages.yearlydata;
    const maxserie = createReturnDataType(`Korkein`, months.map(month => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, month.date.getMonth(), month.date.getDate()), month.average.high, month.average.highdate.getFullYear(), serietooltipcallback);
    }));
    const minserie = createReturnDataType(`Matalin`, months.map(month => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, month.date.getMonth(), month.date.getDate()), month.average.low, month.average.lowdate.getFullYear(), serietooltipcallback);
    }));
    let lastyear = 0;
    const allyears = years.map(year => {
        lastyear = year.year;
        return createReturnDataType(`Vuosi ${year.year}`, year.months.map(month => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, month.monthno - 1, 1), month.averages.averagevalue, years[years.length - 1].year, serietooltipcallback);
        }));
    });
    const allseries = [minserie, maxserie];
    for (let i = 0; i < allyears.length; i++)
        allseries.push(allyears[i]);
    const returnvalues = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value),
            tooltip: value.tooltipfunction !== null ? value.tooltipfunction(value) : '',
        })), false, 0);
    });
    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true, selection: [`Vuosi ${lastyear}`, 'Korkein', 'Matalin'] });
}
exports.CFcreateAllYearsMonthlyAverageSeriedata = CFcreateAllYearsMonthlyAverageSeriedata;
