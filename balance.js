const fetch = require('node-fetch');
const csv = require('fast-csv');
const fs = require('fs');
const { walletTablePath, responsePath } = require('./config');

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const commonHeaders = {
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'es-419,es;q=0.9,en;q=0.8,ru;q=0.7',
  'Origin': 'https://bnb.reth.cc',
  'Referer': 'https://bnb.reth.cc/',
  'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
  'Sec-Ch-Ua-Mobile': '?0',
  'Sec-Ch-Ua-Platform': '"macOS"',
  'Sec-Fetch-Dest': 'empty',
  'Sec-Fetch-Mode': 'cors',
  'Sec-Fetch-Site': 'cross-site',
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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
      mode: 'cors',
      credentials: 'omit',
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
  const balancePromises = wallets.map(w => getBalance(w.address).catch(error => {
    console.error(`Error processing wallet ${w.address}:`, error);
    return null; // or some error indication
  }));
  const balances = await Promise.all(balancePromises);
  balances.forEach((balance, index) => {
    if (balance) {
      console.log(`Wallet ${wallets[index].address}:`, balance);
    }
  });
};


main();
