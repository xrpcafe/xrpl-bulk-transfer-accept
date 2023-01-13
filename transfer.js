const xrpl = require("xrpl");
const config = require('config');
const xrplServer = config.get('XRPL_Server');
const xrp_account = config.get('Account');
const xrp_account_secret = config.get('Secret_Key');
const issuer = config.get('Transfer.Issuer');
const taxon = config.get('Transfer.Taxon');
const destination = config.get('Transfer.Destination');
const expiration = config.get('Transfer.Expiration') !== "" ? xrpl.unixTimeToRippleTime(new Date(config.get('Transfer.Expiration'))) : 0;

function SellOfferTxnPayload(tokenId) {
    if(expiration != 0)
    {
        return {
            TransactionType: "NFTokenCreateOffer",
            Account: xrp_account,
            NFTokenID: tokenId,
            Amount: "0",
            Flags: xrpl.NFTokenCreateOfferFlags.tfSellNFToken,
            Expiration: expiration,
            Destination: destination
          };
    } else {
        return {
            TransactionType: "NFTokenCreateOffer",
            Account: xrp_account,
            NFTokenID: tokenId,
            Amount: "0",
            Flags: xrpl.NFTokenCreateOfferFlags.tfSellNFToken,
            Destination: destination
          };
    }   
  }

  function AccountNftTxnPayload(xrpAddress, marker){
    if(marker == undefined)
    {
      return {
        "command": "account_nfts",
        "account": xrpAddress,
        "ledger_index": "validated",
        "limit": 200
      }
    } else {
      return {
        "command": "account_nfts",
        "account": xrpAddress,
        "ledger_index": "validated",
        "limit": 200,
        "marker": marker
      }
    }
  }

async function main() {
     const client = new xrpl.Client(xrplServer);
     await client.connect();

     let account_nfts = [];

     try{
     let marker = undefined;
     console.log('Getting Account NFTs');
     do {
        let nfts = await client.request(AccountNftTxnPayload(xrp_account,marker));
        if(nfts.result.account_nfts != undefined && nfts.result.account_nfts.length > 0)
        {
            for(let i = 0; i < nfts.result.account_nfts.length; i++)
            {
                account_nfts.push(nfts.result.account_nfts[i]);
            }
        }
        marker = nfts.marker;
      } while (marker != undefined);
    } catch(err) { console.log('Error getting account nfts: ' + err);}

    const filtered_account_nfts = account_nfts.filter(obj => {return obj.Issuer == issuer && obj.NFTokenTaxon == taxon;});

    console.log(filtered_account_nfts.length.toString() + ' NFTs found on account for issuer: ' + xrp_account + ' and Taxon: ' + taxon);
    console.log('Scripting transfer offers');
    try{
        const hot_wallet = xrpl.Wallet.fromSeed(xrp_account_secret);
        for(let i = 0; i < filtered_account_nfts.length; i++)
        {
            let nft = filtered_account_nfts[i]

            console.log('Scripting transfer offer for TokenID: ' + nft.NFTokenID + ' URI: ' + xrpl.convertHexToString(nft.URI));

            let sellPayload = SellOfferTxnPayload(nft.NFTokenID);
            const cst_prepared_offer = await client.autofill(sellPayload)
            const ts_signed_offer = hot_wallet.sign(cst_prepared_offer)
            const ts_result_offer = await client.submitAndWait(ts_signed_offer.tx_blob)
            if (ts_result_offer.result.meta.TransactionResult == "tesSUCCESS") {
                       console.log('transfer offer success')
             }
        }

    } catch(err) { console.log('Error scripting transfer offers: ' + err);}

    if(client.isConnected) {await client.disconnect();}

    return;
  }

  main()