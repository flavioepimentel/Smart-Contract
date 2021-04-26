const { assert } = require('chai');

var Token = artifacts.require("Token");
var JewSwap = artifacts.require("JewSwap");

//Configuration of Chai Assertion Library
require('chai')
.use(require('chai-as-promised'))
.should()

function tokens(number){
    return web3.utils.toWei(number, 'ether');
}


contract('JewSwap', ([deployer, investor]) => {
    let jewswap, token

    before(async() =>{
        token = await Token.new()
        jewswap = await JewSwap.new(token.address)
        //Tranfer 1 Milion for Token contract to JewSwap contract
        await token.transfer(jewswap.address, tokens('1000000'))
    })

    //Testing swap contract
    describe('JewSwap deployment', async() => {
        //Testintg name of swap
        it('Contract has name', async() => {
        const name = await jewswap.name()
        assert.equal(name, 'JewSwap Instant Exchange')
        })
        //Testing balance
        it('Contract has tokens', async() =>{
        let balance = await token.balanceOf(jewswap.address)
        assert.equal(balance.toString(), tokens('1000000'))
        })
    })

    //Testing token contract
    describe('Token deployment', async() => {
        //Testing name
        it('Contract has name', async() => {
        const name = await token.name()
        assert.equal(name, 'Jew Token')
        })
    })

    describe('buyTokens()', async()=>{
        let results
        before(async()=>{
            results = await jewswap.buyTokens({from: investor, value: web3.utils.toWei('1', 'ether')})
        })
        it('Allows the investor purchase tokens', async()=>{
            //Check the costumer accont
            let balanceInvestor = await token.balanceOf(investor);
            assert.equal(balanceInvestor.toString(), tokens('100'));
            //Check the swap account
            let swapBalance = await token.balanceOf(jewswap.address)
            assert.equal(swapBalance.toString(), tokens('999900'))
            let swapEthBalance = await web3.eth.getBalance(jewswap.address)
            assert.equal(swapEthBalance.toString(), web3.utils.toWei('1', 'ether'))

            //Check the logs to see if the event send the correct data
            const event = results.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')
        })
    })

    describe('sellTokens()', async()=>{
        let results
        before(async()=>{
            
            await token.approve(jewswap.address, tokens('100'), {from: investor})
            results = await jewswap.sellTokens(tokens('100'), {from: investor})
        })
        it('Allows the investor sell tokens', async()=>{
            let balanceInvestor = await token.balanceOf(investor);
            assert.equal(balanceInvestor.toString(), tokens('0'));
            let swapBalance = await token.balanceOf(jewswap.address)
            assert.equal(swapBalance.toString(), tokens('1000000'))
            let swapEthBalance = await web3.eth.getBalance(jewswap.address)
            assert.equal(swapEthBalance.toString(), web3.utils.toWei('0', 'ether'))

            //Check the logs to see if the event send the correct data
            const event = results.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100') 
            
            //Teste for Failure
            await jewswap.sellTokens(tokens('700'), {from: investor, }).should.be.rejected;
        })
    })
})
