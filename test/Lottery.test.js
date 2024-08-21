const assert = require('assert');
const ganache = require('ganache-cli');
const  Web3  = require('web3');
const { describe, it } = require('mocha');
const web3 = new Web3(ganache.provider());  // to connect any given network

const { abi, evm } = require('../compile');// interface = ABI, bytecode = compiled contract

let lottery;
let accounts;

beforeEach(async () => {
    // Get a list of all unlock accounts
    accounts = await web3.eth.getAccounts();

    // use one of those accounts to deploy the contract
    lottery = await new web3.eth.Contract(abi)
        .deploy({ data: evm.bytecode.object })
        .send({ 
            from: accounts[0], 
            gas: '1000000' 
        })
});

describe('Lottery Contract', () => {
    it('deploys a contract', () => {
        assert.ok(lottery.options.address);
        //console.log(inbox);
    });

    it('allows one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it('allows multiple accounts to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('0.02', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[1],
            value: web3.utils.toWei('0.02', 'ether')
        });

        await lottery.methods.enter().send({
            from: accounts[2],
            value: web3.utils.toWei('0.02', 'ether')
        });

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    });

    it('allows a minimum amount of ether to enter', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0],
                value: 0
            });

            assert(false);
        } catch (error) {
            assert(error)
        }
        
    });

    it('only manager can call pickWinner', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[0]
            });
            assert(false);
        } catch (error) {
            assert(error)
        }
    });

    it('sends money to winner and resets players array', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });

        const initialBalance = await web3.eth.getBalance(accounts[0]);
        await lottery.methods.pickWinner().send({from: accounts[0]});
        const finalBalance = await web3.eth.getBalance(accounts[0]);
        const difference = finalBalance - initialBalance;
        //console.log(difference); // money spent on gas
        assert(difference > web3.utils.toWei('1.8', 'ether'));
    });

    it('check if players empty after picking a winner', async () => {
        await lottery.methods.enter().send({
            from: accounts[0],
            value: web3.utils.toWei('2', 'ether')
        });
        await lottery.methods.pickWinner().send({from: accounts[0]});

        const players = await lottery.methods.getPlayers().call({
            from: accounts[0]
        });

        assert(players.length < 1);
    });
});
