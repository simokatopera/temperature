import { guidValid } from "../../server/utils"

export enum HttpResponseType {
    Ok = 200,
    Created = 201,
    Accepted = 202,
    NoContent = 204,
    BadRequest = 400,
    Unautorized = 401,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    NotImplemented = 501
}
export interface HttpErrorResponse {
    statusCode: number;
    body: string;
}
export function createHttpError(errorCode: number, message: string) {
    return {error: {msg: message}, statusCode: errorCode}
}
export function createJsonErrorResponse(errorCode: number, message: string): HttpErrorResponse {
    return {
        statusCode: errorCode,
        body: JSON.stringify(createHttpError(errorCode, message))
    }
}
interface HttpField {
    data: any;
    statusCode: number;
    message: string | null;
}

export function createHttpOkField(message: string | null, data: any): HttpField {
    return {data: data, message: message, statusCode: HttpResponseType.Ok};
}
export interface HttpResponse {
    statusCode: number;
    body: string;
}
export function createHttpJsonOkResponse(message: string | null, data: any, statusCode: number = HttpResponseType.Ok): HttpResponse {
    return {statusCode: statusCode, body: JSON.stringify(createHttpOkField(message, data))}
}
export interface guidResponseType {
    guid: string;
    msg: string | null;
}
export function requestGuidValid(event): guidResponseType {
    if (!event.queryStringParameters || !event.queryStringParameters.userid || event.queryStringParameters.userid === "" || event.queryStringParameters.userid === "null") return {msg: null, guid: ""};
    if (!guidValid(event.queryStringParameters.userid)) return {msg: "Invalid parameter", guid: event.queryStringParameters.userid};
    return {msg: null, guid:event.queryStringParameters.userid}; // guid ok
}
