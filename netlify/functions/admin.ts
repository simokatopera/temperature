
import {GetProvider} from "./../../server/database/DbProvider"
import { HttpResponseType, createJsonErrorResponse, requestGuidValid, createHttpJsonOkResponse } from "./http";
import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    console.log('Admin');

    const guidresp = requestGuidValid(event);
	if (guidresp.msg !== null) return createJsonErrorResponse(HttpResponseType.BadRequest, guidresp.msg);
    const api = await GetProvider(guidresp.guid);
    if (event.httpMethod == "GET") {
        if (event.path.indexOf('/savingallowed') > 0) {
            const resp = await api.savingallowed();
            return createHttpJsonOkResponse(null, {access: resp});
        }
        return createJsonErrorResponse(404, "");
  	}
  	if (event.httpMethod == "POST") {
        if (event.path.indexOf('/save') > 0) {
            if (!event.queryStringParameters || !event.queryStringParameters.pwd) {
                return createJsonErrorResponse( 404, "Missing parameter");
            }
            const savingallowed = await api.savingallowed();
            if (savingallowed) {
                if (event.body) {
                    // save new values
                    const values = JSON.parse(event.body);
                    const status = await api.savereadings(event.queryStringParameters.pwd, values);
                    if (status.errormsg === null) return createHttpJsonOkResponse(null, {status: true});
                    console.log(`Saving failed, error: ${status.errormsg}`)
                    return createJsonErrorResponse( 404, 'Saving failed');
                }
                return createJsonErrorResponse(HttpResponseType.Unautorized, 'Not done');
            }
            return createJsonErrorResponse(HttpResponseType.Unautorized, 'Not allowed');
        }
        return createJsonErrorResponse(404, "");
  	}
  	return  {body: JSON.stringify({statusText: "Virheellinen kutsu"}), statusCode: HttpResponseType.BadRequest};
}


export { handler }