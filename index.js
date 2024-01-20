const { ethers } = require('ethers');
const csv = require('fast-csv');
const fs = require('fs');

const { difficulty, walletTablePath, tick } = require('./config');
const { postResultData } = require('./lib');

const currentChallenge = ethers.utils.formatBytes32String(tick);

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
        await new Promise(resolve => setTimeout(resolve, 10)); // Evitar bloqueo del bucle de eventos
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

async function main() {
    const wallets = await initWallet();
    wallets.forEach(walletInfo => {
        handleWallet(walletInfo); // Iniciar cada wallet en su propio ciclo
    });
}

main();
