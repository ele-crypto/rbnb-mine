const { ethers } = require('ethers');
const csv = require('fast-csv');
const fs = require('fs');

const { difficulty, walletTablePath, tick } = require('./config');
const { postResultData } = require('./lib');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const currentChallenge = ethers.utils.formatBytes32String(tick);

// Find possible solutions
function findSolution(difficulty, walletInfo) {
  const { address } = walletInfo;
  while (1) {
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

  console.log(body);

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

async function handleWallet(walletInfo) {
  while (true) { // Ciclo infinito para cada wallet
    try {
      console.log(`Buscando solución para wallet: ${walletInfo.address}`);

      const solution = findSolution(difficulty, walletInfo);
      console.log(`Solución encontrada para wallet: ${walletInfo.address}, solución: ${solution}`);

      await sendTransaction(solution, walletInfo);
      console.log(`Solución enviada con éxito para wallet: ${walletInfo.address}`);
    } catch (error) {
      console.error(`Error con wallet ${walletInfo.address}:`, error);
      // Aquí puedes decidir si deseas reiniciar el bucle para esta wallet o no
    }
  }
}

async function main() {
  const wallets = await initWallet();
  wallets.forEach(walletInfo => {
    handleWallet(walletInfo); // Iniciar cada wallet en su propio bucle
  });
}

main();
