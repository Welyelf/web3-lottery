const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3  = require('web3');
const { abi, evm } = require('./compile');

const provider = new HDWalletProvider(
  'addict taxi pair until mouse evil erosion royal remove like bronze various',
  'https://sepolia.infura.io/v3/d8d87f0b141a483d85561998bc7edcea'
);

const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();

  console.log('Attempting to deploy from account', accounts[0]);

  const result = await new web3.eth.Contract(abi)
    .deploy({ data: evm.bytecode.object })
    .send({ gas: '1000000', from: accounts[0] });

  console.log(abi);
  console.log("Contract deployed to", result.options.address);
  provider.engine.stop();
};
deploy();
