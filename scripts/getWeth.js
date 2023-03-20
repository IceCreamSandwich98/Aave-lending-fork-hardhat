//import into aave borrow
//weth contract on chain has deposite and withdraw functions. use deposite function to turn eth into weth (erc-20 eth)
//when time to withdraw, use withdraw function to deposite weth to get eth

const { ethers, getNamedAccounts } = require("hardhat")

const AMOUNT = ethers.utils.parseEther("0.02")

async function getWeth() {
    const { deployer } = await getNamedAccounts()
    //call 'deposit' function on weth contract
    //abi(compile) and contract address to interact (etherscan)
    //0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2
    const iWeth = await ethers.getContractAt(
        "IWeth", //abi
        "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", //address
        deployer //user wallet
    )

    const tx = await iWeth.deposit({ value: AMOUNT })
    await tx.wait(1)

    const wethBalance = await iWeth.balanceOf(deployer)
    console.log(`Got ${wethBalance.toString()} WETH`)
}

module.exports = { getWeth, AMOUNT }
