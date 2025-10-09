// imports
import {Connection,PublicKey,TransactionMessage,AddressLookupTableAccount} from "@solana/web3.js"
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
import xtrader from 'xtrader-sdk';
import { getMultiplePrimaryDomains } from '@bonfida/spl-name-service'; // Or similar
import EventEmitter from 'events';
import mcswapConnector from "mcswap-connector";
import "mcswap-connector/src/colors/xtrader-connector.css";
import "./css/style.css";
import "./css/mobile.css";
import tokens_list from './js/list/tokens.js';
import xstocks_list from './js/list/xstocks.js';
import prestocks_list from './js/list/prestocks.js';
import shiftstocks_list from './js/list/shiftstocks.js';
import genesis_list from './js/list/genesis.js';
const groups = [
    {
        name: "ShiftStocks",
        slug: "shiftstocks"
    },
    {
        name: "xStocks",
        slug: "xstocks"
    },
    {
        name: "PreStocks",
        slug: "prestocks"
    }
    // {
    //     name: "Genesis",
    //     slug: "genesis"
    // }
]


// snsGet
async function snsGet(walletAddressString) {
  let _rpc_ = $("#settings-rpc").val();
  if(_rpc_==""){_rpc_ = rpc;}
  const connection = new Connection(_rpc_,'confirmed');
  const walletPublicKey = new PublicKey(walletAddressString);
  const primaryDomains = await getMultiplePrimaryDomains(connection, [walletPublicKey]);
  if (primaryDomains && primaryDomains.length > 0) {
    const primaryDomain = primaryDomains[0];
    if (primaryDomain) {
      return primaryDomain;
    } else {
      return null;
    }
  } else {
    return null;
  }
}


// constants
const rpc = process.env.RPC;
const APP_IDENTITY = {name:'xTrader',uri:'https://www.xtrader.me/',icon:'wallet_icon.png',};


// service worker
if('serviceWorker' in navigator){
  try {
    navigator.serviceWorker.register(
      new URL('../service-worker.js', import.meta.url),
      {type: 'module'}
    );
    // console.log('Service Worker Registered');
  } catch (error) {
    // console.log('Service Worker Register Failed');
  }
}


// asset mapper
const all_mints = [];
async function asset_map(_tokens_,mint=false){
  if(mint!=false){
    for (let i = 0; i < _tokens_.length; i++) {
      if(_tokens_[i].mint==mint){
        return _tokens_[i];
      }
    }
  }
  else{
    return _tokens_;
  }
}


// screensaver
let timeoutId;
function resetTimeout() {
    let timeoutDuration = 1 * 30 * 1000;
    let screensaver = parseInt($("#settings-screensaver").val().trim());
    if(screensaver > 30){
        timeoutDuration = 1 * screensaver * 1000;
    }
    $("#nav, #x-logo").css({"visibility":"visible"});
    clearTimeout(timeoutId);
    timeoutId = setTimeout(resetUI, timeoutDuration);
}
function resetUI() {
    $("#nav .view, #nav #cog").removeClass("active-view").removeClass("active-cog");
    $(".views").hide();
    $("#home-view").show();
    $("#nav, #x-logo").css({"visibility":"hidden"});
}
async function positioner(){
    const window_width = $(window).width();
    const ele_width = $("#views").outerWidth();
    const diff = window_width-ele_width;
    const adj = diff+32;
    if(window_width < 1400){
        $("ul.row").css({"width":(ele_width-104)+"px","left":adj+"px","opacity":"1.0"});
    }
    else{
        $("ul.row").css({"width":(ele_width-64)+"px","left":adj+"px","opacity":"1.0"});
    }
    if($(window).width()<900){
        $('.panel-list .drag-box').css('height','404px');
        $('.panel-list .drag-box:visible:last').css('height','392px');
    }
    else if($(window).width()<1400){
        $('.panel-list .drag-box').css('height','200px');
        $('.panel-list .drag-box:visible:last').css('height','186px');
    }
    else{
        $('.panel-list .drag-box').css('height','auto');
    }
    $("ul.row").each(function(){
        const id = $(this).attr("id");
        const position = $(this).parent().position();
        $(this).css({"top":position.top,"left":position.left}).show();
    });
}
window.addEventListener("resize", function(){
    resetTimeout();
    positioner();
});
window.addEventListener("mousemove", resetTimeout);
window.addEventListener("keypress", resetTimeout);
window.addEventListener("scroll", resetTimeout);
window.addEventListener("click", resetTimeout);
resetTimeout();
$("body").on('scroll', function() {
    positioner();
    resetTimeout();
});


// connection events
async function isConnected(){
    const inWalletApp = await inAppBrowse();
    if(isMobile() && inWalletApp==false){
      $(".mobile_connect_button").hide();
      $('.mobile_disconnect_button').show();
    }
    else if(!isMobile()){noti();}
    $("#introduction").hide();
    $("#nav-contain button.view").prop("disabled",false);
    $("#received-view .panel-list, #sent-view .panel-list, #market-view .panel-list").html("");
    $("#main-cover, #main-chooser").fadeOut(300);
    $("#mcswap_cover, #mcswap_chooser").fadeOut(300);
    let fullWallet = window.mcswap.publicKey.toString();
    $("#settings-user").val(fullWallet);
    const domain = await snsGet(fullWallet);
    if(domain){$("#settings-user").val(domain+".sol");}
    const first_part = fullWallet.slice(0,4);
    const last_part = fullWallet.slice(-4);
    fullWallet = first_part + "..." + last_part;
    toast(fullWallet,4000);
    toast("Connected!",4000);
    if($("#home-view").is(":visible")){$("#received").click();}
    $(".refresher").addClass("spin");
    await load_sent();
    await load_received();
    const _rpc_ = $("#settings-rpc").val().trim();
    if(_rpc_ && _rpc_!=""){
        // await load_public();
    }
    else{
        $("#market-refresh").removeClass("spin");
    }
}
async function isDisconnected(){
    $("#settings-user").val("");
    if($("#agreement").prop("checked")!=true){
        $("#introduction").show();
    }
    const inWalletApp = await inAppBrowse();
    if(isMobile() && inWalletApp==false){
        $('.mobile_disconnect_button').hide();
        $(".mobile_connect_button").show();
    }
    $("#nav-contain button.view").prop("disabled",true);
    $("#received-view .panel-list, #sent-view .panel-list, #market-view .panel-list").html("");
    toast("Disconnected!",2000);
    $("#nav .view, #nav #cog").removeClass("active-view").removeClass("active-cog");
    $(".views").hide();
    $("#home-view").show();
    $(".qty-center").html("0");
    const agreement = localStorage.getItem("agreement");
    if(!agreement){
        $("#connect, #cog").prop("disabled", true);
    }
}


// mcswap wallet adapter
(async function(){
    const inWalletApp = await inAppBrowse();
    if(!isMobile() || inWalletApp===true){
        const emitter = new EventEmitter();
        new mcswapConnector(["phantom"],emitter).init();
        emitter.on('mcswap_connected',async()=>{isConnected();});
        emitter.on('mcswap_disconnected',async()=>{isDisconnected();});
    }
})();
// mobile wallet adapter
async function startMWA(){
    try {
      const publicKey = await transact(async(wallet)=>{
            let authResult;
            try {
                const authToken = localStorage.getItem('authToken');
                if (authToken) {
                  authResult = await wallet.reauthorize({ auth_token: authToken });
                } 
                else {
                  authResult = await wallet.authorize({
                    chain: 'solana:mainnet-beta',
                    identity: APP_IDENTITY,
                  });
                }
            } 
            catch(error){
                return null;
            }
            if(authResult.accounts && authResult.accounts.length > 0 && authResult.accounts[0].address){
              localStorage.setItem('authToken', authResult.auth_token);
              const base64Address = authResult.accounts[0].address;
              const binaryData = Buffer.from(base64Address, 'base64');
              const base58Address = bs58.encode(binaryData);
              return base58Address;
            }
            else{
              toast("No account found",2000);
              return null;
            }
      });
      if(publicKey){
        window.mcswap = {};
        window.mcswap.publicKey = new PublicKey(publicKey);
        return publicKey;
      }
      else{
        toast("Canceled",2000);
        return null;
      }
    } 
    catch(error){
        toast("No compatible wallet found",2000);
        return null;
    }
}
$(document).delegate(".mobile_connect_button", "click", async function(){
    $("#main-cover").fadeIn(400);
    $("#main-message").html("Requesting connection...");
    const result = await startMWA();
    if(result){
        isConnected();
    }
    else{
        $("#main-message").html("");
        $("#main-cover").fadeOut(400);
    }
});
$(document).delegate(".mobile_disconnect_button", "click", async function(){
    // const result = await transact(async(wallet)=>{return await wallet.deauthorize({auth_token: isAuthToken});});
    localStorage.removeItem('authToken');
    window.mcswap = false;
    isDisconnected();
});


// load user selects
async function loadUsers(ele,array){
    array.sort();
    for(let i=0; i<array.length; i++){
        const address = array[i];
        const first_part = address.slice(0,4);
        const last_part = address.slice(-4);
        const option = '<option value="'+address+'">'+first_part+'...'+last_part+'</option>';
        if(ele=="received" && !$("#received-sellers option[value='"+address+"']").length){
            $("#received-sellers").append(option);
        }
        else if(ele=="sent" && !$("#sent-buyers option[value='"+address+"']").length){
            $("#sent-buyers").append(option);
        }
        else if(ele=="market" && !$("#market-sellers option[value='"+address+"']").length){
            $("#market-sellers").append(option);
        }
        if(i==array.length-1){
            const user_filter_sent = localStorage.getItem("user-filter-sent"); 
            const user_filter_received = localStorage.getItem("user-filter-received"); 
            const user_filter_market = localStorage.getItem("user-filter-market");
            if(user_filter_sent){$("#sent-buyers").val(user_filter_sent);}
            if(user_filter_received){$("#received-sellers").val(user_filter_received);}
            if(user_filter_market){$("#market-sellers").val(user_filter_market);}
        }
    }
}
// backchecking displayed offers
async function backcheck(ele,array){
    const list = $("#"+ele+"-view .panel-list").find("ul");
    const count = list.length;
    if(count > 0){
        let i = 0;
        list.each(async function(){
            const item = $(this);
            const id = item.attr("id").replace(ele+"-","");
            if(!array.includes(id)){
                $("#"+ele+"-"+id).remove();
            }
            i++;
            if(i==count){
                positioner();
                return;
            }
        });
    }
    else{
        positioner();
        return;
    }
}
// load sent
const store_sent = [];
let init_sent = false;
async function load_sent(){
    try{
        if(!window.mcswap || !window.mcswap.publicKey){
            toast("Connect wallet",2000);
            return;
        }
        $("#sent-refresh").addClass("spin");
        let _rpc_ = $("#settings-rpc").val().trim();
        if(_rpc_==""){_rpc_=rpc;}
        const splSent = await xtrader.Sent({
            rpc: _rpc_,
            display: true,
            private: true,
            wallet: window.mcswap.publicKey.toString()
        });
        splSent.data.sort((a,b) => (a.utime > b.utime) ? 1 : ((b.utime > a.utime) ? -1 : 0));
        if(!splSent || !splSent.data || splSent.data.length==0){
            $("#sent-refresh").removeClass("spin");
        }
        let i = 0;
        const displayed = [];
        const users = [];
        let hidden=localStorage.getItem("hidden-market");
        if(hidden){hidden=JSON.parse(hidden);}else{hidden=[];}
        while(i < splSent.data.length){
            if(!window.mcswap || !window.mcswap.publicKey){
                $("#received-view .panel-list, #sent-view .panel-list, #market-view .panel-list").html("");
                $(".refresher").removeClass("spin");
                return;
            }
            const asset = splSent.data[i];
            if(!hidden.includes(asset.acct) && all_mints.includes(asset.token_1_mint) && all_mints.includes(asset.token_3_mint)){
                if(!$('#sent-'+asset.acct).length){
                    const merged = [...tokens_list, ...xstocks_list, ...prestocks_list, ...genesis_list];
                    asset.token_1_details = await asset_map(merged,asset.token_1_mint);
                    asset.token_3_details = await asset_map(merged,asset.token_3_mint);
                    let ele = '<div class="drag-box" id="box-sent-'+asset.acct+'"><ul id="sent-'+asset.acct+'" class="row">';
                    let memo = "Offer";
                    const response = await getMemo(asset.acct);
                    if(response){memo=response;}
                    ele += '<li class="item-title">'+memo+'</li>';
                    ele += '<li class="item-id"><span class="item-label">ID: </span><span class="item-acct">'+asset.acct+'</span></li>';
                    ele += '<li class="first-li-img"><img data-pdf="'+asset.token_1_details.pdf+'" class="item-img" src="'+asset.token_1_details.icon+'" /></li>';
                    ele += '<li data-issuer="'+asset.token_1_details.issuer+'" data-mint="'+asset.token_1_mint+'" class="item-details first-detail"><div class="item-symbol">'+asset.token_1_details.symbol+'</div><div class="item-name">'+asset.token_1_details.name+'</div></li>';
                    ele += '<li class="mobile-break"></li>';
                    ele += '<li class="item-amount seller-amount">'+asset.token_1_amount+'</li>';
                    ele += '<li class="arrow arrow_up"><img src="'+arrow_up+'" /></li>';
                    const first_part = asset.buyer.slice(0,4);
                    const last_part = asset.buyer.slice(-4);
                    ele += '<li data-wallet="'+asset.buyer+'" class="item-buyer">'+first_part+'...'+last_part+'</li>';
                    ele += '<li class="break"></li>';
                    let has_pdf = "";
                    if(asset.token_3_details.pdf!=""){has_pdf=' data-pdf="'+asset.token_3_details.pdf+'"'; }
                    ele += '<li class="img-2"><img'+has_pdf+' class="item-img" src="'+asset.token_3_details.icon+'" /></li>';
                    ele += '<li data-issuer="'+asset.token_3_details.issuer+'" data-mint="'+asset.token_3_mint+'" class="item-details last-detail"><div class="item-symbol">'+asset.token_3_details.symbol+'</div><div class="item-name">'+asset.token_3_details.name+'</div></li>';
                    ele += '<li class="mobile-break"></li>';
                    ele += '<li class="item-amount buyer-amount">'+asset.token_3_amount+'</li>';
                    ele += '<li class="arrow arrow_down"><img src="'+arrow_down+'" /></li>';
                    const time = asset.utime*1000;
                    const date = new Date(time);
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const year = date.getFullYear();
                    let hours = date.getHours();
                    const minutes = date.getMinutes();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
                    const display_time = hours + ':' + minutesStr + ' ' + ampm + ' ' + month + '/' + day + '/' + year;
                    ele += '<li class="item-time">'+display_time+'</li>';
                    ele += '<li class="item-action"><button class="item-action item-cancel">Cancel</button></li>';
                    ele += '</ul></div>';
                    $("#sent-view .panel-list").prepend(ele);
                    positioner();
                }
                displayed.push(asset.acct);
                if(!users.includes(asset.buyer)){users.push(asset.buyer);}
            }
            i++;
            if(i==splSent.data.length){
                await loadUsers("sent", users);
                await backcheck("sent", displayed);
                $("#sent-filter").trigger("change");
                $("#sent-refresh").removeClass("spin");
            }
        }
    }
    catch(err){
        $("#sent-refresh").removeClass("spin");
    }
}
// load received
const store_received = [];
let init_received = false;
async function load_received(){
    try{
        if(!window.mcswap || !window.mcswap.publicKey){
            toast("Connect wallet",2000);
            return;
        }
        $("#received-refresh").addClass("spin");
        let _rpc_ = $("#settings-rpc").val().trim();
        if(_rpc_==""){_rpc_=rpc;}
        const splReceived = await xtrader.Received({
            rpc: _rpc_,
            display: true,
            wallet: window.mcswap.publicKey.toString()
        });
        splReceived.data.sort((a,b) => (a.utime > b.utime) ? 1 : ((b.utime > a.utime) ? -1 : 0));
        if(!splReceived || !splReceived.data || splReceived.data.length==0){
            $("#received-refresh").removeClass("spin");
        }
        let i = 0;
        const displayed = [];
        const users = [];
        let hidden=localStorage.getItem("hidden-received");
        if(hidden){hidden=JSON.parse(hidden);}else{hidden=[];}
        while(i < splReceived.data.length){
            if(!window.mcswap || !window.mcswap.publicKey){
                $("#received-view .panel-list, #sent-view .panel-list, #market-view .panel-list").html("");
                $(".refresher").removeClass("spin");
                return;
            }
            const asset = splReceived.data[i];
            if(!hidden.includes(asset.acct) && all_mints.includes(asset.token_1_mint) && all_mints.includes(asset.token_3_mint)){
                if(!$('#received-'+asset.acct).length){
                    const merged = [...tokens_list, ...xstocks_list, ...prestocks_list, ...genesis_list];
                    asset.token_1_details = await asset_map(merged,asset.token_1_mint);
                    asset.token_3_details = await asset_map(merged,asset.token_3_mint);
                    let ele = '<div class="drag-box" id="box-received-'+asset.acct+'"><ul id="received-'+asset.acct+'" class="row">';
                    let memo = "Offer";
                    const response = await getMemo(asset.acct);
                    if(response){memo=response;}
                    ele += '<li class="item-title">'+memo+'</li>';
                    ele += '<li class="item-id"><span class="item-label">ID: </span><span class="item-acct">'+asset.acct+'</span></li>';
                    ele += '<li class="first-li-img"><img data-pdf="'+asset.token_1_details.pdf+'" class="item-img" src="'+asset.token_1_details.icon+'" /></li>';
                    ele += '<li data-issuer="'+asset.token_1_details.issuer+'" data-mint="'+asset.token_1_mint+'" class="item-details first-detail"><div class="item-symbol">'+asset.token_1_details.symbol+'</div><div class="item-name">'+asset.token_1_details.name+'</div></li>';
                    ele += '<li class="mobile-break"></li>';
                    ele += '<li class="item-amount seller-amount">'+asset.token_1_amount+'</li>';
                    ele += '<li class="arrow arrow_down"><img src="'+arrow_down+'" /></li>';
                    const first_part = asset.seller.slice(0,4);
                    const last_part = asset.seller.slice(-4);
                    ele += '<li data-wallet="'+asset.seller+'" class="item-buyer">'+first_part+'...'+last_part+'</li>';
                    ele += '<li class="break"></li>';
                    let has_pdf = "";
                    if(asset.token_3_details.pdf!=""){has_pdf=' data-pdf="'+asset.token_3_details.pdf+'"'; }
                    ele += '<li class="img-2"><img'+has_pdf+' class="item-img" src="'+asset.token_3_details.icon+'" /></li>';
                    ele += '<li data-issuer="'+asset.token_3_details.issuer+'" data-mint="'+asset.token_3_mint+'" class="item-details last-detail"><div class="item-symbol">'+asset.token_3_details.symbol+'</div><div class="item-name">'+asset.token_3_details.name+'</div></li>';
                    ele += '<li class="mobile-break"></li>';
                    ele += '<li class="item-amount buyer-amount">'+asset.token_3_amount+'</li>';
                    ele += '<li class="arrow arrow_up"><img src="'+arrow_up+'" /></li>';
                    const time = asset.utime*1000;
                    const date = new Date(time);
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const year = date.getFullYear();
                    let hours = date.getHours();
                    const minutes = date.getMinutes();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    hours = hours % 12;
                    hours = hours ? hours : 12; // the hour '0' should be '12'
                    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
                    const display_time = hours + ':' + minutesStr + ' ' + ampm + ' ' + month + '/' + day + '/' + year;
                    ele += '<li class="item-time">'+display_time+'</li>';
                    ele += '<li class="item-action"><button class="item-hide">hide</button><button class="item-action item-authorize">Accept</button></li>';
                    ele += '</ul></div>';
                    $("#received-view .panel-list").prepend(ele);
                    positioner();
                }
                displayed.push(asset.acct);
                if(!users.includes(asset.seller)){users.push(asset.seller);}
            }
            i++;
            if(i==splReceived.data.length){
                await loadUsers("received", users);
                await backcheck("received", displayed);
                $("#received-filter").trigger("change");
                $("#received-refresh").removeClass("spin");
                return;
            }
        }
    }
    catch(err){
        $("#received-refresh").removeClass("spin");
    }
}
// load received
const store_public = [];
let init_public = false;
async function load_public(){
    try{
        if(!window.mcswap || !window.mcswap.publicKey){
            toast("Connect wallet",2000);
            return;
        }
        const _rpc_ = $("#settings-rpc").val().trim();
        if(_rpc_==""){
            toast("RPC endpoint required");
        }
        else{
            $("#market-refresh").addClass("spin");
            const user = window.mcswap.publicKey.toString();
            const splSent = await xtrader.Sent({
                rpc: _rpc_,
                display: true,
                private: false,
                wallet: false
            });
            if(!splSent || !splSent.data || splSent.data.length==0){
                $("#market-refresh").removeClass("spin");
            }
            splSent.data.sort((a,b) => (a.utime > b.utime) ? 1 : ((b.utime > a.utime) ? -1 : 0));
            if(splSent.data.length==0){
                await backcheck("market",displayed);
                $("#market-refresh").removeClass("spin");
                return;
            }
            let i = 0;
            const displayed = [];
            const users = [];
            let hidden=localStorage.getItem("hidden-market");
            if(hidden){hidden=JSON.parse(hidden);}else{hidden=[];}
            while(i < splSent.data.length){
                if(!window.mcswap || !window.mcswap.publicKey){
                    $("#received-view .panel-list, #sent-view .panel-list, #market-view .panel-list").html("");
                    $(".refresher").removeClass("spin");
                    return;
                }
                const asset = splSent.data[i];
                if(!hidden.includes(asset.acct) && all_mints.includes(asset.token_1_mint) && all_mints.includes(asset.token_3_mint)){
                    if(!$('#market-'+asset.acct).length){
                        const merged = [...tokens_list, ...xstocks_list, ...prestocks_list, ...genesis_list];
                        asset.token_1_details = await asset_map(merged,asset.token_1_mint);
                        asset.token_3_details = await asset_map(merged,asset.token_3_mint);
                        let ele = '<div class="drag-box" id="box-market-'+asset.acct+'"><ul id="market-'+asset.acct+'" class="row">';
                        let memo = "Offer";
                        const response = await getMemo(asset.acct);
                        if(response){memo=response;}
                        ele += '<li class="item-title">'+memo+'</li>';
                        ele += '<li class="item-id"><span class="item-label">ID: </span><span class="item-acct">'+asset.acct+'</span></li>';
                        ele += '<li class="first-li-img"><img data-pdf="'+asset.token_1_details.pdf+'" class="item-img" src="'+asset.token_1_details.icon+'" /></li>';
                        ele += '<li data-issuer="'+asset.token_1_details.issuer+'" data-mint="'+asset.token_1_mint+'" class="item-details first-detail"><div class="item-symbol">'+asset.token_1_details.symbol+'</div><div class="item-name">'+asset.token_1_details.name+'</div></li>';
                        ele += '<li class="mobile-break"></li>';
                        ele += '<li class="item-amount seller-amount">'+asset.token_1_amount+'</li>';
                        ele += '<li class="arrow arrow_down"><img src="'+arrow_down+'" /></li>';
                        const first_part = asset.seller.slice(0,4);
                        const last_part = asset.seller.slice(-4);
                        ele += '<li data-wallet="'+asset.seller+'" class="item-buyer">'+first_part+'...'+last_part+'</li>';
                        ele += '<li class="break"></li>';
                        let has_pdf = "";
                        if(asset.token_3_details.pdf!=""){has_pdf=' data-pdf="'+asset.token_3_details.pdf+'"'; }
                        ele += '<li class="img-2"><img'+has_pdf+' class="item-img" src="'+asset.token_3_details.icon+'" /></li>';
                        ele += '<li data-issuer="'+asset.token_3_details.issuer+'" data-mint="'+asset.token_3_mint+'" class="item-details last-detail"><div class="item-symbol">'+asset.token_3_details.symbol+'</div><div class="item-name">'+asset.token_3_details.name+'</div></li>';
                        ele += '<li class="mobile-break"></li>';
                        ele += '<li class="item-amount buyer-amount">'+asset.token_3_amount+'</li>';
                        ele += '<li class="arrow arrow_up"><img src="'+arrow_up+'" /></li>';
                        const time = asset.utime*1000;
                        const date = new Date(time);
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const year = date.getFullYear();
                        let hours = date.getHours();
                        const minutes = date.getMinutes();
                        const ampm = hours >= 12 ? 'PM' : 'AM';
                        hours = hours % 12;
                        hours = hours ? hours : 12; // the hour '0' should be '12'
                        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
                        const display_time = hours + ':' + minutesStr + ' ' + ampm + ' ' + month + '/' + day + '/' + year;
                        ele += '<li class="item-time">'+display_time+'</li>';
                        if(user==asset.seller){
                            ele += '<li class="item-action"><button class="item-action item-cancel">Cancel</button></li>';
                        }
                        else{
                            ele += '<li class="item-action"><button class="item-hide">hide</button><button class="item-action item-public-authorize">Accept</button></li>';
                        }
                        ele += '</ul></div>';
                        $("#market-view .panel-list").prepend(ele);
                        positioner();
                    }
                    displayed.push(asset.acct);
                    if(!users.includes(asset.seller)){users.push(asset.seller);}
                }
                i++;
                if(i==splSent.data.length){
                    await loadUsers("market", users);
                    await backcheck("market", displayed);
                    $("#market-filter").trigger("change");
                    $("#market-refresh").removeClass("spin");
                    return;
                }
            }            
        }
    }
    catch(err){
        $("#market-refresh").removeClass("spin");
    }
}
// refresh clicks
$("#market-refresh, #sent-refresh, #received-refresh").on("click", async function(){
    if(!window.mcswap || !window.mcswap.publicKey){
        toast("Connect wallet",2000);
        return;
    }
    try{
        const id = $(this).attr("id");
        if($(this).hasClass("spin")){
            toast("Please wait...", 2000);
            return;
        }
        if(id=="market-refresh"){
            const _rpc_ = $("#settings-rpc").val().trim();
            if(_rpc_==""){
                toast("RPC Endpoint Required");
                return;
            }
            else{
                toast("Refreshing...",2000);
                // await load_public();
            }
        }
        else if(id=="sent-refresh"){
            toast("Refreshing...",2000);
            await load_sent();
        }
        else if(id=="received-refresh"){
            toast("Refreshing...",2000);
            await load_received();
        }
    }
    catch(err){
        toast("Refresh error", 2000);
    }
});


// get ref for a given offer
async function verifyProgram(ixs,signature){
    try{
        let verified = false;
        let i = 0;
        while(i < ixs.length){
            const programId = ixs[i].programId;
            if(programId.toString() == xtrader.PROGRAM){
                let parts = signature.memo.split("] ");
                parts.shift();
                verified = parts.join('] ');
                return verified;
            }
            i++;
        }
        return;
    }
    catch(err){
        return;
    }
}
async function getMemo(offer){
    try{
        const address = new PublicKey(offer);
        let _rpc_ = $("#settings-rpc").val();
        if(_rpc_==""){_rpc_ = rpc;}
        const connection = new Connection(_rpc_,'confirmed');
        const signatures = await connection.getSignaturesForAddress(address);
        let i=0;
        while (i < signatures.length) {
            if(signatures[i].memo !== null){
                const details = await connection.getParsedTransaction(signatures[i].signature,{maxSupportedTransactionVersion:0,});
                const ixs = details.transaction.message.instructions;
                const isVerified = await verifyProgram(ixs, signatures[i]);
                if(isVerified){
                    return isVerified;
                }
            }
            i++;
        }
        return;
    }
    catch(err){
        // console.log("err", err);
        return;
    }
}


// line items clicks
$(document).delegate(".item-acct", "click", async function(){
    const inWalletApp = await inAppBrowse();
    if(!isMobile() || (isMobile() && inWalletApp==false)){
        window.open('https://solana.fm/address/'+$(this).html(), '_blank');
    }
    else{
        copy($(this).html());
        toast("Copied");
    }
});
$(document).delegate("img.item-img", "click", async function(){
    const item = $(this).parent().parent().attr("id");
    const parts = item.split("-");
    const view = parts[0];
    const id = parts[1];
    const pdf = $(this).attr("data-pdf");
    if(!pdf){
        toast("No docs available",3000);
    }
    else{
        toast("Copied docs link",3000);
        copy(pdf);
        const inWalletApp = await inAppBrowse();
        if(!isMobile() || (isMobile() && inWalletApp==false)){
            window.open(pdf,'_blank');
        }
    }
});
$(document).delegate(".item-details", "click", async function(){
    const mint = $(this).attr("data-mint");
    toast("Copied chart link",3000);
    const href = "https://jup.ag/tokens/"+mint;
    copy(href);
    const inWalletApp = await inAppBrowse();
    if(!isMobile() || (isMobile() && inWalletApp==false)){
        window.open(href,'_blank');
    }
});
$(document).delegate(".item-amount", "click", async function(){
    const item = $(this).parent().attr("id");
    const parts = item.split("-");
    const view = parts[0];
    const symbol_a = $(this).parent().find(".first-detail .item-symbol").html();
    const symbol_b = $(this).parent().find(".last-detail .item-symbol").html();
    const mint_a = $(this).parent().find(".first-detail").data("mint");
    const mint_b = $(this).parent().find(".last-detail").data("mint");
    const amount_a = $(this).parent().find(".first-detail").next().next().html();
    const amount_b = $(this).parent().find(".last-detail").next().next().html();
    const issuer_a = $(this).parent().find(".first-detail").attr("data-issuer");
    const issuer_b = $(this).parent().find(".last-detail").attr("data-issuer");
    const amounts = await getValue(false,[issuer_a,issuer_b],[mint_a,mint_b],[amount_a,amount_b]);
    if(view=="market"){
        if($(this).hasClass("seller-amount")){
            toast("The offer "+amount_a+" "+symbol_a, 5000);
            toast("Value $"+amounts[mint_a].usdPrice, 5000);
            toast("PnL "+amounts[mint_a].dif, 5000);
        }
        else if($(this).hasClass("buyer-amount")){
            toast("You send "+amount_b+" "+symbol_b, 5000);
            toast("Value $"+amounts[mint_b].usdPrice, 5000);
            toast("PnL "+amounts[mint_b].dif, 5000);
        }
    }
    else if(view=="sent"){
        if($(this).hasClass("seller-amount")){
            toast("Your offer "+amount_a+" "+symbol_a, 5000);
            toast("Value $"+amounts[mint_a].usdPrice, 5000);
            if(amounts[mint_a].usdPrice < amounts[mint_b].usdPrice){
                toast("Your PnL $"+amounts[mint_a].dif, 5000);
            }
            else{
                toast("Your PnL $-"+amounts[mint_a].dif, 5000);
            }
        }
        else if($(this).hasClass("buyer-amount")){
            toast("They send "+amount_b+" "+symbol_b, 5000);
            toast("Value $"+amounts[mint_b].usdPrice, 5000);
            if(amounts[mint_a].usdPrice < amounts[mint_b].usdPrice){
                toast("Their PnL $-"+amounts[mint_b].dif, 5000);
            }
            else{
                toast("Their PnL $"+amounts[mint_b].dif, 5000);
            }
        }
    }
    else if(view=="received"){
        if($(this).hasClass("seller-amount")){
            toast("You receive "+amount_a+" "+symbol_a, 5000);
            toast("Value $"+amounts[mint_a].usdPrice, 5000);
            if(amounts[mint_a].usdPrice < amounts[mint_b].usdPrice){
                toast("Your PnL $-"+amounts[mint_a].dif, 5000);
            }
            else{
                toast("Your PnL $"+amounts[mint_a].dif, 5000);
            }
        }
        else if($(this).hasClass("buyer-amount")){
            toast("You send "+amount_b+" "+symbol_b, 5000);
            toast("Value $"+amounts[mint_b].usdPrice, 5000);
            if(amounts[mint_a].usdPrice < amounts[mint_b].usdPrice){
                toast("Your PnL $-"+amounts[mint_b].dif, 5000);
            }
            else{
                toast("Your PnL $"+amounts[mint_b].dif, 5000);
            }
        }
    }
});
$(document).delegate(".item-buyer", "click", async function(){
    const item = $(this).parent().attr("id");
    const parts = item.split("-");
    const view = parts[0];
    const id = parts[1];
    const symbol = $(this).prev().prev().find(".item-symbol").html();
    const wallet = $(this).attr("data-wallet");
    const first_part = wallet.slice(0,5);
    const last_part = wallet.slice(-5);
    if(view=="market"){
        toast("Created by "+first_part+"..."+last_part, 3000);
        copy(wallet);
    }
    else if(view=="sent"){
        toast("Offered to "+first_part+"..."+last_part, 3000);
        copy(wallet);
    }
    else if(view=="received"){
        toast("Created by "+first_part+"..."+last_part, 3000);
        copy(wallet);
    }
});
$(document).delegate(".item-time", "click", async function(){
    const time = $(this).html();
    toast("Created "+time, 3000);
    copy(time);
});
$(document).delegate(".item-hide", "click", async function(){
    const parent = $(this).parent().parent().parent();
    parent.addClass("hidden").hide();
    const id = $(this).parent().parent().parent().attr("id");
    const view = id.split("-")[1];
    const offer = id.split("-")[2];
    const hidden = localStorage.getItem("hidden-"+view);
    if(hidden){
        const array = JSON.parse(hidden);
        if(!array.includes(offer)){array.push(offer);}
        localStorage.setItem("hidden-"+view, JSON.stringify(array));
    }
    else{
        localStorage.setItem("hidden-"+view, JSON.stringify([offer]));
    }
    toast("Hidden", 2000);
    positioner();
    const ele = $("#"+view+"-view .qty-center");
    const count = parseInt(ele.html());
    ele.html(count-1);
});
$(document).delegate(".item-cancel", "click", async function(){
    $("#main-cover").fadeIn(300);
    $("#main-message").html("Preparing transaction...");
    const item = $(this).parent().parent().attr("id");
    const parts = item.split("-");
    const view = parts[0];
    const offer = parts[1];
    const seller = window.mcswap.publicKey.toString();
    const priority = $("#settings-priority").val();
    const tx = await xtrader.Cancel({
        "rpc": rpc,
        "blink": false,
        "seller": seller,
        "offer": offer,
        "priority": priority
    });
    if(tx){
        try{
            $("#main-message").html("Requesting approval...");
            let signed=null;
            const inWalletApp = await inAppBrowse();
            if(isMobile() && inWalletApp==false){
                try{
                    signed = await transact(async(wallet)=>{
                        const authToken = localStorage.getItem('authToken');
                        const authorizationResult = await wallet.authorize({chain:"solana:mainnet-beta",identity:APP_IDENTITY,auth_token:authToken});
                        const _signedTxs_ = await wallet.signTransactions({transactions:[tx],auth_token:authorizationResult.auth_token});
                        return _signedTxs_[0];
                    });
                }
                catch(err){
                    if(err=="SolanaMobileWalletAdapterProtocolError: sign request declined"){
                        toast("User Declined", 5000);
                        signed=null;
                    }
                    else if(err=="SolanaMobileWalletAdapterProtocolError: auth_token not valid for signing"){
                        toast("Wrong Wallet", 5000);
                        localStorage.removeItem('authToken');
                        window.mcswap = false;
                        signed=null;
                        isDisconnected();
                        return;
                    }
                    else{
                        signed=null;
                    }
                }
            }
            else{
                signed = await window.mcswap.signTransaction(tx).catch(async function(err){});
            }
            if(!signed){
                $("#main-message").html("");
                $("#main-cover").fadeOut(300);
                toast("Canceled",2000);
                return;
            }
            $("#main-message").html("Canceling offer...");
            const signature = await xtrader.Send(rpc,signed);
            // console.log("signature", signature);
            // console.log("awaiting status...");
            const status = await xtrader.Status(rpc,signature);
            if(status!="finalized"){
                $("#main-message").html("");
                $("#main-cover").fadeOut(300);
                toast("Transaction failed",2000);
            }
            else{
                $("#main-message").html("");
                $("#main-cover").fadeOut(300);
                toast("Offer Canceled",4000);
                $("#"+view+"-"+offer).parent().remove();
                positioner();
                const ele = $("#"+view+"-view .qty-center");
                const count = parseInt(ele.html());
                ele.html(count-1);
            }
        }
        catch(err){
            $("#main-message").html("");
            $("#main-cover").fadeOut(300);
            toast("Transaction error",2000);
        }
    }
    else{
        $("#main-message").html("");
        $("#main-cover").fadeOut(300);
        toast("Transaction canceled",2000);
    }
});
$(document).delegate(".item-public-authorize, .item-authorize", "click", async function(){
    $("#main-cover").fadeIn(300);
    $("#main-message").html("Preparing transaction...");
    const item = $(this).parent().parent().attr("id");
    const ref = $(this).parent().parent().find(".item-title").html();
    const parts = item.split("-");
    const view = parts[0];
    const offer = parts[1];
    const buyer = window.mcswap.publicKey.toString();
    const priority = $("#settings-priority").val();
    const symbol = $(this).parent().prev().prev().prev().prev().prev().find(".item-symbol").html();
    const tx = await xtrader.Execute({
        "rpc": rpc,
        "blink": false,
        "buyer": buyer,
        "offer": offer,
        "priority": priority,
        "memo": ref
    });
    if(tx.tx){
        try{
            $("#main-message").html("Requesting approval...");
            let signed=null;
            const inWalletApp = await inAppBrowse();
            if(isMobile() && inWalletApp==false){
                try{
                    signed = await transact(async(wallet)=>{
                        const authToken = localStorage.getItem('authToken');
                        const authorizationResult = await wallet.authorize({chain:"solana:mainnet-beta",identity:APP_IDENTITY,auth_token:authToken});
                        const _signedTxs_ = await wallet.signTransactions({transactions:[tx.tx],auth_token:authorizationResult.auth_token});
                        return _signedTxs_[0];
                    });
                }
                catch(err){
                    if(err=="SolanaMobileWalletAdapterProtocolError: sign request declined"){
                        toast("User Declined", 5000);
                        signed=null;
                    }
                    else if(err=="SolanaMobileWalletAdapterProtocolError: auth_token not valid for signing"){
                        toast("Wrong Wallet", 5000);
                        localStorage.removeItem('authToken');
                        window.mcswap = false;
                        signed=null;
                        isDisconnected();
                        return;
                    }
                    else{
                        signed=null;
                    }
                }
            }
            else{
                signed = await window.mcswap.signTransaction(tx.tx).catch(async function(err){});
            }
            if(!signed){
                $("#main-message").html("");
                $("#main-cover").fadeOut(300);
                toast("Canceled",2000);
                return;
            }
            $("#main-message").html("Processing...");
            const signature = await xtrader.Send(rpc,signed);
            // console.log("signature", signature);
            // console.log("awaiting status...");
            const status = await xtrader.Status(rpc,signature);
            if(status!="finalized"){
                $("#main-message").html("");
                $("#main-cover").fadeOut(300);
                toast("Transaction failed",2000);
            }
            else{
                $("#main-message").html("");
                $("#main-cover").fadeOut(300);
                toast("Transaction complete",4000);
                $("#"+view+"-"+offer).parent().remove();
                positioner();
                const ele = $("#"+view+"-view .qty-center");
                const count = parseInt(ele.html());
                ele.html(count-1);
            }
        }
        catch(err){
            $("#main-message").html("");
            $("#main-cover").fadeOut(300);
            toast("Transaction error",2000);
        }
    }
    else{
        $("#main-message").html("");
        $("#main-cover").fadeOut(300);
        if(tx.logs && tx.logs.includes("Program log: CERROR: Invalid token 3 ata")){
            toast("Insufficient "+symbol, 2000);
        }
        else{
            toast("Transaction stopped", 2000);
        }
    }
});


// line item filters
async function applyAssetFilter(view,filter,user){
    let qty = 0;
    let i = 0;
    const list = $("#"+view+"-view .panel-list ul li.first-detail");
    $("#"+view+"-view .panel-list ul").parent().hide();
    $("#"+view+"-view .panel-list ul").hide();
    if(filter=="All Assets"){
        list.each(async function(){
            const item = $(this);
            const this_user = item.parent().find(".item-buyer").attr("data-wallet");
            if(!item.parent().parent().hasClass("hidden")){
                if(user=="All Creators" || user=="All Recipients"){
                    item.parent().parent().show();
                    qty++;
                }
                else if(user==this_user){
                    item.parent().parent().show();
                    qty++;
                }
            }
            i++;
            if(i==list.length){
                $("#"+view+"-view .qty-center").html(qty);
                await positioner();
                $("#"+view+"-view .panel-list ul").show();
            }
        });
    }
    else{
        let _filter_ = filter.toLowerCase();
        list.each(async function(){
            const item = $(this);
            const this_user = item.parent().find(".item-buyer").attr("data-wallet");
            const mint = item.attr("data-mint").toLowerCase();
            if(mint.includes(_filter_)){
                if(!item.parent().parent().hasClass("hidden")){
                    if(user=="All Creators" || user=="All Recipients"){
                        item.parent().parent().show();
                        qty++;
                    }
                    else if(user==this_user){
                        item.parent().parent().show();
                        qty++;
                    }
                }
            }
            else{
                item.parent().parent().hide();
            }
            i++;
            if(i==list.length){
                $("#"+view+"-view .qty-center").html(qty);
                await positioner();
                $("#"+view+"-view .panel-list ul").show();
            }
        });
    }
    localStorage.setItem("filter-"+view, filter);
    localStorage.setItem("user-filter-"+view, user);
}
$("#received-filter, #sent-filter, #market-filter").on("change", async function(){
    const view = $(this).attr("id").replace("-filter","");
    const filter = $(this).val().trim();
    let ele;
    if(view=="received"){
        ele = $("#received-sellers");
    }
    else if(view=="sent"){
        ele = $("#sent-buyers");
    }
    else if(view=="market"){
        ele = $("#market-sellers");
    }
    const user = ele.val().trim();
    applyAssetFilter(view,filter,user);
});
$("#received-sellers, #sent-buyers, #market-sellers").on("change", async function(){
    let view = $(this).attr("id").replace("-sellers","");
    view = view.replace("-buyers","");
    const filter = $("#"+view+"-filter").val().trim();
    let ele;
    if(view=="received"){
        ele = $("#received-sellers");
    }
    else if(view=="sent"){
        ele = $("#sent-buyers");
    }
    else if(view=="market"){
        ele = $("#market-sellers");
    }
    const user = ele.val().trim();
    applyAssetFilter(view,filter,user);
});


// settings
async function save_settings(){
    try{
        const settings = {};
        settings.priority = $("#settings-priority").val();
        settings.screensaver = $("#settings-screensaver").val();
        const test_rpc = $("#settings-rpc").val().trim();
        if(settings.screensaver<30){settings.screensaver="120";}
        if(test_rpc!=""){
            if(await pingRPC(test_rpc)){
                settings.rpc = test_rpc;
                $("#settings-rpc").css("color", "#f9df95");
            }
            else{
                settings.rpc = "";
                $("#settings-rpc").css("color", "#b63d3d");
            }
        }
        localStorage.setItem("settings", JSON.stringify(settings));
        return true;
    }
    catch(err){
        return;
    }
}
const debounceScreensaver = debounce(save_settings, 1000);
const debounceRPC = debounce(save_settings, 1000);
$("#settings-priority").on("change", async function(){
    save_settings();
});
$("#settings-screensaver").on("keyup change input",function(e){
    e.preventDefault();
    if(e.key==='Enter'){
        $("#settings-priority").focus();
    }
    else{
        debounceScreensaver();
    }
});
$("#settings-rpc").on("keyup change input",function(e){
    e.preventDefault();
    if(e.key==='Enter'){
        $("#settings-priority").focus();
    }
    else{
        debounceRPC();
    }
});


// create offer
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
async function getValue(ele=false,issuers=false,mints,amounts){
    // if(issuer=="false"){return;}
    if(ele=="creator-amount" && $("#creator-asset").html()=="Choose"){return;}
    else if(ele=="buyer-amount" && $("#buyer-asset").html()=="Choose"){return;}
    if(ele!=false){
        if(issuers=="usdc" || issuers == "tether"){
            amounts = parseFloat(amounts).toFixed(2);
            if(isNaN(amounts)){amounts="0.00";}
            if(ele=="creator-amount"){
                $("#creator-value").html("$"+commas(amounts));
                return;
            }
            else if(ele=="buyer-amount"){
                $("#buyer-value").html("$"+commas(amounts));
                return;
            }
            else{
                return amounts;
            }
        }
    }
    // const url = 'https://api.coingecko.com/api/v3/simple/price?ids='+gecko+'&vs_currencies='+currency;
    const url = 'https://lite-api.jup.ag/price/v3?ids='+mints;
    const options = {
      method: 'GET', // Or 'POST', 'PUT', etc.
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    try {
        const response = await fetch(url, options);
        const data = await response.json();
        if(ele==false){
            if(!data[mints[0]] || !data[mints[0]].usdPrice){
                data[mints[0]] = {};
                if(issuers[0]=="usdc" || issuers[0]=="tether"){
                    data[mints[0]].usdPrice = commas(parseFloat(amounts[0]).toFixed(2));
                }
                else{
                    data[mints[0]].usdPrice = "0.00";
                }
            }
            else{
                 data[mints[0]].usdPrice = commas(parseFloat((data[mints[0]].usdPrice * amounts[0])).toFixed(2));
            }
            if(!data[mints[1]] || !data[mints[1]].usdPrice){
                data[mints[1]] = {};
                if(issuers[1]=="usdc" || issuers[1]=="tether"){
                    data[mints[1]].usdPrice = commas(parseFloat(amounts[1]).toFixed(2));
                }
                else{
                    data[mints[1]].usdPrice = "0.00";
                }
            }
            else{
                 data[mints[1]].usdPrice = commas(parseFloat((data[mints[1]].usdPrice * amounts[1])).toFixed(2));
            }
            if(data[mints[0]].usdPrice < data[mints[1]].usdPrice){
                data[mints[0]].dif = commas((parseFloat(data[mints[1]].usdPrice - data[mints[0]].usdPrice).toFixed(2)));
                data[mints[1]].dif = commas((parseFloat(data[mints[1]].usdPrice - data[mints[0]].usdPrice).toFixed(2)));
            }
            else if(data[mints[0]].usdPrice > data[mints[1]].usdPrice){
                data[mints[0]].dif = commas((parseFloat(data[mints[0]].usdPrice - data[mints[1]].usdPrice).toFixed(2)));
                data[mints[1]].dif = commas((parseFloat(data[mints[0]].usdPrice - data[mints[1]].usdPrice).toFixed(2)));
            }
            else{
                data[mints[0]].dif = "0.00";
                data[mints[1]].dif = "0.00";
            }
            console.log("data", data);
            return data;
        }
        else{
            let _amount_ = "0.00";
            if(data && data[mints] && data[mints].usdPrice){
                _amount_ = data[mints].usdPrice * amounts;
                _amount_ = _amount_.toFixed(2);
            }
            if(ele=="creator-amount"){
                $("#creator-value").html("$"+commas(_amount_));
            }
            else if(ele=="buyer-amount"){
                $("#buyer-value").html("$"+commas(_amount_));
            }
            if(_amount_=="0.00"){
                toast("No value!");
            }
        }
    }
    catch(error){
        console.log("pricing error", error);
    }
}
const debounceValue = debounce(getValue, 1500);
$("#creator-amount, #buyer-amount").on("click keyup change input",function(e){
    e.preventDefault();
    if(e.key==='Enter'){
        const id = $(this).attr("id");
        if(id=="creator-amount"){
            $("#create-memo").focus();
        }
        else if(id=="buyer-amount"){
            $("#buyer-wallet").focus();
        }
        return;
    }
    else{
        const regex = /[^0-9.]/g;
        const decimals = $(this).attr("data-decimals");
        const id = $(this).attr("id");
        const issuer = $(this).attr("data-issuer");
        let mint;
        if(id=="creator-amount"){
            mint = $("#creator-mint").val();
        }
        else if(id=="buyer-amount"){
            mint = $("#buyer-mint").val();
        }
        let value = $(this).val();
        value = value.replace(regex,'');
        if(countDecimals(value) > decimals){value=parseFloat(value).toFixed(decimals);}
        $(this).val(value);
        if(value<=0){
            if(id=="creator-amount"){
                $("#creator-value").html("$0.00");
                if($("#buyer-asset").html() == "Choose"){
                    $("#buyer-asset").prop("disabled", true);
                }
                else{
                    $("#plus-minus, #set-percent, #set-button").prop("disabled", true);
                }
            }
            else if(id=="buyer-amount"){
                $("#buyer-value").html("$0.00");
                $("#buyer-type, #buyer-wallet").prop("disabled", true);
            }
        }
        else{
            if(id=="creator-amount"){
                if($("#buyer-asset").html() == "Choose"){
                    $("#buyer-asset").prop("disabled", false);
                }
                else{
                    $("#buyer-asset, #plus-minus, #set-percent, #set-button, #buyer-amount").prop("disabled", false);
                }
            }
            else if(id=="buyer-amount"){
                 $("#buyer-type, #buyer-wallet").prop("disabled", false);
            }
        }
        debounceValue(id,issuer,mint,value);
        return;
    }
});
$("#create-memo").on("keyup change input",function(e){
    e.preventDefault();
    if(e.key==='Enter'){
        $("#buyer-asset").focus();
        return;
    }
});
$("#buyer-wallet").on("keyup change input",function(e){
    e.preventDefault();
    if(e.key==='Enter'){
        $("#payment-pay").focus();
        return;
    }
    let val = $(this).val();
    if(val.includes(".sol")){
        val = val.toLowerCase();
        $(this).val(val);
    }
    return;
});
$("#payment-pay").on("click", async function(){
    $("label").removeClass("form-error");
    if($("#creator-asset").html()=="Choose"){
        toast("Choose asset",2000);
        $("#creator-asset").prev().addClass("form-error");
        return;
    }
    if($("#creator-amount").val()<=0){
        toast("Define amount",2000);
        $("#creator-amount").prev().addClass("form-error");
        return;
    }
    if($("#buyer-asset").html()=="Choose"){
        toast("Choose asset",2000);
        $("#buyer-asset").prev().addClass("form-error");
        return;
    }
    if($("#buyer-amount").val()<=0){
        toast("Define amount",2000);
        $("#buyer-amount").prev().addClass("form-error");
        return;
    }
    if($("#buyer-type").val()=="Wallet Address" && !isValidSolanaAddress($("#buyer-wallet").val().trim())){
        toast("Invalid recipient wallet",2000);
        $("#buyer-wallet").prev().addClass("form-error");
        return;
    }
    if(!window.mcswap || !window.mcswap.publicKey){
        toast("Connect wallet",2000);
        $("#connect").click();
        return;
    }
    $("#main-cover").fadeIn(300);
    const amount = await balance(rpc,window.mcswap.publicKey.toString(),$("#creator-mint").val(),$("#creator-amount").attr("data-decimals"));    
    if(amount < $("#creator-amount").val()){
        $("#main-cover").fadeOut(300);
        toast("Insufficient "+$("#creator-asset").html());
        $("#creator-amount").prev().addClass("form-error");
        return;
    }
    const seller = window.mcswap.publicKey.toString();
    const seller_mint = $("#creator-mint").val().trim();
    const seller_amount = $("#creator-amount").val().trim();
    let buyer = $("#buyer-wallet").val().trim();
    if(buyer.includes(".")){buyer = buyer.toLowerCase();}
    if(buyer=="Any"){buyer=false;}
    const buyer_mint = $("#buyer-mint").val().trim();
    const buyer_amount = $("#buyer-amount").val().trim();
    const priority = $("#settings-priority").val().trim();
    let memo = $("#create-memo").val();
    if(memo==""){memo=false;}
    const affiliateWallet = false;
    const affiliateFee = 0;
    const config = {
        "rpc": rpc,
        "blink": false,
        "builder": true,
        "convert": true,
        "tolerance": "1.2",
        "priority": priority,
        "affiliateWallet": affiliateWallet,
        "affiliateFee": affiliateFee,
        "seller": seller,
        "token1Mint": seller_mint,
        "token1Amount": seller_amount,
        "token2Mint": false,
        "token2Amount": false,
        "buyer": buyer,
        "token3Mint": buyer_mint,
        "token3Amount": buyer_amount,
        "token4Mint": false,
        "token4Amount": false,
        "memo": memo
    }
    if($("#drafting").is(":checked")){
        $("#main-message").html("Saving draft...");
        config.rpc = false;
        const drafts = localStorage.getItem("drafts");
        if(drafts){
            const array = JSON.parse(drafts);
            array.push(config);
            localStorage.setItem("drafts", JSON.stringify(array));
        }
        else{
            localStorage.setItem("drafts", JSON.stringify([config]));
        }
        toast("Draft saved",2000);
        $("#main-message").html("");
        $("#main-cover").fadeOut(300);
        return;
    }
    else{
        $("#main-message").html("Preparing transaction...");
        const tx = await xtrader.Create(config);
        if(tx.tx){
            try{
                $("#main-message").html("Requesting approval...");
                let signed=null;
                const inWalletApp = await inAppBrowse();
                if(isMobile() && inWalletApp==false){
                    try{
                        signed = await transact(async(wallet)=>{
                            const authToken = localStorage.getItem('authToken');
                            const authorizationResult = await wallet.authorize({chain:"solana:mainnet-beta",identity:APP_IDENTITY,auth_token:authToken});
                            const _signedTxs_ = await wallet.signTransactions({transactions:[tx.tx],auth_token:authorizationResult.auth_token});
                            return _signedTxs_[0];
                        });
                    }
                    catch(err){
                        if(err=="SolanaMobileWalletAdapterProtocolError: sign request declined"){
                            toast("User Declined", 5000);
                            signed=null;
                        }
                        else if(err=="SolanaMobileWalletAdapterProtocolError: auth_token not valid for signing"){
                            toast("Wrong Wallet", 5000);
                            localStorage.removeItem('authToken');
                            window.mcswap = false;
                            signed=null;
                            isDisconnected();
                            return;
                        }
                        else{
                            signed=null;
                        }
                    }
                }
                else{
                    signed = await window.mcswap.signTransaction(tx.tx).catch(async function(err){});
                }
                if(!signed){
                    $("#main-message").html("");
                    $("#main-cover").fadeOut(300);
                    toast("Transaction canceled",2000);
                    return;
                }
                $("#main-message").html("Creating offer...");
                const signature = await xtrader.Send(rpc,signed);
                // console.log("signature", signature);
                // console.log("awaiting status...");
                const status = await xtrader.Status(rpc,signature);
                if(status!="finalized"){
                    $("#main-message").html("");
                    $("#main-cover").fadeOut(300);
                    toast("Transaction failed",2000);
                }
                else{
                    $("#main-message").html("");
                    $("#main-cover").fadeOut(300);
                    toast("Offer created",4000);
                    if(buyer==false){
                        $("#market").click();
                        $("#market-refresh").click();
                    }
                    else{
                        $("#sent").click();
                        $("#sent-refresh").click();
                    }
                }
            }
            catch(err){
                $("#main-message").html("");
                $("#main-cover").fadeOut(300);
                toast("Transaction error",2000);
            }
        }
        else{
            $("#main-message").html("");
            $("#main-cover").fadeOut(300);
            toast("Transaction canceled",2000);
            if(tx.details){
                // check for low sol balance from simulation

            }
        }
    }
});
$("#plus-minus").on("click", async function(){
    const val = $(this).html();
    if(val=="+"){$(this).html("-");}
    else{$(this).html("+");}
    $("#set-percent").focus();
});
$("#set-percent").on("keyup change input",function(e){
    e.preventDefault();
    if(e.key==='Enter'){
        $("#set-button").click();
        $("#buyer-wallet").focus();
        return;
    }
    const regex = /[^0-9.]/g;
    let value = $(this).val();
    value = value.replace(regex,'');
    $(this).val(value);
});
$("#set-button").on("click", async function(){
    try{
        const regex = /[^0-9.]/g;
        let creator_value = $("#creator-value").html();
        creator_value = creator_value.replace(regex,'');
        let result;
        const merged = [...tokens_list, ...xstocks_list, ...prestocks_list, ...genesis_list];
        const mint = $("#buyer-mint").val();
        const token = await asset_map(merged,mint);
        if(token.issuer=="usdc" || token.issuer=="tether"){
            result = parseFloat(creator_value);
        }
        else{
            const response = await getValue(false,token.issuer,mint,1);
            const value = response[mint].usdPrice;
            result = creator_value / value;            
        }
        const plus_minus = $("#plus-minus").html();
        const percent = $("#set-percent").val();
        if(plus_minus == "+"){
            if(percent > 0){
                result = result + (result * (percent/100));
            }
        }
        else{
            if(percent > 0){
                result = result - (result * (percent/100));
            }
        }
        result = parseFloat(result).toFixed(token.decimals);
        $("#buyer-amount").val(result);
        $("#buyer-amount").click();
        $("#buyer-wallet").focus();
    }
    catch(err){
        console.log("err", err);
        toast("Calculation failed");
    }
});
$("#drafting").on("click", async function(){
    if($("#drafting").is(":checked")){
        $("#payment-pay").html("Save");
        $("#payment-pay").addClass("drafting");
    }
    else{
        $("#payment-pay").html("Send");
        $("#payment-pay").removeClass("drafting");
    }
});




// filter asset list
async function filterAssetList(filter){
    const group = $("#asset_group").val();
    if(filter!=""){
        filter = filter.toLowerCase();
        let i = 0;
        const length = $("#asset-list ul").length;
        $("#asset-list ul").each(function(){
            const item = $(this);
            const id = item.attr("id").toLowerCase();
            const symbol = item.find(".list-symbol").html().toLowerCase();
            const name = item.find(".list-name").html().toLowerCase();
            const issuer = item.attr("data-issuer");
            if(id.includes(filter) || symbol.includes(filter) || name.includes(filter)){
                if(group=="all" || group==issuer){
                    $("ul#"+item.attr("id")).show();
                }
                else{
                    $("ul#"+item.attr("id")).hide();
                }
            }
            else{
                $("ul#"+item.attr("id")).hide();
            }
            i++;
            if(i==length){
                $('#asset-list ul:visible:first').css('border-top','1px solid #111111');
                $('#asset-list ul:visible:last').css('border-bottom','1px solid #111111');
            }
        });
    }
    else{
        if(group=="all"){
            $("#asset-list ul").show();
        }
        else{
            $("#asset-list ul").hide();
            $("#asset-list ul[data-issuer="+group+"]").show();
        } 
    }
}
const debounceAssetList = debounce(filterAssetList, 500);
// close asset list
$("button#asset-list-close").on("click", function(){
    $("#asset-list-box").attr("data-chooser",null).removeClass("animate__slideInLeft").addClass("animate__slideOutLeft");
});
// choose asset 1
$("button#creator-asset").on("click", async function(e){
    e.preventDefault();
    debounceAssetList($("#asset_filter").val());
    $("#asset-list-box").scrollTop(0);
    $("#asset-list-box").attr("data-chooser","creator-asset").removeClass("animate__slideOutLeft").addClass("animate__slideInLeft").show();
    $("#asset_filter").focus();
});
// choose asset 2
$("button#buyer-asset").on("click", async function(e){
    e.preventDefault();
    debounceAssetList($("#asset_filter").val());
    $("#asset-list-box").scrollTop(0);
    $("#asset-list-box").attr("data-chooser","buyer-asset").removeClass("animate__slideOutLeft").addClass("animate__slideInLeft").show();
    $("#asset_filter").focus();
});
// offer type
$("#buyer-type").on("change",function(){
    if($(this).val()=="Public Market"){
        $("#buyer-wallet").val("Any").prop("disabled",true);
    }
    else{
        $("#buyer-wallet").val("").prop("disabled",false).focus();
    }
});
// main navigation
$("#nav #cog, #nav .view, #introduction").on("click", async function(){
    let id = $(this).attr("id");
    $("#"+id+"-view ul.row").hide();
    if(id=="introduction"){

    }
    else if(id=="cog"){
        if($(this).hasClass("active-view")){
            $("#nav #cog, #nav .view").removeClass("active-view").removeClass("active-cog");
            id="home";
        }
        else{
            $("#nav #cog, #nav .view").removeClass("active-view").removeClass("active-cog");
            $(this).addClass("active-view").addClass("active-cog");
            id="settings";
        }
    }
    else{
        $("#nav #cog, #nav .view").removeClass("active-view").removeClass("active-cog");
        $(this).addClass("active-view");
    }
    $(".views").hide();
    $("#"+id+"-view").show();
    await positioner();
    $("#"+id+"-view ul.row").show();
});
// select asset
$(document).delegate("#asset-list ul", "click", async function(){
    const id = $(this).parent().parent().attr("data-chooser");
    const mint = $(this).attr("id");
    const issuer = $(this).attr("data-issuer");
    const decimals = $(this).attr("data-decimals");
    const symbol = $(this).find(".list-symbol").html();
    const img = $(this).find(".list-icon img").attr("src");
    $("#asset-list-close").click();
    if(id=="creator-asset"){
        $("#creator-value").html("$0.00");
        $("#creator-mint").val(mint);
        $("#creator-asset").html(symbol);
        $("#creator-icon").attr("src",img).show();
        $("#creator-amount").val("").attr("data-issuer",issuer).attr("data-decimals",decimals).prop("disabled",false).focus();
        $("#create-memo").prop("disabled",false);
        if($("#creator-amount").val() > 0 && $("#buyer-asset").html() != "Choose"){
            $("#plus-minus, #set-percent, #set-button").prop("disabled", false);
        }
        else{
            $("#plus-minus, #set-percent, #set-button").prop("disabled", true);
        }
    }
    else if(id=="buyer-asset"){
        $("#buyer-value").html("$0.00");
        $("#buyer-mint").val(mint);
        $("#buyer-asset").html(symbol);
        $("#buyer-icon").attr("src",img).show();
        $("#buyer-amount").val("").attr("data-issuer",issuer).attr("data-decimals",decimals).prop("disabled",false).focus();
        if($("#creator-amount").val() > 0 && $("#buyer-asset").html() != "Choose"){
            $("#plus-minus, #set-percent, #set-button").prop("disabled", false);
        }
        else{
            $("#plus-minus, #set-percent, #set-button").prop("disabled", true);
        }
    }
    await new Promise(_=>setTimeout(_,1000));
    $("#asset_filter").val("");
    $("#asset-list ul").show();
});
$("#asset_filter").on("keyup change input", async function(){
    debounceAssetList($(this).val());
});
$("#asset_group").on("change", async function(){
    debounceAssetList($("#asset_filter").val());
});


// notifications
function noti(){
    const title = "xTrader";
    if (!("Notification" in window)) {
        alert("This browser does not support notification");
    } 
    else if (Notification.permission === "granted") {
        const options = {
            "body": "Welcome Back!",
            "icon": "https://www.xtrader.me/wallet_icon.png"
        }
        const notification = new Notification(title, options);
    } 
    else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
            const options = {
                body: "Welcome to xTrader!",
                icon: "https://www.xtrader.me/wallet_icon.png",
            }
            const notification = new Notification(title, options);
        }
        });
    }
}
// debounce
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
// ping rpc
async function pingRPC(HELIUS_RPC_URL){
  try{
    const response = await fetch(HELIUS_RPC_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getHealth", // A simple method to check node health
        params: [],
      }),
    }).catch(function(err){return;});
    if(response.ok){
        return true;
    }
    else{
        return;
    }
  }
  catch(error){return;}
}
// get balance
async function balance(_rpc_,_wallet_,_mint_,_decimals_){
    try{
        const connection = new Connection(_rpc_,'confirmed');
        let amount = 0;
        if(_mint_=="So11111111111111111111111111111111111111112"){
            amount = await connection.getBalance(window.mcswap.publicKey.toString());
        }
        else{
            const response = await connection.getParsedTokenAccountsByOwner(new PublicKey(_wallet_),{mint:new PublicKey(_mint_)}).catch(function(err){return;});
            if(response != null && response.value.length > 0){amount = response.value[0].account.data.parsed.info.tokenAmount.amount;}
        }
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
        // console.log("err", err);
        return;
    }
}
// validate wallet
function isValidSolanaAddress(address){
  try {

    if(address.includes(".sol")){
        return true;
    }
    else{
        const publicKey = new PublicKey(address);
        return PublicKey.isOnCurve(publicKey.toBytes());
    }
  } catch (error) {
    return false;
  }
}
// copy to clipboard
function copy(string){
    let textArea = document.createElement('textarea');
    textArea.setAttribute('style', 'width:1px;border:0;opacity:0;');
    textArea.setAttribute('id', 'temp_copy');
    document.body.appendChild(textArea);
    textArea.value = string;
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return;
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
// mobile check
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
// in wallet browser detection
async function inAppBrowse(){
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  const Phantom = /Phantom/i.test(userAgent);
  const Solflare = /Solflare/i.test(userAgent);
  const Backpack = / wv/i.test(userAgent);
  if(Phantom || Solflare || Backpack){
    return true;
  }
  else{
    return false;
  }
}
// load the asset list
$("#introduction").css({"display":"block"}).show();
const agreement = localStorage.getItem("agreement");
if(agreement){
    $("#connect, #cog").prop("disabled", false);
    $("#agreement").prop("checked", true);
    $("#introduction").hide();
    $("#logo-home").show();
}
else{
    $("#logo-home").show();
    $("#introduction").css({"display":"block"}).show();
}
$(window).on("load", async function(){
    let wakeLock = null;
    if("wakeLock" in navigator){
        try{
            wakeLock = await navigator.wakeLock.request("screen");
        }catch(err){}
        document.addEventListener("visibilitychange",async()=>{
        if (wakeLock!==null && document.visibilityState==="visible"){
            wakeLock = await navigator.wakeLock.request("screen");
        }
        });
    }
    const inWalletApp = await inAppBrowse();
    if(isMobile() && inWalletApp==false){
        $(".mcswap_connect_button").removeClass().addClass("mobile_connect_button");
        $(".mcswap_disconnect_button").removeClass().addClass("mobile_disconnect_button");
    }
    let i=0;
    while (i < groups.length) {
        const group = groups[i];
        const item = '<option value="'+group.slug+'">'+group.name+'</option>';
        $("#asset_group").append(item);
        i++;
    }
    i=0;
    while (i < tokens_list.length) {
        const asset = tokens_list[i];
        const item = '<option value="'+asset.mint+'">'+asset.symbol+'</option>';
        $("#sent-filter").append(item);
        $("#received-filter").append(item);
        $("#market-filter").append(item);
        all_mints.push(asset.mint);
        i++;
    }
    const master_list = [...xstocks_list, ...prestocks_list, ...shiftstocks_list, ...genesis_list];
    master_list.sort((a,b) => (a.symbol > b.symbol) ? 1 : ((b.symbol > a.symbol) ? -1 : 0));
    i=0;
    while (i < master_list.length) {
        const asset = master_list[i];
        const item = '<option value="'+asset.mint+'">'+asset.symbol+'</option>';
        $("#sent-filter").append(item);
        $("#received-filter").append(item);
        $("#market-filter").append(item);
        all_mints.push(asset.mint);
        i++;
    }
    const filter_sent = localStorage.getItem("filter-sent"); 
    const filter_received = localStorage.getItem("filter-received"); 
    const filter_market = localStorage.getItem("filter-market"); 
    if(filter_sent){$("#sent-filter").val(filter_sent);}
    if(filter_received){$("#received-filter").val(filter_received);}
    if(filter_market){$("#market-filter").val(filter_market);}
    i=0;
    while (i < tokens_list.length) {
        const asset = tokens_list[i];
        let item = '<ul data-issuer="'+asset.issuer+'" data-decimals="'+asset.decimals+'" id="'+asset.mint+'">';
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
    while (i < master_list.length) {
        const asset = master_list[i];
        let item = '<ul data-issuer="'+asset.issuer+'" data-decimals="'+asset.decimals+'" id="'+asset.mint+'">';
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
    let settings = localStorage.getItem("settings");
    if(settings){
        settings = JSON.parse(settings);
        $("#settings-priority").val(settings.priority);
        $("#settings-screensaver").val(settings.screensaver);
        $("#settings-rpc").val(settings.rpc);
    }
    if(isMobile() && !inAppBrowse()){
        $("#import-blackbook").hide();
        $("#import-contact").show();
    }
    else{
        $("#import-contact").hide();
        $("#import-blackbook").show();
    }
    if(!localStorage.getItem("blackbook")){localStorage.setItem("blackbook", JSON.stringify([]));}
});


// desktop contact vcard upload
$("#import-blackbook").on("change", async function(event){
    const file = event.target.files[0];
    if(file){
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = e.target.result;
            toast("Importing contact");
            $("#blackbook-form").get(0).reset();
        };
        reader.onerror = function(e) {
            toast("Error importing contact");
        };
        reader.readAsText(file);
    }
});


// mobile contact select
const props = ['name','email','tel'];
const opts = {multiple:false};
async function getContact(){
    try{
        const contacts = await navigator.contacts.select(props, opts);
        if(contacts.length > 0){
            const selectedContact = contacts[0];
            console.log('Selected Contact Name:', selectedContact.name);
            console.log('Selected Contact Email:', selectedContact.email);
        } 
        else {
            console.log('No contact selected.');
        }
    } 
    catch(ex){
        console.error('Error accessing contacts:', ex);
    }
}
$("#import-contact").on("click", async function(e){
    e.preventDefault();
    if(!window.mcswap){return;}
    const chosen = await getContact();
    $("#coming-soon").html(chosen);
});


// usage agreement
$("#agreement").on("click", async function(){
    const checked = $(this).prop("checked");
    if(checked===true){
        localStorage.setItem("agreement",checked);
        $(".views").hide();
        $("#home-view").show();
        $("#connect, #cog").prop("disabled", false);
        $("#introduction").hide();
        toast("Connect your wallet");
        $("#connect").click();
    }
    else{
        const confirm = window.confirm("Are you sure? This will clear all stored data.");
        if(!confirm){
            $(this).prop("checked", true);
            return;
        }
        $("#connect, #cog").prop("disabled", true);
        $("#introduction").show();
        if($("#disconnect").is(":visible")){
            $("#disconnect").click();
        }
        else{
            $(".views").hide();
            $("#home-view").show();
        }
        localStorage.clear();
        $("#settings-rpc").val("");
        $("#settings-screensaver").val("120");
        $("#settings-priority").val("Low");
    }
});
$("#open-intro").on("click", async function(){
    $("#introduction").click();
    $("#cog").removeClass("active-view").removeClass("active-cog");
});


// swipe events
class TouchEvent {

    // static SWIPE_THRESHOLD = 200;
    static SWIPE_LEFT   = 1;
    static SWIPE_RIGHT  = 2;
    static SWIPE_UP     = 3;
    static SWIPE_DOWN   = 4;

    constructor(startEvent, endEvent) {
        this.startEvent = startEvent;
        this.endEvent = endEvent || null;
        this.threshold = $("#views").width()/3;
    }

    isSwipeLeft() {
        return this.getSwipeDirection() == TouchEvent.SWIPE_LEFT;
    }

    isSwipeRight() {
        return this.getSwipeDirection() == TouchEvent.SWIPE_RIGHT;
    }

    isSwipeUp() {
        return this.getSwipeDirection() == TouchEvent.SWIPE_UP;
    }

    isSwipeDown() {
        return this.getSwipeDirection() == TouchEvent.SWIPE_DOWN;
    }

    getSwipeDirection() {
        if (!this.startEvent.changedTouches || !this.endEvent.changedTouches) {
            return null;
        }

        let start = this.startEvent.changedTouches[0];
        let end = this.endEvent.changedTouches[0];

        if (!start || !end) {
            return null;
        }

        let horizontalDifference = start.screenX - end.screenX;
        let verticalDifference = start.screenY - end.screenY;

        // Horizontal difference dominates
        if (Math.abs(horizontalDifference) > Math.abs(verticalDifference)) {
            if (horizontalDifference >= this.threshold) {
                return TouchEvent.SWIPE_LEFT;
            } else if (horizontalDifference <= -this.threshold) {
                return TouchEvent.SWIPE_RIGHT;
            }

        // Vertical or no difference dominates
        } else {
            if (verticalDifference >= this.threshold) {
                return TouchEvent.SWIPE_UP;
            } else if (verticalDifference <= -this.threshold) {
                return TouchEvent.SWIPE_DOWN;
            }
        }

        return null;
    }

    setEndEvent(endEvent) {
        this.endEvent = endEvent;
    }
}
let touchEvent = null;
let isDragging = false;
let initialX;
let initialLeft;
$(document).delegate("ul.row", "touchstart", function(e){
    if($(this).find("button.item-hide").is(":visible")){
        touchEvent = new TouchEvent(e);
        isDragging = true;
        initialX = e.touches[0].clientX;
        initialLeft = $(this).position().left;
    }
    else{
      return;  
    }
});
$(document).delegate("ul.row", "touchmove", function(e){
    if(!isDragging) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - initialX;
    if(deltaX >= 0){
        $(this).css('left', (initialLeft + deltaX) + 'px');
        const level = (1 - (deltaX / $(this).width()));
        $(this).css('opacity', level + '');
    }
});
$(document).delegate("ul.row", "touchend", handleSwipe);
function handleSwipe(event){
    if(!touchEvent){
        isDragging=false;
        return;
    }
    touchEvent.setEndEvent(event);
    if(touchEvent.isSwipeRight()){
        const window_width = $(window).width();
        $(this).animate({'left': window_width}, 300, async function(){
            const parent = $(this).parent();
            parent.addClass("hidden");
            const id = parent.attr("id");
            const view = id.split("-")[1];
            const offer = id.split("-")[2];
            const hidden = localStorage.getItem("hidden-"+view);
            if(hidden){
                const array = JSON.parse(hidden);
                if(!array.includes(offer)){array.push(offer);}
                localStorage.setItem("hidden-"+view, JSON.stringify(array));
            }
            else{
                localStorage.setItem("hidden-"+view, JSON.stringify([offer]));
            }
            await new Promise(_=>setTimeout(_,500));
            parent.hide();
            toast("Hidden", 2000);
            positioner();
            const ele = $("#"+view+"-view .qty-center");
            const count = parseInt(ele.html());
            ele.html(count-1);
        });
    } else if(touchEvent.isSwipeLeft()){
    }
    else{
        positioner();
    }
    touchEvent = null;
    isDragging = false;
}


const arrow_up = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFzGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDIgNzkuYTZhNjM5NiwgMjAyNC8wMy8xMi0wNzo0ODoyMyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjExIChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjUtMDctMDhUMDE6Mjc6MzktMDQ6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI1LTA3LTA4VDAxOjMwOjMxLTA0OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI1LTA3LTA4VDAxOjMwOjMxLTA0OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3MzgyZTdjZC1jNzczLWJlNDktOGI0My1lMDhhMzJiOGUzNzYiIHhtcE1NOkRvY3VtZW50SUQ9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";
const arrow_down = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAYAAABV7bNHAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFzGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDIgNzkuYTZhNjM5NiwgMjAyNC8wMy8xMi0wNzo0ODoyMyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDI1LjExIChXaW5kb3dzKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjUtMDctMDhUMDE6Mjc6MzktMDQ6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI1LTA3LTA4VDAxOjMwOjU1LTA0OjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI1LTA3LTA4VDAxOjMwOjU1LTA0OjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoyNzY0NDk2Yi03YWI4LWMwNGEtYWQ2ZC04Yjc1OTljZDRlNGIiIHhtcE1NOkRvY3VtZW50SUQ9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";