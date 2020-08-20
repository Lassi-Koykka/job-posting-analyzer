const express = require("express");
const path = require("path");
const cron = require('node-cron');
const { isEqual } = require('lodash');
const { detResType } = require(path.join(__dirname, 'src', 'detResType.js'))
const makeDataKeysLower = require(path.join(__dirname, "src", "makeKeysLower.js"));
const dataExists = require(path.join(__dirname, "src", "dataExists.js"))
const {updateJsonSync} = require(path.join(__dirname, "src", "updateJson.js"))


//MIDDLEWARE
const logger = require(path.join(__dirname, "middleware", "logger"))

//ROUTES
const api = require(path.join(__dirname, 'routes', 'api', 'api'))

//APP
const app = express();

//Run on startup
//Checks if all the json files inside the folder exist before starting the server and creates them if needed.
//Returns the data and posts objects
let {
  data,
  posts
} = dataExists()
//MIDDLEWARE
app.use(logger);


data = makeDataKeysLower(data)

app.locals.data = data
app.locals.posts = posts

//Set static folder
app.use(express.static(path.join(__dirname, 'public')));

//ROUTING
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.use("/api", api);

app.use((req, res) => {
  res.status(404);
  detResType(req, res, path.join(__dirname, 'public', '404.html'))
});

//Schedule cron to update the json data every 15 minutes
cron.schedule("0,15,30,45 * * * *", async () => {
  try {
    console.log("\nSCHEDULED DATA UPDATE:\n")
    obj = await updateJsonSync()
    obj.data = makeDataKeysLower(obj.data)
    if (isEqual(obj.data, data)) {
      console.log("Some of the data has changed!")
    }
    data = obj.data
    posts = obj.posts
    app.locals.data = data
    app.locals.posts = data
    console.log('UPDATE DONE')
  } catch (error) {
    console.log(error)
  }
})

//Define the port and start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});