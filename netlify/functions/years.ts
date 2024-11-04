
import {GetProvider} from "./../../server/database/DbProvider"
import { HttpResponseType, createJsonErrorResponse, requestGuidValid, createHttpJsonOkResponse } from "./http";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    console.log('Years');
	const guidresp = requestGuidValid(event);
	if (guidresp.msg !== null) return createJsonErrorResponse(HttpResponseType.BadRequest, guidresp.msg);
    if (!event.queryStringParameters || !event.queryStringParameters.location) return createJsonErrorResponse(HttpResponseType.BadRequest, "Invalid parameter");
    const api = await GetProvider(guidresp.guid);
    if (event.httpMethod == "GET") {
		const resp = await api.years(event.queryStringParameters.location);
		resp.sort((a, b) => a - b);
		return createHttpJsonOkResponse(null, resp);
  	}
  	if (event.httpMethod == "PUT") {
    	return  {body: JSON.stringify({statusText: "Vastaus Put done"}), statusCode: HttpResponseType.Ok};
  	}
  	return  {body: JSON.stringify({statusText: "Virheellinen kutsu"}), statusCode: HttpResponseType.BadRequest};
}

export { handler }