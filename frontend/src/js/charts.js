import { showAmount, showNumber } from './shared.js'
import { runAsFunction, getObjChild, setObjChild } from './lib.js'
import { Chart, Legend, registerables } from 'chart.js'
import { logAttrUpdate } from './init.js'

Chart.register(...registerables)
Chart.defaults.color = '#000'

export function createTicks(mode, val, ticks, ratioSum) {
  if (!val)
    return

  if (val === ticks[0].value || val === 0 || val === ticks.at(-1).value || val === ratioSum) {
    if (mode === 'number') return showNumber(val.toFixed(2))

    if (mode === 'amount') return showAmount(val.toFixed(2))

    if (mode === 'amountStacked') return showAmount(val.toFixed(2))
  }
}

function updateChartAttr(chartObj, attrPath, val, update) {
  if (chartObj instanceof Chart && val && getObjChild(chartObj, attrPath) != val) {

    if (logAttrUpdate)
      console.log(`${attrPath} ${getObjChild(chartObj, attrPath)} -> ${val} `)

    setObjChild(chartObj, attrPath, val)
    if (update) chartObj.update()

    return true
  }

  return false
}

export function chartFontSize(chartObj, axe, fontSize, update) {
  return updateChartAttr(chartObj, `options.scales.${axe}.ticks.font.size`, fontSize, update)
}

// один размер фонта на 2 оси.
export function chartFontSizeXY(chartObj, fontSize, update) {
  return (updateChartAttr(chartObj, 'options.scales.x.ticks.font.size', fontSize, update) +
         updateChartAttr(chartObj, 'options.scales.y.ticks.font.size', fontSize, update))
}

export function chartTickPadding(chartObj, axe, padding, update) {
  return updateChartAttr(chartObj, `options.scales.${axe}.ticks.padding`, padding, update)
}

export function chartBarSizePx(chartObj, sizePx, update) {
  if (sizePx === 0 && chartObj instanceof Chart) {

    if (!('barThickness' in chartObj.options))
      return false

    if (logAttrUpdate)
      console.log('delete barThickness')

    delete chartObj.options['barThickness']

    if (update)
      chartObj.update()

    return true
  }

  return updateChartAttr(chartObj, 'options.barThickness', sizePx, update)
}

function getOptions(srcData) {
  return {
    plugins: {
      title: {
        display: false,
        text: 'some text'
      },
      legend: {
        display: false
      }
    },

    responsive: true,
    // barThickness: 50,
    // categoryPercentage, and barPercentage
    // barPercentage: 0.3,
    // categoryPercentage: 1.8,
    maintainAspectRatio: false, // !!!!

    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
      }
    },

    // animation: {
    //   duration: 1,
    //   onComplete: () => {},
    // },

    scales: {
      x: {
        position: 'bottom',
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Ubuntu',
            weight: 700,
            size: 20
          }
        },
        border: {
          width: 1,
          color: '#000'
        }
      },
      x1: {
        position: 'top',
        ticks: {
          display: false
        },
        grid: {
          display: false
        },
        border: {
          width: 1,
          color: '#000'
        }
      },
      y: {
        beginAtZero: true,
        max: srcData.amountSorted.at(-1),

        position: 'right',
        grid: {
          display: false
        },

        ticks: {
          font: {
            family: 'Work Sans',
            weight: 500,
            size: 20
          }
        },
        border: {
          width: 1,
          color: '#000'
        }
      },
      y1: {
        position: 'left',
        ticks: {
          display: false
        },
        grid: {
          display: false
        },
        border: {
          width: 1,
          color: '#000'
        }
      }
    }
  }
}

function createChart(id, type, srcData, dataCb, optionsCb, ticksCb, afterBuildTicksCb) {
  const ctx = document.getElementById(id)
  if (!ctx) {
    console.error(`не найден id для отрисовки графика = ${id}`)
    return
  }

  const options = runAsFunction(optionsCb)(srcData)
  options.scales.y.ticks.callback = ticksCb
  options.scales.y.afterBuildTicks = afterBuildTicksCb

  return new Chart(ctx, {
    type: type,
    data: runAsFunction(dataCb)(srcData),
    options: options
  })
}

// ****************************************************************************

function prepareStackedData(srcData) {
  return {
    labels: srcData.months,
    datasets: [
      {
        label: 'Приход',
        data: srcData.income,
        backgroundColor: '#76CA66'
      },
      {
        label: 'Расход',
        data: srcData.outcome,
        backgroundColor: '#FD4E5D'
      }
    ]
  }
}

function prepareStackedOptions(srcData) {
  const options = getOptions(srcData)
  options.scales.x.stacked = true
  options.scales.y.stacked = true
  return options
}

export function createChartStacked(id, srcData, ticksCb, afterBuildTicksCb) {
  return createChart(
    id,
    'bar',
    srcData,
    prepareStackedData,
    prepareStackedOptions,
    ticksCb,
    afterBuildTicksCb
  )
}

// ****************************************************************************

function prepareSimpleOptions(srcData) {
  const options = getOptions(srcData)
  if (srcData.length > 1) options.scales.y.min = srcData.amountSorted[0]
  return options
}

function prepareSimpleData(srcData) {
  return {
    labels: srcData.months,
    datasets: [
      {
        label: 'Итого',
        data: srcData.amount,
        borderWidth: 1,
        backgroundColor: '#116ACC'
      }
    ]
  }
}

export function createChartSimple(id, srcData, ticksCb, afterBuildTicksCb) {
  return createChart(
    id,
    'bar',
    srcData,
    prepareSimpleData,
    prepareSimpleOptions,
    ticksCb,
    afterBuildTicksCb
  )
}

// ****************************************************************************

// https://jsfiddle.net/m5tnkr4n/1/
// export function complete() {

//     var controller = this.chart.controller;
//     var chart = controller.chart;
//     var yAxis = controller.scales['y'];

//     yAxis.ticks.forEach(function(value, index) {
//       var xOffset = chart.width - 40;
//       var yOffset = ((chart.height - 60) / 2 * index) + 15;
//       ctx.fillText(value + 'M', xOffset, yOffset);
//     });

// }
