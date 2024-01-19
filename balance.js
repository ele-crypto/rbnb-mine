const fetch = require('node-fetch');
const csv = require('fast-csv');
const fs = require('fs');
const { walletTablePath, responsePath } = require('./config');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const commonHeaders = {
  accept: 'application/json, text/plain, */*',
  'accept-language': 'zh-CN,zh;q=0.9',
  'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': '"Windows"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'cross-site',
};

const initWallet = async () => {
  const wallets = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(walletTablePath)
      .pipe(csv.parse({ headers: true }))
      .on('error', error => reject(error))
      .on('data', row => {
        wallets.push({
          address: row['address'],
        });
      })
      .on('end', () => resolve(wallets));
  });
};

const getBalance = async address => {
  const url = `${responsePath}/balance?address=${address}`;
  try {
    const res = await fetch(url, {
      headers: commonHeaders,
      method: 'GET',
    });
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return await res.json();
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
};

const main = async () => {
  const wallets = await initWallet();
  for (const w of wallets) {
    try {
      const balance = await getBalance(w.address);
      console.log(balance);
    } catch (error) {
      console.error(`Error processing wallet ${w.address}:`, error);
    }
  }
};

main();
