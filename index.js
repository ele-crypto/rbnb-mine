const { ethers } = require('ethers');
const csv = require('fast-csv');
const fs = require('fs');

const { difficulty, walletTablePath, tick } = require('./config');
const { postResultData } = require('./lib');

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const currentChallenge = ethers.utils.formatBytes32String(tick);

// Encuentra soluciones posibles de manera asincrónica
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

    // Agrega un pequeño retardo para evitar bloquear completamente el bucle de eventos
    await new Promise(resolve => setTimeout(resolve, 10));
  }
}

// El resto del código se mantiene igual...

async function handleWallet(walletInfo) {
  while (true) {
    try {
      console.log(`Buscando solución para wallet: ${walletInfo.address}`);

      const solution = await findSolution(difficulty, walletInfo);
      console.log(`Solución encontrada para wallet: ${walletInfo.address}, solución: ${solution}`);

      await sendTransaction(solution, walletInfo);
      console.log(`Solución enviada con éxito para wallet: ${walletInfo.address}`);
    } catch (error) {
      console.error(`Error con wallet ${walletInfo.address}:`, error);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

const initWallet = async (start, end) => {
  const wallets = [];
  let index = 0;
  return new Promise((resolve, reject) => {
    fs.createReadStream(walletTablePath)
      .pipe(csv.parse({ headers: true }))
      .on('error', error => reject(error))
      .on('data', row => {
        if (index >= start && index < end) {
          wallets.push({
            address: row['address'],
            privateKey: row['key'],
          });
        }
        index++;
      })
      .on('end', () => resolve(wallets));
  });
};


async function main() {
  const start = parseInt(process.argv[2]) || 0;
  const end = parseInt(process.argv[3]) || 10; // Ajusta el valor por defecto si es necesario
  const wallets = await initWallet(start, end);
  wallets.forEach(walletInfo => {
    handleWallet(walletInfo);
  });
}

main();
