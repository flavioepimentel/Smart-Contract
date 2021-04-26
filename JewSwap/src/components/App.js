import React, { Component } from 'react';
import Navbar from './Navbar.js'
import Web3 from 'web3'
import Token from '../abis/Token.json'
import JewSwap from '../abis/JewSwap.json'
import './App.css'
import Main from './Main.js'

class App extends Component {

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    
  }
  async loadBlockchainData(){
    const web3 = window.web3
    //Taken the Ether balance
    const accounts = await web3.eth.getAccounts()
    this.setState({account: accounts[0]})
    
    const ethBalance = await web3.eth.getBalance(this.state.account);
    this.setState({ethBalance: ethBalance})
    

    const networkId = await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    if(tokenData){
      //Taken the token balance 
      const token = new web3.eth.Contract(Token.abi, tokenData.address);
      this.setState({token: token})
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      this.setState({tokenBalance: tokenBalance.toString()})
    } else{
      //
      window.alert('Token contract its not detected')
    }
    //Load the Swap, in our case called JewSwap
    const jewSwapdata = JewSwap.networks[networkId]
    if(jewSwapdata){
      //Taken the token balance 
      const jewSwap = new web3.eth.Contract(JewSwap.abi, jewSwapdata.address);
      this.setState({jewSwap: jewSwap})
    } else{
      //
      window.alert('JewSwap contract its not detected')
    }
    console.log(this.state.jewSwap)
    this.setState({loading: false})
  }
  
  async loadWeb3(){
    if (window.ethereum){
      window.web3 = new Web3(window.ethereum)
       await window.ethereum.enable()
       // De acordo com o EIP-1102 eth_requestaccounts
       try {
        // Request account access if needed
        const accounts = await window.ethereum.send('eth_requestAccounts');
        
        } catch (error) {
        // User denied account access
        window.alert('User denied account access')
    }
       
    }
    else if (window.web3){
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Error! Non-Ethereum browser detected.')
    }
  };

  buyTokens = (ethAmount) =>{
    this.setState({loading: true})
    this.state.jewSwap.methods.buyTokens().send({value: ethAmount, from: this.state.account}).on('transactionHash', (hash) =>{
    this.setState({loading: false})
  })

  }

  constructor(props) {
    super(props);
    this.state = { 
      account: '',
      token: {},
      jewSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true
   
    }
  };
  
  render() {
    let content

    if(this.state.loading){
      content = <p id="loader" className="text-center">Loading...</p>
    } else{
      content = <Main
      ethBalance={this.state.ethBalance}
      tokenBalance={this.state.tokenBalance}
      buyTokens={this.buyTokens}  />
    }
    return (
      <div>
        <Navbar account={this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role='main' className='col-lg-12 d-flex text-center'>
              <div className="content mr-auto ml-auto">
                <a href=""
                  target="_blank"
                  rel="noopener noreferrer">
                </a>
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
