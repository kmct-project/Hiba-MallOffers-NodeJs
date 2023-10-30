const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const bcrypt =require('bcrypt');
const { URLS } = require('./URLS');


const stores = [];

 function scrapeData(url) {
    return new Promise((resolve, reject) => {
        request(url,async function (err, res, body) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                let $ = cheerio.load(body);
                console.log(url)

                const logoSec = $('div.str-dt-logo-wrp');
                const logo = logoSec.find('img').attr('src');
                const name = logoSec.find('h3').text();
                const floor = logoSec.find('h4').text();
                const urlParts = url.split('/');
                const categoryWithHyphens = urlParts[urlParts.length - 2];
                const category = categoryWithHyphens.replace(/-/g, ' ');

                const phoneSec = $('div.str-cnt-dtl');
                const phone = phoneSec.find('div.add:has(h4:contains("PHONE")) a').text();
                const emailId = phoneSec.find('div.add:has(h4:contains("EMAIL ID")) a').text();
                const website = phoneSec.find('div.add:has(h4:contains("WEBSITE")) a').text();
                const code =name.slice(0, 3);
                const pass = "shop@"+code;
                const password= await bcrypt.hash(pass, 10);
                console.log(password, pass);

                stores.push({ name, logo, floor, category, phone, emailId, website ,password:password,"isOffer":false,offers:[]});

                resolve();
            }
        });
    });
}

async function scrapeAllData() {
    for (const url of URLS) {
        await scrapeData(url);
    }

    const scrapeDataString = JSON.stringify(stores, null, 2);
    fs.writeFile('data.txt', scrapeDataString, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Data saved to data.txt");
        }
    });
}

scrapeAllData();
