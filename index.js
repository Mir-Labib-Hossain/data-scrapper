// npm run scrap
// http://localhost:8000/

const PORT = 8000;
const axios = require("axios");
const cheerio = require("cheerio");
const express = require("express");
const res = require("express/lib/response");
const connection = require("./database");
const app = express();

//
// scrapping symbol list
//
const url_symbol_list = "https://www.dse.com.bd/latest_share_price_scroll_l.php";
let symbol_list = [];
axios(url_symbol_list).then((res) => {
  const html = res.data;
  const $ = cheerio.load(html);
  $(".table-responsive>table>tbody>tr", html).each(function () {
    let each_data_arr = $(this).text().trim().replace(/\s\s+/g, " ").replace(/,/g, "").split(" ");
    symbol_list.push(each_data_arr);
    // break
    if (each_data_arr[0] === "386") return false;
  });
});

const fetchSymbolDetails = async (symbol, i) => {
  let headers = [];
  let url_symbol_details = "https://www.dse.com.bd/displayCompany.php?name=" + symbol;
  let symbol_details = {
    company_info: {},
    market_info: {},
    basic_info: {},
    pe_unaudited: {},
    pe_audited: {},
    financial_performance_per_audited_financial: [],
    financial_performance_continued: [],
    other_info: {},
  };

  function filterTableData(data) {
    return data
      .replace(/<\/?[^>]+(>|$)/g, "   ")
      .replace("'", "")
      .split("   ");
  }

  function toNum(data) {
    return parseFloat(data.replace(/,/g, ""));
  }

  let res = await axios(url_symbol_details);

  const html = res.data.trim().replace(/\s\s+/g, " ");
  const $ = cheerio.load(html);
  console.log(i + " fetching data of " + symbol + " ⏳");

  $(".topBodyHead", html).each(function () {
    headers.push($(this).text().trim());
  });

  $("#company", html).each(function (index) {
    let eachTable = $(this).html();

    switch (index) {
      case 0:
        $("tr", eachTable).each(function () {
          let data = $(this).text().trim().split(" ");
          symbol_details.company_info.name = headers[index].split(": ")[1];
          symbol_details.company_info.trading_code = data[2];
          symbol_details.company_info.scrip_code = parseInt(data[5]);
        });
        break;

      case 1:
        $("tbody", eachTable).each(function () {
          let data = filterTableData($(this).html());

          symbol_details.market_info.last_trading_price = toNum(data[4]);
          symbol_details.market_info.closing_price = toNum(data[8]);
          symbol_details.market_info.last_update = data[15].trim();
          const days_range = data[19].split("-");
          symbol_details.market_info.days_range = {
            start: toNum(days_range[0]),
            end: toNum(days_range[1]),
          };
          symbol_details.market_info.change = {
            value: toNum(data[26]),
            percentage: toNum(data[35]),
          };
          symbol_details.market_info.days_value_MN = toNum(data[30]);
          const moving_range_of_52weeks = data[39].split("-");
          symbol_details.market_info.moving_range_of_52weeks = {
            start: toNum(moving_range_of_52weeks[0]),
            end: toNum(moving_range_of_52weeks[1]),
          };
          symbol_details.market_info.opening_price = toNum(data[46]);
          symbol_details.market_info.days_volume_Nos = toNum(data[50]);
          symbol_details.market_info.adjusted_opening_price = toNum(data[57]);
          symbol_details.market_info.days_trade_Nos = toNum(data[61]);
          symbol_details.market_info.yesterdays_closing_price = toNum(data[68]);
          symbol_details.market_info.market_capitalization_MN = toNum(data[72]);
        });
        break;

      case 2:
        $("tbody", eachTable).each(function () {
          let data = filterTableData($(this).html());

          symbol_details.basic_info.authorized_capital_MN = toNum(data[4]);
          symbol_details.basic_info.debut_trading_date = data[9];
          symbol_details.basic_info.paid_up_capital_MN = toNum(data[14]);
          symbol_details.basic_info.type_of_instrument = data[21];
          symbol_details.basic_info.face_par_value = toNum(data[28]);
          symbol_details.basic_info.market_lot = toNum(data[32]);
          symbol_details.basic_info.total_no_of_outstanding_securities = toNum(data[39]);
          symbol_details.basic_info.sector = data[43].trim();
          return false;
        });
        break;

      case 5:
        $("tbody", eachTable).each(function (index) {
          let data = filterTableData($(this).html());

          symbol_details.pe_unaudited = [
            {
              particulars: data[19],
              ratio: [
                {
                  date: data[4].trim(),
                  value: toNum(data[22]),
                },
                {
                  date: data[6],
                  value: toNum(data[24]),
                },
                {
                  date: data[8],
                  value: toNum(data[26]),
                },
                {
                  date: data[10],
                  value: toNum(data[28]),
                },
                {
                  date: data[12],
                  value: toNum(data[30]),
                },
                {
                  date: data[14],
                  value: toNum(data[32]),
                },
              ],
            },
            {
              particulars: data[37],
              ratio: [
                {
                  date: data[4].trim(),
                  value: toNum(data[40]),
                },
                {
                  date: data[6],
                  value: toNum(data[42]),
                },
                {
                  date: data[8],
                  value: toNum(data[44]),
                },
                {
                  date: data[10],
                  value: toNum(data[46]),
                },
                {
                  date: data[12],
                  value: toNum(data[48]),
                },
                {
                  date: data[14],
                  value: toNum(data[50]),
                },
              ],
            },
          ];
        });

        break;

      case 6:
        $("tbody", eachTable).each(function (index) {
          let data = filterTableData($(this).html());
          symbol_details.pe_audited = [
            {
              particulars: data[19],
              ratio: [
                {
                  date: data[4].trim(),
                  value: toNum(data[22]),
                },
                {
                  date: data[6],
                  value: toNum(data[24]),
                },
                {
                  date: data[8],
                  value: toNum(data[26]),
                },
                {
                  date: data[10],
                  value: toNum(data[28]),
                },
                {
                  date: data[12],
                  value: toNum(data[30]),
                },
                {
                  date: data[14],
                  value: toNum(data[32]),
                },
              ],
            },
            {
              particulars: data[37],
              ratio: [
                {
                  date: data[4].trim(),
                  value: toNum(data[40]),
                },
                {
                  date: data[6],
                  value: toNum(data[42]),
                },
                {
                  date: data[8],
                  value: toNum(data[44]),
                },
                {
                  date: data[10],
                  value: toNum(data[46]),
                },
                {
                  date: data[12],
                  value: toNum(data[48]),
                },
                {
                  date: data[14],
                  value: toNum(data[50]),
                },
              ],
            },
          ];
        });

        break;

      case 7:
        $("tbody", eachTable).each(function () {
          data = $(this)
            .html()
            .replace(/<tr>/g, "   ")
            .replace(/<\/?[^>]+(>|$)/g, "")
            .split(" -->");

          len = data.length;
          for (i = 1; i < len; i++) {
            eachRow = data[i].trim().split("  ");
            symbol_details.financial_performance_per_audited_financial.push({
              year: toNum(eachRow[0]),
              eps: {
                original: toNum(eachRow[4]),
                restated: toNum(eachRow[5]),
                deluted: toNum(eachRow[6]),
              },
              nav_per_share: {
                original: toNum(eachRow[7]),
                restated: toNum(eachRow[8]),
                deluted: toNum(eachRow[9]),
              },
              profit_per_loss_OCI: {
                pco: toNum(eachRow[10]),
                profit_for_year_MN: toNum(eachRow[11]),
                tci: toNum(eachRow[12]),
              },
            });
          }
        });

        break;

      case 8:
        $("tbody", eachTable).each(function () {
          data = $(this)
            .html()
            .replace(/<tr>/g, "    ")
            .replace(/<\/?[^>]+(>|$)/g, "")
            .split("    ");

          len = data.length;
          for (i = 2; i < len; i++) {
            eachRow = data[i].trim().split("  ");
            dividend_percentage = eachRow[7].split(", ");
            symbol_details.financial_performance_continued.push({
              year: toNum(eachRow[0]),
              eps: {
                original: toNum(eachRow[4]),
                restated: toNum(eachRow[5]),
                deluted: toNum(eachRow[6]),
              },
              dividend_percentage: {
                value: toNum(dividend_percentage[0]),
                percentage: dividend_percentage[1],
              },
              dividend_yield_percentage: toNum(eachRow[8]),
            });
          }
        });
        break;

      case 10:
        $("tbody", eachTable).each(function (index) {
          let data = filterTableData($(this).html().replaceAll(" Share Holding Percentage [as on ", "").replace("]", ""));

          symbol_details.other_info.listing_year = toNum(data[4]);
          symbol_details.other_info.market_category = data[11].trim();
          symbol_details.other_info.electronic_share = data[18].trim();
          symbol_details.other_info.share_holding_percentage = [];

          symbol_details.other_info.share_holding_percentage.push(
            {
              date: data[23].trim(),
              sponsor_or_director: toNum(data[31]),
              govt: toNum(data[34]),
              institute: toNum(data[37]),
              foreign: toNum(data[40]),
              public: toNum(data[43]),
            },
            {
              date: data[53],
              sponsor_or_director: toNum(data[61]),
              govt: toNum(data[64]),
              institute: toNum(data[67]),
              foreign: toNum(data[70]),
              public: toNum(data[73]),
            }
          );
          if (data[83] !== "Remarks") {
            symbol_details.other_info.share_holding_percentage.push({
              date: data[83],
              sponsor_or_director: toNum(data[91]),
              govt: toNum(data[94]),
              institute: toNum(data[97]),
              foreign: toNum(data[100]),
              public: toNum(data[103]),
            });
            symbol_details.other_info.remarks = data[115].trim();
          } else symbol_details.other_info.remarks = data[83].trim();
          return false;
        });
        break;

      default:
        break;
    }
  });

  return JSON.stringify(symbol_details);
};

const insertFetchedData = async () => {
  var symbol_list_insert_query = "INSERT INTO symbol_list (id, trading_code, ltp, high, low, closep, ycp, cng, trade, value, volume) VALUES";
  var symbol_details_insert_query = "INSERT INTO symbol_details ( symbol, data) VALUES";
  const len = symbol_list.length;
  for (let i = 0; i < len; i++) {
    let jsonData = await fetchSymbolDetails(symbol_list[i][1], i);
    symbol_list_insert_query += "('" + symbol_list[i].join("','") + "')";
    symbol_details_insert_query += "('" + symbol_list[i][1] + "','" + jsonData + "')";
    if (i === len - 1) break;
    symbol_list_insert_query += ",";
    symbol_details_insert_query += ",";
  }
  console.log("Fetching complete 🎉");
  console.log("⏳ INSERTING . . .");

  combined_query = symbol_list_insert_query + "; " + symbol_details_insert_query;
  connection.query(combined_query, function (err, result) {
    if (err) console.log(err);
    else console.log(symbol_list.length + " records inserted 🎉");
  });
};

app.get("/update", (req, res) => {
  var check_date_query = "SELECT TO_CHAR(fetched_on, 'DD/MM/YYYY') as fetched_on FROM symbol_list ORDER BY id DESC LIMIT 1;";
  connection.query(check_date_query, function (err, result) {
    if (err) console.log(err);
    else {
      let last_fetched_on = result.rows[0].fetched_on;
      let today_date = new Date();
      let dd = String(today_date.getDate()).padStart(2, "0");
      let mm = String(today_date.getMonth() + 1).padStart(2, "0"); //January is 0!
      let yyyy = today_date.getFullYear();
      today_date = dd + "/" + mm + "/" + yyyy;
      console.log(today_date + " =? " + last_fetched_on);

      if (today_date !== last_fetched_on) {
        res.send("Updating . . .");
        console.log("Updating");
        insertFetchedData();
      } else {
        res.send("Already up to date !<br> <a href = '/'>Go back</a>");
        console.log("Already up to date");
      }
    }
  });
});

app.get("/:symbol", function (req, res) {
  let symbol = req.params.symbol;
  res.send(symbol);
});

app.get("/", function (req, res) {
  let str = "<a href = '/update'>UPDATE DB</a><br><table>  <tr> <th>#</th> <th>TRADING CODE</th> <th>LTP*</th> <th>HIGH</th> <th>LOW</th> <th>CLOSEP*</th> <th>YCP*</th> <th>CHANGE</th> <th>TRADE</th> <th>VALUE (mn)</th> <th>VOLUME</th> </tr> ";
  for (let i = 0; i < symbol_list.length; i++) {
    str += "<tr>";
    for (let j = 0; j < symbol_list[i].length; j++) {
      if (j == 1) str += "<td><a href='" + symbol_list[i][1] + "'>" + symbol_list[i][j] + "</a></td>";
      else str += "<td>" + symbol_list[i][j] + "</td>";
    }
    str += " <tr>";
  }
  str += "</table>";
  res.send(str);
});

app.listen(PORT, () => {
  connection.connect((err) => {
    if (err) console.log(err);
    console.log("DB connected 🤝");
  });
  console.log(`Server running on PORT ${PORT} 🚀`);
});
