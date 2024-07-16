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
    morning: number;
    evening: number;
}