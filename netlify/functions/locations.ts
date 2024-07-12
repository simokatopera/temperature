
import { Handler } from "@netlify/functions"

const handler = async (event, context) => {
  console.log('Locations');
    // if (!event.queryStringParameters || !event.queryStringParameters.team || !event.queryStringParameters.userid)
    //   return createJsonErrorResponse(404, "Missing parameter");

    // const teams = await GetProvider(event.queryStringParameters.userid).seasons(event.queryStringParameters.team);
    // return createHttpJsonOkResponse(null, teams);
    return  {body: "Ok", statusCode: 200};
  
}


export { handler }