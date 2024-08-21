const assert = require('assert');
const ganache = require('ganache');
const  { Web3 }  = require('web3');
const { describe, it } = require('mocha');
const web3 = new Web3(ganache.provider());  // to connect any given network , generate 10 accounts we can use of

// load the build files
const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

// declare variables
let accounts;
let factory;
let campaign;
let campaignAddress;

// will run this function before each describe
beforeEach(async () => {
    // Get a list of all accounts
    accounts = await web3.eth.getAccounts();

    // use one of those accounts to deploy the campaign contract
    factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
        .deploy({ data: compiledFactory.bytecode })
        .send({ 
            from: accounts[0], 
            gas: '1000000' 
        })
    // attempt to create a campaign with minimum amount
    await factory.methods.createCampaign('100').send({ 
        from: accounts[0],
        gas : '1000000'
    });

    [campaignAddress] = await factory.methods.getDeployedCampaigns().call(); // get the first element of deployed contracts

    //get the already deployed contract (2 params)
    campaign = await new web3.eth.Contract(
        JSON.parse(compiledCampaign.interface),
        campaignAddress
    );
});


describe('Campaigns', () => {
    it('deploys a factory and a campaign', () => {
        assert.ok(factory.options.address);
        assert.ok(campaign.options.address);
    });

    it('marks caller as the campaign manager', async () => {
        // marking variable as public will automatically have get method >>> address public manager;
        const manager = await campaign.methods.manager().call();
        assert.equal(accounts[0], manager);
    });

    it('allows people to contribute money and marks them as approver', async () => {
        await campaign.methods.contribute().send({
            value : '200',
            from : accounts[1]
        });
        const isContributor = campaign.methods.approvers(accounts[1]).call();
        assert(isContributor);
    });

    it('minimum contribution', async () => {
        try {
            await campaign.methods.contribute().send({
                from: accounts[1],
                value: '5'
            });

            assert(false);
        } catch (error) {
            assert(error)
        }
    });

    it('allows managet to create a payment request', async () => {
        await campaign.methods
            .createRequest('Buy car','100', accounts[1])
            .send({
                from: accounts[0],
                gas: '1000000'
            });
        const request = await campaign.methods.requests(0).call();
        assert.equal('Buy car', request.description);
    });

    it('process the whole request', async () => {

        // initialize campaign and set 10 ether as minnimum contribution
        await campaign.methods.contribute().send({
            from: accounts[0],
            value: web3.utils.toWei('10', 'ether')
        });

        // attempt to send ether to other accounts from manager
        await campaign.methods
            .createRequest('Buy car', web3.utils.toWei('5', 'ether'), accounts[1])
            .send({
                from: accounts[0],
                gas: '1000000'
            });
        
        // attempt to approve the request
        await campaign.methods.approveRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });

        // attempt to finalize the request
        await campaign.methods.finalizeRequest(0).send({
            from: accounts[0],
            gas: '1000000'
        });

        // get the balance of an account then transform into float since getBalance returns a string
        let balance = await web3.eth.getBalance(accounts[1]);
        balance = web3.utils.fromWei(balance, 'ether');
        balance = parseFloat(balance);
        console.log(balance);
        
        assert(balance > 104);
    });
});