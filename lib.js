const fetch = require('node-fetch');
const { responsePath } = require('./config');

const commonHeaders = {
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
};

const postResultData = async body => {
  const url = `${responsePath}/validate`;
  try {
    const res = await fetch(url, {
      headers: commonHeaders,
      body,
      method: 'POST',
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Error in postResultData:', error);
    throw error;
  }
};

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

module.exports = {
  postResultData,
  getRandomInt,
};
