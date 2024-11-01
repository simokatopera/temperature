export interface TemperatureInfoType {
    location: string;
    year: number;
}
export interface TemperatureType {
    info: TemperatureInfoType;
    data: TemperatureDataType[];
    saveenable: boolean;
}
export function createTemperatureType(year, location, data): TemperatureType {
    return {info: {location: location, year: year}, data: data, saveenable: false}
}
export interface TemperatureDataType {
    date: string;
    datetimeUtc: Date | null;
    datetimeLocal: Date | null;
    morning: number;
    evening: number;
}
export function createTemperatureDataType(date: string, morning: number, evening: number, datetimeUtc: Date | null, datetimeLocal: Date | null): TemperatureDataType {
    return {date: date, datetimeLocal: datetimeLocal, datetimeUtc: datetimeUtc, morning: morning, evening: evening}
}

export interface DbTemperatureType {
    info: TemperatureInfoType;
    data: DbTemperatureDataType[];
}
export function createDbTemperatureType(year, location, data): TemperatureType {
    return {info: {location: location, year: year}, data: data, saveenable: false}
}
export interface DbTemperatureDataType {
    date: string;
    morning: number;
    evening: number;
}
export function createDbTemperatureDataType(date: string, morning: number, evening: number): DbTemperatureDataType {
    return {date: date, morning: morning, evening: evening}
}
export interface TemperatureUpdateData {
    date: string;
    morning: number;
    evening: number;
    morningtimeUtc: string;
    eveningtimeUtc: string;
}
export interface DBStatus {
    errormsg: string | null;
    status: string | null;
    id: number;
}
export function setFailResult(errorMsg: string): DBStatus {
    return {errormsg: errorMsg, status: 'Fail', id: 0}
}
export function setOkResult(status: string | null, id: number): DBStatus {
    console.log(`status: ${status}`)
    const ret = {errormsg: null, status: status == null ? 'Ok' : status, id: id}
    console.log(ret)
    return ret
}