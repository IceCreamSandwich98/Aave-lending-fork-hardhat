//imports
const { ethers, getNamedAccounts } = require("hardhat")
const { getWeth, AMOUNT } = require("../scripts/getWeth")
require("dotenv").config()

async function main() {
    //AAVE protocol treats everything as a erc-20 token
    //need to convert eth (non ERC-20) to weth (ERC-20)
    await getWeth()
    const { deployer } = await getNamedAccounts()
    //abi and contract address
    //Lending Pool Address Provider : 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5
    //Lending Pool : ^

    const lendingPool = await getLendingPool(deployer)
    console.log(`lending pool address ${lendingPool.address}`)

    //deposit!! @ILendingPool deposite func. takes 4 params. asset, amount, address on behave of, and referal code

    const wethTokenAddress = process.env.WETH_TOKEN_ADDRESS
    // const wethTokenAmount =
    // const borrowedAsset =
    await approvErc20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)
    console.log("depositing...")
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("deposited!!")
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(
        lendingPool,
        deployer
    )

    const daiPrice = await getDaiPrice()

    const amountDaiToBorrow =
        availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber())

    const amountDaiToBorrowInWei = ethers.utils.parseEther(
        amountDaiToBorrow.toString()
    )

    console.log(`you can borrow ${amountDaiToBorrow} DAI`)
    //in order to borrow, we need to figure out the conversion rate from eth -> DAI.... or eth -> USDC is

    //Borrow
    //how much we have borrow, how much we have in collateral, how much we CAN borrow
    //aavs docs has a function called "getUserAccountData()", which gives total colateral, total debt, avaliable borrow, current liq,

    const daiTokenAddress = process.env.DAI_TOKEN_ADDRESS
    await borrowDai(
        daiTokenAddress,
        lendingPool,
        amountDaiToBorrowInWei,
        deployer
    )
    await getBorrowUserData(lendingPool, deployer)
    await repay(amountDaiToBorrowInWei, daiTokenAddress, lendingPool, deployer)
    await getBorrowUserData(lendingPool, deployer)

    //we have sucessfully deposited collateral in aave, and have borrowed dai
    //now we need a repay function to pay back the borrowed dai (see aave docs for function / s)
}

async function repay(amount, daiAddress, lendingPool, account) {
    //we need to approve sending out DAI back to aave, call approve func
    await approvErc20(daiAddress, lendingPool.address, amount, account)
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account)
    await repayTx.wait(1)
    console.log("Repayed")
}

async function borrowDai(
    daiAddress,
    lendingPool,
    amountDaiToBorrowInWei,
    deployer
) {
    const borrowTx = await lendingPool.borrow(
        daiAddress,
        amountDaiToBorrowInWei,
        1,
        0,
        deployer
    )

    await borrowTx.wait(1)
    console.log(`you've borrowed!!`)
}

async function getDaiPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        process.env.DAI_ETH_PRICEFEED
        //if we are reading form a contract, we dont need a signer
        //everything else, we need a signer
    )

    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`the dai-eth price is ${price.toString()}`)
    return price
}

async function getBorrowUserData(lendingPool, account) {
    const { totalCollateralETH, totalDebtETH, availableBorrowsETH } =
        await lendingPool.getUserAccountData(account)
    console.log(
        `you have ${ethers.utils.formatEther(
            totalCollateralETH
        )} worth of ETH deposited.`
    )
    console.log(
        `you have ${ethers.utils.formatEther(totalDebtETH)} ETH in debt`
    )
    console.log(
        `you can take out ${ethers.utils.formatEther(
            availableBorrowsETH
        )} ETH to borrow`
    )
    return { availableBorrowsETH, totalDebtETH }
}

async function getLendingPool(account) {
    //1. get access to lending pool provider contract.
    //2. when inside the contract, run a function to get the ledning pool address
    //3.once address is gotten, run ethers.getContract at(abi, data from step 2, parameter to function)

    const lendingPoolAddressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider", //abi from @aave/protocols-v2 add via yarn
        process.env.LENDING_POOL_ADDRESS_PROVIDER, //contract from docs.avve.com addressprovider
        account //parameter
    )
    //get addy
    const getLendingPoolAddress =
        await lendingPoolAddressProvider.getLendingPool()

    //get contract from addy  + abi + account
    const lendingPool = await ethers.getContractAt(
        "ILendingPool",
        getLendingPoolAddress,
        account
    )
    return lendingPool
}

async function approvErc20(
    erc20Addreess,
    spenderAddress,
    amountToSpend,
    account
) {
    const erc20Token = await ethers.getContractAt(
        "IERC20",
        erc20Addreess,
        account
    )

    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)

    console.log("approved")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
