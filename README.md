# Create bulk NFT Transfer Offers and Accept offers on the XRPL

### Features
+ Create 0 xrp offers to a particular destination address for transferring NFTs
+ Accept all 0 xrp offers originating from an address

### Requirements

+ [NodeJs](https://nodejs.org/en/)
+ [Git](https://git-scm.com/downloads)

## Getting Started

### Open a command prompt or Powershell prompt and issue the following commands

```
git clone https://github.com/xrpcafe/xrpl-bulk-transfer-accept
```

### in the ./config directory edit the default.json file with the information about your mint.
```
{
    "XRPL_Server": "wss://s.altnet.rippletest.net:51233/",
    "Account" : "rL8RMQZhA1Wycu8AP4cNLEQRCthuwARsPs",
    "Secret_Key" : "",
    "Transfer":
    {
        "Issuer":"rL8RMQZhA1Wycu8AP4cNLEQRCthuwARsPs",
        "Taxon": 0,
        "Destination": "rse34sdZApS8CfDVNaYM41UoZ1rFDRpD5c",
        "Expiration": "2023-01-22 00:00:00"
    }
  }
  ```
1. XRPL_Server: the wss server of the public XRPL endpoint. Testnet: wss://s.altnet.rippletest.net:51233/  Main Net: wss://s1.ripple.com/    wss://xrplcluster.com/
 - Public Main Net servers: [Servers](https://xrpl.org/public-servers.html)
2. Account: Your xrp account address. [XRPL Faucet](https://xrpl.org/xrp-testnet-faucet.html)
3. Secret_Key: the family seed for your xrp address. If you activated from XUMM you'll need to convert your secret numbers to a Family seed [https://github.com/WietseWind/secret-numbers-to-family-seed](https://github.com/WietseWind/secret-numbers-to-family-seed)
 ```diff
- KEEP THIS SAFE, DO NOT SHARE!!!
```
4. Issuer: the issuer of the NFTs minted (when running transfer.js it should be the same the Account property)
5. Taxon: Taxon of the NFTs to be transferred.
6. Destination: destination xrp address to where you want to send NFTs
7. Expiration: Expiration for the transfer offers in UTC time format YYYY-MM-DD HH:MM:SS (leave as an empty string for no expiration)

### Install
``` npm install ``` 

### Run Bulk Transfer
``` node transfer.js ``` 

### Accept Transfers

1. Swap out both Account and Secret_Key in the config with the destination address of the account you are sending the NFTs to.
2. Make sure the Issuer property in the config is the address of the originator of the transfer offers.

``` node accept.js ``` 


