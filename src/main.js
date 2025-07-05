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


// connection events
const emitter = new EventEmitter();
new mcswapConnector(["phantom","solflare","backpack"],emitter).init();
emitter.on('mcswap_connected',async()=>{
    $("#mcswap_cover, #mcswap_chooser").fadeOut(300);
    toast("Connected!",2000);
});
emitter.on('mcswap_disconnected',async()=>{
    toast("Disconnected!",2000);
    $("#nav .view").removeClass("active-view");
    $(".views").hide();
    $("#home-view").show();
});


// main navigation
$("#nav .view").on("click", async function(){
    $("#nav .view").removeClass("active-view");
    $(this).addClass("active-view");
    const id = $(this).attr("id");
    $(".views").hide();
    $("#"+id+"-view").show();
});


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