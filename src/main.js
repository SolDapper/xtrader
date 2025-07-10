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
import mcswap from 'mcswap-sdk';
import EventEmitter from 'events';
import mcswapConnector from "mcswap-connector";
import "mcswap-connector/src/colors/xtrader-connector.css";
import "./css/style.css";
const rpc = process.env.RPC;
const mode = window.location.pathname;
const APP_IDENTITY = {name:'xTrader',uri:'https://www.xtrader.me/',icon:'special_icon.png',};


// serviceWorker
if ('serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.register(
      new URL('../service-worker.js', import.meta.url),
      {type: 'module'}
    );
    console.log('Service Worker Registered');
  } catch (error) {
    console.log('Service Worker Register Failed');
  }
}


// asset list
const token_list = [
    {
        name: "Solana",
        symbol: "SOL",
        mint: "So11111111111111111111111111111111111111112",
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
        decimals: 8
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
    },
    {
        name: "Coinbase xStock",
        symbol: "COINx",
        mint: "Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c131b2d6d8cbe9e61a3dc_Ticker%3DCOIN%2C%20Company%20Name%3DCoinbase%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-COINx.pdf",
        decimals: 8
    },
    {
        name: "Comcast xStock",
        symbol: "CMCSAx",
        mint: "XsvKCaNsxg2GN8jjUmq71qukMJr7Q1c5R2Mk9P8kcS8",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bfbe3db57e5f5f6b277aa_Ticker%3DCMCSA%2C%20Company%20Name%3DComcast%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-CMCSAx.pdf",
        decimals: 8
    },
    {
        name: "CrowdStrike xStock",
        symbol: "CRWDx",
        mint: "Xs7xXqkcK7K8urEqGg52SECi79dRp2cEKKuYjUePYDw",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c10fbaf9d90e3d974ae23_Ticker%3DCRWD%2C%20Company%20Name%3DCrowdstrike%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-CRWDx.pdf",
        decimals: 8
    },
    {
        name: "Danaher xStock",
        symbol: "DHRx",
        mint: "Xseo8tgCZfkHxWS9xbFYeKFyMSbWEvZGFV1Gh53GtCV",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bfa59ce8102ff96cee2fe_Ticker%3DDHR%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-DHRx.pdf",
        decimals: 8
    },
    {
        name: "DFDV xStock",
        symbol: "DFDVx",
        mint: "Xs2yquAgsHByNzx68WJC55WHjHBvG9JsMB7CWjTLyPy",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/6861b8b7beb9cf856e2332d5_DFDVx.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-DFDVx.pdf",
        decimals: 8
    },
    {
        name: "Eli Lilly xStock",
        symbol: "LLYx",
        mint: "Xsnuv4omNoHozR6EEW5mXkw8Nrny5rB3jVfLqi6gKMH",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684ad0eaa9a1efe9b1b7155a_Ticker%3DLLY%2C%20Company%20Name%3DLilly%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-LLYx.pdf",
        decimals: 8
    },
    {
        name: "Exxon Mobil xStock",
        symbol: "XOMx",
        mint: "XsaHND8sHyfMfsWPj6kSdd5VwvCayZvjYgKmmcNL5qh",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684abe960ee12e238c0a1f0b_Ticker%3DXOM%2C%20Company%20Name%3DExxonMobil%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-XOMx.pdf",
        decimals: 8
    },
    {
        name: "Gamestop xStock",
        symbol: "GMEx",
        mint: "Xsf9mBktVB9BSU5kf4nHxPq5hCBJ2j2ui3ecFGxPRGc",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c125f1c48a3dab4c66137_Ticker%3DGME%2C%20Company%20Name%3Dgamestop%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-GMEx.pdf",
        decimals: 8
    },
    {
        name: "Gold xStock",
        symbol: "GLDx",
        mint: "Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/685123a7747987b071b10d47_Ticker%3DGLD%2C%20Company%20Name%3DGold%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-GSx.pdf",
        decimals: 8
    },
    {
        name: "Goldman Sachs xStock",
        symbol: "GSx",
        mint: "XsgaUyp4jd1fNBCxgtTKkW64xnnhQcvgaxzsbAq5ZD1",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c114972ed2d868a1b3f95_Ticker%3DGS%2C%20Company%20Name%3DGoldman%20Sachs%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-GSx.pdf",
        decimals: 8
    },
    {
        name: "Home Depot xStock",
        symbol: "HDx",
        mint: "XszjVtyhowGjSC5odCqBpW1CtXXwXjYokymrk7fGKD3",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684be484171c0a11201e098d_Ticker%3DHD%2C%20Company%20Name%3DHome%20Depot%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-HDx.pdf",
        decimals: 8
    },
    {
        name: "Honeywell xStock",
        symbol: "HONx",
        mint: "XsRbLZthfABAPAfumWNEJhPyiKDW6TvDVeAeW7oKqA2",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c08d12385ea1da806a5bb_Ticker%3DHON%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-HONx.pdf",
        decimals: 8
    },
    {
        name: "Intel xStock",
        symbol: "INTCx",
        mint: "XshPgPdXFRWB8tP1j82rebb2Q9rPgGX37RuqzohmArM",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c0a334cac334b4a41651b_Ticker%3DINTC%2C%20Company%20Name%3DIntel%20Corp%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-INTCx.pdf",
        decimals: 8
    },
    {
        name: "International Business Machines",
        symbol: "IBMx",
        mint: "XspwhyYPdWVM8XBHZnpS9hgyag9MKjLRyE3tVfmCbSr",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bfb32f7000e98d733283f_Ticker%3DIBM%2C%20Company%20Name%3DIBM%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-IBMx.pdf",
        decimals: 8
    },
    {
        name: "Johnson & Johnson xStock",
        symbol: "JNJx",
        mint: "XsGVi5eo1Dh2zUpic4qACcjuWGjNv8GCt3dm5XcX6Dn",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684ace98941130a24503a315_Ticker%3DJNJ%2C%20Company%20Name%3Djohnson-johnson%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-JNJx.pdf",
        decimals: 8
    },
    {
        name: "JPMorgan Chase xStock",
        symbol: "JPMx",
        mint: "XsMAqkcKsUewDrzVkait4e5u4y8REgtyS7jWgCpLV2C",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684acf34c10a7e0add155c61_Ticker%3DJPM%2C%20Company%20Name%3DJPMorganChase%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-JPMx.pdf",
        decimals: 8
    },
    {
        name: "Linde xStock",
        symbol: "LINx",
        mint: "XsSr8anD1hkvNMu8XQiVcmiaTP7XGvYu7Q58LdmtE8Z",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf2b1132313f4529a3160_Ticker%3DLIN%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-LINx.pdf",
        decimals: 8
    },
    {
        name: "Marvell xStock",
        symbol: "MRVLx",
        mint: "XsuxRGDzbLjnJ72v74b7p9VY6N66uYgTCyfwwRjVCJA",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c0eb412d3850c2c01cd29_Ticker%3DMRVL%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-MRVLx.pdf",
        decimals: 8
    },
    {
        name: "Mastercard xStock",
        symbol: "MAx",
        mint: "XsApJFV9MAktqnAc6jqzsHVujxkGm9xcSUffaBoYLKC",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684ad1ca13c7aaa9ece4cbbf_Ticker%3DMA%2C%20Company%20Name%3DMastercard%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-MAx.pdf",
        decimals: 8
    },
    {
        name: "McDonald's xStock",
        symbol: "MCDx",
        mint: "XsqE9cRRpzxcGKDXj1BJ7Xmg4GRhZoyY1KpmGSxAWT2",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf77838b45bb94ff32be7_Ticker%3DMCD%2C%20Company%20Name%3DMcDonalds%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-MCDx.pdf",
        decimals: 8
    },
    {
        name: "Medtronic xStock",
        symbol: "MDTx",
        mint: "XsDgw22qRLTv5Uwuzn6T63cW69exG41T6gwQhEK22u2",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bfc99a86580de629510e9_Ticker%3DMDT%2C%20Company%20Name%3DMedtronic%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-MDTx.pdf",
        decimals: 8
    },
    {
        name: "Merck xStock",
        symbol: "MRKx",
        mint: "XsnQnU7AdbRZYe2akqqpibDdXjkieGFfSkbkjX1Sd1X",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684be6ff5bd0a5643adf85ec_Ticker%3DMRK%2C%20Company%20Name%3DMerck%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-MRKx.pdf",
        decimals: 8
    },
    {
        name: "Meta xStock",
        symbol: "METAx",
        mint: "Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/68497dee3db1bae97b91ac05_Ticker%3DMETA%2C%20Company%20Name%3DMeta%20Platforms%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-METAx.pdf",
        decimals: 8
    },
    {
        name: "Microsoft xStock",
        symbol: "MSFTx",
        mint: "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/68497bdc918924ea97fd8211_Ticker%3DMSFT%2C%20Company%20Name%3DMicrosoft%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-MSFTx.pdf",
        decimals: 8
    },
    {
        name: "MicroStrategy xStock",
        symbol: "MSTRx",
        mint: "XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c0d47eee3a9c3fa12475a_Ticker%3DMSTR%2C%20Company%20Name%3DMicroStrategy%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-MSTRx.pdf",
        decimals: 8
    },
    {
        name: "Nasdaq xStock",
        symbol: "QQQx",
        mint: "Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/68511cb6e367f19f06664527_QQQx.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-QQQx.pdf",
        decimals: 8
    },
    {
        name: "Netflix xStock",
        symbol: "NFLXx",
        mint: "XsEH7wWfJJu2ZT3UCFeVfALnVA6CP5ur7Ee11KmzVpL",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf6c149d917d503f6cda6_Ticker%3DNFLX%2C%20Company%20Name%3DNetflix%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-NFLXx.pdf",
        decimals: 8
    },
    {
        name: "Novo Nordisk xStock",
        symbol: "NVOx",
        mint: "XsfAzPzYrYjd4Dpa9BU3cusBsvWfVB9gBcyGC87S57n",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf139788d618501b65727_Ticker%3DNOVO_B%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-NVOx.pdf",
        decimals: 8
    },
    {
        name: "NVIDIA xStock",
        symbol: "NVDAx",
        mint: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684961bfb45e3c4d777b9997_Ticker%3DNVDA%2C%20Company%20Name%3DNVIDIA%20Corp%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-NVDAx.pdf",
        decimals: 8
    },
    {
        name: "Oracle xStock",
        symbol: "ORCLx",
        mint: "XsjFwUPiLofddX5cWFHW35GCbXcSu1BCUGfxoQAQjeL",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf1ecae4eb4a817da9941_Ticker%3DORCL%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-ORCLx.pdf",
        decimals: 8
    },
    {
        name: "Palantir xStock",
        symbol: "PLTRx",
        mint: "XsoBhf2ufR8fTyNSjqfU71DYGaE6Z3SUGAidpzriAA4",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c0c4c0e5466272c52958b_Ticker%3DPLTR%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-PLTRx.pdf",
        decimals: 8
    },
    {
        name: "PepsiCo xStock",
        symbol: "PEPx",
        mint: "Xsv99frTRUeornyvCfvhnDesQDWuvns1M852Pez91vF",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684be8662b90a208c5d5b8e5_Ticker%3DPEP%2C%20Company%20Name%3DPepsico%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-PEPx.pdf",
        decimals: 8
    },
    {
        name: "Pfizer xStock",
        symbol: "PFEx",
        mint: "XsAtbqkAP1HJxy7hFDeq7ok6yM43DQ9mQ1Rh861X8rw",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684be5e3c54ff3f5c6c9b36f_Ticker%3DPFE%2C%20Company%20Name%3Dpfizer%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-PFEx.pdf",
        decimals: 8
    },
    {
        name: "Philip Morris xStock",
        symbol: "PMx",
        mint: "Xsba6tUnSjDae2VcopDB6FGGDaxRrewFCDa5hKn5vT3",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c0981cbec78a581a6bfe7_Ticker%3DPM%2C%20Company%20Name%3Dphilip%20morris%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-PMx.pdf",
        decimals: 8
    },
    {
        name: "Procter & Gamble xStock",
        symbol: "PGx",
        mint: "XsYdjDjNUygZ7yGKfQaB6TxLh2gC6RRjzLtLAGJrhzV",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684be3c6fa6a62fb260a51e3_Ticker%3DPG%2C%20Company%20Name%3DProctor%20%26%20Gamble%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-PGx.pdf",
        decimals: 8
    },
    {
        name: "Robinhood xStock",
        symbol: "HOODx",
        mint: "XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c0f39cede10b9afa4852f_Ticker%3DHOOD%2C%20Company%20Name%3DRobinhood%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-HOODx.pdf",
        decimals: 8
    },
    {
        name: "Salesforce xStock",
        symbol: "CRMx",
        mint: "XsczbcQ3zfcgAEt9qHQES8pxKAVG5rujPSHQEXi4kaN",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf3670e24ef4c92a6a7fc_Ticker%3DCRM%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-CRMx.pdf",
        decimals: 8
    },
    {
        name: "SP500 xStock",
        symbol: "SPYx",
        mint: "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/685116624ae31d5ceb724895_Ticker%3DSPX%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-SPYx.pdf",
        decimals: 8
    },
    {
        name: "Tesla xStock",
        symbol: "TSLAx",
        mint: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684aaf9559b2312c162731f5_Ticker%3DTSLA%2C%20Company%20Name%3DTesla%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-TSLAx.pdf",
        decimals: 8
    },
    {
        name: "Thermo Fisher xStock",
        symbol: "TMOx",
        mint: "Xs8drBWy3Sd5QY3aifG9kt9KFs2K3PGZmx7jWrsrk57",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf4d930b0fdc50503056d_Ticker%3DTMO%2C%20Company%20Name%3DThermo_Fisher_Scientific%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-TMOx.pdf",
        decimals: 8
    },
    {
        name: "TQQQ xStock",
        symbol: "TQQQx",
        mint: "XsjQP3iMAaQ3kQScQKthQpx9ALRbjKAjQtHg6TFomoc",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/685125548a5829b9b59a6156_TQQQx.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-TQQQx.pdf",
        decimals: 8
    },
    {
        name: "UnitedHealth xStock",
        symbol: "UNHx",
        mint: "XszvaiXGPwvk2nwb3o9C1CX4K6zH8sez11E6uyup6fe",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684abb4c69185d8a871e2ab5_Ticker%3DUNH%2C%20Company%20Name%3DUnited%20Health%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-UNHx.pdf",
        decimals: 8
    },
    {
        name: "Vanguard xStock",
        symbol: "VTIx",
        mint: "XsssYEQjzxBCFgvYFFNuhJFBeHNdLWYeUSP8F45cDr9",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/68511e335ee1314f602d9a7c_Ticker%3DVTI%2C%20Company%20Name%3DVanguard%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-VTIx.pdf",
        decimals: 8
    },
    {
        name: "Visa xStock",
        symbol: "Vx",
        mint: "XsqgsbXwWogGJsNcVZ3TyVouy2MbTkfCFhCGGGcQZ2p",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684acfd76eb8395c6d1d2210_Ticker%3DV%2C%20Company%20Name%3DVisa%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-Vx.pdf",
        decimals: 8
    },
    {
        name: "Walmart xStock",
        symbol: "WMTx",
        mint: "Xs151QeqTCiuKtinzfRATnUESM2xTU6V9Wy8Vy538ci",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bebd366d5089b2da3cf7e_Ticker%3DWMT%2C%20Company%20Name%3DWalmart%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-WMTx.pdf",
        decimals: 8
    }
];
const asset_mints = [];
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


// connection events
async function isConnected(){
    if(isMobile()){
      $(".mobile_connect_button").hide();
      $('.mobile_disconnect_button').show();
    }
    $("#received-view .panel-list, #sent-view .panel-list, #market-view .panel-list").html("");
    $("#mcswap_cover, #mcswap_chooser").fadeOut(300);
    toast("Connected!",2000);
    if($("#home-view").is(":visible")){$("#received").click();}
    $(".refresher").addClass("spin");
    await load_sent();
    await load_received();
    await load_public();
}
async function isDisconnected(){
    if(isMobile()){
      $('.mobile_disconnect_button').hide();
      $(".mobile_connect_button").show();
    }
    $("#received-view .panel-list, #sent-view .panel-list, #market-view .panel-list").html("");
    toast("Disconnected!",2000);
    $("#nav .view").removeClass("active-view");
    $(".views").hide();
    $("#home-view").show();
}
// mcswap wallet adapter
(async function(){
    const inWalletApp = await inAppBrowse();
    if(!isMobile() || inWalletApp===true){
        const emitter = new EventEmitter();
        new mcswapConnector(["phantom","solflare","backpack"],emitter).init();
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
            catch(error){return null;}
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
        toast("MWA error",2000);
        return null;
    }
}
$(document).delegate(".mobile_connect_button", "click", async function(){
    toast("trying",3000);
    $("#mcswap_cover").fadeIn(400);
    $("#mcswap_message").html("Requesting connection...");
    const result = await startMWA();
    if(result){
        isConnected();
    }
    else{
        $("#mcswap_message").html("");
        $("#mcswap_cover").fadeOut(400);
    }
});
$(document).delegate(".mobile_disconnect_button", "click", async function(){
    const isAuthToken = localStorage.getItem('authToken');
    if(isAuthToken){
        const result = await transact(async(wallet)=>{return await wallet.deauthorize({auth_token: isAuthToken});});
        localStorage.removeItem('authToken');
    }
    window.mcswap = false;
    await isDisconnected(true);
});


// backchecking displayed escrows
async function backcheck(ele,array){
    const list = $("#"+ele+"-view .panel-list").find("ul");
    const count = list.length;
    if(count > 0){
        let i = 0;
        list.each(function(){
            const item = $(this);
            const id = item.attr("id").replace(ele+"-","");
            if(!array.includes(id)){
                $("#"+ele+"-"+id).remove();
            }
            i++;
            if(i==count){
                return;
            }
        });
    }
    else{
        return;
    }
}
// load sent
async function load_sent(){
    try{
        if(!window.mcswap || !window.mcswap.publicKey){
            toast("Connect wallet",2000);
            return;
        }
        $("#sent-refresh").addClass("spin");
        const splSent = await mcswap.splSent({
            rpc: rpc,
            display: true,
            private: true,
            wallet: window.mcswap.publicKey.toString()
        });
        let i = 0;
        splSent.data.sort((a,b) => (a.utime > b.utime) ? 1 : ((b.utime > a.utime) ? -1 : 0));
        if(!splSent || !splSent.data || splSent.data.length==0){
            $("#sent-refresh").removeClass("spin");
        }
        const displayed = [];
        while(i < splSent.data.length){
            const asset = splSent.data[i];
            if(asset_mints.includes(asset.token_1_mint)){
                if(!$('#sent-'+asset.acct).length){
                    asset.token_1_details = await asset_map(asset_list,asset.token_1_mint);
                    const merged = token_list.concat(asset_list);
                    asset.token_3_details = await asset_map(merged,asset.token_3_mint);
                    let ele = '<ul id="sent-'+asset.acct+'" class="row">';
                    ele += '<li><img data-pdf="'+asset.token_1_details.pdf+'" class="item-img" src="'+asset.token_1_details.icon+'" /></li>';
                    ele += '<li data-mint="'+asset.token_1_mint+'" class="item-details"><div class="item-symbol">'+asset.token_1_details.symbol+'</div><div class="item-name">'+asset.token_1_details.name+'</div></li>';
                    ele += '<li class="item-amount seller-amount">'+asset.token_1_amount+'</li>';
                    ele += '<li class="arrow arrow_up"><img src="./up.72e2edee.png" /></li>';
                    const first_part = asset.buyer.slice(0,5);
                    const last_part = asset.buyer.slice(-5);
                    ele += '<li data-wallet="'+asset.buyer+'" class="item-buyer">'+first_part+'...'+last_part+'</li>';
                    let has_pdf = "";
                    if(asset.token_3_details.pdf!=""){has_pdf=' data-pdf="'+asset.token_3_details.pdf+'"'; }
                    ele += '<li><img'+has_pdf+' class="item-img" src="'+asset.token_3_details.icon+'" /></li>';
                    ele += '<li data-mint="'+asset.token_3_mint+'" class="item-details"><div class="item-symbol">'+asset.token_3_details.symbol+'</div><div class="item-name">'+asset.token_3_details.name+'</div></li>';
                    ele += '<li class="item-amount buyer-amount">'+asset.token_3_amount+'</li>';
                    ele += '<li class="arrow arrow_down"><img src="./down.8b892579.png" /></li>';
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
                    ele += '</ul>';
                    $("#sent-view .panel-list").prepend(ele);
                }
                displayed.push(asset.acct);
            }
            i++;
            if(i==splSent.data.length){
                await backcheck("sent",displayed);
                $("#sent-refresh").removeClass("spin");
            }
        }
    }
    catch(err){
        $("#sent-refresh").removeClass("spin");
    }
}
// load received
async function load_received(){
    try{
        if(!window.mcswap || !window.mcswap.publicKey){
            toast("Connect wallet",2000);
            return;
        }
        $("#received-refresh").addClass("spin");
        const splReceived = await mcswap.splReceived({
            rpc: rpc,
            display: true,
            private: true,
            wallet: window.mcswap.publicKey.toString()
        });
        let i = 0;
        splReceived.data.sort((a,b) => (a.utime > b.utime) ? 1 : ((b.utime > a.utime) ? -1 : 0));
        if(!splReceived || !splReceived.data || splReceived.data.length==0){
            $("#received-refresh").removeClass("spin");
        }
        const displayed = [];
        while(i < splReceived.data.length){
            const asset = splReceived.data[i];
            if(asset_mints.includes(asset.token_1_mint)){
                if(!$('#received-'+asset.acct).length){
                    asset.token_1_details = await asset_map(asset_list,asset.token_1_mint);
                    const merged = token_list.concat(asset_list);
                    asset.token_3_details = await asset_map(merged,asset.token_3_mint);
                    let ele = '<ul id="received-'+asset.acct+'" class="row">';
                    ele += '<li><img data-pdf="'+asset.token_1_details.pdf+'" class="item-img" src="'+asset.token_1_details.icon+'" /></li>';
                    ele += '<li data-mint="'+asset.token_1_mint+'" class="item-details"><div class="item-symbol">'+asset.token_1_details.symbol+'</div><div class="item-name">'+asset.token_1_details.name+'</div></li>';
                    ele += '<li class="item-amount seller-amount">'+asset.token_1_amount+'</li>';
                    ele += '<li class="arrow arrow_down"><img src="./down.8b892579.png" /></li>';
                    const first_part = asset.seller.slice(0,5);
                    const last_part = asset.seller.slice(-5);
                    ele += '<li data-wallet="'+asset.seller+'" class="item-buyer">'+first_part+'...'+last_part+'</li>';
                    let has_pdf = "";
                    if(asset.token_3_details.pdf!=""){has_pdf=' data-pdf="'+asset.token_3_details.pdf+'"'; }
                    ele += '<li><img'+has_pdf+' class="item-img" src="'+asset.token_3_details.icon+'" /></li>';
                    ele += '<li data-mint="'+asset.token_3_mint+'" class="item-details"><div class="item-symbol">'+asset.token_3_details.symbol+'</div><div class="item-name">'+asset.token_3_details.name+'</div></li>';
                    ele += '<li class="item-amount buyer-amount">'+asset.token_3_amount+'</li>';
                    ele += '<li class="arrow arrow_up"><img src="./up.72e2edee.png" /></li>';
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
                    ele += '<li class="item-action"><button class="item-action item-authorize">Authorize</button></li>';
                    ele += '</ul>';
                    $("#received-view .panel-list").prepend(ele);
                }
                displayed.push(asset.acct);
            }
            i++;
            if(i==splReceived.data.length){
                await backcheck("received",displayed);
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
async function load_public(){
    try{
        if(!window.mcswap || !window.mcswap.publicKey){
            toast("Connect wallet",2000);
            return;
        }
        $("#market-refresh").addClass("spin");
        const user = window.mcswap.publicKey.toString();
        const splSent = await mcswap.splSent({
            rpc: rpc,
            display: true,
            private: false,
            wallet: false
        });
        if(!splSent || !splSent.data || splSent.data.length==0){
            $("#market-refresh").removeClass("spin");
        }
        splSent.data.sort((a,b) => (a.utime > b.utime) ? 1 : ((b.utime > a.utime) ? -1 : 0));
        const displayed = [];
        if(splSent.data.length==0){
            await backcheck("market",displayed);
            $("#market-refresh").removeClass("spin");
            return;
        }
        let i = 0;
        while(i < splSent.data.length){
            const asset = splSent.data[i];
            if(asset_mints.includes(asset.token_1_mint)){
                if(!$('#market-'+asset.acct).length){
                    asset.token_1_details = await asset_map(asset_list,asset.token_1_mint);
                    const merged = token_list.concat(asset_list);
                    asset.token_3_details = await asset_map(merged,asset.token_3_mint);
                    let ele = '<ul id="market-'+asset.acct+'" class="row">';
                    ele += '<li><img data-pdf="'+asset.token_1_details.pdf+'" class="item-img" src="'+asset.token_1_details.icon+'" /></li>';
                    ele += '<li data-mint="'+asset.token_1_mint+'" class="item-details"><div class="item-symbol">'+asset.token_1_details.symbol+'</div><div class="item-name">'+asset.token_1_details.name+'</div></li>';
                    ele += '<li class="item-amount seller-amount">'+asset.token_1_amount+'</li>';
                    ele += '<li class="arrow arrow_down"><img src="./down.8b892579.png" /></li>';
                    const first_part = asset.seller.slice(0,5);
                    const last_part = asset.seller.slice(-5);
                    ele += '<li data-wallet="'+asset.seller+'" class="item-buyer">'+first_part+'...'+last_part+'</li>';
                    let has_pdf = "";
                    if(asset.token_3_details.pdf!=""){has_pdf=' data-pdf="'+asset.token_3_details.pdf+'"'; }
                    ele += '<li><img'+has_pdf+' class="item-img" src="'+asset.token_3_details.icon+'" /></li>';
                    ele += '<li data-mint="'+asset.token_3_mint+'" class="item-details"><div class="item-symbol">'+asset.token_3_details.symbol+'</div><div class="item-name">'+asset.token_3_details.name+'</div></li>';
                    ele += '<li class="item-amount buyer-amount">'+asset.token_3_amount+'</li>';
                    ele += '<li class="arrow arrow_up"><img src="./up.72e2edee.png" /></li>';
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
                        ele += '<li class="item-action"><button class="item-action item-public-authorize">Authorize</button></li>';
                    }
                    ele += '</ul>';
                    $("#market-view .panel-list").prepend(ele);
                }
                displayed.push(asset.acct);
            }
            i++;
            if(i==splSent.data.length){
                await backcheck("market",displayed);
                $("#market-refresh").removeClass("spin");
                return;
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
        toast("Refreshing...",2000);
        if(id=="market-refresh"){
            await load_public();
        }
        else if(id=="sent-refresh"){
            await load_sent();
        }
        else if(id=="received-refresh"){
            await load_received();
        }
    }
    catch(err){
        toast("Refresh error", 2000);
    }
});


// line items clicks
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
        if(!isMobile()){window.open(pdf,'_blank');}
    }
});
$(document).delegate(".item-details", "click", async function(){
    const mint = $(this).attr("data-mint");
    toast("Copied chart link",3000);
    const href = "https://jup.ag/tokens/"+mint;
    copy(href);
    if(!isMobile()){window.open(href,'_blank');}
});
$(document).delegate(".item-amount", "click", async function(){
    const item = $(this).parent().attr("id");
    const parts = item.split("-");
    const view = parts[0];
    const id = parts[1];
    const amount = $(this).html();
    const symbol = $(this).prev().find(".item-symbol").html();
    if(view=="market"){
        if($(this).hasClass("seller-amount")){
            toast("Buyer receives: "+amount+" "+symbol, 3000);
        }
        else if($(this).hasClass("buyer-amount")){
            toast("Buyer sends: "+amount+" "+symbol, 3000);
        }
        copy(amount);
    }
    else if(view=="sent"){
        if($(this).hasClass("seller-amount")){
            toast("You're selling: "+amount+" "+symbol, 3000);
        }
        else if($(this).hasClass("buyer-amount")){
            toast("Buyer sends: "+amount+" "+symbol, 3000);
        }
        copy(amount);
    }
    else if(view=="received"){
        if($(this).hasClass("seller-amount")){
            toast("You receive: "+amount+" "+symbol, 3000);
        }
        else if($(this).hasClass("buyer-amount")){
            toast("You send: "+amount+" "+symbol, 3000);
        }
        copy(amount);
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
        toast("Seller: "+first_part+"..."+last_part, 3000);
        copy(wallet);
    }
    else if(view=="sent"){
        toast("Buyer: "+first_part+"..."+last_part, 3000);
        copy(wallet);
    }
    else if(view=="received"){
        toast("Seller: "+first_part+"..."+last_part, 3000);
        copy(wallet);
    }
});
$(document).delegate(".item-time", "click", async function(){
    const time = $(this).html();
    toast("Created: "+time, 3000);
    copy(time);
});
$(document).delegate(".item-cancel", "click", async function(){
    const item = $(this).parent().parent().attr("id");
    const parts = item.split("-");
    const view = parts[0];
    const escrow = parts[1];
    const seller = window.mcswap.publicKey.toString();
    $("#mcswap_cover").fadeIn(300);
    $("#mcswap_message").html("Preparing transaction...");
    const tx = await mcswap.splCancel({
        "rpc": rpc,
        "blink": false,
        "seller": seller,
        "escrow": escrow,
    });
    if(tx){
        try{
            $("#mcswap_message").html("Requesting approval...");
            const signed = await window.mcswap.signTransaction(tx).catch(async function(err){
                $("#mcswap_message").html("");
                $("#mcswap_cover").fadeOut(300);
                toast("Transaction canceled",2000);
            });
            if(!signed){return;}
            $("#mcswap_message").html("Closing escrow...");
            const signature = await mcswap.send(rpc,signed);
            console.log("signature", signature);
            console.log("awaiting status...");
            const status = await mcswap.status(rpc,signature);
            if(status!="finalized"){
                $("#mcswap_message").html("");
                $("#mcswap_cover").fadeOut(300);
                toast("Transaction failed",2000);
            }
            else{
                $("#mcswap_message").html("");
                $("#mcswap_cover").fadeOut(300);
                toast("Escrow closed",4000);
                $("#"+view+"-"+escrow).remove();
            }
        }
        catch(err){
            $("#mcswap_message").html("");
            $("#mcswap_cover").fadeOut(300);
            toast("Transaction error",2000);
        }
    }
    else{
        $("#mcswap_message").html("");
        $("#mcswap_cover").fadeOut(300);
        toast("Transaction canceled",2000);
    }
});
$(document).delegate(".item-public-authorize, .item-authorize", "click", async function(){
    const item = $(this).parent().parent().attr("id");
    const parts = item.split("-");
    const view = parts[0];
    const escrow = parts[1];
    const buyer = window.mcswap.publicKey.toString();
    $("#mcswap_cover").fadeIn(300);
    $("#mcswap_message").html("Preparing transaction...");
    const tx = await mcswap.splExecute({
        "rpc": rpc,
        "blink": false,
        "buyer": buyer,
        "escrow": escrow
    });
    if(tx.tx){
        try{
            $("#mcswap_message").html("Requesting approval...");
            const signed = await window.mcswap.signTransaction(tx.tx).catch(async function(err){
                $("#mcswap_message").html("");
                $("#mcswap_cover").fadeOut(300);
                toast("Transaction canceled",2000);
            });
            if(!signed){return;}
            $("#mcswap_message").html("Procesing trade...");
            const signature = await mcswap.send(rpc,signed);
            console.log("signature", signature);
            console.log("awaiting status...");
            const status = await mcswap.status(rpc,signature);
            if(status!="finalized"){
                $("#mcswap_message").html("");
                $("#mcswap_cover").fadeOut(300);
                toast("Transaction failed",2000);
            }
            else{
                $("#mcswap_message").html("");
                $("#mcswap_cover").fadeOut(300);
                toast("Transaction complete",4000);
                $("#"+view+"-"+escrow).remove();
            }
        }
        catch(err){
            $("#mcswap_message").html("");
            $("#mcswap_cover").fadeOut(300);
            toast("Transaction error",2000);
        }
    }
    else{
        $("#mcswap_message").html("");
        $("#mcswap_cover").fadeOut(300);
        toast("Transaction canceled",2000);
    }
});


// amounts and values
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
        toast("Invlid buyer wallet",2000);
        $("#buyer-wallet").prev().addClass("form-error");
        return;
    }
    if(!window.mcswap || !window.mcswap.publicKey){
        toast("Connect wallet",2000);
        $("#connect").click();
        return;
    }
    $("#mcswap_cover").fadeIn(300);
    $("#mcswap_message").html("Preparing transaction...");
    const amount = await balance(rpc,window.mcswap.publicKey.toString(),$("#creator-mint").val(),$("#creator-amount").attr("data-decimals"));    
    if(amount < $("#creator-amount").val()){
        $("#mcswap_cover").fadeOut(300);
        toast("Insufficient "+$("#creator-asset").html());
        $("#creator-amount").prev().addClass("form-error");
        return;
    }
    const seller = window.mcswap.publicKey.toString();
    const seller_mint = $("#creator-mint").val().trim();
    const seller_amount = $("#creator-amount").val().trim();
    let buyer = $("#buyer-wallet").val().trim();
    if(buyer=="Any"){buyer=false;}
    const buyer_mint = $("#buyer-mint").val().trim();
    const buyer_amount = $("#buyer-amount").val().trim();
    const priority = $("#payment-priority").val().trim();
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
        "sellerEmail": false
    }
    const tx = await mcswap.splCreate(config);
    if(tx.tx){
        try{
            $("#mcswap_message").html("Requesting approval...");
            const signed = await window.mcswap.signTransaction(tx.tx).catch(async function(err){
                $("#mcswap_message").html("");
                $("#mcswap_cover").fadeOut(300);
                toast("Transaction canceled",2000);
            });
            if(!signed){return;}
            $("#mcswap_message").html("Creating escrow...");
            console.log("debug");
            const signature = await mcswap.send(rpc,signed);
            console.log("signature", signature);
            console.log("awaiting status...");
            const status = await mcswap.status(rpc,signature);
            if(status!="finalized"){
                $("#mcswap_message").html("");
                $("#mcswap_cover").fadeOut(300);
                toast("Transaction failed",2000);
            }
            else{
               $("#mcswap_message").html("");
                $("#mcswap_cover").fadeOut(300);
                toast("Escrow created",4000);
                if(buyer==false){$("#market").click();}
                else{$("#sent").click();}
            }
        }
        catch(err){
            $("#mcswap_message").html("");
            $("#mcswap_cover").fadeOut(300);
            toast("Transaction error",2000);
        }
    }
    else{
        $("#mcswap_message").html("");
        $("#mcswap_cover").fadeOut(300);
        toast("Transaction canceled",2000);
    }
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


// close asset list
$("button#asset-list-close").on("click", function(){
    $("#asset-list-box").attr("data-chooser",null).removeClass("animate__slideInLeft").addClass("animate__slideOutLeft");
});
// choose asset 1
$("button#creator-asset").on("click", function(e){
    e.preventDefault();
    $("#asset-list-box").scrollTop(0);
    $("#asset-list ul:lt(3)").hide();
    $("#asset-list-box").attr("data-chooser","creator-asset").removeClass("animate__slideOutLeft").addClass("animate__slideInLeft").show();
});
// choose asset 2
$("button#buyer-asset").on("click", function(e){
    e.preventDefault();
    $("#asset-list-box").scrollTop(0);
    $("#asset-list ul:lt(3)").show();
    $("#asset-list-box").attr("data-chooser","buyer-asset").removeClass("animate__slideOutLeft").addClass("animate__slideInLeft").show();
});
// escrow type
$("#buyer-type").on("change",function(){
    if($(this).val()=="Public Listing"){
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
// validate wallet
function isValidSolanaAddress(address){
  try {
    const publicKey = new PublicKey(address);
    return PublicKey.isOnCurve(publicKey.toBytes());
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
$(window).on("load", async function(){
    const inWalletApp = await inAppBrowse();
    // toast("isMobile(): "+isMobile(), 2000);
    // toast("inWalletApp: "+inWalletApp, 2000);
    if(isMobile() && inWalletApp==false){
        $(".mcswap_connect_button").removeClass().addClass("mobile_connect_button");
        $(".mcswap_disconnect_button").removeClass().addClass("mobile_disconnect_button");
        // const authToken = localStorage.getItem('authToken');
        // if(authToken){$(".mobile_connect_button").click();}
    }
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
    asset_list.sort((a,b) => (a.symbol > b.symbol) ? 1 : ((b.symbol > a.symbol) ? -1 : 0));
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
    i=0;
    while (i < asset_list.length) {
        const asset = asset_list[i];
        const item = '<option value="'+asset.mint+'">'+asset.symbol+'</option>';
        $("#sent-filter").append(item);
        $("#received-filter").append(item);
        asset_mints.push(asset.mint);
        i++;
    }
});