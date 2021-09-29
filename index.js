const fs = require("fs");
const http = require("https");

const init = async () => {
  let readData = fs.readFileSync("README.md", "utf8");
  readData = readData.toString();

  http.request("https://api.adviceslip.com/advice", function (res) {
    res.setEncoding("utf8");
    res.on("data", function (chunk) {
      let data = JSON.parse(chunk);
      console.log(data);

      let adviceTxt = `<!-- ADVICE:START -->\n<p align="center"><br><i>${data.slip.advice}</i><br></p>\n<!-- ADVICE:END -->`;

      readData = readData.replace(
        /(?:<!-- ADVICE:START -->)([\s\S]*)(?:<!-- ADVICE:END -->)/g,
        adviceTxt
      );

      console.log(adviceTxt);

      fs.writeFile("README.md", readData, function (err) {
        if (err) {
          return console.log(err);
        }
        console.log("The file was saved!");
      });
    });
  }).end();
};

init();
