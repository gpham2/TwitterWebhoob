// http://localhost:5001/twitter-d7a18/us-central1/followC9/?username=GiangStacks

const functions = require("firebase-functions");
const axios = require("axios");
const hmacsha1 = require('hmacsha1');
const { config } = require("firebase-functions");

const {
    TWITTER_API_KEY: apiKey,
    TWITTER_API_KEY_SECRET: apiSecret,
    TWITTER_BEARER_TOKEN: bearer,
    TWITTER_TEMP_TEST_ACCESS_TOKEN: token,
    TWITTER_TEMP_TEST_ACCESS_SECRET: tokenSecret,
} = process.env;


const followList = [
    ["1414660862372028443", 'C9Stratus'], 
    ["1452520626", '@cloud9']
];


/* TODO: returns token info of user */
function getToken(id) {
    
    return {'token': token, 'tokenSecret': tokenSecret};
}


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
function authSignature(config) {

    const paramString = `oauth_consumer_key=${config.oauth_consumer_key}&` +
                        `oauth_nonce=${config.oauth_nonce}&` +
                        `oauth_signature_method=${config.oauth_signature_method}&` +
                        `oauth_timestamp=${config.oauth_timestamp}&` +
                        `oauth_token=${config.oauth_token}&` +
                        `oauth_version=${config.oauth_version}`;

    const sig_base_string = `POST&${config.url}&${encodeURIComponent(paramString)}`;
    const sig_key = `${encodeURIComponent(apiSecret)}&${config.oauth_token_secret}`;
    return hmacsha1(sig_key, sig_base_string);
}


/* retrieves user id based on twitter handle */
async function getUserId(username) {
    return ((await axios.get(`https://api.twitter.com/2/users/by/username/${username}`,
            {
                headers: {
                    'Authorization': `Bearer ${bearer}`
                }
            })
        ).data.data.id
    );

}

/* performs the follow, id and tokenInfo belong to user doing the following*/
async function follow(id, tokenInfo) {

    const success = [];
    
    for (const item of followList) {
        // generating request's timestamp and special nonce
        const timeStamp = authTimestamp();
        const nonce = authNonce();

        // configurations for signature
        const signature = encodeURIComponent(authSignature(
            {
                'url': `${encodeURIComponent(`https://api.twitter.com/2/users/${id}/following`)}`,
                'oauth_consumer_key': `${encodeURIComponent(apiKey)}`,
                'oauth_nonce': `${nonce}`,
                'oauth_signature_method': `HMAC-SHA1`,
                'oauth_timestamp': `${timeStamp}`,
                'oauth_token': `${encodeURIComponent(tokenInfo.token)}`,
                'oauth_token_secret': `${encodeURIComponent(tokenInfo.tokenSecret)}`,
                'oauth_version': `1.0`
            }        
        ));
        
        // generating header 
        const header = {
            headers: {
                'Content-Type':     'application/json',
                'Authorization':    `OAuth oauth_signature_method="HMAC-SHA1",` +
                                    `oauth_version="1.0",`                      +
                                    `oauth_token="${tokenInfo.token}",`         +
                                    `oauth_consumer_key="${apiKey}",`           +
                                    `oauth_timestamp="${timeStamp}",`           +
                                    `oauth_nonce="${nonce}",`                   +
                                    `oauth_signature="${signature}"`            
            }
        };
            
        // making request
        const follow = await axios.post(
                    `https://api.twitter.com/2/users/${id}/following`,
                    {
                        "target_user_id": `${item[0]}`
                    },
                    header
        );
        success.push(follow.data.data.following);
    };
    
    return success;
}


function displaySuccess(success) {

    const outputString = followList
        .reduce((accum, item, index) => {
            return `${accum}${index > 0 ? ' | ' : ''}${item[1]}: ${success[index]}`
        }, '');
    
    return outputString;
}

/* Webhook function */
async function followC9(request, response) {
    
    const id = await getUserId(request.query.username);
    const tokenInfo = getToken(id);
    const success = await follow(id, tokenInfo);
    const display = displaySuccess(success);
    response.send(display);
}


exports.followC9 = functions.https.onRequest(followC9);
