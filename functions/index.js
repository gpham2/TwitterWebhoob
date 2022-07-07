// http://localhost:5001/twitter-d7a18/us-central1/followC9/?username=GiangStacks

const functions = require("firebase-functions");
const axios = require("axios");
//const DateTime = require('datetime-js');
const hmacsha1 = require('hmacsha1');
const { config } = require("firebase-functions");
const {
    TWITTER_API_KEY: apiKey,
    TWITTER_API_KEY_SECRET: apiSecret,
    TWITTER_BEARER_TOKEN: bearer,
    TWITTER_TEMP_TEST_ACCESS_TOKEN: token,
    TWITTER_TEMP_TEST_ACCESS_SECRET: tokenSecret,
} = process.env;


/* generates oauth_nonce of some length */
function authNonce(length = 11) {

    let res = '';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const listLength = chars.length;
    for (let i = 0; i < length; i++) {
        res += chars.charAt(Math.floor(Math.random() * listLength));
    }
    return res;
}


/* generates oauth_timestamp */
function authTimestamp() {
    return (Date.now() / 1000 | 0).toString();
}


/* generates oath_signature */
// use this https://developer.twitter.com/en/docs/authentication/oauth-1-0a/creating-a-signature
// ??????? this thing so complicated ???? so much room for mistakes, not sure if this is right
function authSignature(config) {

    const paramString = `oauth_consumer_key=${config.oauth_consumer_key}&oauth_nonce=${config.oauth_nonce}&oauth_signature_method=${config.oauth_signature_method}&oauth_timestamp=${config.oauth_timestamp}&oauth_token=${config.oauth_token}&oauth_version=${config.oauth_version}`;
    const sig_base_string = `POST&${config.url}&${encodeURIComponent(paramString)}`;
    const sig_key = `${encodeURIComponent(apiSecret)}&${encodeURIComponent(tokenSecret)}`;
    const hash = hmacsha1(sig_key, sig_base_string);
    //const encoded = btoa(hash);
    const encoded = hash.toString();
    return encoded;




}

/* Webhook function */
async function followC9(request, response) {
    
    // Turning username into id
    const username = request.query.username;
    const id = 
            (await axios.get(
                `https://api.twitter.com/2/users/by/username/${username}`,
                {
                    headers: {
                        'Authorization': `Bearer ${bearer}`
                    }
                })
            ).data.data.id;
    



    const timeStamp = authTimestamp();
    const nonce = authNonce();


    // ???? idk
    const sigConfig = {
        'url': `${encodeURIComponent(`https://api.twitter.com/2/users/by/username/${username}`)}`,
        'oauth_consumer_key': `${encodeURIComponent(apiKey)}`,
        'oauth_nonce': `${nonce}`,
        'oauth_signature_method': `HMAC-SHA1`,
        'oauth_timestamp': `${timeStamp}`,
        'oauth_token': `${encodeURIComponent(token)}`,
        'oauth_version': `1.0`
    }


    const signature = authSignature(sigConfig);
    // following C9 and C9 Stratus
    const follow = await axios.post(
                `https://api.twitter.com/2/users/${id}/following`,
                {
                    "target_user_id": "1414660862372028443"
                },
                {
                    headers: {
                        'Authorization':
                            `OAuth oauth_consumer_key="${apiKey}", oauth_token="${token}", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timeStamp}", oauth_nonce="${nonce}", oauth_version="1.0", oauth_signature="${signature}"`
                    }
                });
                       
            
    //response.send(follow.data);

    response.send(authTimestamp());
    console.log(authTimestamp());
    console.log('hi');
    
}


exports.followC9 = functions.https.onRequest(followC9);
