const chartVersion = '1.3';
class Chart {

        constructor(element) {
            this.version = chartVersion;
            if (typeof element === 'undefined') return;
            this.chart = echarts.init(element);
            this.options = {
                title: {}, 
                xAxis: [], 
                yAxis: [], 
                series: [], 
                grid: {top: 120}, 
                legend: {show: false, data: [], top: 50, orient: 'horizontal', textStyle: { color: '#000', fontSize: '16' }}, 
                tooltip: {show: true, trigger: 'item', axisPointer: { type: 'cross'}, formatter: null}
            };
        }
        static getVersion() { return chartVersion} ;
        getVersion() { return this.version; }
        setChartTitle(title, subtitle) {
            this.options.title.text = title;
            if (typeof subtitle !== 'undefined') {
                if (subtitle != '') this.options.legend.top += 20;
                this.options.title.subtext = subtitle;
            }
        }
        setTitleLocation(horizontallocation) {
            if (typeof horizontallocation !== 'undefined') {this.options.title.left = 'auto'; }
        }
        addXAxis(name, type, data, labelformatter) {
            const newaxis = {};
            if (typeof name !== 'undefined') newaxis.name = name;
            if (typeof type !== 'undefined') newaxis.type = type;
            if (typeof data !== 'undefined') newaxis.data = data.map(d => d);
            if (typeof labelformatter !== 'undefined') {
                newaxis.axisLabel = {};
                newaxis.axisLabel.formatter = labelformatter;
            }
            this.options.xAxis.push(newaxis);
        }
        addYAxis(name, type, labelformatter) {
            const newaxis = {};
            if (typeof name !== 'undefined') newaxis.name = name;
            if (typeof type !== 'undefined') newaxis.type = type;
            if (typeof labelformatter !== 'undefined') {
                newaxis.axisLabel = {};
                newaxis.axisLabel.formatter = labelformatter;
            }
            this.options.yAxis.push(newaxis);
        }
        addSerie(name, type, data, yaxisindex) {
            const newserie = {top: 140};
            if (typeof name !== 'undefined') {
                newserie.name = name;
                this.options.legend.data.push({name: name});
            }
            if (typeof type !== 'undefined') newserie.type = type;
            if (typeof yaxisindex !== 'undefined') newserie.yAxisIndex = yaxisindex;
            if (typeof data !== 'undefined') {
                if (data.length > 0 && Array.isArray(data[0].value)) newserie.data = data.map(d => ({value: d.value, symbol: d.symbol, symbolSize: d.symbolsize}));
                else newserie.data = data.map(d => d);
            }
            this.options.series.push(newserie);
        }
        setTooltipFormatter(tooltipformatter) {
            if (typeof tooltipformatter !== 'undefined') {
                this.options.tooltip.formatter = tooltipformatter;
            }
        }
        showSerieLegends(showlegend) {
            this.options.legend.show = showlegend;
        }
        setLegendSpace(spaces) {
            if (typeof spaces.legend !== 'undefined') this.options.legend.top = spaces.legend;
            if (typeof spaces.grid !== 'undefined') this.options.grid = spaces.grid;
        }
        setSerieSymbolStyle(serieindex, symbol, symbolsize, color) {
            if (serieindex < this.options.series.length) {
                //this.options.series[serieindex].type = '';
                if (typeof symbolsize !== 'undefined') this.options.series[serieindex].symbolSize = symbolsize;
                if (typeof symbol !== 'undefined') this.options.series[serieindex].symbol = symbol;
                if (typeof this.options.series[serieindex].itemStyle === 'undefined') this.options.series[serieindex].itemStyle = {};
                if (typeof color !== 'undefined') this.options.series[serieindex].itemStyle.color = color;
            }
        }
        setSerieLineStyle(serieindex, color, width, type) {
            if (serieindex < this.options.series.length) {
                this.options.series[serieindex].lineStyle = {};
                if (typeof color !== 'undefined') this.options.series[serieindex].lineStyle.color = color;
                if (typeof width !== 'undefined') this.options.series[serieindex].lineStyle.width = width;
                if (typeof type !== 'undefined') this.options.series[serieindex].lineStyle.type = type;
            }
        }
        getSelection(selectedseries) {
            let selection = {};
            this.options.series.forEach(s => {
                selection[s.name] = false;
            })
            if (selectedseries && selectedseries.length) {
                selectedseries.forEach(s => {
                    selection[s] = true;
                })
            }
            return selection;
        };
        selectSeries(selection) {
            this.options.legend.selected = this.getSelection(selection);
        }
        drawChart() {
            this.chart.setOption(this.options);
        }
    }


function createNewChart(divname, params) {
    let newchart = new Chart(document.getElementById(divname));
    newchart.setChartTitle(params.title1, params.title2);
    newchart.setTitleLocation(params.titlelocation);

    newchart.addXAxis(params.xaxis.name, typeof params.xaxis.type === 'undefined' ? 'time' : params.xaxis.type, undefined, params.xaxis.formatter);
    for (let axisno = 0; axisno < params.yaxis.length; axisno++) {
        newchart.addYAxis(params.yaxis[0].name, 'value', params.yaxis[axisno].formatter);
        //newchart.options.yAxis[0].min = -10;
        //newchart.options.yAxis[0].max = 10;
    }
    for (let serieno = 0; serieno < params.series.length; serieno++) {
        newchart.addSerie(params.series[serieno].name, typeof params.series[serieno].type === 'undefined' ? 'line' : params.series[serieno].type, params.series[serieno].data, params.series[serieno].yaxisindex);
        if (typeof params.series[serieno].linestyle !== 'undefined') {
            newchart.setSerieLineStyle(serieno, params.series[serieno].linestyle.color, params.series[serieno].linestyle.width, params.series[serieno].linestyle.color.type);
        }
        if (typeof params.series[serieno].symbol !== 'undefined') {
            newchart.setSerieSymbolStyle(serieno, undefined, params.series[serieno].symbol.size, params.series[serieno].symbol.color);
        }
    }
    if (typeof params.legend.top !== 'undefined') {
        newchart.setLegendSpace(params.legend.top);
    }
    if (typeof params.legend.tooltipformatter !== 'undefined') {
        newchart.setTooltipFormatter(params.legend.tooltipformatter);
    }
    if (typeof params.legend.selected !== 'undefined') {
        newchart.selectSeries(params.legend.selected);
    }
    if (typeof params.animation !== "undefined") newchart.options.animation = params.animation;
    newchart.showSerieLegends(params.legend.show);
    return newchart;
}
