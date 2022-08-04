const PORT = 8000;
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");

const app = express();
const url_symbol_list = "https://www.dse.com.bd/latest_share_price_scroll_l.php";
axios(url_symbol_list).then((response) => {
  const html = response.data;
  const $ = cheerio.load(html);
  $(".table-responsive>table>tbody>tr", html).each(function () {
    const dataArr = $(this).text().trim().replace(/\s\s+/g, " ").split(" ");
    console.log(dataArr);
    if (dataArr[0] === "386") return false;
  });
  // console.log(html);
});

app.get("/", function (req, res) {
    // visit - http://localhost:8000/
  res.send("Hello labibNoob !");
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));