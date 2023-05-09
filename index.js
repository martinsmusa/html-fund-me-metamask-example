import { ethers } from './ethers-5.1.esm.min.js';
import { abi, contractAddress } from './constants.js';

const connectButton = document.getElementById('connectButton');
const fundButton = document.getElementById('fundButton');
const fundInput = document.getElementById('ethAmount');
const getBalanceBtn = document.getElementById('getBalance');
const withdrawButton = document.getElementById('withdrawButton');

const listenForTransactionMined = (transactionRes, provider) => {
    console.log(`Mining ${ transactionRes.hash }`);

    return new Promise((resolve, reject) => {
        provider.once(transactionRes.hash, (receipt) => {
            if (receipt.blockNumber) {
                console.log(`Mined! ${ transactionRes.hash }`);
                resolve(receipt);
            } else {
                reject(receipt);
            }
        });
    });
};
const connect = async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const connection = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log(connection);
            document.getElementById('connectButton').innerHTML = 'Connected';
        } catch (err) {
            if (err.code === 4001) {
                // EIP-1193 userRejectedRequest error
                console.log('Please connect to MetaMask.');
            } else {
                console.error(err);
            }
        }
    }
};

const fund = async () => {
    console.log('Funding contract...');
    const ethAmount = fundInput.value;

    if (typeof window.ethereum !== 'undefined') {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);

            try {
                const txRes = await contract.fund({
                    value: ethers.utils.parseEther(ethAmount)
                });
                await listenForTransactionMined(txRes, provider);
            } catch (err) {
                console.error(err);
            }

            console.log('Transaction complete');
        } catch (err) {
            console.error(err);
        }

    }
};

const getBalance = async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const balance = await provider.getBalance(contractAddress);
            console.log(ethers.utils.formatEther(balance));
        } catch (err) {
            console.error(err);
        }
    }
}

const withDraw = async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(contractAddress, abi, signer);
            const txRes = await contract.withdraw();
            await listenForTransactionMined(txRes, provider);
        } catch (err) {
            console.error(err);
        }
    }
}

connectButton.onclick = connect;
fundButton.onclick = fund;
getBalanceBtn.onclick = getBalance;
withdrawButton.onclick = withDraw;
