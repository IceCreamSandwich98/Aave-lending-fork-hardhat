

# Aave Borrow forking
I wanted to be confident enough to be able to use a forked on-chain protocol and access its functions.This projects requires three steps, depositing collateral, borrowing funds, then repaying those borrow funds. FIrst i used Aave's deposit funciton to deposit Eth in the form of WEth(ERC-20). After that, i got the lendingPoolAddressProvider, in order to access a function which gives me the lending pool access provider, to borrow collateral in the form of DAI. After this, i use the repay function to repay the borrowed funds. I still need to add
1.) function that takes borrowed funds + intrest in order to fully pay back debt.


## Installation

I use yarn rather than npm, but both get the job done.

```bash
yarn
```

```bash
yarn hardhat
```

```bash
yarn add --dev @aave/protocol-v2
```
after importing @aave, use ```bash yarn hardhat compile ```

```bash
yarn add --dev @nomiclabs/hardhat-ethers@npm:hardhat-deploy-ethers ethers @nomiclabs/hardhat-etherscan @nomiclabs/hardhat-waffle chai ethereum-waffle hardhat hardhat-contract-sizer hardhat-deploy hardhat-gas-reporter prettier prettier-plugin-solidity solhint solidity-coverage dotenv
```

## Usage

```javascript
yarn hardhat run scripts/aaveBorrow.js
```


## License

[MIT](https://choosealicense.com/licenses/mit/)
