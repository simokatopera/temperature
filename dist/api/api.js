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
    async getStatistics(location, years, filtersize, m1, m2) {
        const path = `grphics?location=${location}&years=${years}&filtersize=${filtersize}&months=${m1}&monthslong=${m2}`;
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
async function apiGetStatistics(guid, location, years, filtersize, m1, m2) {
    const values = await new TemperatureApi(guid).getStatistics(location, years, filtersize, m1, m2);
    values.data.readings.forEach(yearserie => {
        yearserie.data.forEach(dayvalue => {
            dayvalue.datetimeLocal = getDate(dayvalue.date);
            dayvalue.datetimeUtc = new Date(dayvalue.datetimeUtc);
        })
    });    
    return values;
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
}

function getDate(date) {
    let parts = date.split('/');
    if (parts && parts.length === 3) {
        return new Date(parts[2], Number(parts[0]) - 1, parts[1]);
    }
    return NaN;
}
// async function sendGetJsonAsync2(command) {
//     const response = await fetch(command, 
//         { method: "GET", headers: { "Content-Type": "application/json" } });
//     if (response.status == 200)
//         return await response.json();
//     return await response.json();
// }
async function sendGetXmlAsync(command) {
    const response = await fetch(command, 
        { method: "GET", headers: { "Content-Type": "text/xml" } });
    return await response.text();
}
// async function apiGetLatestTemperatures(location) {
//     return await sendGetJsonAsync2(`https://www.ilmatieteenlaitos.fi/api/weather/observations?fmisid=100955&observations=true&radar=false&daily=false`);
// }
// async function apiGetForecast(location) {
//     const values = await sendGetJsonAsync2(`https://www.ilmatieteenlaitos.fi/api/weather/forecasts?place=${location.toLowerCase()}&area=`);
//     if (values && values.forecastValues && values.forecastValues.length > 0) {
//         return values.forecastValues.map(f => ({localtime: f.isolocaltime, temperature: f.Temperature}));
//     }
//     return null;
// }
// async function apiGetLatestTemperatures2(location) {
//     const etime = new Date();
//     const stime = new Date(etime.getFullYear(), etime.getMonth(), etime.getDate()-7);

//     const starttime = formatDate(stime);
//     const endtime = formatDate(etime);

//     const response = await sendGetXmlAsync(`https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::observations::weather::hourly::timevaluepair&place=${location}&starttime=${starttime}&endtime=${endtime}&maxlocations=1&parameters=TA_PT1H_AVG`);
//     let parser = new DOMParser();
//     let xmlDoc = parser.parseFromString(response,"text/xml");      
//     const values = xmlDoc.getElementsByTagName('wml2:MeasurementTVP');  
//     let results = [];
//     for (var i = 0; i < values.length; i++) {
//         let nodes = values[i].children;
//         let valuestr = null;
//         let timestr = null;
//         for (var j = 0; j < nodes.length; j++) {
//             if (nodes[j].nodeName == 'wml2:time') timestr = nodes[j].textContent;
//             if (nodes[j].nodeName == 'wml2:value') valuestr = nodes[j].textContent;
//         }
        
//         results.push(valuestr == 'NaN' ? null : {value: valuestr, time: timestr});
//     }
    
//     results = results.filter(r => r !== null)
//     const returnvalues = {observations: results.map(r => ({t2m: Number(r.value), localtime: formatTime(r.time)}))}
//     return returnvalues;
// }
async function apiGetLatestTemperatures3(location, days) {
    let etime = new Date();
    etime = new Date(etime.getFullYear(), etime.getMonth(), etime.getDate(), etime.getHours()-localtimehouroffset, etime.getMinutes(), etime.getSeconds());
    const stime = new Date(etime.getFullYear(), etime.getMonth(), etime.getDate()-days, etime.getHours(), etime.getMinutes()+10, etime.getMinutes(), etime.getSeconds());

    const starttime = formatDate(stime);
    const endtime = formatDate(etime);

    const response = await sendGetXmlAsync(`https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=fmi::observations::weather::simple&place=${location}&starttime=${starttime}&endtime=${endtime}&timestep=10&maxlocations=1&parameters=t2m`);
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(response,"text/xml");      
    const nodes = xmlDoc.getElementsByTagName('BsWfs:BsWfsElement');  
    let results = [];
    for (var index = 0; index < nodes.length; index++) {
        let valuestr = null;
        let timestr = null;
        for (var chindex = 0; chindex < nodes[index].children.length; chindex++) {
            let value = nodes[index].children[chindex].textContent.trim();
            switch (chindex) {
                case 0: break; // coordinates
                case 1: timestr = value; break; // datetime
                case 3: valuestr = value; break; // temperature value
                default: break; // t2m
            }
        }
        results.push(valuestr === null ? null : {value: valuestr, time: timestr});
    }
    
    results = results.filter(r => r !== null)
    const returnvalues = {observations: results.map(r => ({t2m: Number(r.value), localtime: formatTime(r.time)}))}
    // returnvalues.observations.forEach(v => {
    //     console.log(`${v.localtime} ${v.t2m}`);
    // })
    return returnvalues;
}

async function apiGetForecast2(location) {
    let stime = new Date();
    stime = new Date(stime.getFullYear(), stime.getMonth(), stime.getDate(), stime.getHours()-localtimehouroffset, stime.getMinutes(), stime.getSeconds());
    const etime = new Date(stime.getFullYear(), stime.getMonth(), stime.getDate() + 14);
    const starttime = formatDate(stime);
    const endtime = formatDate(etime);

    const response = await sendGetXmlAsync(`https://opendata.fmi.fi/wfs?service=WFS&version=2.0.0&request=getFeature&storedquery_id=ecmwf::forecast::surface::point::timevaluepair&place=${location}&parameters=Temperature&starttime=${starttime}&endtime=${endtime}`);
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(response,"text/xml");      
    const values = xmlDoc.getElementsByTagName('wml2:MeasurementTVP');  
    let results = [];
    for (var i = 0; i < values.length; i++) {
        let nodes = values[i].children;
        let valuestr = null;
        let timestr = null;
        for (var j = 0; j < nodes.length; j++) {
            if (nodes[j].nodeName == 'wml2:time') timestr = nodes[j].textContent;
            if (nodes[j].nodeName == 'wml2:value') valuestr = nodes[j].textContent;
        }
        
        results.push(valuestr == 'NaN' ? null : {value: valuestr, time: timestr});
    }
    
    results = results.filter(r => r !== null)
    const returnvalues = results.map(r => ({temperature: Number(r.value), localtime: formatTime2(r.time)}))
    return returnvalues;
}

const localtimehouroffset = 2;

function pad(value, count) {
    return value.toString().padStart(count, '0')
}
function formatDate(date) {
    return `${date.getFullYear()}-${pad(date.getMonth()+1, 2)}-${pad(date.getDate(), 2)}T${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}:${pad(date.getMinutes(), 2)}Z`;
}

function formatTime(t) {
    //20241107T192000
    let date = t.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/)
    if (date) {
        const dt = new Date(Number(date[1]), Number(date[2])-1, Number(date[3]), Number(date[4])+localtimehouroffset, Number(date[5]), Number(date[6]));
        let datestr = `${dt.getFullYear()}${pad(dt.getMonth()+1, 2)}${pad(dt.getDate(), 2)}T${pad(dt.getHours()+0, 2)}${pad(dt.getMinutes(), 2)}${pad(dt.getSeconds(), 2)}`;
        return datestr;
    }
    return '';
}

function formatTime2(t) {
    //20241107T192000
    let date = t.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/)
    if (date) {
        const dt = new Date(Number(date[1]), Number(date[2])-1, Number(date[3]), Number(date[4])+0, Number(date[5]), Number(date[6]));
        return formatDate(dt);
    }
    return '';
}

