const express = require("express")
const cors = require("cors")
const fetch = require("node-fetch")
const app = express()
const port = 3000

app.use(cors())

app.get("/api/snapshots", (req, res) => {
  fetch("https://powertop.home.jimmysawczuk.net/api/snapshots")
    .then((response) => response.json())
    .then((response) => res.send(response))
})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
