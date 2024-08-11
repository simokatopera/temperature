export interface TemperatureInfoType {
    location: string;
    year: number;
}
export interface TemperatureType {
    info: TemperatureInfoType;
    data: TemperatureDataType[];
}
export interface TemperatureDataType {
    date: string;
    datetimeUtc: Date | null;
    morning: number;
    evening: number;
}