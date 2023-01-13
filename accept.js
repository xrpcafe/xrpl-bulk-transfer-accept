const xrpl = require("xrpl");
const config = require('config');
const xrplServer = config.get('XRPL_Server');
const xrp_account = config.get('Account');
const xrp_account_secret = config.get('Secret_Key');
const issuer = config.get('Transfer.Issuer');

function AcceptOffer(offer_index) {
    return {
        TransactionType: "NFTokenAcceptOffer",
        Account: xrp_account,
        NFTokenSellOffer: offer_index
    };
}

function AccountObjectsPayload(marker) {
    if (marker == undefined) {
        return {
            "command": "account_objects",
            "account": issuer,
            "ledger_index": "validated",
            "limit": 200
        }
    } else {
        return {
            "command": "account_objects",
            "account": issuer,
            "ledger_index": "validated",
            "limit": 200,
            "marker": marker
        }
    }
}

async function main() {
    const client = new xrpl.Client(xrplServer);
    await client.connect();

    let offerObjects = [];

    try {
        let marker = undefined;
        console.log('Getting offers');
        do {
            let accountObjects = await client.request(AccountObjectsPayload(marker));
            for (let i = 0; i < accountObjects.result.account_objects.length; i++) {
                if (accountObjects.result.account_objects[i].LedgerEntryType == "NFTokenOffer") {
                    if (accountObjects.result.account_objects[i].Destination != undefined &&
                        accountObjects.result.account_objects[i].Destination == xrp_account &&
                        accountObjects.result.account_objects[i].Amount == "0") {
                        offerObjects.push(accountObjects.result.account_objects[i]);
                    }
                }
            }
            marker = accountObjects.marker;
        } while (marker != undefined);
    } catch (err) {
        console.log('Error getting offers: ' + err);
    }

    console.log(offerObjects.length.toString() + ' Offers Found');
    console.log('Accepting Offers');
    try {
        const hot_wallet = xrpl.Wallet.fromSeed(xrp_account_secret);

        for (let i = 0; i < offerObjects.length; i++) {
            let acceptOfferPayload = AcceptOffer(offerObjects[i].index);
            const cst_prepared_offer = await client.autofill(acceptOfferPayload);
            const ts_signed_offer = hot_wallet.sign(cst_prepared_offer);
            const ts_result_offer = await client.submitAndWait(ts_signed_offer.tx_blob);
            if (ts_result_offer.result.meta.TransactionResult == "tesSUCCESS") {
                console.log('successfully transferred NFT: ' + offerObjects[i].NFTokenID)
            }
        }
    } catch (err) {
        console.log('Error accepting offers: ' + err);
    }

    if (client.isConnected) {
        await client.disconnect();
    }

    return;
}

main()