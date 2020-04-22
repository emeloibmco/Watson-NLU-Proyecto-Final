const express = require("express");
const server = express();
const bodyParser = require("body-parser");
const callNLUnderstanding = require("./utils/watsonNL");
const proDataNL = require("./utils/proDataNL");
const fileUpload = require("express-fileupload");
const par = require("./params.json");
const cors = require("cors");

server.use(bodyParser.json());
server.use(cors());


server.use(
  fileUpload({
    createParentPath: true
  })
);

server.post("/upload-text", async (req, res) => {
  const inputText = req.body.text;

  try {
    if (!inputText) {
      res.send({
        status: false,
        message: "No text uploaded"
      });
    } else {
      await callNLUnderstanding(par, inputText).then(ans =>
        proDataNL(ans).then(finalRes => res.json(finalRes))
      );
      console.log("\nDone!");
    }
  } catch (err) {
    res.status(500).json({ message: "No se pudo analizar el texto ingresado" });
  }
});

var cfenv = require("cfenv");
var appEnv = cfenv.getAppEnv();

server.listen(appEnv.port, "0.0.0.0", () => {
  console.log("Running at " + appEnv.url);
});

module.exports = server;
