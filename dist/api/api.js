class TemperatureApi  {
    constructor(guid) {
        this.apipath = '.netlify/functions/';
        this.guid = guid;
    }
    async sendGetJsonAsync(url) {
        let separator = '?';
        if (url.indexOf('?') >= 0) separator = '&';
        const response = await fetch(`${this.apipath}${url}${separator}userid=${this.guid}`, { method: "GET", headers: { "Content-Type": "application/json" } });
        return await response.json();
    }
    async sendPostJsonAsync(url, data) {
        // const response = fetch(`${this.apipath}${url}`, { method: "POST", body: JSON.stringify(data) }).then(r => r.json())
        // return response;
        const response = await fetch(`${this.apipath}${url}`, { method: "POST", body: JSON.stringify(data) });
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
    async getSavingAllowedStatus() {
        const path = `admin/savingallowed`;
        return await this.sendGetJsonAsync(path);
    }
    async getAdminStatus() {
        const path = `admin/status`;
        return await this.sendGetJsonAsync(path);
    }
    async getAdminButton1() {
        const path = 'admin/button1';
        return await this.sendGetJsonAsync(path);
    }
    async saveReadings(pwd, data) {
        const path = `admin/save?userid=${this.guid}&pwd=${pwd}`;
        const ret = await this.sendPostJsonAsync(path, data);
        return ret;
    }
}


async function apiGetLocations(guid) {
    return await new TemperatureApi(guid).getLocations();
}
async function apiGetYears(guid, location) {
    return await new TemperatureApi(guid).getYears(location);
}
async function apiGetSavingAllowed(guid) {
    return await new TemperatureApi(guid).getSavingAllowedStatus();
}
async function apiAdminStatus(guid) {
    return await new TemperatureApi(guid).getAdminStatus();
}
async function apiAdminButton1(guid) {
    return await new TemperatureApi(guid).getAdminButton1();
}
async function apiSaveReadings(guid, pwd, data) {
    return await new TemperatureApi(guid).saveReadings(pwd, data);
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

async function sendGetJsonAsync2(command) {
    const response = await fetch(command, 
        { method: "GET", headers: { "Content-Type": "application/json" } });
    if (response.status == 200)
        return await response.json();
    return await response.json();
}
async function apiGetLatestTemperatures() {
    return await sendGetJsonAsync2(`https://www.ilmatieteenlaitos.fi/api/weather/observations?fmisid=100955&observations=true&radar=false&daily=false`);
}

async function apiGetForecast(location) {
    const values = await sendGetJsonAsync2(`https://www.ilmatieteenlaitos.fi/api/weather/forecasts?place=${location}&area=`);
    if (values && values.forecastValues && values.forecastValues.length > 0) {
        return values.forecastValues.map(f => ({localtime: f.isolocaltime, temperature: f.Temperature}));
    }
    return null;
}

