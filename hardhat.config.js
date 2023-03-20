/** @type import('hardhat/config').HardhatUserConfig */

require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("hardhat-deploy")
require("solidity-coverage")
require("hardhat-gas-reporter")
require("hardhat-contract-sizer")
require("dotenv").config()

GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
GOERLI_PRIVATE_KEY = process.env.GOERLI_PRIVATE_KEY
COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
MAINNET_RPC_URL = process.env.MAINNET_RPC_URL

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
            blockConfirmations: 1,
            forking: {
                url: MAINNET_RPC_URL,
            },
        },
        goerli: {
            chainId: 5,
            blockConfirmations: 6,
            url: GOERLI_RPC_URL,
            accounts: [GOERLI_PRIVATE_KEY],
        },
    },
    etherscan: {
        // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
        apiKey: {
            goerli: ETHERSCAN_API_KEY,
        },
    },
    gasReporter: {
        enabled: false, // turn off and on
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
    },
    solidity: {
        compilers: [
            { version: "0.8.17" },
            { version: "0.4.19" },
            { version: "0.6.12" },
            { version: "0.6.6" },
            { version: "0.6.0" },
        ],
    },
    namedAccounts: {
        deployer: {
            default: 0,
            1: 0,
        },
    },
    mocha: {
        timeout: 20000,
    },
}
