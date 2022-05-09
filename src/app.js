import { encode, decode } from './encode';

const DOC_URL = 'https://github.com/digio/aws-lambda-power-tuning-ui';
const HASH_DELIM = ';';
const NORMAL_HASH_LEN = 3;
const COMPARISON_HASH_LEN = 8;

const chartColors = {
  red: 'rgb(255, 99, 132)',
  blue: 'rgb(54, 162, 235)',
  orange: 'rgb(255, 165, 00)',
  green: 'rgb(34, 139, 34)',
};

const chartOptions = {
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
    xAxes: [
      {
        scaleLabel: {
          display: true,
          labelString: 'Memory / Power (MB)',
        },
      },
    ],
    yAxes: [
      {
        ticks: {
          beginAtZero: true,
          callback: (value /*, index, values*/) => `${smartRound(value)} ms`,
        },
        type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
        display: true,
        scaleLabel: {
          display: true,
          labelString: 'Invocation Time',
        },
        position: 'left',
        id: 'time-axis',
      },
      {
        ticks: {
          beginAtZero: true,
          callback: (value /*, index, values*/) => `${smartRound(value)} $`,
        },
        type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
        display: true,
        position: 'right',
        id: 'cost-axis',
        scaleLabel: {
          display: true,
          labelString: 'Invocation Cost',
        },
        // grid line settings
        gridLines: {
          drawOnChartArea: false, // only want the grid lines for one axis to show up
        },
      },
    ],
  },
};

export class App {
  constructor(store) {
    this.store = store;
    this.canvas = document.querySelector('canvas');
    this.reportElem = document.getElementById('report');
    this.errorElem = document.getElementById('error');

    // App State
    this.data1 = null;
    this.data1URL = '';
    this.data2 = null;
    this.data2URL = '';
    this.legend1 = '';
    this.legend2 = '';

    this.store.addListener(this.show.bind(this), this.error.bind(this));
  }

  setData1(parts) {
    this.data1 = parseHash(parts);
    this.data1URL = getURLForHash(parts.join(HASH_DELIM));
  }

  setData2(parts) {
    this.data2 = parseHash(parts);
    this.data2URL = getURLForHash(parts.join(HASH_DELIM));
  }

  error(err) {
    this.reportElem.style.display = 'none';
    this.errorElem.style.display = 'flex';

    switch (err) {
      case 'empty':
        let sampleURL = getURLForHash(
          encode([128, 256, 512, 1024], Int16Array) +
            HASH_DELIM +
            encode([36555.39, 18441.58, 8539.34, 3870.76]) +
            HASH_DELIM +
            encode([0.00007612, 0.00007696, 0.00007155, 0.00006489]),
        );
        document.getElementById('error-title').innerHTML = 'Error: URL must contain data in the hash!';
        document.getElementById(
          'error-msg',
        ).innerHTML = `Your URL is ${window.location} and should be something like <a href="${sampleURL}" class="dont-break-out">${sampleURL}</a><br>Please refer to the <a href="${DOC_URL}">documentation</a>.`;
        break;

      case 'malformed':
        document.getElementById('error-title').innerHTML = 'Error: malformed URL parameters!';
        document.getElementById(
          'error-msg',
        ).innerHTML = `Please check your URL parameters, refer to the <a href='${DOC_URL}#url-format'>documentation</a>.`;
        break;

      default:
        // general error
        document.getElementById('error-title').innerHTML = 'Error';
        document.getElementById('error-msg').innerHTML = 'Please check your URL parameters';
    }
  }

  show(hash) {
    const hashParts = hash.split(HASH_DELIM);
    const hashPartsLen = hashParts.length;
    this.legend1 = '';
    this.legend2 = '';

    // There must be a single set of values (3 parts), OR, the comparison-set-of-values (8)
    if (hashPartsLen !== NORMAL_HASH_LEN && hashPartsLen !== COMPARISON_HASH_LEN) {
      this.error('malformed');
    }

    try {
      this.setData1(hashParts.slice(0, 3));
    } catch (e) {
      console.error(e);
      this.error('malformed');
      return;
    }

    if (hashPartsLen === COMPARISON_HASH_LEN) {
      try {
        this.setData2(hashParts.slice(3, 6));
      } catch (e) {
        console.error(e);
        this.error('malformed');
        return;
      }

      this.legend1 = decodeURIComponent(hashParts[6]);
      this.legend2 = decodeURIComponent(hashParts[7]);
    } else {
      // If we don't have the comparison data, reset the comparison-data fields
      this.data2 = null;
      this.data2URL = '';
      this.legend1 = '';
      this.legend2 = '';
    }

    this.reportElem.style.display = 'flex';
    this.errorElem.style.display = 'none';

    this.showCards(this.data1);

    // will be used for the x-axis
    let powerValues = this.data1.powers;

    if (this.data2) {
      // let's make sure you can compare two results with different power values
      // union of power values
      powerValues = this.data1.powers.concat(this.data2.powers);
      // remove duplicates
      powerValues = powerValues.filter((item, pos) => powerValues.indexOf(item) === pos);
      // sort numerically
      powerValues.sort((a, b) => a - b);
      // inject null for missing power values (if any)
      for (const [i, value] of powerValues.entries()) {
        if (!this.data1.powers.includes(value)) {
          this.data1.times.splice(i, 0, null);
          this.data1.costs.splice(i, 0, null);
        }
        if (!this.data2.powers.includes(value)) {
          this.data2.times.splice(i, 0, null);
          this.data2.costs.splice(i, 0, null);
        }
      }
    }

    const chartData = {
      labels: powerValues,
      datasets: [
        {
          label: `Invocation Time ${this.legend1 ? this.legend1 + ' ' : ''}(ms)`,
          borderColor: chartColors.red,
          backgroundColor: chartColors.red,
          fill: false,
          data: this.data1.times,
          yAxisID: 'time-axis',
        },
        {
          label: `Invocation Cost ${this.legend1 ? this.legend1 + ' ' : ''}(USD)`,
          borderColor: chartColors.blue,
          backgroundColor: chartColors.blue,
          fill: false,
          data: this.data1.costs,
          yAxisID: 'cost-axis',
        },
      ],
    };

    if (this.data2) {
      // add two more datasets with different legend & colors (but same axis ID)
      chartData.datasets.push(
        ...[
          {
            label: `Invocation Time ${this.legend2 ? this.legend2 + ' ' : ''}(ms)`,
            borderColor: chartColors.orange,
            backgroundColor: chartColors.orange,
            fill: false,
            data: this.data2.times,
            yAxisID: 'time-axis',
          },
          {
            label: `Invocation Cost ${this.legend2 ? this.legend2 + ' ' : ''}(USD)`,
            borderColor: chartColors.green,
            backgroundColor: chartColors.green,
            fill: false,
            data: this.data2.costs,
            yAxisID: 'cost-axis',
          },
        ],
      );
    }

    // clear existing charts to avoid rendering conflicts
    if (this.myLine) {
      this.myLine.destroy();
    }

    const ctx = this.canvas.getContext('2d');
    this.myLine = Chart.Line(ctx, {
      data: chartData,
      options: chartOptions,
    });
  }

  showCards(data) {
    const alpha = 0.5;
    const mc = Math.max(...data.costs);
    const mt = Math.max(...data.times);

    const configurations = data.powers.map((x, i) => {
      return {
        size: x,
        time: data.times[i],
        cost: data.costs[i],
        value: (alpha * data.costs[i]) / mc + ((1 - alpha) * data.times[i]) / mt,
      };
    });

    configurations.sort((x, y) => x.time - y.time);
    document.getElementById('min-time').innerHTML = `${configurations[0].size}MB`;
    document.getElementById('max-time').innerHTML = `${configurations[configurations.length - 1].size}MB`;
    configurations.sort((x, y) => x.cost - y.cost);
    document.getElementById('min-cost').innerHTML = `${configurations[0].size}MB`;
    document.getElementById('max-cost').innerHTML = `${configurations[configurations.length - 1].size}MB`;
    configurations.sort((x, y) => x.value - y.value);
    document.getElementById('balanced').innerHTML = `${configurations[0].size}MB`;
  }

  compare(hash1, hash2, legend1, legend2) {
    // This is really like a persistState() call.
    // This should trigger a call to app.show() via the hashwatcher's callback
    this.store.setState([hash1, hash2, encodeURIComponent(legend1), encodeURIComponent(legend2)].join(HASH_DELIM));
  }
}

function parseHash(parts) {
  const powers = decode(parts[0], Int16Array);
  const times = decode(parts[1]);
  const costs = decode(parts[2]);
  // console.log(powers.toString(), times.toString(), costs.toString());
  return { powers, times, costs };
}

function getURLForHash(hash) {
  return `${window.location.origin}${window.location.pathname}#${hash}`;
}

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
    el.style.display = 'none';
    return;
  }

  const power = tooltipModel.dataPoints[0].label;
  const time = smartRound(parseFloat(tooltipModel.dataPoints[0].value));
  const cost = smartRound(parseFloat(tooltipModel.dataPoints[1].value), 2);

  elPower.innerHTML = `Power: ${power}`;
  elTime1.innerHTML = `Time: ${time}ms`;
  elCost1.innerHTML = `Cost: ${cost}$`;

  if (tooltipModel.dataPoints[2] && tooltipModel.dataPoints[2].value) {
    const time2 = smartRound(parseFloat(tooltipModel.dataPoints[2].value));
    const cost2 = smartRound(parseFloat(tooltipModel.dataPoints[3].value), 2);
    const percTime = smartRound((time2 * 100) / time) - 100; // faster if <0, slower if >0
    const percCost = smartRound((cost2 * 100) / cost) - 100; // more expensive if >0, cheaper if <0

    const timeLabel = percTime < 0 ? 'faster' : 'slower';
    const costLabel = percCost > 0 ? 'more expensive' : 'cheaper';

    elTime2.innerHTML = `Time: ${time2}ms (${Math.sign(percTime) * percTime}% ${timeLabel})`;
    elCost2.innerHTML = `Cost: ${cost2}$ (${Math.sign(percCost) * percCost}% ${costLabel})`;

    elTime2.style.display = 'block';
    elCost2.style.display = 'block';
    elSeparator.style.display = 'block';
  } else {
    elTime2.style.display = 'none';
    elCost2.style.display = 'none';
    elSeparator.style.display = 'none';
  }

  const position = this._chart.canvas.getBoundingClientRect();

  el.style.display = 'block';
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
