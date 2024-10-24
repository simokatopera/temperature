class TemperatureApi  {
    constructor(guid) {
        this.apipath = '.netlify/functions/';
        this.guid = guid;
    }
    async sendGetJsonAsync(url) {
        let separator = '?';
        if (url.indexOf('?') >= 0) separator = '&';
        const response = await fetch(`${this.apipath}${url}${separator}userid=${this.guid}`, { method: "GET", headers: { "Content-Type": "application/json" } });
        if (response.status == 200)
            return await response.json();
        return await response.json();
    }
    async sendPostJsonAsync(url, data) {
        const response = await fetch(`${this.apipath}${url}`, { method: "POST", body: JSON.stringify(data) });
        if (response.status == 200)
            return await response.json();
        return await response.json();
    }
    async sendGetTxtAsync(url) {
        const response = await fetch(`${this.apipath}${url}`);
        if (response.status == 200)
            return await response.text();
        return await response.text();
    }
    // sendGetJson(url, successfulCb, failCb) {
    //     fetch(`${this.apipath}${url}&userid=${this.guid}`, { method: 'GET', })
    //         .then(response => response.json())
    //         .then(res => successfulCb(res))
    //         .catch(error => failCb(error));
    // }
    // sendPostJson(path, data, successfulCb, failCb) {
    //     let url = `${this.apipath}${path}`;
    //     if (this.guid !== null) {
    //     }
    //     fetch(url, {
    //         method: "POST",
    //         body: JSON.stringify(data)
    //     })
    //         .then(response => response.json())
    //         .then(resp => successfulCb(resp))
    //         .catch(error => failCb(error));
    // }
    async getLocations() {
        const path = `locations`;
        return await this.sendGetJsonAsync(path);
    }
    async getYears(data) {
        const path = `years?location=${data}`;
        return await this.sendGetJsonAsync(path);
    }    
    async getTemperatures(location, years) {
        const path = `temperatures?location=${location}&years=${years}`;
        return await this.sendGetJsonAsync(path);
    }    
}


async function apiGetLocations(guid) {
    return await new TemperatureApi(guid).getLocations();
}
async function apiGetYears(guid, location) {
    return await new TemperatureApi(guid).getYears(location);
}
async function apiGetTemperatures(guid, location, years) {
    const values = await new TemperatureApi(guid).getTemperatures(location, years);
    if (values && values.data) {
        values.data.forEach(yearserie => {
            yearserie.data.forEach(dayvalue => {
                dayvalue.datetimeLocal = getDate(dayvalue.date);
                dayvalue.datetimeUtc = new Date(dayvalue.datetimeUtc);
            })
        });
    }
    return values;

    function getDate(date) {
        let parts = date.split('/');
        if (parts && parts.length === 3) {
            return new Date(parts[2], Number(parts[0]) - 1, parts[1]);
        }
        return NaN;
    }
}

async function sendGetJsonAsync2(url) {
    const response = await fetch(`https://www.ilmatieteenlaitos.fi/api/weather/observations?fmisid=100955&observations=true&radar=true&daily=true`, 
        { method: "GET", headers: { "Content-Type": "application/json" } });
    if (response.status == 200)
        return await response.json();
    return await response.json();
}
async function apiGetLatestTemperatures() {
    //https://www.ilmatieteenlaitos.fi/api/weather/observations?fmisid=100955&observations=true&radar=true&daily=true
    return await sendGetJsonAsync2();
}