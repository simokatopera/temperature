"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareReadings = exports.CFcalculateTrend = exports.CFcreateAllYearsMonthlyAverageSeriedata = exports.CFcreateAllYearsAverageSeriedata = exports.CFcreateMonthlySpringTrendSeriedata = exports.CFcreateMonthlyFallTrendSeriedata = exports.CFcreateMonthlyWinterTrendSeriedata = exports.CFcreateMonthlySummerTrendSeriedata = exports.createTrendForGivenMonths = exports.CFcreateYearlyTrendSeriedata = exports.CFcalculateMonthlyAverages = exports.CFcreateYearlyHighValuedata = exports.CFcreateDailyDiffdata = exports.CFcreateLastYearsSeriedata = exports.CFcreateYearlyFilteredSeriedata = exports.CFcreateAllYearsFilteredSeriedata = exports.CFgetAllReadings = exports.CFinitTemperature = exports.getDateTxt = exports.isNumeric = exports.roundNumber = exports.getTempMaxDefaultValue = exports.getTempMinDefaultValue = void 0;
const TempMinDefaultValue = 99999;
const TempMaxDefaultValue = -99999;
function getTempMinDefaultValue() { return TempMinDefaultValue; }
exports.getTempMinDefaultValue = getTempMinDefaultValue;
function getTempMaxDefaultValue() { return TempMaxDefaultValue; }
exports.getTempMaxDefaultValue = getTempMaxDefaultValue;
function roundNumber(value, num) {
    if (isNaN(value))
        return 'NaN';
    if (isNumeric(value)) {
        if (typeof value === 'number')
            return value.toFixed(num);
        else
            return value;
    }
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
        return (date) ? `${date.getDate()}.${date.getMonth() + 1}` : `-`;
    return (date) ? `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}` : `-`;
}
exports.getDateTxt = getDateTxt;
function createMinMaxAverageCount(count, sum, min, max) {
    return { count: count, sum: sum, average: count > 0 ? sum / count : NaN, min: min, max: max };
}
function createReadingDate(value, date) {
    return { value: value, date: date };
}
function createOneDayValuesEmpty() {
    return createMinMaxAverageCount(0, 0, createReadingDate(TempMinDefaultValue, new Date(0)), createReadingDate(TempMaxDefaultValue, new Date(0)));
}
function createAverageMinMaxCalcValues(date) {
    return { date: date, day: date.getDate(), monthno: date.getMonth() + 1, year: date.getFullYear(),
        averagevalue: NaN,
        morning: createOneDayValuesEmpty(),
        evening: createOneDayValuesEmpty(),
        difference: createOneDayValuesEmpty(),
        total: createOneDayValuesEmpty(),
        morningfiltered: createOneDayValuesEmpty(),
        eveningfiltered: createOneDayValuesEmpty(),
        differencefiltered: createOneDayValuesEmpty(),
        totalfiltered: createOneDayValuesEmpty()
    };
}
function createAverageCalculatedTable(year, datasize, incrmonth) {
    return Array.from({ length: datasize }).map((x, i) => createAverageMinMaxCalcValues(new Date(year, incrmonth ? i : 0, incrmonth ? 1 : i + 1)));
}
function createAverageCalculated12MonthsTable(year) {
    return createAverageCalculatedTable(year, 12, true);
}
function createAverageCalculated366DaysTable(year) {
    return createAverageCalculatedTable(year, 366, false);
}
function createAverageCalculated(date, year, average, morning, evening, difference, total) {
    return { date: date, year: year, monthno: date.getMonth() + 1, day: date.getDate(), averagevalue: average, morning: morning, evening: evening, difference: difference, total: total,
        morningfiltered: null, eveningfiltered: null, differencefiltered: null, totalfiltered: null };
}
function updateMinMaxTable(minmaxvalues, newvalue, newdate) {
    if (newvalue == null || isNaN(newvalue))
        return false;
    minmaxvalues.count++;
    minmaxvalues.sum += newvalue;
    minmaxvalues.average = minmaxvalues.sum / minmaxvalues.count;
    if (newvalue > minmaxvalues.max.value) {
        minmaxvalues.max.value = newvalue;
        minmaxvalues.max.date = newdate;
    }
    if (newvalue < minmaxvalues.min.value) {
        minmaxvalues.min.value = newvalue;
        minmaxvalues.min.date = newdate;
    }
    return true;
}
function createFiltered(date, morning, evening, average, difference, filteredmorning, filteredevening, filteredaverage, filtereddifference, filterfirstday, filterlastday) {
    return { date: date, morning: morning, evening: evening, average: average, difference: difference, morningfiltered: filteredmorning, eveningfiltered: filteredevening, averagefiltered: filteredaverage, differencefiltered: filtereddifference, firstdayfilter: filterfirstday, lastdayfilter: filterlastday, index: 0, morninghighest: false, morninglowest: false, eveninghighest: false, eveninglowest: false };
}
function createDateOnlyFiltered(date) {
    return { date: date, morning: NaN, evening: NaN, average: NaN, difference: NaN, morningfiltered: NaN, eveningfiltered: NaN, averagefiltered: NaN, differencefiltered: NaN, firstdayfilter: date, lastdayfilter: date, index: 0, morninghighest: false, morninglowest: false, eveninghighest: false, eveninglowest: false };
}
function createAverageMinMaxCalculatedEmpty() {
    return { value: NaN, high: TempMaxDefaultValue, highdate: new Date(0), low: TempMinDefaultValue, lowdate: new Date(0) };
}
function createAverageMinMaxCalculated(value, high, highdate, low, lowdate) {
    return { value: value, high: high, highdate: highdate, low: low, lowdate: lowdate };
}
function createYearlyAverageData(year, location, estimate = false) {
    return { year: year, location: location, yearlyaverage: NaN, yearlyaveragediff: NaN, months: [], estimate: estimate };
}
function createFilterValueEmpty(date) {
    return { date: date, morning: createAverageMinMaxCalculatedEmpty(), evening: createAverageMinMaxCalculatedEmpty(), total: createAverageMinMaxCalculatedEmpty(), difference: createAverageMinMaxCalculatedEmpty() };
}
function createFilterValue(date, average, morning, evening, difference) {
    return { date: date, morning: morning, evening: evening, total: average, difference: difference };
}
function createAverageYearsMonths(yearlydata, monthlydata) {
    return { yearlydata: yearlydata, monthlydata: monthlydata };
}
function calculateAverage(counter) {
    const morningmin = createReadingDate(counter.morning.min.value, counter.morning.min.date);
    const morningmax = createReadingDate(counter.morning.max.value, counter.morning.max.date);
    const morning = createMinMaxAverageCount(counter.morning.count, counter.morning.sum, morningmin, morningmax);
    const eveningmin = createReadingDate(counter.evening.min.value, counter.evening.min.date);
    const eveningmax = createReadingDate(counter.evening.max.value, counter.evening.max.date);
    const evening = createMinMaxAverageCount(counter.evening.count, counter.evening.sum, eveningmin, eveningmax);
    const differencemin = createReadingDate(counter.difference.min.value, counter.difference.min.date);
    const differencemax = createReadingDate(counter.difference.max.value, counter.difference.max.date);
    const difference = createMinMaxAverageCount(counter.difference.count, counter.difference.sum, differencemin, differencemax);
    const totalmin = createReadingDate(counter.total.min.value, counter.total.min.date);
    const totalmax = createReadingDate(counter.total.max.value, counter.total.max.date);
    const total = createMinMaxAverageCount(counter.total.count, counter.total.sum, totalmin, totalmax);
    let newitem = createAverageCalculated(counter.date, counter.year, counter.total.average, morning, evening, difference, total);
    return newitem;
}
function createMonthAverageData(monthno, monthlytemperature, monthlytemperaturecount, monthlydifference, monthlydifferencecount, averages) {
    return { monthno: monthno,
        monthlytemperaturecount: monthlytemperaturecount,
        monthlytemperature: monthlytemperature,
        monthlydifferencecount: monthlydifferencecount,
        monthlydifference: monthlydifference,
        averages: averages, estimate: false };
}
function createGraphSerieType(data, params) {
    return { data: data, params: params };
}
function createGraphSerie(name, location, year, values, trend, index) {
    return { name: name, location: location, year: year, values: values, trend: trend, index: index };
}
function createGraphItem(d, v, e) {
    return [d, v, e];
}
class Temperatures {
    constructor(filterlength, monthnames, monthnameslong) {
        this.defaultyear = 1976;
        this.filteredValues = [];
        this.filteredValuesValid = [];
        this.yearlyMonthlyAverages = createAverageYearsMonths([], []);
        this.dailyValues = [];
        this.allFilteredDataYearlyArranged = [];
        this.monthnames = [];
        this.monthnameslong = [];
        this.filterlength = filterlength;
        this.monthnames = monthnames;
        this.monthnameslong = monthnameslong;
    }
    getValidFilteredValues() {
        if (this.filteredValuesValid.length == 0) {
            this.filteredValuesValid = this.filteredValues.filter(v => !(isNaN(v.morning) || isNaN(v.evening)));
            this.filteredValuesValid.forEach((fv, i) => fv.index = i);
        }
        return this.filteredValuesValid;
    }
    updateYearCounters(yearcounters, monthlycounters) {
        const monthlyvalues = monthlycounters.map((counter, index) => {
            let averages = calculateAverage(counter);
            const morningstatus = updateMinMaxTable(yearcounters[index].morning, averages.morning.count > 0 ? averages.morning.sum / averages.morning.count : NaN, new Date(counter.year, counter.monthno, 1));
            const everningstatus = updateMinMaxTable(yearcounters[index].evening, averages.evening.count > 0 ? averages.evening.sum / averages.evening.count : NaN, new Date(counter.year, counter.monthno, 1));
            if (morningstatus && everningstatus) {
                updateMinMaxTable(yearcounters[index].difference, averages.difference.count > 0 ? averages.difference.sum / averages.difference.count : NaN, new Date(counter.year, counter.monthno, 1));
                updateMinMaxTable(yearcounters[index].total, averages.total.count > 0 ? averages.total.sum / averages.total.count : NaN, new Date(counter.year, counter.monthno, 1));
            }
            const monthlytempereature = counter.total.average;
            const monthlytempereaturecount = counter.total.count;
            const monthlydifference = counter.difference.average;
            const monthlydifferencecount = counter.difference.count;
            return createMonthAverageData(counter.monthno, monthlytempereature, monthlytempereaturecount, monthlydifference, monthlydifferencecount, averages);
        });
        return monthlyvalues;
    }
    calculateMonthlyValuesForCurrentYear(currentyear) {
        let monthlycounters = createAverageCalculated12MonthsTable(currentyear.info.year);
        currentyear.data.forEach(monthlytemp => {
            const monthindex = monthlytemp.datetimeLocal.getMonth();
            const morningvalueexists = updateMinMaxTable(monthlycounters[monthindex].morning, monthlytemp.morning, monthlytemp.datetimeLocal);
            const eveningvalueexists = updateMinMaxTable(monthlycounters[monthindex].evening, monthlytemp.evening, monthlytemp.datetimeLocal);
            if (eveningvalueexists && morningvalueexists) {
                const diff = (monthlytemp.evening - monthlytemp.morning);
                const aver = (monthlytemp.evening + monthlytemp.morning) / 2;
                updateMinMaxTable(monthlycounters[monthindex].difference, diff, monthlytemp.datetimeLocal);
                updateMinMaxTable(monthlycounters[monthindex].total, aver, monthlytemp.datetimeLocal);
            }
            monthlycounters[monthindex].averagevalue = monthlycounters[monthindex].total.average;
        });
        return monthlycounters;
    }
    getEstimateForMonth(year, monthindex, monthlyreadings) {
        let dailyindex = 0;
        let estimationcount = 0;
        let estimationdiffsum = 0;
        let estimationsum = 0;
        let countday = new Date(year, monthindex, 1);
        while (countday.getMonth() == monthindex) {
            let curdate = countday.getDate();
            if (dailyindex >= monthlyreadings.length || curdate < monthlyreadings[dailyindex].date.getDate()) {
                let datefound = this.dailyValues.find(d => d.date.getMonth() == monthindex && d.date.getDate() == curdate);
                if (datefound) {
                    estimationcount++;
                    estimationsum += datefound.averagevalue;
                    estimationdiffsum += datefound.difference.average;
                }
                else {
                    console.log(`Estimate calculation for day: ${curdate} failed`);
                }
            }
            else {
                estimationcount++;
                estimationsum += monthlyreadings[dailyindex].average;
                estimationdiffsum += monthlyreadings[dailyindex].difference;
            }
            countday = new Date(year, monthindex, curdate + 1);
            while (dailyindex < monthlyreadings.length && curdate >= monthlyreadings[dailyindex].date.getDate()) {
                dailyindex++;
            }
        }
        return { temperature: estimationsum / estimationcount, difference: estimationdiffsum / estimationcount };
    }
    calculateYearlyAndMonthlyAveragesWithEstimates(temperatures) {
        let yearcounters = createAverageCalculated12MonthsTable(this.defaultyear);
        let allyearsandmonthsstatistics = [];
        const yearlystatistics = temperatures.data.map(year => {
            const averagedata = createYearlyAverageData(year.info.year, year.info.location);
            const allmonthsstatistics = this.calculateMonthlyValuesForCurrentYear(year);
            allyearsandmonthsstatistics[year.info.year] = { year: year.info.year, data: allmonthsstatistics };
            averagedata.months = this.updateYearCounters(yearcounters, allmonthsstatistics);
            averagedata.yearlyaverage = 0;
            let sum = 0;
            let count = 0;
            let dsum = 0;
            let dcount = 0;
            let estimates = false;
            averagedata.months.forEach(month => {
                let daycount = new Date(year.info.year, month.monthno, 0).getDate();
                if (month.monthlytemperaturecount >= daycount) {
                    count++;
                    sum += month.monthlytemperature;
                }
                else {
                    month.estimate = true;
                    estimates = true;
                }
                dcount++;
                dsum += month.monthlydifference;
            });
            averagedata.estimate = estimates;
            averagedata.yearlyaverage = estimates ? NaN : sum / count;
            averagedata.yearlyaveragediff = estimates ? NaN : dsum / dcount;
            return averagedata;
        });
        const monthlystatistics = yearcounters.map((monthcounter, monthindex) => {
            return createFilterValue(new Date(this.defaultyear, monthindex, 1), createAverageMinMaxCalculated(monthcounter.total.count > 0 ? monthcounter.total.sum / monthcounter.total.count : NaN, monthcounter.total.max.value, monthcounter.total.max.date, monthcounter.total.min.value, monthcounter.total.min.date), createAverageMinMaxCalculated(monthcounter.morning.count > 0 ? monthcounter.morning.sum / monthcounter.morning.count : NaN, monthcounter.morning.max.value, monthcounter.morning.max.date, monthcounter.morning.min.value, monthcounter.morning.min.date), createAverageMinMaxCalculated(monthcounter.evening.count > 0 ? monthcounter.evening.sum / monthcounter.evening.count : NaN, monthcounter.evening.max.value, monthcounter.evening.max.date, monthcounter.evening.min.value, monthcounter.evening.min.date), createAverageMinMaxCalculated(monthcounter.difference.count > 0 ? monthcounter.difference.sum / monthcounter.difference.count : NaN, monthcounter.difference.max.value, monthcounter.difference.max.date, monthcounter.difference.min.value, monthcounter.difference.min.date));
        });
        yearlystatistics.forEach((year) => {
            const allyyearreadings = this.getAllFilteredDataYearlyArranged();
            const thisyearreadings = allyyearreadings[year.year];
            if (year.estimate) {
                year.months.forEach((month, monthindex) => {
                    if (month.estimate) {
                        let x = this.getEstimateForMonth(year.year, monthindex, thisyearreadings.values.filter(reading => reading.date.getMonth() == monthindex));
                        month.monthlytemperature = x.temperature;
                        month.monthlydifference = x.difference;
                    }
                });
            }
            let yearsum = year.months.reduce((a, b) => a + b.monthlytemperature, 0);
            year.yearlyaverage = yearsum / 12;
            let diffsum = year.months.reduce((a, b) => a + b.monthlydifference, 0);
            year.yearlyaveragediff = diffsum / 12;
        });
        this.yearlyMonthlyAverages = createAverageYearsMonths(yearlystatistics, monthlystatistics);
        return { status: 0, message: null, data: this.yearlyMonthlyAverages };
    }
    createLinearContTable(temperatures) {
        let lineartable = [];
        if (temperatures.data.length == 0)
            return lineartable;
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
                                    lineartable[currindex].total.value = value;
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
            if (!isNaN(ss.total.value)) {
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
                    if (isNaN(filteredserie[index].total.value))
                        dec++;
                    else
                        sum += filteredserie[index].total.value;
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
    calculateDailyAverages(temperatures, year = null) {
        let calculationtable = createAverageCalculated366DaysTable(this.defaultyear);
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
                    const value1ok = updateMinMaxTable(foundsum.morning, dayreadings.morning, dayreadings.datetimeLocal);
                    const value2ok = updateMinMaxTable(foundsum.evening, dayreadings.evening, dayreadings.datetimeLocal);
                    if (value1ok && value2ok) {
                        updateMinMaxTable(foundsum.total, (dayreadings.morning + dayreadings.evening) / 2, dayreadings.datetimeLocal);
                    }
                    if (value1ok && value2ok) {
                        updateMinMaxTable(foundsum.difference, dayreadings.evening - dayreadings.morning, dayreadings.datetimeLocal);
                    }
                }
            });
        }
        const dailyvalues = calculationtable.map(sum => {
            let morning = createMinMaxAverageCount(sum.morning.count, sum.morning.sum, { date: sum.morning.min.date, value: sum.morning.min.value }, { date: sum.morning.max.date, value: sum.morning.max.value });
            let evening = createMinMaxAverageCount(sum.evening.count, sum.evening.sum, { date: sum.evening.min.date, value: sum.evening.min.value }, { date: sum.evening.max.date, value: sum.evening.max.value });
            let difference = createMinMaxAverageCount(sum.difference.count, sum.difference.sum, { date: sum.difference.min.date, value: sum.difference.min.value }, { date: sum.difference.max.date, value: sum.difference.max.value });
            let total = createMinMaxAverageCount(sum.total.count, sum.total.sum, { date: sum.total.min.date, value: sum.total.min.value }, { date: sum.total.max.date, value: sum.total.max.value });
            return createAverageCalculated(sum.date, NaN, total.count > 0 ? total.sum / total.count : NaN, morning, evening, difference, total);
        });
        this.dailyValues = dailyvalues;
        return { status: 0, message: null, data: dailyvalues };
    }
    calculateTemperatures(temperaturevalues) {
        const status3 = this.calculateFilteredValues(temperaturevalues);
        const status2 = this.calculateDailyAverages(temperaturevalues);
        const status1 = this.calculateYearlyAndMonthlyAveragesWithEstimates(temperaturevalues);
    }
    getFilteredDataYearlyArranged() {
        let data = this.getValidFilteredValues();
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
    getAllFilteredDataYearlyArranged() {
        if (this.allFilteredDataYearlyArranged.length == 0)
            this.allFilteredDataYearlyArranged = this.getFilteredDataYearlyArranged();
        return this.allFilteredDataYearlyArranged;
    }
    getDailyMinMaxValues(data) {
        const dailyminmaxtable = createAverageCalculated366DaysTable(this.defaultyear);
        data.forEach(year => {
            let minmaxindex = 0;
            year.values.forEach(day => {
                const date = day.date.getDate();
                const month = day.date.getMonth() + 1;
                while (minmaxindex < dailyminmaxtable.length && (dailyminmaxtable[minmaxindex].monthno != month || dailyminmaxtable[minmaxindex].day != date))
                    minmaxindex++;
                if (minmaxindex < dailyminmaxtable.length) {
                    updateMinMaxTable(dailyminmaxtable[minmaxindex].morning, day.morning, day.date);
                    updateMinMaxTable(dailyminmaxtable[minmaxindex].evening, day.evening, day.date);
                    updateMinMaxTable(dailyminmaxtable[minmaxindex].difference, (day.evening - day.morning), day.date);
                    updateMinMaxTable(dailyminmaxtable[minmaxindex].total, (day.evening + day.morning) / 2, day.date);
                    updateMinMaxTable(dailyminmaxtable[minmaxindex].morningfiltered, day.morningfiltered, day.date);
                    updateMinMaxTable(dailyminmaxtable[minmaxindex].eveningfiltered, day.eveningfiltered, day.date);
                    updateMinMaxTable(dailyminmaxtable[minmaxindex].totalfiltered, (day.eveningfiltered + day.morningfiltered) / 2, day.date);
                    updateMinMaxTable(dailyminmaxtable[minmaxindex].differencefiltered, (day.eveningfiltered - day.morningfiltered), day.date);
                }
            });
        });
        return dailyminmaxtable;
    }
}
let temperatureClass;
function createReturnDataValue(date, value, year, estimate, tooltipfunction = null, tooltipformat = null) {
    return { date: date, value: value, year: year, estimate: estimate, tooltipfunction: tooltipfunction, tooltipformat: tooltipformat };
}
function createReturnDataType(name, values) {
    return { name: name, values: values };
}
function createNameValues(name, date, values) {
    return { name: name, date: date, values: values };
}
function createYearlyAveragesEstimates(yearlyvalues, monthlyaverages, values) {
    return { yearlyvalues: yearlyvalues, monthlyvalues: monthlyaverages, monthlystatvalues: values };
}
function createMonthlyAverage(temperature, difference, estimate) {
    return { temperature: temperature, difference: difference, estimate: estimate };
}
function createYearlyAverage(year, yearaverage, yearaveragediff, months, estimate = false) {
    return { year: year, yearaverage: yearaverage, yearaveragediff: yearaveragediff, months: months, estimate: estimate };
}
function createTempDiffTable(temp, diff) {
    return { temperature: temp, diff: diff };
}
function createMonthDataPair(month, data, estimate = false) {
    return { month: month, data: data, estimate: estimate };
}
function createValueDataValue(value, year, month, estimate = false) {
    return { value: value, year: year, month: month, estimate: estimate };
}
function createYearlyMinMax(year, min, max) {
    return { year: year, low: min, high: max };
}
function createTrendCalcTable(data) {
    return { data: data };
}
function createTrendCalcData(year, value) {
    return { year: year, value: value };
}
function createGraphParams(name, symbol, symbolsize, symbolindex) {
    return { name: name, symbol: symbol, symbolindex: symbolindex, symbolsize: symbolsize };
}
function createHiLoValue(date, average, minvalue, mindate, maxvalue, maxdate) {
    return { date: date, average: average, min: createReadingDate(minvalue, mindate), max: createReadingDate(maxvalue, maxdate) };
}
function getReadingsBetween(startdate, enddate, readings) {
    let retvalues = readings.map(val => val.date >= startdate && val.date <= enddate ? val : null).filter(v => v !== null);
    return retvalues;
}
function createTooltip(seriename, value) {
    if (value.tooltipfunction === null)
        return '';
    return value.tooltipfunction(seriename, value);
}
function addEstimatesToParameters(series) {
    let estimateitems = [];
    let currentyear = new Date().getFullYear();
    let currentmonth = new Date().getMonth();
    series.forEach(serie => {
        if (serie.values && serie.values.length) {
            serie.values.forEach((month, monthindex) => {
                if (month.estimate) {
                    if (month.year < currentyear || (month.year == currentyear && month.date.getMonth() <= currentmonth)) {
                        estimateitems.push(createGraphParams(serie.name, 'circle', 14, monthindex));
                    }
                    else {
                        month.value = NaN;
                    }
                }
            });
        }
    });
    return estimateitems;
}
function CFinitTemperature(temperaturevalues, filtersize, monthnames, monthnameslong) {
    temperatureClass = new Temperatures(filtersize, monthnames, monthnameslong);
    temperatureClass.calculateTemperatures(temperaturevalues);
}
exports.CFinitTemperature = CFinitTemperature;
function CFgetAllReadings() {
    const values = temperatureClass.getValidFilteredValues();
    const returnvalues = values.map(v => {
        return createFiltered(v.date, v.morning, v.evening, v.average, v.difference, v.morningfiltered, v.eveningfiltered, v.averagefiltered, v.differencefiltered, v.firstdayfilter, v.lastdayfilter);
    }).reverse();
    const dayshighlowvalues = temperatureClass.dailyValues;
    let minmaxindex = dayshighlowvalues.length - 1;
    for (let i = 0; i < returnvalues.length; i++) {
        returnvalues[i].index = i;
        if (dayshighlowvalues.length) {
            while (dayshighlowvalues[minmaxindex].date.getMonth() != returnvalues[i].date.getMonth() ||
                dayshighlowvalues[minmaxindex].date.getDate() != returnvalues[i].date.getDate()) {
                minmaxindex--;
                if (minmaxindex < 0)
                    minmaxindex = dayshighlowvalues.length - 1;
            }
            if (returnvalues[i].morning == dayshighlowvalues[minmaxindex].morning.max.value)
                returnvalues[i].morninghighest = true;
            if (returnvalues[i].evening == dayshighlowvalues[minmaxindex].evening.max.value)
                returnvalues[i].eveninghighest = true;
            if (returnvalues[i].morning == dayshighlowvalues[minmaxindex].morning.min.value)
                returnvalues[i].morninglowest = true;
            if (returnvalues[i].evening == dayshighlowvalues[minmaxindex].morning.min.value)
                returnvalues[i].eveninglowest = true;
        }
    }
    return { values: returnvalues, filtersize: temperatureClass.filterlength };
}
exports.CFgetAllReadings = CFgetAllReadings;
function CFcreateAllYearsFilteredSeriedata() {
    const yearlyarrangeddata = temperatureClass.getAllFilteredDataYearlyArranged();
    let returnvalues = yearlyarrangeddata.map(yeardata => {
        const item = yeardata.values.map(value => ({
            value: createGraphItem(value.date, value.average, false),
            tooltip: `${getDateTxt(value.date)} ${roundNumber(value.average, 1)}°C`,
            estimate: false,
        }));
        return createGraphSerie(yeardata.name, '', 0, item, false, 0);
    });
    return createGraphSerieType(returnvalues, { series: [{ name: '', markersize: 1 }] });
}
exports.CFcreateAllYearsFilteredSeriedata = CFcreateAllYearsFilteredSeriedata;
function CFcreateYearlyFilteredSeriedata() {
    function serietooltipcallback(seriename, value) {
        return `${seriename} ${getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()))} ${roundNumber(value.value, 1)}°C`;
    }
    const yearlyarrangeddata = temperatureClass.getAllFilteredDataYearlyArranged();
    let lastyear = yearlyarrangeddata.length > 0 ? yearlyarrangeddata[yearlyarrangeddata.length - 1].date.getFullYear() : 0;
    let yearlydata = [];
    const dailyminmaxtable = temperatureClass.getDailyMinMaxValues(yearlyarrangeddata);
    yearlydata.push(createSerie_7('Korkein', dailyminmaxtable, (minmax) => (new Date(temperatureClass.defaultyear, minmax.monthno - 1, minmax.totalfiltered.max.value > getTempMaxDefaultValue() ? minmax.total.max.date.getDate() : minmax.date.getDate())), (minmax) => (minmax.totalfiltered.max.value > getTempMaxDefaultValue() ? minmax.totalfiltered.max.value : NaN), (minmax) => (minmax.totalfiltered.max.value > getTempMaxDefaultValue() ? minmax.totalfiltered.max.date.getFullYear() : NaN), serietooltipcallback));
    yearlydata.push(createSerie_7('Matalin', dailyminmaxtable, (minmax) => (new Date(temperatureClass.defaultyear, minmax.monthno - 1, minmax.totalfiltered.min.value < getTempMinDefaultValue() ? minmax.total.min.date.getDate() : minmax.date.getDate())), (minmax) => (minmax.totalfiltered.min.value < getTempMinDefaultValue() ? minmax.totalfiltered.min.value : NaN), (minmax) => (minmax.totalfiltered.min.value < getTempMinDefaultValue() ? minmax.totalfiltered.min.date.getFullYear() : NaN), serietooltipcallback));
    let seriedata = yearlyarrangeddata.map(yeardata => {
        return createReturnDataType(`Vuosi ${yeardata.date.getFullYear()}`, yeardata.values.map(value => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, value.date.getMonth(), value.date.getDate()), value.averagefiltered, value.date.getFullYear(), false, serietooltipcallback);
        }));
    });
    yearlydata = yearlydata.concat(seriedata);
    const returnvalues = yearlydata.map(dd => {
        return createGraphSerie(dd.name, '', 0, dd.values.map(value => ({
            value: createGraphItem(value.date, value.value, false),
            tooltip: createTooltip(dd.name, value)
        })), false, 0);
    });
    return createGraphSerieType(returnvalues, { showlegend: true,
        selection: [`Vuosi ${lastyear}`, 'Korkein', 'Matalin'], series: [{ name: 'Matalin', color: '#777777' }, { 'name': 'Korkein', color: '#777777' }] });
}
exports.CFcreateYearlyFilteredSeriedata = CFcreateYearlyFilteredSeriedata;
function CFcreateLastYearsSeriedata() {
    function serietooltipcallback(seriename, value) {
        return `${seriename} ${getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()))} ${roundNumber(value.value, 1)}°C`;
    }
    const allvalues = temperatureClass.getAllFilteredDataYearlyArranged();
    const dailyminmaxtable = temperatureClass.getDailyMinMaxValues(allvalues);
    const lastdate = allvalues[allvalues.length - 1].values[allvalues[allvalues.length - 1].values.length - 1].date;
    const firstdate = new Date(lastdate.getFullYear() - 1, lastdate.getMonth(), lastdate.getDate());
    const readings = temperatureClass.getValidFilteredValues();
    const lastyearreadings = getReadingsBetween(firstdate, lastdate, readings);
    let curdate = firstdate;
    let index = 0;
    const fillledlastyearreadings = [];
    while (curdate <= lastdate) {
        if (curdate.getDate() == lastyearreadings[index].date.getDate() &&
            curdate.getMonth() == lastyearreadings[index].date.getMonth()) {
            fillledlastyearreadings.push(createFiltered(curdate, lastyearreadings[index].morning, lastyearreadings[index].evening, lastyearreadings[index].average, lastyearreadings[index].difference, lastyearreadings[index].morningfiltered, lastyearreadings[index].eveningfiltered, lastyearreadings[index].averagefiltered, lastyearreadings[index].differencefiltered, lastyearreadings[index].firstdayfilter, lastyearreadings[index].lastdayfilter));
            index++;
        }
        else {
            fillledlastyearreadings.push(createFiltered(curdate, NaN, NaN, NaN, NaN, NaN, NaN, NaN, NaN, new Date(0), new Date(0)));
        }
        curdate = new Date(curdate.getFullYear(), curdate.getMonth(), curdate.getDate() + 1);
    }
    const morningserie = createSerie_4('Aamu', fillledlastyearreadings, (reading) => (reading.morning), null, serietooltipcallback);
    const eveningserie = createSerie_4('Ilta', fillledlastyearreadings, (reading) => (reading.evening), null, serietooltipcallback);
    let estimateparams = [];
    let today = new Date();
    today = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (today.getHours() > 16 ? 1 : 0));
    morningserie.values.forEach((day, dayindex) => {
        if (day.date > today)
            estimateparams.push(createGraphParams(morningserie.name, 'circle', 8, dayindex));
    });
    eveningserie.values.forEach((day, dayindex) => {
        if (day.date > today)
            estimateparams.push(createGraphParams(eveningserie.name, 'circle', 8, dayindex));
    });
    const startyear = firstdate.getFullYear();
    let maxdataarray = [];
    let mindataarray = [];
    let dateindex = dailyminmaxtable.findIndex(item => item.day == firstdate.getDate() && item.monthno - 1 == firstdate.getMonth());
    if (dateindex >= 0) {
        while (dateindex < dailyminmaxtable.length) {
            const minmax = dailyminmaxtable[dateindex];
            let highvalue = NaN;
            let lowvalue = NaN;
            let highdate = NaN;
            let lowdate = NaN;
            if (minmax.evening.max.value > getTempMaxDefaultValue()) {
                highvalue = minmax.evening.max.value > minmax.morning.max.value ? minmax.evening.max.value : minmax.morning.max.value;
                highdate = minmax.evening.max.value > minmax.morning.max.date.getFullYear() ? minmax.evening.max.value : minmax.morning.max.date.getFullYear();
                lowvalue = minmax.evening.min.value < minmax.morning.min.value ? minmax.evening.min.value : minmax.morning.min.value;
                lowdate = minmax.evening.min.value < minmax.morning.min.value ? minmax.evening.min.date.getFullYear() : minmax.morning.min.date.getFullYear();
            }
            const newitemmax = createReturnDataValue(new Date(startyear, minmax.monthno - 1, minmax.day), highvalue, highdate, false, serietooltipcallback);
            maxdataarray.push(newitemmax);
            const newitemmin = createReturnDataValue(new Date(startyear, minmax.monthno - 1, minmax.day), lowvalue, lowdate, false, serietooltipcallback);
            mindataarray.push(newitemmin);
            dateindex++;
        }
    }
    const maxserie = createReturnDataType('Korkein', maxdataarray.concat(createSerie_3(dailyminmaxtable, startyear + 1, (value) => (value.evening.max.value > value.morning.max.value ? value.evening.max.value : value.morning.max.value), (value) => (value.evening.max.value > value.morning.max.value ? value.evening.max.date.getFullYear() : value.morning.max.date.getFullYear()), serietooltipcallback)));
    const minserie = createReturnDataType('Matalin', mindataarray.concat(createSerie_3(dailyminmaxtable, startyear + 1, (value) => (value.evening.min.value < value.morning.min.value ? value.evening.min.value : value.morning.min.value), (value) => (value.evening.min.value < value.morning.min.value ? value.evening.min.date.getFullYear() : value.morning.min.date.getFullYear()), serietooltipcallback)));
    const allseries = [morningserie, eveningserie, maxserie, minserie];
    const returnvalues = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value, false),
            tooltip: createTooltip(serie.name, value),
        })), false, 0);
    });
    return createGraphSerieType(returnvalues, { showlegend: true,
        selection: [`Aamu`, 'Ilta', 'Korkein', 'Matalin'],
        series: [{ name: 'Matalin', color: '#777777' }, { 'name': 'Korkein', color: '#777777' }].concat(estimateparams),
        legend: { items: temperatureClass.monthnames }
    });
}
exports.CFcreateLastYearsSeriedata = CFcreateLastYearsSeriedata;
function CFcreateDailyDiffdata() {
    function serietooltipcallback(seriename, value) {
        let daytxt = isNaN(value.year) ?
            `${value.date.getDate()}.${value.date.getMonth() + 1}` :
            getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()));
        return `${seriename} ${daytxt} ${roundNumber(value.value, 1)}°C`;
    }
    const yearlyarrangeddata = temperatureClass.getAllFilteredDataYearlyArranged();
    const dailyminmaxtable = temperatureClass.getDailyMinMaxValues(yearlyarrangeddata);
    const averageserie = createSerie_4('Keskiarvo', dailyminmaxtable, (value) => (value.differencefiltered.average), (value) => (NaN), serietooltipcallback);
    const maxserie = createSerie_4('Maksimi', dailyminmaxtable, (value) => (value.differencefiltered.max.value > getTempMaxDefaultValue() ? value.differencefiltered.max.value : NaN), (value) => (value.differencefiltered.max.value > getTempMaxDefaultValue() ? value.differencefiltered.max.date.getFullYear() : NaN), serietooltipcallback);
    const minserie = createSerie_4('Minimi', dailyminmaxtable, (value) => (value.differencefiltered.min.value < getTempMinDefaultValue() ? value.differencefiltered.min.value : NaN), (value) => (value.differencefiltered.min.value < getTempMinDefaultValue() ? value.differencefiltered.min.date.getFullYear() : NaN), serietooltipcallback);
    let lastyear = '';
    const yearseries = yearlyarrangeddata.map(year => {
        lastyear = year.name;
        return createReturnDataType(year.name, year.values.map(reading => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, reading.date.getMonth(), reading.date.getDate()), reading.differencefiltered, reading.date.getFullYear(), false, serietooltipcallback);
        }));
    });
    let allseries = [averageserie, maxserie, minserie];
    allseries = allseries.concat(yearseries);
    const returnvalues = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value, false),
            tooltip: createTooltip(serie.name, value),
        })), false, 0);
    });
    const selection = [lastyear, 'Keskiarvo', 'Maksimi', 'Minimi'];
    const seriedata = {
        data: returnvalues,
        params: { showlegend: true, series: [{ name: 'Minimi', color: '#777777' }, { name: 'Maksimi', color: '#777777' }], selection: selection }
    };
    return seriedata;
}
exports.CFcreateDailyDiffdata = CFcreateDailyDiffdata;
function CFcreateYearlyHighValuedata() {
    function serietooltipcallback(seriename, value) {
        let daytxt = isNaN(value.year) ? `???` : ` vuosi ${value.year}`;
        return `${seriename} ${daytxt} ${roundNumber(value.value, 0)} kpl`;
    }
    const yearlyarrangeddata = temperatureClass.getAllFilteredDataYearlyArranged();
    const dailyminmaxtable = temperatureClass.getDailyMinMaxValues(yearlyarrangeddata);
    let yearlyminmaxvalues = yearlyarrangeddata.map(y => (createYearlyMinMax(y.date.getFullYear(), 0, 0)));
    dailyminmaxtable.forEach(day => {
        if (day.morning.max.date && yearlyminmaxvalues[day.morning.max.date.getFullYear()]) {
            yearlyminmaxvalues[day.morning.max.date.getFullYear()].high++;
            yearlyminmaxvalues[day.evening.max.date.getFullYear()].high++;
            yearlyminmaxvalues[day.morning.min.date.getFullYear()].low++;
            yearlyminmaxvalues[day.evening.min.date.getFullYear()].low++;
        }
    });
    let lastyearestimate = false;
    const years = temperatureClass.yearlyMonthlyAverages.yearlydata;
    if (years[years.length - 1].estimate) {
        lastyearestimate = true;
        let lastday = yearlyarrangeddata[yearlyarrangeddata.length - 1].values[yearlyarrangeddata[yearlyarrangeddata.length - 1].values.length - 1].date;
        const curhigh = yearlyminmaxvalues[yearlyminmaxvalues.length - 1].high;
        const curlow = yearlyminmaxvalues[yearlyminmaxvalues.length - 1].low;
        let firstday = new Date(lastday.getFullYear(), 0, 1);
        let dayno = lastday.valueOf() - firstday.valueOf();
        const oneday = 24 * 60 * 60 * 1000;
        let days = Number(roundNumber(dayno / oneday, 1));
        if (days == 0)
            days = 365;
        yearlyminmaxvalues[yearlyminmaxvalues.length - 1].high = 365 * curhigh / days;
        yearlyminmaxvalues[yearlyminmaxvalues.length - 1].low = 365 * curlow / days;
    }
    const highserie = createSerie_8('Ylin', yearlyminmaxvalues, (value) => (value.high), lastyearestimate, serietooltipcallback);
    const lowserie = createSerie_8('Alin', yearlyminmaxvalues, (value) => (value.low), lastyearestimate, serietooltipcallback);
    const hightrendserie = createSerie_9('Ylimpien suuntaus', yearlyminmaxvalues, (v) => (v.high), serietooltipcallback);
    const lowtrendserie = createSerie_9('Alimpien suuntaus', yearlyminmaxvalues, (v) => (v.low), serietooltipcallback);
    const allseries = [lowserie, highserie, hightrendserie, lowtrendserie];
    const returnvalues = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value, false),
            tooltip: createTooltip(serie.name, value),
        })), false, 0);
    });
    let estimateitems = addEstimatesToParameters(allseries);
    const params = { showlegend: true, series: estimateitems };
    return createGraphSerieType(returnvalues, params);
}
exports.CFcreateYearlyHighValuedata = CFcreateYearlyHighValuedata;
function CFcalculateMonthlyAverages() {
    const months = temperatureClass.yearlyMonthlyAverages.monthlydata;
    const years = temperatureClass.yearlyMonthlyAverages.yearlydata;
    let tempaverages = months.map(month => month.total.value);
    let diffaverages = months.map(month => month.difference.value);
    const yearlyMonthaverages = years.map(year => {
        return createYearlyAverage(year.year, year.yearlyaverage, year.yearlyaveragediff, year.months.map(month => {
            return createMonthlyAverage(month.monthlytemperature, month.monthlydifference, month.estimate);
        }), year.estimate);
    });
    const sumtemp = tempaverages.reduce((a, b) => a += isNaN(b) ? 0 : b, 0);
    const sumdiff = diffaverages.reduce((a, b) => a += isNaN(b) ? 0 : b, 0);
    tempaverages.push(sumtemp / tempaverages.length);
    diffaverages.push(sumdiff / diffaverages.length);
    function standardDeviation(arr, usePopulation = false) {
        const mean = arr.reduce((acc, val) => acc + val, 0) / arr.length;
        return Math.sqrt(arr.reduce((acc, val) => acc.concat((val - mean) ** 2), []).reduce((acc, val) => acc + val, 0) /
            (arr.length - (usePopulation ? 0 : 1)));
    }
    ;
    let stdevarray = [];
    const allvalues = CFgetAllReadings();
    for (var month = 0; month < 12; month++) {
        let arr = allvalues.values.map(val => (val.date.getMonth() == month ? val.average : null)).filter(v => v !== null);
        let average = arr.reduce((acc, val) => (acc + val)) / (arr.length > 0 ? arr.length : 1);
        let min = Math.min(...arr);
        let max = Math.max(...arr);
        stdevarray.push({ stdev: standardDeviation(arr, true), min: min, max: max, average: average });
    }
    const monthlyvalues = createTempDiffTable(tempaverages, diffaverages);
    let monthlystats = [];
    monthlyvalues.temperature.forEach((m, i) => {
        if (i < 12) {
            let l = 5 * Math.floor(stdevarray[i].min / 5);
            let h = 5 * (Math.floor(stdevarray[i].max / 5) + 1);
            if (h - l > 25) {
                l = 5 * Math.floor((stdevarray[i].average - 14) / 5);
                h = l + 25;
            }
            monthlystats.push({ monthno: i + 1, average: stdevarray[i].average,
                min: l, max: h,
                stdev: stdevarray[i].stdev,
                high: stdevarray[i].max, low: stdevarray[i].min });
        }
    });
    return createYearlyAveragesEstimates(yearlyMonthaverages, monthlyvalues, monthlystats);
}
exports.CFcalculateMonthlyAverages = CFcalculateMonthlyAverages;
function CFcreateYearlyTrendSeriedata() {
    function serietooltipcallback(seriename, value) {
        return `${seriename} ${value.year} ${roundNumber(value.value, 1)}°C`;
    }
    const yeartemperatureserie = createSerie_5('Lämpötila', temperatureClass.yearlyMonthlyAverages.yearlydata, (value) => (value.yearlyaverage), serietooltipcallback);
    const yeardiffserie = createSerie_5('Illan ja aamun ero', temperatureClass.yearlyMonthlyAverages.yearlydata, (value) => (value.yearlyaveragediff), serietooltipcallback);
    let trendserie = createSerie_1('Suuntaus', yeartemperatureserie, serietooltipcallback);
    let difftrendserie = createSerie_1('Erosuuntaus', yeardiffserie, serietooltipcallback);
    const allseries = [yeartemperatureserie, yeardiffserie];
    allseries.push(trendserie);
    allseries.push(difftrendserie);
    const returnvalues = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value, false),
            tooltip: createTooltip(serie.name, value),
        })), false, 0);
    });
    let estimateseries = addEstimatesToParameters(allseries);
    let params = { rangeoffset: 1, showlegend: true, series: estimateseries };
    return createGraphSerieType(returnvalues, params);
}
exports.CFcreateYearlyTrendSeriedata = CFcreateYearlyTrendSeriedata;
function createTrendForGivenMonths(monthnumbers, monthnames) {
    let datavalues = [];
    const years = temperatureClass.yearlyMonthlyAverages.yearlydata;
    const curyear = new Date().getFullYear();
    const curmonth = new Date().getMonth();
    let toofewvalues = [];
    let ogiginaldestimates = [];
    const monthlydata = monthnumbers.map((monthnumber) => {
        let estimates = false;
        const data = years.map(y => {
            let i = 0;
            if (y.year < curyear || (y.year == curyear && monthnumber - 1 <= curmonth)) {
                let value = y.months[monthnumber - 1].monthlytemperature;
                if (y.months[monthnumber - 1].estimate) {
                    estimates = true;
                    if (y.year != curyear) {
                        value = y.months[monthnumber - 1].averages.averagevalue;
                        if (!isNaN(value)) {
                            toofewvalues.push({ year: y.year, monthindex: monthnumber - 1 });
                        }
                        else {
                            y.months[monthnumber - 1].estimate = false;
                            ogiginaldestimates.push({ year: y.year, monthno: monthnumber, estimate: true });
                        }
                    }
                }
                return createValueDataValue(value, y.year, monthnumber - 1, y.months[monthnumber - 1].estimate);
            }
            return createValueDataValue(NaN, y.year, monthnumber - 1);
        });
        return createMonthDataPair(monthnumber - 1, data, estimates);
    });
    monthlydata.forEach(month => {
        let found = monthnumbers.indexOf(month.month + 1);
        if (found >= 0) {
            let values = month.data.map(value => ({
                value: createGraphItem(new Date(value.year, 0, 1), value.value, value.estimate),
                tooltip: `${value.year} ${monthnames[found]} ${roundNumber(value.value, 1)}`,
            }));
            datavalues.push(createGraphSerie(monthnames[datavalues.length], 'location', 0, values, false, monthnumbers[found]));
        }
    });
    let calctable = monthlydata.map(month => (createTrendCalcTable(month.data.map(data => (createTrendCalcData(data.year, data.value))))));
    const tempseries = datavalues.map(dvalue => {
        return createReturnDataType(dvalue.name, dvalue.values.map(day => {
            return createReturnDataValue(new Date(temperatureClass.defaultyear, day.value[0].getMonth(), day.value[0].getDate()), day.value[1], day.value[0].getFullYear(), day.value[2]);
        }));
    });
    let estimateparameters = addEstimatesToParameters(tempseries);
    toofewvalues.forEach(par => {
        estimateparameters.push(createGraphParams(temperatureClass.monthnames[par.monthindex], 'triangle', 24, par.monthindex));
    });
    ogiginaldestimates.forEach(est => {
        let searchyear = years.find(y => y.year == est.year);
        if (searchyear) {
            searchyear.months[est.monthno].estimate = est.estimate;
        }
    });
    let trend = CFcalculateTrend(calctable);
    let newvalues = years.map((yearserie) => ({
        value: createGraphItem(new Date(yearserie.year, 0, 1), isNaN(trend.k) ? NaN : yearserie.year * trend.k + trend.b, false),
        tooltip: `${yearserie.year} Suuntaus ${isNaN(trend.k) ? '???' : roundNumber(yearserie.year * trend.k + trend.b, 1)}`
    }));
    if (isNaN(trend.k))
        datavalues.push(createGraphSerie(`Trendi --- °C/10v`, 'location', 0, newvalues, true, -1));
    else
        datavalues.push(createGraphSerie(`Trendi ${trend.k > 0 ? '+' : ''}${roundNumber(trend.k * 10, 1)}°C/10v`, 'location', 0, newvalues, true, -1));
    return { values: datavalues, series: estimateparameters };
}
exports.createTrendForGivenMonths = createTrendForGivenMonths;
function CFcreateMonthlySummerTrendSeriedata() {
    const returnvalues = createTrendForGivenMonths([6, 7, 8], ['Kesäkuu', 'Heinäkuu', 'Elokuu']);
    let data = createGraphSerieType(returnvalues.values, { rangeoffset: 1, showlegend: true, series: returnvalues.series });
    return data;
}
exports.CFcreateMonthlySummerTrendSeriedata = CFcreateMonthlySummerTrendSeriedata;
function CFcreateMonthlyWinterTrendSeriedata() {
    const returnvalues = createTrendForGivenMonths([1, 2, 12], ['Tammikuu', 'Helmikuu', 'Joulukuu']);
    return createGraphSerieType(returnvalues.values, { rangeoffset: 1, showlegend: true, series: returnvalues.series });
}
exports.CFcreateMonthlyWinterTrendSeriedata = CFcreateMonthlyWinterTrendSeriedata;
function CFcreateMonthlyFallTrendSeriedata() {
    const returnvalues = createTrendForGivenMonths([9, 10, 11], ['Syyskuu', 'Lokakuu', 'Marraskuu']);
    return createGraphSerieType(returnvalues.values, { rangeoffset: 1, showlegend: true, series: returnvalues.series });
}
exports.CFcreateMonthlyFallTrendSeriedata = CFcreateMonthlyFallTrendSeriedata;
function CFcreateMonthlySpringTrendSeriedata() {
    const returnvalues = createTrendForGivenMonths([3, 4, 5], ['Maaliskuu', 'Huhtikuu', 'Toukokuu']);
    return createGraphSerieType(returnvalues.values, { rangeoffset: 1, showlegend: true, series: returnvalues.series });
}
exports.CFcreateMonthlySpringTrendSeriedata = CFcreateMonthlySpringTrendSeriedata;
function CFcreateAllYearsAverageSeriedata() {
    function serietooltipcallback(seriename, value) {
        let daytxt = isNaN(value.year) ?
            `${value.date.getDate()}.${value.date.getMonth() + 1}` :
            getDateTxt(new Date(value.year, value.date.getMonth(), value.date.getDate()));
        return `${seriename} ${daytxt} ${roundNumber(value.value, 1)}°C`;
    }
    const days = temperatureClass.dailyValues.map(day => (createHiLoValue(day.date, day.total.average, day.total.min.value, day.total.min.date, day.total.max.value, day.total.max.date)));
    const yearlyarrangeddata = temperatureClass.getAllFilteredDataYearlyArranged();
    const curyearno = yearlyarrangeddata[yearlyarrangeddata.length - 1].date.getFullYear();
    const minserie = createSerie_10(`Matalin`, days, (day) => (day.min.value < getTempMinDefaultValue() ? day.min.value : NaN), (day) => (day.min.value < getTempMinDefaultValue() ? day.min.date.getFullYear() : ''), serietooltipcallback);
    const maxserie = createSerie_10(`Korkein`, days, (day) => (day.max.value > getTempMaxDefaultValue() ? day.max.value : NaN), (day) => (day.max.value > getTempMaxDefaultValue() ? day.max.date.getFullYear() : ''), serietooltipcallback);
    const averageserie = createSerie_10(`Keskiarvo`, days, (day) => (day.average), (day) => (day.date.getFullYear()), serietooltipcallback);
    const curyear = createReturnDataType(`Vuosi ${curyearno}`, yearlyarrangeddata[yearlyarrangeddata.length - 1].values.map(day => {
        return createReturnDataValue(new Date(temperatureClass.defaultyear, day.date.getMonth(), day.date.getDate()), day.average, day.date.getFullYear(), false, serietooltipcallback);
    }));
    const allseries = [minserie, maxserie, averageserie, curyear];
    const returnvalues = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value, false),
            tooltip: createTooltip(serie.name, value),
        })), false, 0);
    });
    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true });
}
exports.CFcreateAllYearsAverageSeriedata = CFcreateAllYearsAverageSeriedata;
function CFcreateAllYearsMonthlyAverageSeriedata() {
    function serietooltipcallback(seriename, value) {
        return `${seriename} ${temperatureClass.monthnameslong[value.date.getMonth()]} ${roundNumber(value.value, 1)}°C`;
    }
    let maxserie = createSerie_2(`Matalin`, temperatureClass.yearlyMonthlyAverages.monthlydata, temperatureClass.defaultyear, (value) => (value.low < getTempMinDefaultValue() ? value.low : NaN), serietooltipcallback);
    let minserie = createSerie_2(`Korkein`, temperatureClass.yearlyMonthlyAverages.monthlydata, temperatureClass.defaultyear, (value) => (value.high > getTempMaxDefaultValue() ? value.high : NaN), serietooltipcallback);
    const yearsstatistics = temperatureClass.yearlyMonthlyAverages.yearlydata;
    let lastyear = 0;
    const allyears = yearsstatistics.map(year => {
        lastyear = year.year;
        let estimatedmonthindexes = [];
        const allmonths = createReturnDataType(`Vuosi ${year.year}`, year.months.map(month => {
            if (year.estimate && month.estimate)
                estimatedmonthindexes.push(month.monthno - 1);
            return createReturnDataValue(new Date(temperatureClass.defaultyear, month.monthno - 1, 1), month.monthlytemperature, yearsstatistics[yearsstatistics.length - 1].year, month.estimate, serietooltipcallback);
        }));
        return allmonths;
    });
    const allseries = [minserie, maxserie].concat(allyears);
    let estimateparams = addEstimatesToParameters(allyears);
    const returnvalues = allseries.map(serie => {
        return createGraphSerie(serie.name, '', 0, serie.values.map(value => ({
            value: createGraphItem(value.date, value.value, false),
            tooltip: createTooltip(serie.name, value),
        })), false, 0);
    });
    return createGraphSerieType(returnvalues, { rangeoffset: 1, showlegend: true, series: estimateparams, selection: [`Vuosi ${lastyear}`, 'Korkein', 'Matalin'] });
}
exports.CFcreateAllYearsMonthlyAverageSeriedata = CFcreateAllYearsMonthlyAverageSeriedata;
function CFcalculateTrend(valuearray) {
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
exports.CFcalculateTrend = CFcalculateTrend;
function createSerie_2(seriename, monthlydata, year, dataFunc, cbFunc) {
    return createReturnDataType(seriename, monthlydata.map(month => {
        return createReturnDataValue(new Date(year, month.date.getMonth(), month.date.getDate()), dataFunc(month.total), month.total.highdate.getFullYear(), false, cbFunc);
    }));
}
function createSerie_4(seriename, dailyminmaxtable, dataFunc, yearFunc, cbFunc) {
    return createReturnDataType(seriename, dailyminmaxtable.map(reading => {
        return createReturnDataValue(reading.date, dataFunc(reading), yearFunc ? yearFunc(reading) : reading.date.getFullYear(), false, cbFunc);
    }));
}
function createSerie_7(seriename, dailyminmaxtable, dateFunc, dataFunc, yearFunc, cbFunc) {
    return createReturnDataType(seriename, dailyminmaxtable.map(minmax => {
        return createReturnDataValue(dateFunc(minmax), dataFunc(minmax), yearFunc(minmax), false, cbFunc);
    }));
}
function createSerie_3(dailyminmaxtable, startyear, dataFunc, yearFunc, cbFunc) {
    return dailyminmaxtable.map(minmax => {
        let value = NaN;
        let date = NaN;
        if (minmax.evening.max.value > getTempMaxDefaultValue()) {
            value = dataFunc(minmax);
            date = yearFunc(minmax);
        }
        return createReturnDataValue(new Date(startyear, minmax.monthno - 1, minmax.day), value, date, false, cbFunc);
    });
}
function createSerie_8(seriename, yearlyminmaxvalues, dataFunc, lastyearestimate, cbFunc) {
    return createReturnDataType(seriename, yearlyminmaxvalues.map((value, index) => {
        return createReturnDataValue(new Date(value.year, 0, 1), dataFunc(value), value.year, (index == yearlyminmaxvalues.length - 1 && lastyearestimate) ? true : false, cbFunc);
    }));
}
function createSerie_1(seriename, tempserie, cbFunc) {
    let trenddata = createTrendCalcTable(tempserie.values.map(v => (createTrendCalcData(v.year, v.value))));
    const trend = CFcalculateTrend([trenddata]);
    if (isNaN(trend.k))
        return createReturnDataType(seriename, []);
    return createReturnDataType(`${seriename} ${trend.k > 0 ? '+' : '-'}${roundNumber(trend.k * 10, 1)} °C/10v`, tempserie.values.map(value => {
        return createReturnDataValue(new Date(value.year, 0, 1), value.year * trend.k + trend.b, value.year, false, cbFunc);
    }));
}
function createSerie_5(seriename, years, dataFunc, cbFunc) {
    return createReturnDataType(seriename, years.map((value, index) => {
        return createReturnDataValue(new Date(value.year, 0, 1), value.estimate && index != years.length - 1 ? NaN : dataFunc(value), value.year, value.estimate, cbFunc);
    }));
}
function createSerie_9(seriename, yearlyminmaxvalues, dataFunc, cbFunc) {
    let trendserie = createReturnDataType(seriename, []);
    let trenddata = createTrendCalcTable(yearlyminmaxvalues.map(v => (createTrendCalcData(v.year, dataFunc(v)))));
    const trend = CFcalculateTrend([trenddata]);
    if (!isNaN(trend.k) && !isNaN(trend.b)) {
        trendserie = createReturnDataType(trendserie.name, yearlyminmaxvalues.map(value => {
            return createReturnDataValue(new Date(value.year, 0, 1), trend.k * value.year + trend.b, value.year, false, cbFunc);
        }));
    }
    return trendserie;
}
function createSerie_10(seriename, days, dataFunc, yearFunc, cbFunc) {
    return createReturnDataType(seriename, days.map(day => {
        return createReturnDataValue(day.date, dataFunc(day), yearFunc(day), false, cbFunc);
    }));
}
function createLatestReadingsGroup(name, date, observation, reading) {
    return { name: name, date: date, observation: observation, reading: reading, obsselected: false };
}
function createLatestReadings(morning, morningtime, evening, eveningtime) {
    return { morning: morning, evening: evening, morningtime: morningtime, eveningtime: eveningtime };
}
function createLatestReadingsEmpty() {
    return createLatestReadings(NaN, new Date(0), NaN, new Date(0));
}
function getStationTime(ltime) {
    return new Date(`${ltime.substring(0, 4)}-${ltime.substring(4, 6)}-${ltime.substring(6, 11)}:${ltime.substring(11, 13)}:${ltime.substring(13, 15)}`);
}
const MorningTime = 7;
const EveningTime = 15;
function compareReadings(temperatures, stationreadings) {
    let updatedReadings = [];
    if (!temperatures || !temperatures || temperatures.length === 0)
        return updatedReadings;
    if (!stationreadings || !stationreadings.observations || !stationreadings.observations.length)
        return updatedReadings;
    const readings = stationreadings.observations.map(reading => {
        const ltime = getStationTime(reading.localtime);
        if ((ltime.getHours() == EveningTime || ltime.getHours() == MorningTime) && ltime.getMinutes() == 0) {
            reading.ltime = ltime;
            return reading;
        }
        return null;
    }).filter((v) => v !== null);
    readings.forEach(reading => {
        let i = 0;
        let found = false;
        while (i < updatedReadings.length && !found) {
            if (!isNaN(updatedReadings[i].observation.morning)) {
                found = (reading.ltime.getMonth() == updatedReadings[i].observation.morningtime.getMonth() &&
                    reading.ltime.getDate() == updatedReadings[i].observation.morningtime.getDate());
            }
            if (!found)
                i++;
        }
        if (found) {
            if (reading.ltime.getHours() == MorningTime) {
                updatedReadings[i].observation.morning = reading.t2m;
                updatedReadings[i].observation.morningtime = reading.ltime;
            }
            else {
                updatedReadings[i].observation.evening = reading.t2m;
                updatedReadings[i].observation.eveningtime = reading.ltime;
            }
        }
        else {
            updatedReadings.push(createLatestReadingsGroup(reading.name, new Date(reading.ltime.getFullYear(), reading.ltime.getMonth(), reading.ltime.getDate()), createLatestReadings(reading.ltime.getHours() == MorningTime ? reading.t2m : NaN, reading.ltime.getHours() == MorningTime ? reading.ltime : new Date(0), reading.ltime.getHours() == EveningTime ? reading.t2m : NaN, reading.ltime.getHours() == EveningTime ? reading.ltime : new Date(0)), createLatestReadingsEmpty()));
        }
    });
    let tempindex = 0;
    updatedReadings.forEach(updated => {
        while (tempindex < temperatures.length && temperatures[tempindex].datetimeLocal < updated.date) {
            tempindex++;
        }
        if (tempindex < temperatures.length && temperatures[tempindex].datetimeLocal > updated.date) {
        }
        else {
            if (tempindex < temperatures.length)
                updated.reading = createLatestReadings(temperatures[tempindex].morning, temperatures[tempindex].datetimeLocal, temperatures[tempindex].evening, temperatures[tempindex].datetimeLocal);
            else {
                updated.reading = createLatestReadingsEmpty();
            }
        }
    });
    if (updatedReadings[updatedReadings.length - 1].date < temperatures[temperatures.length - 1].datetimeLocal) {
        let index = temperatures.length - 1;
        while (temperatures[index].datetimeLocal > updatedReadings[updatedReadings.length - 1].date)
            index--;
        while (++index < temperatures.length) {
            let newreading = { date: temperatures[index].datetimeLocal };
            if (temperatures[index].morning !== null && !isNaN(temperatures[index].morning))
                newreading.morning = temperatures[index].morning;
            if (temperatures[index].evening !== null && !isNaN(temperatures[index].evening))
                newreading.evening = temperatures[index].evening;
            updatedReadings.push(createLatestReadingsGroup(updatedReadings[0].name, temperatures[index].datetimeLocal, createLatestReadings(NaN, temperatures[index].datetimeLocal, NaN, temperatures[index].datetimeLocal), newreading));
        }
    }
    return updatedReadings;
}
exports.compareReadings = compareReadings;
