export interface TemperatureInfoType {
    location: string;
    year: number;
}
export interface TemperatureType {
    info: TemperatureInfoType;
    data: TemperatureDataType[];
}
export function createTemperatureType(year, location, data): TemperatureType {
    return {info: {location: location, year: year}, data: data}
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