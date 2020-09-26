import highcharts from "highcharts"
import { render as timeagoRender, register } from "timeago.js"
import { formatDistance } from "date-fns"
import "./fa"

import "~/bootstrap/scss/bootstrap.scss"
import "~/highcharts/css/highcharts.scss"
import "./main.scss"

let baseURL = ""

register("local", function (number, index) {
  return [
    ["a moment ago", "in a moment"],
    ["a moment ago", "in a moment"],
    ["1 minute ago", "in 1 minute"],
    ["%s minutes ago", "in %s minutes"],
    ["1 hour ago", "in 1 hour"],
    ["%s hours ago", "in %s hours"],
    ["1 day ago", "in 1 day"],
    ["%s days ago", "in %s days"],
    ["1 week ago", "in 1 week"],
    ["%s weeks ago", "in %s weeks"],
    ["1 month ago", "in 1 month"],
    ["%s months ago", "in %s months"],
    ["1 year ago", "in 1 year"],
    ["%s years ago", "in %s years"],
  ][index]
})

function humanizeDuration(d) {
  return `${formatDistance(new Date(), new Date() - d)} ago`
}

function updateModel(snapshot) {
  document.getElementById(
    "model",
  ).innerHTML = `UPS Model: ${snapshot.modelName}`
}

function updateBatteryRemaining(snapshot) {
  document.getElementById("battery-remaining").innerHTML = `<h1>${
    snapshot.batteryRemaining * 100
  } %<small>Battery remaining</small></h1>`
}

function updateLoad(snapshot) {
  document.getElementById(
    "load",
  ).innerHTML = `<h1>${snapshot.load} W<small>Load</small></h1>`
}

function updateRemainingRuntime(snapshot) {
  document.getElementById(
    "remaining-runtime",
  ).innerHTML = `<h1>${snapshot.remainingRuntime} min.<small>Remaining runtime</small></h1>`
}

function updateUtilityVoltage(snapshot) {
  document.getElementById(
    "utility-voltage",
  ).innerHTML = `<h1>${snapshot.utilityVoltage} V<small>Utility voltage</small></h1>`
}

function getDefaultChartOptions() {
  return {
    chart: {
      styledMode: true,
    },

    credits: {
      enabled: false,
    },

    xAxis: {
      labels: {
        formatter() {
          return humanizeDuration(this.value)
        },
      },
    },

    legend: {
      enabled: false,
    },

    title: {
      style: {},
    },

    plotOptions: {
      line: {
        marker: {
          enabled: false,
        },
      },
    },
  }
}

function drawBatteryRemainingChart(snapshots) {
  const data = []
  snapshots.forEach((snapshot) => {
    data.push([snapshot.duration, snapshot.batteryRemaining])
  })

  highcharts.chart({
    ...getDefaultChartOptions(),
    chart: {
      ...getDefaultChartOptions().chart,
      renderTo: "battery-remaining-chart",
    },
    title: {
      text: "Battery remaining",
    },
    yAxis: {
      tickInterval: 0.2,
      endOnTick: false,
      labels: {
        formatter() {
          return `${100 * this.value}%`
        },
      },
      min: 0,
      max: 1.1,
    },

    tooltip: {
      formatter() {
        return `<b>${humanizeDuration(this.x)}:</b> ${100 * this.y}%`
      },
    },

    series: [
      {
        name: "Battery remaining",
        data,
      },
    ],
  })
}

function drawLoadChart(snapshots) {
  const data = []
  snapshots.forEach((snapshot) => {
    data.push([snapshot.duration, snapshot.load])
  })

  highcharts.chart({
    ...getDefaultChartOptions(),
    chart: {
      ...getDefaultChartOptions().chart,
      renderTo: "load-chart",
    },
    title: {
      text: "Load",
    },
    yAxis: {
      endOnTick: true,
      labels: {
        formatter() {
          return `${this.value} W`
        },
      },
      min: 0,
      // max: 1 * snapshots[0].batteryCapacity
    },

    tooltip: {
      formatter() {
        return `<b>${humanizeDuration(this.x)}:</b> ${this.y} W`
      },
    },

    series: [
      {
        name: "Load",
        data,
      },
    ],
  })
}

function drawRemainingRuntimeChart(snapshots) {
  const data = []
  snapshots.forEach((snapshot) => {
    data.push([snapshot.duration, snapshot.remainingRuntime])
  })

  highcharts.chart({
    ...getDefaultChartOptions(),
    chart: {
      ...getDefaultChartOptions().chart,
      renderTo: "remaining-runtime-chart",
    },

    title: {
      text: "Remaining runtime",
    },

    yAxis: {
      endOnTick: true,
      labels: {
        formatter() {
          return `${this.value} min`
        },
      },
      min: 0,
    },

    tooltip: {
      formatter() {
        return `<b>${humanizeDuration(this.x)}:</b> ${this.y} min.`
      },
    },

    series: [
      {
        name: "Remaining runtime",
        data,
      },
    ],
  })
}

function drawUtilityVoltageChart(snapshots) {
  const data = []
  snapshots.forEach((snapshot) => {
    data.push([snapshot.duration, snapshot.utilityVoltage])
  })

  highcharts.chart({
    ...getDefaultChartOptions(),
    chart: {
      ...getDefaultChartOptions().chart,
      renderTo: "utility-voltage-chart",
    },

    title: {
      text: "Utility voltage",
    },

    yAxis: {
      endOnTick: true,
      labels: {
        formatter() {
          return `${this.value} V`
        },
      },
      min: 0,
    },

    tooltip: {
      formatter() {
        return `<b>${humanizeDuration(this.x)}:</b> ${this.y} V`
      },
    },

    series: [
      {
        name: "Utility voltage",
        data,
      },
    ],
  })
}

function setMonitoringStartTime(startTime) {
  document.getElementById(
    "started",
  ).innerHTML = `Monitoring started <time datetime="${startTime}" />`

  timeagoRender(document.querySelectorAll("time"), "local")
}

function setFrontendRevision(revision) {
  document.getElementById(
    "frontend-revision",
  ).innerHTML = `frontend: <a href="${revision.link}" title="${revision.date}" target="_blank">rev. ${revision.rev}</a>`
}

function setBackendRevision(revision) {
  document.getElementById(
    "backend-revision",
  ).innerHTML = `api: <a href="${revision.link}" title="${revision.date}" target="_blank">${revision.version}-${revision.rev}</a>`
}

function setBaseURL(url) {
  baseURL = url
}

function update() {
  fetch(`${baseURL}/api/snapshots`)
    .then((response) => response.json())
    .then((response) => {
      if (
        response === null ||
        response.recent === null ||
        response.latest === null
      ) {
        return
      }

      const { latest, recent } = response

      if (recent.length === 0) {
        return
      }

      const now = +new Date()
      recent.forEach((snapshot, i) => {
        recent[i].duration = now - +new Date(snapshot.timestamp)
      })

      updateModel(latest)

      updateBatteryRemaining(latest)
      updateLoad(latest)
      updateRemainingRuntime(latest)
      updateUtilityVoltage(latest)

      drawBatteryRemainingChart(recent)
      drawLoadChart(recent)
      drawRemainingRuntimeChart(recent)
      drawUtilityVoltageChart(recent)

      document.getElementById(
        "last-updated",
      ).innerHTML = `Last updated <time datetime="${latest.timestamp}" />`

      timeagoRender(document.querySelectorAll("time"), "local")
    })
}

export function startup(window, document, opts) {
  document.addEventListener("DOMContentLoaded", () => {
    setFrontendRevision(opts.frontendRevision)
    setBaseURL(opts.baseURL)

    fetch(`${baseURL}/api/meta`)
      .then((response) => response.json())
      .then((response) => {
        setMonitoringStartTime(response.startTime)
        setBackendRevision({
          version: response.version,
          rev: response.revision,
          link: `https://github.com/jimmysawczuk/power-monitor/commit/${response.revision}`,
          date: response.revisedDate,
        })
      })

    window.setInterval(update, opts.interval)
    update()
  })
}
