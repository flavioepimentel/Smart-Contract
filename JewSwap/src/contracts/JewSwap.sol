// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;
import "./Token.sol";

contract JewSwap {
    string public name = "JewSwap Instant Exchange";
    Token public token;
    uint public rate = 100;

    event TokensPurchased(
       address account,
       address token,
       uint amount,
       uint rate
    );

    event TokensSold(
       address account,
       address token,
       uint amount,
       uint rate
    );
    

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable{
    //Calculate de the quantity of token
    uint tokenAmount = msg.value * rate;
    //Require the SWAP contract have enought tokens to sell
    require(token.balanceOf(address(this)) >= tokenAmount);
    token.transfer(msg.sender, tokenAmount);

    //Emit on event
    emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }
    function sellTokens(uint _amount) public {
        //Require the user have enought tokens to sell
        require (token.balanceOf(msg.sender) >= _amount);

        //Calculate the amount Ether to redeem 
        uint ethAmount =  _amount / rate;

        require(token.balanceOf(address(this)) >= ethAmount);
        //transferFrom define from, to, amount 
        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(ethAmount);

    //Emit the event TokensSold
    emit TokensSold(msg.sender, address(token), _amount, rate);
    }
}

