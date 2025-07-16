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
        decimals: 8,
        gecko: "abbvie-xstock"
    },
    {
        name: "Accenture xStock",
        symbol: "ACNx",
        mint: "Xs5UJzmCRQ8DWZjskExdSQDnbE6iLkRu2jjrRAB1JSU",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c0b0e15af8be8257db52f_Ticker%3DACN%2C%20Company%20Name%3Daccenture%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-ACNx.pdf",
        decimals: 8,
        gecko: "accenture-xstock"
    },
    {
        name: "Alphabet xStock",
        symbol: "GOOGLx",
        mint: "XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684aae04a3d8452e0ae4bad8_Ticker%3DGOOG%2C%20Company%20Name%3DAlphabet%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-GOOGLx.pdf",
        decimals: 8,
        gecko: "alphabet-xstock"
    },
    {
        name: "Amazon xStock",
        symbol: "AMZNx",
        mint: "Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/68497d354d7140b01657a793_Ticker%3DAMZN%2C%20Company%20Name%3DAmazon.com%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-AMZNx.pdf",
        decimals: 8,
        gecko: "amazon-xstock"
    },
    {
        name: "Amber xStock",
        symbol: "AMBRx",
        mint: "XsaQTCgebC2KPbf27KUhdv5JFvHhQ4GDAPURwrEhAzb",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/68652e463fd5d0c86d866c65_AMBRx.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-AMBRx.pdf",
        decimals: 8,
        gecko: "amber-xstock"
    },
    {
        name: "Apple xStock",
        symbol: "AAPLx",
        mint: "XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/6849799260ee65bf38841f90_Ticker%3DAAPL%2C%20Company%20Name%3DApple%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-AAPLx.pdf",
        decimals: 8,
        gecko: "apple-xstock"
    },
    {
        name: "AppLovin xStock",
        symbol: "APPx",
        mint: "XsPdAVBi8Zc1xvv53k4JcMrQaEDTgkGqKYeh7AYgPHV",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c0deccaecf631c0c174ea_Ticker%3DAPP%2C%20Company%20Name%3Dapp%20lovin%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-APPx.pdf",
        decimals: 8,
        gecko: "applovin-xstock"
    },
    {
        name: "AstraZeneca xStock",
        symbol: "AZNx",
        mint: "Xs3ZFkPYT2BN7qBMqf1j1bfTeTm1rFzEFSsQ1z3wAKU",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf47b066fa1085ae953e9_Ticker%3DAZN%2C%20Company%20Name%3Dastrazeneca%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-AZNx.pdf",
        decimals: 8,
        gecko: "astrazeneca-xstock"
    },
    {
        name: "Bank of America xStock",
        symbol: "BACx",
        mint: "XswsQk4duEQmCbGzfqUUWYmi7pV7xpJ9eEmLHXCaEQP",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf5a74604b4f162fd0efd_Ticker%3DBAC%2C%20Company%20Name%3DBank%20of%20America%20Corporation%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-BACx.pdf",
        decimals: 8,
        gecko: "bank-of-america-xstock"
    },
    {
        name: "Berkshire Hathaway xStock",
        symbol: "BRK.Bx",
        mint: "Xs6B6zawENwAbWVi7w92rjazLuAr5Az59qgWKcNb45x",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684ab977b76d1a151f09c858_Ticker%3DBRK.B%2C%20Company%20Name%3Dberkshire-hathaway%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-BRK.Bx.pdf",
        decimals: 8,
        gecko: "berkshire-hathaway-xstock"
    },
    {
        name: "Broadcom xStock",
        symbol: "AVGOx",
        mint: "XsgSaSvNSqLTtFuyWPBhK9196Xb9Bbdyjj4fH3cPJGo",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684aaef288f41927892d12c1_Ticker%3DAVGO%2C%20Company%20Name%3DBroadcom%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-AVGOx.pdf",
        decimals: 8,
        gecko: "broadcom-xstock"
    },
    {
        name: "Chevron xStock",
        symbol: "CVXx",
        mint: "XsNNMt7WTNA2sV3jrb1NNfNgapxRF5i4i6GcnTRRHts",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684be50accfbb14c64319124_Ticker%3DCVX%2C%20Company%20Name%3Dchevron%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-CVXx.pdf",
        decimals: 8,
        gecko: "chevron-xstock"
    },
    {
        name: "Circle xStock",
        symbol: "CRCLx",
        mint: "XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/6861ae6944c62c8dd3a0e165_CRCLx.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-CRCLx.pdf",
        decimals: 8,
        gecko: "circle-xstock"
    },
    {
        name: "Cisco xStock",
        symbol: "CSCOx",
        mint: "Xsr3pdLQyXvDJBFgpR5nexCEZwXvigb8wbPYp4YoNFf",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bec77bfaeef7ac61f7231_Ticker%3DCSCO%2C%20Company%20Name%3DCisco%20Systems%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-CSCOx.pdf",
        decimals: 8,
        gecko: "cisco-xstock"
    },
    {
        name: "Coca-Cola xStock",
        symbol: "KOx",
        mint: "XsaBXg8dU5cPM6ehmVctMkVqoiRG2ZjMo1cyBJ3AykQ",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684beb344604b4f162f66f93_Ticker%3DCOKE%2C%20Company%20Name%3DCokeCola%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-KOx.pdf",
        decimals: 8,
        gecko: "coca-cola-xstock"
    },
    {
        name: "Coinbase xStock",
        symbol: "COINx",
        mint: "Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c131b2d6d8cbe9e61a3dc_Ticker%3DCOIN%2C%20Company%20Name%3DCoinbase%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-COINx.pdf",
        decimals: 8,
        gecko: "coinbase-xstock"
    },
    {
        name: "Comcast xStock",
        symbol: "CMCSAx",
        mint: "XsvKCaNsxg2GN8jjUmq71qukMJr7Q1c5R2Mk9P8kcS8",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bfbe3db57e5f5f6b277aa_Ticker%3DCMCSA%2C%20Company%20Name%3DComcast%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-CMCSAx.pdf",
        decimals: 8,
        gecko: "comcast-xstock"
    },
    {
        name: "CrowdStrike xStock",
        symbol: "CRWDx",
        mint: "Xs7xXqkcK7K8urEqGg52SECi79dRp2cEKKuYjUePYDw",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c10fbaf9d90e3d974ae23_Ticker%3DCRWD%2C%20Company%20Name%3DCrowdstrike%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-CRWDx.pdf",
        decimals: 8,
        gecko: "crowdstrike-xstock"
    },
    {
        name: "Danaher xStock",
        symbol: "DHRx",
        mint: "Xseo8tgCZfkHxWS9xbFYeKFyMSbWEvZGFV1Gh53GtCV",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bfa59ce8102ff96cee2fe_Ticker%3DDHR%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-DHRx.pdf",
        decimals: 8,
        gecko: "danaher-xstock"
    },
    {
        name: "DFDV xStock",
        symbol: "DFDVx",
        mint: "Xs2yquAgsHByNzx68WJC55WHjHBvG9JsMB7CWjTLyPy",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/6861b8b7beb9cf856e2332d5_DFDVx.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-DFDVx.pdf",
        decimals: 8,
        gecko: "dfdv-xstock"
    },
    {
        name: "Eli Lilly xStock",
        symbol: "LLYx",
        mint: "Xsnuv4omNoHozR6EEW5mXkw8Nrny5rB3jVfLqi6gKMH",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684ad0eaa9a1efe9b1b7155a_Ticker%3DLLY%2C%20Company%20Name%3DLilly%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-LLYx.pdf",
        decimals: 8,
        gecko: "eli-lilly-xstock"
    },
    {
        name: "Exxon Mobil xStock",
        symbol: "XOMx",
        mint: "XsaHND8sHyfMfsWPj6kSdd5VwvCayZvjYgKmmcNL5qh",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684abe960ee12e238c0a1f0b_Ticker%3DXOM%2C%20Company%20Name%3DExxonMobil%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-XOMx.pdf",
        decimals: 8,
        gecko: "exxon-mobil-xstock"
    },
    {
        name: "Gamestop xStock",
        symbol: "GMEx",
        mint: "Xsf9mBktVB9BSU5kf4nHxPq5hCBJ2j2ui3ecFGxPRGc",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c125f1c48a3dab4c66137_Ticker%3DGME%2C%20Company%20Name%3Dgamestop%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-GMEx.pdf",
        decimals: 8,
        gecko: "gamestop-xstock"
    },
    {
        name: "Gold xStock",
        symbol: "GLDx",
        mint: "Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/685123a7747987b071b10d47_Ticker%3DGLD%2C%20Company%20Name%3DGold%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-GSx.pdf",
        decimals: 8,
        gecko: "gold-xstock"
    },
    {
        name: "Goldman Sachs xStock",
        symbol: "GSx",
        mint: "XsgaUyp4jd1fNBCxgtTKkW64xnnhQcvgaxzsbAq5ZD1",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c114972ed2d868a1b3f95_Ticker%3DGS%2C%20Company%20Name%3DGoldman%20Sachs%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-GSx.pdf",
        decimals: 8,
        gecko: "goldman-sachs-xstock"
    },
    {
        name: "Home Depot xStock",
        symbol: "HDx",
        mint: "XszjVtyhowGjSC5odCqBpW1CtXXwXjYokymrk7fGKD3",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684be484171c0a11201e098d_Ticker%3DHD%2C%20Company%20Name%3DHome%20Depot%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-HDx.pdf",
        decimals: 8,
        gecko: "home-depot-xstock"
    },
    {
        name: "Honeywell xStock",
        symbol: "HONx",
        mint: "XsRbLZthfABAPAfumWNEJhPyiKDW6TvDVeAeW7oKqA2",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c08d12385ea1da806a5bb_Ticker%3DHON%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-HONx.pdf",
        decimals: 8,
        gecko: "honeywell-xstock"
    },
    {
        name: "Intel xStock",
        symbol: "INTCx",
        mint: "XshPgPdXFRWB8tP1j82rebb2Q9rPgGX37RuqzohmArM",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c0a334cac334b4a41651b_Ticker%3DINTC%2C%20Company%20Name%3DIntel%20Corp%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-INTCx.pdf",
        decimals: 8,
        gecko: "intel-xstock"
    },
    {
        name: "International Business Machines",
        symbol: "IBMx",
        mint: "XspwhyYPdWVM8XBHZnpS9hgyag9MKjLRyE3tVfmCbSr",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bfb32f7000e98d733283f_Ticker%3DIBM%2C%20Company%20Name%3DIBM%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-IBMx.pdf",
        decimals: 8,
        gecko: "international-business-machines-xstock"
    },
    {
        name: "Johnson & Johnson xStock",
        symbol: "JNJx",
        mint: "XsGVi5eo1Dh2zUpic4qACcjuWGjNv8GCt3dm5XcX6Dn",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684ace98941130a24503a315_Ticker%3DJNJ%2C%20Company%20Name%3Djohnson-johnson%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-JNJx.pdf",
        decimals: 8,
        gecko: "johnson-johnson-xstock"
    },
    {
        name: "JPMorgan Chase xStock",
        symbol: "JPMx",
        mint: "XsMAqkcKsUewDrzVkait4e5u4y8REgtyS7jWgCpLV2C",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684acf34c10a7e0add155c61_Ticker%3DJPM%2C%20Company%20Name%3DJPMorganChase%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-JPMx.pdf",
        decimals: 8,
        gecko: "jpmorgan-chase-xstock"
    },
    {
        name: "Linde xStock",
        symbol: "LINx",
        mint: "XsSr8anD1hkvNMu8XQiVcmiaTP7XGvYu7Q58LdmtE8Z",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf2b1132313f4529a3160_Ticker%3DLIN%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-LINx.pdf",
        decimals: 8,
        gecko: "linde-xstock"
    },
    {
        name: "Marvell xStock",
        symbol: "MRVLx",
        mint: "XsuxRGDzbLjnJ72v74b7p9VY6N66uYgTCyfwwRjVCJA",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c0eb412d3850c2c01cd29_Ticker%3DMRVL%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-MRVLx.pdf",
        decimals: 8,
        gecko: "marvell-xstock"
    },
    {
        name: "Mastercard xStock",
        symbol: "MAx",
        mint: "XsApJFV9MAktqnAc6jqzsHVujxkGm9xcSUffaBoYLKC",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684ad1ca13c7aaa9ece4cbbf_Ticker%3DMA%2C%20Company%20Name%3DMastercard%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-MAx.pdf",
        decimals: 8,
        gecko: "mastercard-xstock"
    },
    {
        name: "McDonald's xStock",
        symbol: "MCDx",
        mint: "XsqE9cRRpzxcGKDXj1BJ7Xmg4GRhZoyY1KpmGSxAWT2",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf77838b45bb94ff32be7_Ticker%3DMCD%2C%20Company%20Name%3DMcDonalds%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-MCDx.pdf",
        decimals: 8,
        gecko: "mcdonald-s-xstock"
    },
    {
        name: "Medtronic xStock",
        symbol: "MDTx",
        mint: "XsDgw22qRLTv5Uwuzn6T63cW69exG41T6gwQhEK22u2",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bfc99a86580de629510e9_Ticker%3DMDT%2C%20Company%20Name%3DMedtronic%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-MDTx.pdf",
        decimals: 8,
        gecko: "medtronic-xstock"
    },
    {
        name: "Merck xStock",
        symbol: "MRKx",
        mint: "XsnQnU7AdbRZYe2akqqpibDdXjkieGFfSkbkjX1Sd1X",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684be6ff5bd0a5643adf85ec_Ticker%3DMRK%2C%20Company%20Name%3DMerck%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-MRKx.pdf",
        decimals: 8,
        gecko: "merck-xstock"
    },
    {
        name: "Meta xStock",
        symbol: "METAx",
        mint: "Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/68497dee3db1bae97b91ac05_Ticker%3DMETA%2C%20Company%20Name%3DMeta%20Platforms%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-METAx.pdf",
        decimals: 8,
        gecko: "meta-xstock"
    },
    {
        name: "Microsoft xStock",
        symbol: "MSFTx",
        mint: "XspzcW1PRtgf6Wj92HCiZdjzKCyFekVD8P5Ueh3dRMX",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/68497bdc918924ea97fd8211_Ticker%3DMSFT%2C%20Company%20Name%3DMicrosoft%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-MSFTx.pdf",
        decimals: 8,
        gecko: "microsoft-xstock"
    },
    {
        name: "MicroStrategy xStock",
        symbol: "MSTRx",
        mint: "XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c0d47eee3a9c3fa12475a_Ticker%3DMSTR%2C%20Company%20Name%3DMicroStrategy%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-MSTRx.pdf",
        decimals: 8,
        gecko: "microstrategy-xstock"
    },
    {
        name: "Nasdaq xStock",
        symbol: "QQQx",
        mint: "Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/68511cb6e367f19f06664527_QQQx.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-QQQx.pdf",
        decimals: 8,
        gecko: "nasdaq-xstock"
    },
    {
        name: "Netflix xStock",
        symbol: "NFLXx",
        mint: "XsEH7wWfJJu2ZT3UCFeVfALnVA6CP5ur7Ee11KmzVpL",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf6c149d917d503f6cda6_Ticker%3DNFLX%2C%20Company%20Name%3DNetflix%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-NFLXx.pdf",
        decimals: 8,
        gecko: "netflix-xstock"
    },
    {
        name: "Novo Nordisk xStock",
        symbol: "NVOx",
        mint: "XsfAzPzYrYjd4Dpa9BU3cusBsvWfVB9gBcyGC87S57n",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf139788d618501b65727_Ticker%3DNOVO_B%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-NVOx.pdf",
        decimals: 8,
        gecko: "novo-nordisk-xstock"
    },
    {
        name: "NVIDIA xStock",
        symbol: "NVDAx",
        mint: "Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684961bfb45e3c4d777b9997_Ticker%3DNVDA%2C%20Company%20Name%3DNVIDIA%20Corp%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-NVDAx.pdf",
        decimals: 8,
        gecko: "nvidia-xstock"
    },
    {
        name: "Oracle xStock",
        symbol: "ORCLx",
        mint: "XsjFwUPiLofddX5cWFHW35GCbXcSu1BCUGfxoQAQjeL",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf1ecae4eb4a817da9941_Ticker%3DORCL%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-ORCLx.pdf",
        decimals: 8,
        gecko: "oracle-xstock"
    },
    {
        name: "Palantir xStock",
        symbol: "PLTRx",
        mint: "XsoBhf2ufR8fTyNSjqfU71DYGaE6Z3SUGAidpzriAA4",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c0c4c0e5466272c52958b_Ticker%3DPLTR%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-PLTRx.pdf",
        decimals: 8,
        gecko: "palantir-xstock"
    },
    {
        name: "PepsiCo xStock",
        symbol: "PEPx",
        mint: "Xsv99frTRUeornyvCfvhnDesQDWuvns1M852Pez91vF",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684be8662b90a208c5d5b8e5_Ticker%3DPEP%2C%20Company%20Name%3DPepsico%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-PEPx.pdf",
        decimals: 8,
        gecko: "pepsico-xstock"
    },
    {
        name: "Pfizer xStock",
        symbol: "PFEx",
        mint: "XsAtbqkAP1HJxy7hFDeq7ok6yM43DQ9mQ1Rh861X8rw",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684be5e3c54ff3f5c6c9b36f_Ticker%3DPFE%2C%20Company%20Name%3Dpfizer%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-PFEx.pdf",
        decimals: 8,
        gecko: "pfizer-xstock"
    },
    {
        name: "Philip Morris xStock",
        symbol: "PMx",
        mint: "Xsba6tUnSjDae2VcopDB6FGGDaxRrewFCDa5hKn5vT3",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c0981cbec78a581a6bfe7_Ticker%3DPM%2C%20Company%20Name%3Dphilip%20morris%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-PMx.pdf",
        decimals: 8,
        gecko: "philip-morris-xstock"
    },
    {
        name: "Procter & Gamble xStock",
        symbol: "PGx",
        mint: "XsYdjDjNUygZ7yGKfQaB6TxLh2gC6RRjzLtLAGJrhzV",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684be3c6fa6a62fb260a51e3_Ticker%3DPG%2C%20Company%20Name%3DProctor%20%26%20Gamble%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-PGx.pdf",
        decimals: 8,
        gecko: "procter-gamble-xstock"
    },
    {
        name: "Robinhood xStock",
        symbol: "HOODx",
        mint: "XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684c0f39cede10b9afa4852f_Ticker%3DHOOD%2C%20Company%20Name%3DRobinhood%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-HOODx.pdf",
        decimals: 8,
        gecko: "robinhood-xstock"
    },
    {
        name: "Salesforce xStock",
        symbol: "CRMx",
        mint: "XsczbcQ3zfcgAEt9qHQES8pxKAVG5rujPSHQEXi4kaN",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf3670e24ef4c92a6a7fc_Ticker%3DCRM%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-CRMx.pdf",
        decimals: 8,
        gecko: "salesforce-xstock"
    },
    {
        name: "SP500 xStock",
        symbol: "SPYx",
        mint: "XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/685116624ae31d5ceb724895_Ticker%3DSPX%2C%20Company%20Name%3DSP500%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-SPYx.pdf",
        decimals: 8,
        gecko: "sp500-xstock"
    },
    {
        name: "Tesla xStock",
        symbol: "TSLAx",
        mint: "XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684aaf9559b2312c162731f5_Ticker%3DTSLA%2C%20Company%20Name%3DTesla%20Inc.%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-TSLAx.pdf",
        decimals: 8,
        gecko: "tesla-xstock"
    },
    {
        name: "Thermo Fisher xStock",
        symbol: "TMOx",
        mint: "Xs8drBWy3Sd5QY3aifG9kt9KFs2K3PGZmx7jWrsrk57",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bf4d930b0fdc50503056d_Ticker%3DTMO%2C%20Company%20Name%3DThermo_Fisher_Scientific%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-TMOx.pdf",
        decimals: 8,
        gecko: "thermo-fisher-xstock"
    },
    {
        name: "TQQQ xStock",
        symbol: "TQQQx",
        mint: "XsjQP3iMAaQ3kQScQKthQpx9ALRbjKAjQtHg6TFomoc",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/685125548a5829b9b59a6156_TQQQx.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-TQQQx.pdf",
        decimals: 8,
        gecko: "tqqq-xstock"
    },
    {
        name: "UnitedHealth xStock",
        symbol: "UNHx",
        mint: "XszvaiXGPwvk2nwb3o9C1CX4K6zH8sez11E6uyup6fe",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684abb4c69185d8a871e2ab5_Ticker%3DUNH%2C%20Company%20Name%3DUnited%20Health%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-UNHx.pdf",
        decimals: 8,
        gecko: "unitedhealth-xstock"
    },
    {
        name: "Vanguard xStock",
        symbol: "VTIx",
        mint: "XsssYEQjzxBCFgvYFFNuhJFBeHNdLWYeUSP8F45cDr9",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/68511e335ee1314f602d9a7c_Ticker%3DVTI%2C%20Company%20Name%3DVanguard%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-VTIx.pdf",
        decimals: 8,
        gecko: "vanguard-xstock"
    },
    {
        name: "Visa xStock",
        symbol: "Vx",
        mint: "XsqgsbXwWogGJsNcVZ3TyVouy2MbTkfCFhCGGGcQZ2p",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684acfd76eb8395c6d1d2210_Ticker%3DV%2C%20Company%20Name%3DVisa%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-Vx.pdf",
        decimals: 8,
        gecko: "visa-xstock"
    },
    {
        name: "Walmart xStock",
        symbol: "WMTx",
        mint: "Xs151QeqTCiuKtinzfRATnUESM2xTU6V9Wy8Vy538ci",
        icon: "https://cdn.prod.website-files.com/655f3efc4be468487052e35a/684bebd366d5089b2da3cf7e_Ticker%3DWMT%2C%20Company%20Name%3DWalmart%2C%20size%3D256x256.svg",
        pdf: "https://documents.backed.fi/backed-assets-factsheet-WMTx.pdf",
        decimals: 8,
        gecko: "walmart-xstock"
    }
];
export default asset_list;