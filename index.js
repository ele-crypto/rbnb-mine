const { ethers } = require('ethers');
const csv = require('fast-csv');
const fs = require('fs');

const { difficulty, walletTablePath, tick } = require('./config');
const { postResultData, sleepMS } = require('./lib');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const currentChallenge = ethers.utils.formatBytes32String(tick);
let walletStates = {}; // Object to track the state of the wallets

async function findSolution(difficulty, walletInfo) {
  const { address } = walletInfo;
  while (true) {
    const random_value = ethers.utils.randomBytes(32);
    const potential_solution = ethers.utils.hexlify(random_value);
    const hashed_solution = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(
        ['bytes32', 'bytes32', 'address'],
        [potential_solution, currentChallenge, address],
      ),
    );
    if (hashed_solution.startsWith(difficulty)) {
      return potential_solution;
    }
    await sleepMS(1); // A small delay to avoid blocking the event loop
  }
}

async function sendTransaction(solution, walletInfo) {
  const body = {
    solution,
    challenge: currentChallenge,
    address: walletInfo.address,
    difficulty,
    tick,
  };

  await postResultData(JSON.stringify(body));
}

const initWallet = async () => {
  const wallets = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(walletTablePath)
      .pipe(csv.parse({ headers: true }))
      .on('error', error => reject(error))
      .on('data', row => {
        wallets.push({
          address: row['address'],
          privateKey: row['key'],
        });
      })
      .on('end', () => resolve(wallets));
  });
};

async function processWallet(walletInfo) {
  try {
    while (true) {
      const solution = await findSolution(difficulty, walletInfo);
      walletStates[walletInfo.address] = 'success';
      printSingleWalletState(walletInfo.address, 'success');
      await sendTransaction(solution, walletInfo);
      walletStates[walletInfo.address] = 'processing';
    }
  } catch (err) {
    console.error(`Error in processWallet for wallet ${walletInfo.address}:`, err);
    walletStates[walletInfo.address] = `Error: ${err.message}`;
  }
}

function printSingleWalletState(address, state) {
  console.log("Se encontró solución:");
  console.table({ [address]: state });
}

async function main() {
  try {
    console.log("Starting the wallet initialization process...");
    const wallets = await initWallet();
    walletStates = wallets.reduce((acc, wallet) => {
      acc[wallet.address] = 'processing';
      return acc;
    }, {});
    console.log("Found", wallets.length, "wallets. Starting processing...");
    wallets.forEach(walletInfo => processWallet(walletInfo));
  } catch (err) {
    console.error('Error in main function:', err);
  }
}

console.log("Starting the script...");
main();
