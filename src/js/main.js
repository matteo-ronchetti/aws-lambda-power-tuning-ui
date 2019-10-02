function custom_tooltip(tooltipModel) {
    // Tooltip Element
    let el = document.getElementById('tooltip');

    // Hide if no tooltip
    if (tooltipModel.opacity === 0) {
        el.style.display = "none";
        return;
    }

    const size = tooltipModel.dataPoints[0].label;
    const time = Math.round(parseFloat(tooltipModel.dataPoints[0].value) * 100) / 100;
    const cost = Math.round(parseFloat(tooltipModel.dataPoints[1].value) * 10000) / 10000;
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

function main() {
    const parts = window.location.hash.slice(1).split(";");
    const sizes = decode(parts[0], Int16Array);
    const times = decode(parts[1]);
    const costs = decode(parts[2]);
    console.log(sizes, times, costs);

    window.chartColors = {
        "red": "rgb(255, 99, 132)",
        "blue": "rgb(54, 162, 235)"
    };

    const data = {
        labels: sizes,
        datasets: [{
            label: 'Execution Time',
            borderColor: window.chartColors.red,
            backgroundColor: window.chartColors.red,
            fill: false,
            data: times,
            yAxisID: 'time-axis',
        }, {
            label: 'Execution Cost',
            borderColor: window.chartColors.blue,
            backgroundColor: window.chartColors.blue,
            fill: false,
            data: costs,
            yAxisID: 'cost-axis'
        }]
    };

    const ctx = document.getElementById('canvas').getContext('2d');
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
                        labelString: 'Lambda Size'
                    },
                }],
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: (value, index, values) => `${value} ms`,
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
                        callback: (value, index, values) => `${value} $`,
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
