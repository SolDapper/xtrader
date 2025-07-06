// imports
import {Connection,PublicKey,Keypair} from "@solana/web3.js"
import 'dotenv/config';
import { createQR } from '@solana/pay';
import bs58 from 'bs58';
import $, { css } from "jquery";
import "jquery.nicescroll";
import 'animate.css';
import Toastify from 'toastify-js';
import "toastify-js/src/toastify.css";
import "@fontsource/ubuntu";
import {transact} from "@solana-mobile/mobile-wallet-adapter-protocol-web3js";
import EventEmitter from 'events';
import mcswapConnector from "mcswap-connector";
import "mcswap-connector/src/colors/solana-connector.css";
import "./css/style.css";
const rpc = process.env.RPC;


// asset list
const token_list = [
    {
        name: "Solana",
        symbol: "SOL",
        mint: "So11111111111111111111111111111111111111111",
        icon: "https://image-cdn.solana.fm/images/?imageUrl=https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
        pdf: "",
        decimals: 9,
        gecko: "solana"
    },
    {
        name: "USD Coin",
        symbol: "USDC",
        mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        icon: "https://image-cdn.solana.fm/images/?imageUrl=https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
        pdf: "",
        decimals: 6,
        gecko: "usdc"
    },
    {
        name: "TETHER",
        symbol: "USDT",
        mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        icon: "https://image-cdn.solana.fm/images/?imageUrl=https://raw.githubusercontent.com/Smaler1/coin/main/logo.png",
        pdf: "",
        decimals: 6,
        gecko: "tether"
    }
];
const asset_list = [
    {
        name: "Abbott xStock",
        symbol: "ABTx",
        mint: "XsHtf5RpxsQ7jeJ9ivNewouZKJHbPxhPoEy6yYvULr7",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf6359f8fa1d916afe97b_Ticker%3DABT%2C%20Company%20Name%3DAbbot%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-ABTx.pdf",
        decimals: 8,
        gecko: "abbott-xstock"
    },
    {
        name: "AbbVie xStock",
        symbol: "ABBVx",
        mint: "XswbinNKyPmzTa5CskMbCPvMW6G5CMnZXZEeQSSQoie",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684be7c58986cdaeeee5bbba_Ticker%3DABBV%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-ABBVx.pdf",
        decimals: 8
    },
    {
        name: "Accenture xStock",
        symbol: "ACNx",
        mint: "Xs5UJzmCRQ8DWZjskExdSQDnbE6iLkRu2jjrRAB1JSU",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c0b0e15af8be8257db52f_Ticker%3DACN%2C%20Company%20Name%3Daccenture%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-ACNx.pdf",
        decimals: 8
    },
    {
        name: "Alphabet xStock",
        symbol: "GOOGLx",
        mint: "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684aae04a3d8452e0ae4bad8_Ticker%3DGOOG%2C%20Company%20Name%3DAlphabet%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-GOOGLx.pdf",
        decimals: 8
    },
    {
        name: "Amazon xStock",
        symbol: "AMZNx",
        mint: "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/68497d354d7140b01657a793_Ticker%3DAMZN%2C%20Company%20Name%3DAmazon.com%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-AMZNx.pdf",
        decimals: 8
    },
    {
        name: "Amber xStock",
        symbol: "AMBRx",
        mint: "XsaQTCgebC2KPbf27KUhdv5JFvHhQ4GDAPURwrEhAzb",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/68652e463fd5d0c86d866c65_AMBRx.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-AMBRx.pdf",
        decimals: 8
    },
    {
        name: "Apple xStock",
        symbol: "AAPLx",
        mint: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/6849799260ee65bf38841f90_Ticker%3DAAPL%2C%20Company%20Name%3DApple%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-AAPLx.pdf",
        decimals: 8
    },
    {
        name: "AppLovin xStock",
        symbol: "APPx",
        mint: "XsPdAVBi8Zc1xvv53k4JcMrQaEDTgkGqKYeh7AYgPHV",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c0deccaecf631c0c174ea_Ticker%3DAPP%2C%20Company%20Name%3Dapp%20lovin%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-APPx.pdf",
        decimals: 8
    },
    {
        name: "AstraZeneca xStock",
        symbol: "AZNx",
        mint: "Xs3ZFkPYT2BN7qBMqf1j1bfTeTm1rFzEFSsQ1z3wAKU",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf47b066fa1085ae953e9_Ticker%3DAZN%2C%20Company%20Name%3Dastrazeneca%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-AZNx.pdf",
        decimals: 8
    },
    {
        name: "Bank of America xStock",
        symbol: "BACx",
        mint: "XswsQk4duEQmCbGzfqUUWYmi7pV7xpJ9eEmLHXCaEQP",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf5a74604b4f162fd0efd_Ticker%3DBAC%2C%20Company%20Name%3DBank%20of%20America%20Corporation%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-BACx.pdf",
        decimals: 8
    },
    {
        name: "Berkshire Hathaway xStock",
        symbol: "BRK.Bx",
        mint: "Xs6B6zawENwAbWVi7w92rjazLuAr5Az59qgWKcNb45x",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684ab977b76d1a151f09c858_Ticker%3DBRK.B%2C%20Company%20Name%3Dberkshire-hathaway%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-BRK.Bx.pdf",
        decimals: 8
    },
    {
        name: "Broadcom xStock",
        symbol: "AVGOx",
        mint: "XsgSaSvNSqLTtFuyWPBhK9196Xb9Bbdyjj4fH3cPJGo",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684aaef288f41927892d12c1_Ticker%3DAVGO%2C%20Company%20Name%3DBroadcom%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-AVGOx.pdf",
        decimals: 8
    },
    {
        name: "Chevron xStock",
        symbol: "CVXx",
        mint: "XsNNMt7WTNA2sV3jrb1NNfNgapxRF5i4i6GcnTRRHts",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684be50accfbb14c64319124_Ticker%3DCVX%2C%20Company%20Name%3Dchevron%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-CVXx.pdf",
        decimals: 8
    },
    {
        name: "Circle xStock",
        symbol: "CRCLx",
        mint: "XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/6861ae6944c62c8dd3a0e165_CRCLx.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-CRCLx.pdf",
        decimals: 8
    },
    {
        name: "Cisco xStock",
        symbol: "CSCOx",
        mint: "Xsr3pdLQyXvDJBFgpR5nexCEZwXvigb8wbPYp4YoNFf",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bec77bfaeef7ac61f7231_Ticker%3DCSCO%2C%20Company%20Name%3DCisco%20Systems%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-CSCOx.pdf",
        decimals: 8
    },
    {
        name: "Coca-Cola xStock",
        symbol: "KOx",
        mint: "XsaBXg8dU5cPM6ehmVctMkVqoiRG2ZjMo1cyBJ3AykQ",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684beb344604b4f162f66f93_Ticker%3DCOKE%2C%20Company%20Name%3DCokeCola%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-KOx.pdf",
        decimals: 8
    }
];


// connection events
const emitter = new EventEmitter();
new mcswapConnector(["phantom","solflare","backpack"],emitter).init();
emitter.on('mcswap_connected',async()=>{
    $("#mcswap_cover, #mcswap_chooser").fadeOut(300);
    toast("Connected!",2000);
    $("#compose").click();
});
emitter.on('mcswap_disconnected',async()=>{
    toast("Disconnected!",2000);
    $("#nav .view").removeClass("active-view");
    $(".views").hide();
    $("#home-view").show();
});




// get balance
async function balance(_rpc_,_wallet_,_mint_,_decimals_){
    try{
        const connection = new Connection(_rpc_,'confirmed');
        const response = await connection.getParsedTokenAccountsByOwner(new PublicKey(_wallet_),{mint:new PublicKey(_mint_)}).catch(function(err){return;});
        let amount = 0;
        if(response != null && response.value.length > 0){amount = response.value[0].account.data.parsed.info.tokenAmount.amount;}
        let multiplier = 1;
        for (let i = 0; i < _decimals_; i++) {multiplier = multiplier * 10;} 
        let amount_ = amount / multiplier;
        amount_ = parseFloat(amount_).toFixed(_decimals_);
        const ui_split = amount_.split(".");
        const formatted_a = commas(ui_split[0]);
        const formatted = formatted_a + "." + ui_split[1];
        return formatted;
    }
    catch(err){
        console.log("err", err);
        return;
    }
}



// amounts and values
$("#payment-pay").on("click", async function(){
    $("label").removeClass("form-error");
    if($("#creator-asset").html()=="Choose"){
        toast("Choose Asset",2000);
        $("#creator-asset").prev().addClass("form-error");
        return;
    }
    if($("#creator-amount").val()<=0){
        toast("Define Amount",2000);
        $("#creator-amount").prev().addClass("form-error");
        return;
    }
    if($("#buyer-asset").html()=="Choose"){
        toast("Choose Asset",2000);
        $("#buyer-asset").prev().addClass("form-error");
        return;
    }
    if($("#buyer-amount").val()<=0){
        toast("Define Amount",2000);
        $("#buyer-amount").prev().addClass("form-error");
        return;
    }
    if($("#buyer-type").val()=="Private Trade" && !isValidSolanaAddress($("#buyer-wallet").val().trim())){
        toast("Recipient Wallet",2000);
        $("#buyer-wallet").prev().addClass("form-error");
        return;
    }
    if(!window.mcswap || !window.mcswap.publicKey){
        toast("Connect Wallet",2000);
        return;
    }
    const amount = await balance(rpc,window.mcswap.publicKey.toString(),$("#creator-mint").val(),$("#creator-amount").attr("data-decimals"));
    console.log("amount", amount);    
    
    // if(balance(rpc,window.mcswap.publicKey.toString()) < $("#creator-amount").val()){
    //     toast("Not enough "+$("#creator-asset").html());
    //     $("#creator-amount").prev().addClass("form-error");
    //     return;
    // }









});
function commas(_amount_){
    return _amount_.toString().replace(/\B(?=(\d{3})+(?!\d))/g,",");
}
function countDecimals(number){
  const numString = String(number);
  const parts = numString.split('.');
  if (parts.length < 2) {
    return 0;
  }
  return parts[1].length;
}
async function getValue(ele,gecko,amount,currency){
    if(gecko=="false"){return;}
    if(ele=="creator-amount" && $("#creator-asset").html()=="Choose"){return;}
    else if(ele=="buyer-amount" && $("#buyer-asset").html()=="Choose"){return;}
    if(gecko=="usdc" || gecko == "tether"){
        amount = parseFloat(amount).toFixed(2);
        if(isNaN(amount)){amount="0.00";}
        if(ele=="creator-amount"){
            $("#creator-value").html("$"+commas(amount));
        }
        else if(ele=="buyer-amount"){
            $("#buyer-value").html("$"+commas(amount));
        }
        return;
    }
    const coinId = gecko;
    const vsCurrency = currency;
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=${vsCurrency}`; // 1.2.2, 1.3.2, 1.4.2
    try {
        const response = await fetch(url);
        const data = await response.json();
        let _amount_ = data[gecko].usd * amount;
        _amount_ = _amount_.toFixed(2);
        if(isNaN(_amount_)){_amount_="0.00";}
        if(ele=="creator-amount"){
            $("#creator-value").html("$"+commas(_amount_));
        }
        else if(ele=="buyer-amount"){
            $("#buyer-value").html("$"+commas(_amount_));
        }
    }
    catch(error){}
}
function debounce(func,delay){
  let timer;
  return function(...args) {
    const context = this;
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}
const debounceValue = debounce(getValue, 1500);
$("#creator-amount, #buyer-amount").on("keyup change input",function(e){
    e.preventDefault();
    if(e.key==='Enter'){
        const id = $(this).attr("id");
        if(id=="creator-amount"){
            $("#buyer-asset").focus();
        }
        else if(id=="buyer-amount"){
            $("#buyer-wallet").focus();
        }
        return;
    }
    else{
        const regex = /[^0-9.]/g;
        const decimals = $(this).attr("data-decimals");
        const gecko = $(this).attr("data-gecko");
        let value = $(this).val();
        value = value.replace(regex,'');
        if(countDecimals(value) > decimals){value=parseFloat(value).toFixed(decimals);}
        $(this).val(value);
        const id = $(this).attr("id");
        if(value<=0){
            if(id=="creator-amount"){
                $("#creator-value").html("$0.00");
            }
            else if(id=="buyer-amount"){
                $("#buyer-value").html("$0.00");
            }
        }
        debounceValue(id,gecko,value,"usd");
        return;
    }
});


// select asset
$(document).delegate("#asset-list ul", "click", function(){
    const id = $(this).parent().parent().attr("data-chooser");
    const mint = $(this).attr("id");
    const decimals = $(this).attr("data-decimals");
    const gecko = $(this).attr("data-gecko");
    const symbol = $(this).find(".list-symbol").html();
    const img = $(this).find(".list-icon img").attr("src");
    $("#asset-list-close").click();
    if(id=="creator-asset"){
        $("#creator-mint").val(mint);
        $("#creator-asset").html(symbol);
        $("#creator-icon").attr("src",img).show();
        $("#creator-value").html("$0.00");
        $("#creator-amount").val("").attr("data-gecko",gecko).attr("data-decimals",decimals).prop("disabled",false).focus();
    }
    else if(id=="buyer-asset"){
        $("#buyer-mint").val(mint);
        $("#buyer-asset").html(symbol);
        $("#buyer-icon").attr("src",img).show();
        $("#buyer-value").html("$0.00");
        $("#buyer-amount").val("").attr("data-gecko",gecko).attr("data-decimals",decimals).prop("disabled",false).focus();
    }
});
// load the asset list
$(window).on("load", async function(){
    let i=0;
    while (i < token_list.length) {
        const asset = token_list[i];
        if(!asset.gecko){asset.gecko="false";}
        let item = '<ul data-gecko="'+asset.gecko+'" data-decimals="'+asset.decimals+'" id="'+asset.mint+'">';
        item += '<li class="list-icon">';
        item += '<img src="'+asset.icon+'" />';
        item += '</li><li class="list-symbol">';
        item += asset.symbol;
        item += '</li>';
        item += '<li class="list-name">';
        item += asset.name;
        item += '</li>';
        item += '<li class="list-clear"></li>';
        item += '<li class="list-pdf">';
        
        item += '</li>';
        item += '</ul>';
        $("#asset-list").append(item);
        i++;
    }
    i=0;
    while (i < asset_list.length) {
        const asset = asset_list[i];
        if(!asset.gecko){asset.gecko="false";}
        let item = '<ul data-gecko="'+asset.gecko+'" data-decimals="'+asset.decimals+'" id="'+asset.mint+'">';
        item += '<li class="list-icon">';
        item += '<img src="'+asset.icon+'" />';
        item += '</li><li class="list-symbol">';
        item += asset.symbol;
        item += '</li>';
        item += '<li class="list-name">';
        item += asset.name;
        item += '</li>';
        item += '<li class="list-clear"></li>';
        item += '<li class="list-pdf">';
        
        item += '</li>';
        item += '</ul>';
        $("#asset-list").append(item);
        i++;
    }
});


// close asset list
$("button#asset-list-close").on("click", function(){
    $("#asset-list-box").attr("data-chooser",null).removeClass("animate__slideInLeft").addClass("animate__slideOutLeft");
});
// choose asset 1
$("button#creator-asset").on("click", function(e){
    e.preventDefault();
    $("#asset-list ul:lt(3)").hide();
    $("#asset-list-box").attr("data-chooser","creator-asset").removeClass("animate__slideOutLeft").addClass("animate__slideInLeft").show();
});
// choose asset 2
$("button#buyer-asset").on("click", function(e){
    e.preventDefault();
    $("#asset-list ul:lt(3)").show();
    $("#asset-list-box").attr("data-chooser","buyer-asset").removeClass("animate__slideOutLeft").addClass("animate__slideInLeft").show();
});
// escrow type
$("#buyer-type").on("change",function(){
    if($(this).val()=="Public Market"){
        $("#buyer-wallet").val("Any").prop("disabled",true);
        $("#payment-priority").focus();
    }
    else{
        $("#buyer-wallet").val("").prop("disabled",false).focus();
    }
});
// priority
$("#payment-priority").on("change",function(){
    $("#payment-pay").focus();
});


// main navigation
$("#nav .view").on("click", async function(){
    $("#nav .view").removeClass("active-view");
    $(this).addClass("active-view");
    const id = $(this).attr("id");
    $(".views").hide();
    $("#"+id+"-view").show();
});
// validate wallet
function isValidSolanaAddress(address){
  try {
    const publicKey = new PublicKey(address);
    return PublicKey.isOnCurve(publicKey.toBytes());
  } catch (error) {
    return false;
  }
}
// toast
async function toast(message,wait,error=false){
    Toastify({
        text: message,
        duration: wait,
        newWindow: false,
        close: false,
        gravity: "bottom", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        onClick: function(){} // Callback after click
    }).showToast();
}
// vanta background
VANTA.CELLS({
  el: "#vanta",
  mouseControls: true,
  touchControls: true,
  gyroControls: false,
  minHeight: 200.00,
  minWidth: 200.00,
  scale: 1.00,
  color1: "#111111",
  color2: "#161616",
  size: 5.00,
  speed: 0.40
});