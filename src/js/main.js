function customTooltip(tooltipModel) {
    // Tooltip Element
    const el = document.getElementById('tooltip');
    const elPower = document.getElementById('tooltip-power');
    const elTime1 = document.getElementById('tooltip-time-1');
    const elCost1 = document.getElementById('tooltip-cost-1');
    const elTime2 = document.getElementById('tooltip-time-2');
    const elCost2 = document.getElementById('tooltip-cost-2');
    const elSeparator = document.getElementById('tooltip-separator');

    // Hide if no tooltip
    if (tooltipModel.opacity === 0) {
        el.style.display = "none";
        return;
    }

    const power = tooltipModel.dataPoints[0].label;
    const time = smartRound(parseFloat(tooltipModel.dataPoints[0].value));
    const cost = smartRound(parseFloat(tooltipModel.dataPoints[1].value), 2);

    elPower.innerHTML = `Power: ${power}`;
    elTime1.innerHTML = `Time: ${time}ms`;
    elCost1.innerHTML = `Cost: ${cost}$`;

    if(tooltipModel.dataPoints[2] && tooltipModel.dataPoints[2].value) {
        const time2 = smartRound(parseFloat(tooltipModel.dataPoints[2].value));
        const cost2 = smartRound(parseFloat(tooltipModel.dataPoints[3].value), 2);
        const percTime = smartRound(time2 * 100 / time) - 100; // faster if <0, slower if >0
        const percCost = smartRound(cost2 * 100 / cost) - 100; // more expensive if >0, cheaper if <0

        const timeLabel = percTime < 0? "faster" : "slower";
        const costLabel = percCost > 0? "more expensive" : "cheaper";

        elTime2.innerHTML = `Time: ${time2}ms (${Math.sign(percTime)*percTime}% ${timeLabel})`;
        elCost2.innerHTML = `Cost: ${cost2}$ (${Math.sign(percCost)*percCost}% ${costLabel})`;

        elTime2.style.display = "block";
        elCost2.style.display = "block";
        elSeparator.style.display = "block";
    } else {
        elTime2.style.display = "none";
        elCost2.style.display = "none";
        elSeparator.style.display = "none";
    }

    const position = this._chart.canvas.getBoundingClientRect();

    el.style.display = "block";
    el.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
    el.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
    el.style.fontFamily = tooltipModel._bodyFontFamily;
    el.style.fontSize = tooltipModel.bodyFontSize + 'px';
    el.style.fontStyle = tooltipModel._bodyFontStyle;
    // el.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
    el.style.pointerEvents = 'none';
}

function smartRound(x, s = 1) {
    if (x < 1e-12) {
        return x.toFixed(s).replace(/(\.0*[1-9]+)[0]+$|\.[0]+$/, '$1');
    }

    let digits = Math.max(-Math.round(Math.log10(x)) + s, 0);
    let string = x.toFixed(digits);
    return string.replace(/(\.0*[1-9]+)[0]+$|\.[0]+$/, '$1');
}

class App {

    chartColors = {
        "red": "rgb(255, 99, 132)",
        "blue": "rgb(54, 162, 235)",
        "orange": "rgb(255, 165, 00)",
        "green": "rgb(34, 139, 34)",
    }

    chartOptions = {
        responsive: true,
        hoverMode: 'index',
        tooltips: {
            mode: 'index',
            intersect: false,
            enabled: false,
            custom: customTooltip,
        },
        stacked: false,
        title: {
            display: false,
        },
        scales: {
            xAxes: [{
                scaleLabel: {
                    display: true,
                    labelString: 'Memory / Power (MB)'
                },
            }],
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback: (value, index, values) => `${smartRound(value)} ms`,
                },
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Invocation Time'
                },
                position: 'left',
                id: 'time-axis',
            }, {
                ticks: {
                    beginAtZero: true,
                    callback: (value, index, values) => `${smartRound(value)} $`,
                },
                type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                display: true,
                position: 'right',
                id: 'cost-axis',
                scaleLabel: {
                    display: true,
                    labelString: 'Invocation Cost'
                },
                // grid line settings
                gridLines: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                },
            }],
        }
    };

    constructor() {
        this.canvas = document.querySelector("canvas");
        this.report_el = document.getElementById("report");
        this.error_el = document.getElementById("error");
    }

    error(err) {
        this.report_el.style.display = "none";
        this.error_el.style.display = "flex";

        const doc_url = "https://github.com/matteo-ronchetti/aws-lambda-power-tuning-ui";

        switch (err) {
            case "empty":
                let sample = window.location.protocol + "//" + window.location.host + "#" + encode([128, 256, 512, 1024], Int16Array) + ";" + encode([36555.39, 18441.58, 8539.34, 3870.76]) + ";" + encode([0.00007612, 0.00007696, 0.00007155, 0.00006489]);
                document.getElementById("error-title").innerHTML = "Error: URL must contain data in the hash!";
                document.getElementById("error-msg").innerHTML = `Your URL is ${window.location} and should be something like <a href="${sample}" class="dont-break-out">${sample}</a><br>Please refer to the <a href="${doc_url}">documentation</a>.`;
                break;
            case "malformed":
                document.getElementById("error-title").innerHTML = "Error: malformed URL parameters!";
                document.getElementById("error-msg").innerHTML = "Please check your URL parameters, refer to the <a href='${doc_url}#url-query-string-format'>documentation</a>.";
                break;
            default:
                // general error
                document.getElementById("error-title").innerHTML = "Error";
                document.getElementById("error-msg").innerHTML = "Please check your URL parameters";
        }
    }

    parseHash(hash) {
        const parts = hash.split(";");
        const powers = decode(parts[0], Int16Array);
        const times = decode(parts[1]);
        const costs = decode(parts[2]);
        // console.log(powers.toString(), times.toString(), costs.toString());
        return { powers, times, costs }
    }

    show(hash, hash2 = null, legend = null) {
        try {
            var data = this.parseHash(hash);
        } catch (e) {
            console.error(e);
            this.error("malformed");
            return;
        }

        if (hash2) {
            try {
                var data2 = this.parseHash(hash2);
            } catch (e) {
                console.error(e);
                this.error("malformed");
                return;
            }
        }

        this.report_el.style.display = "flex";
        this.error_el.style.display = "none";

        this.showCards(data);

        // will be used for the x-axis
        var powerValues = data.powers;

        if(hash2){
            // let's make sure you can compare two results with different power values
            // union of power values
            powerValues = data.powers.concat(data2.powers);
            // remove duplicates
            powerValues = powerValues.filter((item, pos) => powerValues.indexOf(item) === pos);
            // sort numerically
            powerValues.sort((a, b) => a - b);
            // inject null for missing power values (if any)
            for (const [i, value] of powerValues.entries()) {
                if(!data.powers.includes(value)) {
                    data.times.splice(i, 0, null);
                    data.costs.splice(i, 0, null);
                }
                if(!data2.powers.includes(value)) {
                    data2.times.splice(i, 0, null);
                    data2.costs.splice(i, 0, null);
                }
            }
        }

        let chartData = {
            labels: powerValues,
            datasets: [{
                label: 'Invocation Time (ms)',
                borderColor: this.chartColors.red,
                backgroundColor: this.chartColors.red,
                fill: false,
                data: data.times,
                yAxisID: 'time-axis',
            }, {
                label: 'Invocation Cost (USD)',
                borderColor: this.chartColors.blue,
                backgroundColor: this.chartColors.blue,
                fill: false,
                data: data.costs,
                yAxisID: 'cost-axis'
            }]
        };

        if (hash2) {
            // add two more datasets with different legend & colors (but same axis ID)
            chartData.datasets.push(...[{
                label: `Invocation Time ${legend+" "}(ms)`,
                borderColor: this.chartColors.orange,
                backgroundColor: this.chartColors.orange,
                fill: false,
                data: data2.times,
                yAxisID: 'time-axis',
            }, {
                label: `Invocation Cost ${legend+" "}(USD)`,
                borderColor: this.chartColors.green,
                backgroundColor: this.chartColors.green,
                fill: false,
                data: data2.costs,
                yAxisID: 'cost-axis',
            }]);
        }

        // clear existing charts to avoid rendering conflicts
        if (this.myLine) {
            this.myLine.destroy();
        }

        const ctx = this.canvas.getContext('2d');
        this.myLine = Chart.Line(ctx, {
            data: chartData,
            options: this.chartOptions,
        });

    }

    showCards(data) {
        const alpha = 0.5;
        const mc = Math.max(...data.costs);
        const mt = Math.max(...data.times);

        const configurations = data.powers.map((x, i) => {
            return {
                "size": x,
                "time": data.times[i],
                "cost": data.costs[i],
                "value": alpha*data.costs[i]/mc + (1-alpha)*data.times[i]/mt
            }
        });

        configurations.sort((x, y) => x.time - y.time);
        document.getElementById("min-time").innerHTML = `${configurations[0].size}MB`;
        document.getElementById("max-time").innerHTML = `${configurations[configurations.length - 1].size}MB`;
        configurations.sort((x, y) => x.cost - y.cost);
        document.getElementById("min-cost").innerHTML = `${configurations[0].size}MB`;
        document.getElementById("max-cost").innerHTML = `${configurations[configurations.length - 1].size}MB`;
        configurations.sort((x, y) => x.value - y.value);
        document.getElementById("balanced").innerHTML = `${configurations[0].size}MB`;
    }
}
