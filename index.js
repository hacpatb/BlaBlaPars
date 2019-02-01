'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { URL } = require('url');
const moment = require('moment');
const app = express();

const config = {
    timeout: 2000,
    headers: {
        'accept': 'application/json',
        'key': '48e2bd90ac39490aa29939b4c1f7f23f'
    }
};


async function Count(carCitys) {
    let dateStr = moment().add(1, 'days').format('YYYY-MM-DD'),
        lim = 100,
        outArray = [];
    console.log(carCitys[carCitys.length - 1].length);
    if (carCitys[carCitys.length - 1].length < 3) {
        carCitys.pop();
    }
    console.log(carCitys);
    try {
        if (carCitys.length >= 2) {
            for (let i = 0; i < carCitys.length - 1; i++) {
                let myURL = new URL(`https://public-api.blablacar.com/api/v2/trips?fn=${carCitys[i]}&tn=${carCitys[i + 1]}&locale=ru_RU&_format=json&cur=RUB&db=${dateStr}&limit=${lim}`);
                let item = await axios.get(myURL['href'], config);
                let sum = 0;
                if (item['data']['trips'].length != 0) {
                    item['data']['trips'].forEach(function (trip) {
                        sum += trip['price']['value'];
                    });
                    sum = sum / ((item['data']['pager']['total'] <= lim) ? item['data']['pager']['total'] : lim);
                    console.log(sum.toFixed(2));
                    outArray.push(
                        {
                            'startCity': carCitys[i],
                            'endCity': carCitys[i + 1],
                            'avgPrice': sum.toFixed(2),
                            'lowPrice': item['data']['lowest_price'],
                            'total': item['data']['pager']['total'],
                            'data': item['data']
                        });
                }
                else {
                    outArray.push(
                        {
                            'startCity': carCitys[i],
                            'endCity': carCitys[i + 1],
                            'avgPrice': 0,
                            'lowPrice': 0,
                            'total': 0,
                            'data': item['data']
                        });
                }

            }
        }
        return outArray;
    }
    catch (e) {
        return [{
            'startCity': -1,
            'endCity': -1,
            'avgPrice': -1,
            'lowPrice': -1,
            'data': e.message
        }];
    }
}

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use((request, response, next) => { next(); });
app.post('/count', async (req, res, next) => {
    next();

}, async (req, res) => {
    let arCitys = req['body']['citys'];
    res.send(await Count(arCitys));
});


app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});
