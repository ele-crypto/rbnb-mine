const fetch = require('node-fetch')
const { responsePath } = require('./config')

const postResultData = async body => {
  const url = `${responsePath}/validate`
  const res = await fetch(url, {
    headers: {
      accept: 'application/json, text/plain, */*',
      'accept-language': 'zh-CN,zh;q=0.9',
      'content-type': 'application/json',
      'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      Referer: 'https://bnb.reth.cc/',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
    body,
    method: 'POST',
  })
  const r = await res.json()
  return r
}

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function sleepMS(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = {
  postResultData,
  getRandomInt,
  sleepMS,
}
