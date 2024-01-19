const { ethers } = require('ethers');
const csv = require('fast-csv');
const fs = require('fs');

const { difficulty, walletTablePath, tick } = require('./config');
const { postResultData, sleepMS } = require('./lib');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const currentChallenge = ethers.utils.formatBytes32String(tick);

// Find possible solutions
function findSolution(difficulty, walletInfo) {
  const { address } = walletInfo;
  const randomValue = ethers.utils.randomBytes(32);
  const potentialSolution = ethers.utils.hexlify(randomValue);
  const hashedSolution = ethers.utils.keccak256(
    ethers.utils.defaultAbiCoder.encode(['bytes32', 'bytes32', 'address'], [potentialSolution, currentChallenge, address]),
  );

  if (hashedSolution.startsWith(difficulty)) {
    return potentialSolution;
  } else {
    return null;
  }
}

async function sendTransaction(solution, walletInfo) {
  const body = {
    solution,
    challenge: currentChallenge,
    address: walletInfo.address,
    difficulty,
    tick,
  }

  console.log(body)

  await postResultData(JSON.stringify(body))
}

// Function to send transactions concurrently
async function sendTransactions(solutions, wallets) {
  const transactionPromises = solutions.map(async (solution, index) => {
    try {
      const walletInfo = wallets[index];
      await sendTransaction(solution, walletInfo);
      console.log(`Sent successfully solution: ${solution} for wallet: ${walletInfo.address}`);
    } catch (error) {
      console.error(`Error sending solution for wallet: ${wallets[index].address}`);
      console.error(error);
    }
  });

  await Promise.all(transactionPromises);
}

// Initialize the wallets
async function initWallet() {
  return new Promise((resolve, reject) => {
    const wallets = [];
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
}

// Principal function
async function main() {
  const wallets = await initWallet();

  try {
    // Map para ejecutar findSolution para todas las billeteras simultáneamente
    await Promise.all(wallets.map(async (walletInfo) => {
      while (true) {
        const solution = findSolution(difficulty, walletInfo);
        if (solution !== null) {
          // Si encuentra una solución, la envía y sigue buscando para la misma billetera
          await sendTransaction(solution, walletInfo);
          console.log(`Sent successfully solution: ${solution} for wallet: ${walletInfo.address}`);
        }
        // Introduces un pequeño retraso entre iteraciones para evitar consumir demasiados recursos
        await sleepMS(50);
      }
    }));
  } catch (err) {
    console.log('Error ------------------');
    console.log(err);
    console.log('-----------------------');
    console.log('Restarting the program');
    main();
  }
}


main();
