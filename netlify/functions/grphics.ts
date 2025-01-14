
import {GetProvider} from "./../../server/database/DbProvider"
import { HttpResponseType, createJsonErrorResponse, requestGuidValid, createHttpJsonOkResponse } from "./http";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import {CFinitTemperature, CFgetAllReadings, CFcalculateMonthlyAverages, CFcreateAllYearsAverageSeriedata, 
    CFcreateYearlyFilteredSeriedata, CFcreateAllYearsMonthlyAverageSeriedata, CFcreateAllYearsFilteredSeriedata,
    CFcreateLastYearsSeriedata, CFcreateDailyDiffdata, CFcreateYearlyHighValuedata, CFcreateYearlyTrendSeriedata,
    CFcreateMonthlySummerTrendSeriedata, CFcreateMonthlyWinterTrendSeriedata, CFcreateMonthlyFallTrendSeriedata, CFcreateMonthlySpringTrendSeriedata} from "./../../server/chartfunctions"
import {FilteredResponse, GraphSerieType, YearlyAveragesEstimates, AllStatistics} from "./../../server/chartfunctions"
import {TemperatureType} from "./../../server/database/definitions"



const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    console.log('Graphics');
    let filtersize = 7;
    let months = ['xxTammi', 'Helmi', 'Maalis', 'Huhti', 'Touko', 'Kesä', 'Heinä', 'Elo', 'Syys', 'Loka', 'Marras', 'Joulu'];
    let monthslong = ['xxTammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu', 'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'];

    const returndata: AllStatistics = {alltemperaturereadings: null, monthlyaverages: null, yearlyfilteredseriedata: null,
        allyearsaverageseriedata: null, allyearsmonthlyaverageseriedata: null, allyearsfilteredseriedata: null,
        lastyersseriedata: null, dailydiffdata: null, yearlyhighvaluedata: null, yearlytrendseriedata: null,
        monthlysummertrendseriedata: null, monthlywintertrendseriedata: null, monthlyfalltrendseriedata: null, monthlyspringtrendseriedata: null,
    };
	const guidresp = requestGuidValid(event);
	if (guidresp.msg !== null) return createJsonErrorResponse(HttpResponseType.BadRequest, guidresp.msg);
    if (!event.queryStringParameters || !event.queryStringParameters.location || !event.queryStringParameters.years) return createJsonErrorResponse(HttpResponseType.BadRequest, "Invalid parameter");

    if (event.queryStringParameters.filtersize) {
        filtersize = Number(event.queryStringParameters.filtersize);
    }
    if (event.queryStringParameters.months) {
        months = event.queryStringParameters.months.split(',');
    }
    if (event.queryStringParameters.monthslong) {
        monthslong = event.queryStringParameters.monthslong.split(',');
    }
    const api = await GetProvider(guidresp.guid);
    if (event.httpMethod == "GET") {
        let years: number[] = [];

        let i: number;
        let yeartbl = event.queryStringParameters.years.split(',');
        for (i = 0; i < yeartbl.length; i++) {
            years.push(Number(yeartbl[i]));
        }
		const temps: TemperatureType[] = await api.temperatures(event.queryStringParameters.location, years);
        temps.sort((a, b) => a.info.year - b.info.year);
        if (temps && temps.length && temps[0].data && temps[0].data.length) {
            temps.forEach(yearserie => {
                yearserie.data.forEach(dayvalue => {
                    dayvalue.datetimeLocal = getDate(dayvalue.date);
                    dayvalue.datetimeUtc = dayvalue.datetimeLocal;
                })
            });
        }

        let tempsLocalTimesAdded: any = {data : temps};
        CFinitTemperature(tempsLocalTimesAdded, filtersize, months, monthslong);
        returndata.alltemperaturereadings = CFgetAllReadings();
        returndata.monthlyaverages = CFcalculateMonthlyAverages();

        returndata.yearlyfilteredseriedata = CFcreateYearlyFilteredSeriedata();
        returndata.allyearsaverageseriedata = CFcreateAllYearsAverageSeriedata();
        returndata.allyearsmonthlyaverageseriedata = CFcreateAllYearsMonthlyAverageSeriedata();
        returndata.allyearsfilteredseriedata = CFcreateAllYearsFilteredSeriedata();
        returndata.lastyersseriedata = CFcreateLastYearsSeriedata();
        returndata.dailydiffdata = CFcreateDailyDiffdata();
        returndata.yearlyhighvaluedata = CFcreateYearlyHighValuedata();
        returndata.yearlytrendseriedata = CFcreateYearlyTrendSeriedata();
        returndata.monthlysummertrendseriedata = CFcreateMonthlySummerTrendSeriedata();
        returndata.monthlywintertrendseriedata = CFcreateMonthlyWinterTrendSeriedata();
        returndata.monthlyfalltrendseriedata = CFcreateMonthlyFallTrendSeriedata();
        returndata.monthlyspringtrendseriedata = CFcreateMonthlySpringTrendSeriedata();
        const retvalues = {
            statistics: returndata,
            readings: temps,
        }
		return createHttpJsonOkResponse(null, retvalues);

        function getDate(date) {
            let parts = date.split('/');
            if (parts && parts.length === 3) {
                return new Date(parts[2], Number(parts[0]) - 1, parts[1]);
            }
            return new Date(0);
        }
    
  	}
    
  	if (event.httpMethod == "PUT") {
    	return  {body: JSON.stringify({statusText: "Vastaus Put done"}), statusCode: HttpResponseType.Ok};
  	}
  	return  {body: JSON.stringify({statusText: "Virheellinen kutsu"}), statusCode: HttpResponseType.BadRequest};
}

export { handler }