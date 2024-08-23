
import {GetProvider} from "./../../server/database/DbProvider"
import { HttpResponseType, createJsonErrorResponse, requestGuidValid, createHttpJsonOkResponse } from "./http";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    console.log('Temperatures');
	const guidresp = requestGuidValid(event);
	if (guidresp.msg !== null) return createJsonErrorResponse(HttpResponseType.BadRequest, guidresp.msg);
    if (!event.queryStringParameters || !event.queryStringParameters.location || !event.queryStringParameters.years) return createJsonErrorResponse(HttpResponseType.BadRequest, "Invalid parameter");
    const api = await GetProvider(guidresp.guid);
    if (event.httpMethod == "GET") {
        let years: number[] = [];
        let i: number;
        let yeartbl = event.queryStringParameters.years.split(',');
        for (i = 0; i < yeartbl.length; i++) {
            years.push(Number(yeartbl[i]));
        }
		const resp = await api.temperatures(event.queryStringParameters.location, years);
        resp.sort((a, b) => a.info.year - b.info.year);
		return createHttpJsonOkResponse(null, resp);
  	}
    
  	if (event.httpMethod == "PUT") {
    	return  {body: JSON.stringify({statusText: "Vastaus Put done"}), statusCode: HttpResponseType.Ok};
  	}
  	return  {body: JSON.stringify({statusText: "Virheellinen kutsu"}), statusCode: HttpResponseType.BadRequest};
}

export { handler }