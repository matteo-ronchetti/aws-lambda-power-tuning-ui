function custom_tooltip(tooltipModel) {
    // Tooltip Element
    let el = document.getElementById('tooltip');

    // Hide if no tooltip
    if (tooltipModel.opacity === 0) {
        el.style.display = "none";
        return;
    }

    const size = tooltipModel.dataPoints[0].label;
    const time = smart_round(parseFloat(tooltipModel.dataPoints[0].value));
    const cost = smart_round(parseFloat(tooltipModel.dataPoints[1].value), 2);
    // console.log(size, time, cost);

    el.children[0].innerHTML = `Size: ${size}`;
    el.children[1].innerHTML = `Time: ${time}ms`;
    el.children[2].innerHTML = `Cost: ${cost}$`;

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

function smart_round(x, s = 1) {
    if (x < 1e-12) {
        return x.toFixed(s).replace(/(\.0*[1-9]+)[0]+$|\.[0]+$/, '$1');
    }

    let digits = Math.max(-Math.round(Math.log10(x)) + s, 0);
    let string = x.toFixed(digits);
    return string.replace(/(\.0*[1-9]+)[0]+$|\.[0]+$/, '$1');
}

class App {
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

    show(hash) {
        try {
            const parts = hash.split(";");
            var sizes = decode(parts[0], Int16Array);
            var times = decode(parts[1]);
            var costs = decode(parts[2]);
            console.log(sizes.toString(), times.toString(), costs.toString());
        } catch (e) {
            console.error(e);
            this.error("malformed");
            return;
        }
        this.report_el.style.display = "flex";
        this.error_el.style.display = "none";

        const alpha = 0.5;
        const mc = Math.max(...costs);
        const mt = Math.max(...times);

        const configurations = sizes.map((x, i) => {
            return {
                "size": x,
                "time": times[i],
                "cost": costs[i],
                "value": alpha*costs[i]/mc + (1-alpha)*times[i]/mt
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



        window.chartColors = {
            "red": "rgb(255, 99, 132)",
            "blue": "rgb(54, 162, 235)"
        };

        const data = {
            labels: sizes,
            datasets: [{
                label: 'Execution time (ms)',
                borderColor: window.chartColors.red,
                backgroundColor: window.chartColors.red,
                fill: false,
                data: times,
                yAxisID: 'time-axis',
            }, {
                label: 'Execution Cost (USD)',
                borderColor: window.chartColors.blue,
                backgroundColor: window.chartColors.blue,
                fill: false,
                data: costs,
                yAxisID: 'cost-axis'
            }]
        };

        const ctx = this.canvas.getContext('2d');
        window.myLine = Chart.Line(ctx, {
            data: data,
            options: {
                responsive: true,
                hoverMode: 'index',
                tooltips: {
                    mode: 'index',
                    intersect: false,
                    enabled: false,
                    custom: custom_tooltip
                },
                stacked: false,
                title: {
                    display: false,
                },
                scales: {
                    xAxes: [{
                        scaleLabel: {
                            display: true,
                            labelString: 'Lambda power (MB)'
                        },
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            callback: (value, index, values) => `${smart_round(value)} ms`,
                        },
                        type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Execution Time'
                        },
                        position: 'left',
                        id: 'time-axis',
                    }, {
                        ticks: {
                            beginAtZero: true,
                            callback: (value, index, values) => `${smart_round(value)} $`,
                        },
                        type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                        display: true,
                        position: 'right',
                        id: 'cost-axis',
                        scaleLabel: {
                            display: true,
                            labelString: 'Execution Cost'
                        },
                        // grid line settings
                        gridLines: {
                            drawOnChartArea: false, // only want the grid lines for one axis to show up
                        },
                    }],
                }
            }
        });

    }
}
