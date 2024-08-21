const path = require("path");
const fs = require("fs-extra");
const solc = require("solc");

// delete the build folder
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath); // extra function to remove a folder and inside of it

// read the contracts
const campaignPath = path.resolve(__dirname, "contracts", "Campaign.sol");
const source = fs.readFileSync(campaignPath, "utf8");

// compile everything with solidity compiler
const output = solc.compile(source, 1).contracts;

// create the build folder
fs.ensureDirSync(buildPath); // check if exist, if not it will create the folder

// loop through and write the contract inside build folder
for (let contract in output) {
    fs.outputJsonSync(
        path.resolve(buildPath, contract.replace(':', '') + '.json'),
        output[contract]
    );
}
