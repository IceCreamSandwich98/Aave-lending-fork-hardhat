//imports
const { ethers, getNamedAccounts } = require("hardhat")
const { getWeth, AMOUNT } = require("../scripts/getWeth")

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

    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
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

    const daiTokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    await borrowDai(
        daiTokenAddress,
        lendingPool,
        amountDaiToBorrowInWei,
        deployer
    )
    await getBorrowUserData(lendingPool, deployer)
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
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
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
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5", //contract from docs.avve.com addressprovider
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
