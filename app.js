const puppeteer = require('puppeteer');
const fs = require('fs')
const https = require('https')

let config_raw = fs.readFileSync('config.json');
var id = JSON.parse(config_raw).id

puppeteer.launch({
  headless: true
}).then(async browser => {
  const page = await browser.newPage();
  await page.goto('https://vidlii.com/watch?v=' + id, {
    waitUntil: 'networkidle0'
  });
  await page.waitForSelector('body');
  await page.addScriptTag({
    url: 'https://code.jquery.com/jquery-3.2.1.min.js'
  })

  const result = await page.evaluate(() => {
    try {
      var data = [];
      $('div.vlScreen').each(function() {
        const url = $(this).find('video').attr('src');
        data.push({
          "url": url
        });
      });
      return data;
    } catch (err) {
      reject(err.toString());
    }
  });
  var properUrl = result[0].url

  const file = fs.createWriteStream(id + '.mp4');
  const request = https.get(properUrl, function(response) {
    response.pipe(file);
  
  console.log('Video ID ' + id + ' was downloaded successfully.')
  })
})
