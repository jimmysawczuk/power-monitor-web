const express = require("express")
const cors = require("cors")
const fetch = require("node-fetch")
const app = express()
const port = 3000
const baseURL = process.env.BASE_URL

app.use(cors())

app.get("/api/snapshots", (req, res) => {
  fetch(`${baseURL}/api/snapshots`)
    .then((response) => response.json())
    .then((response) => res.send(response))
})

app.get("/api/meta", (req, res) => {
  fetch(`${baseURL}/api/meta`)
    .then((response) => response.json())
    .then((response) => res.send(response))
})

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`)
})
