// redirect:    http://localhost:5001/twitter-d7a18/us-central1/followC9/
// main:        http://localhost:5001/twitter-d7a18/us-central1/authorization/?username=GiangStacksC9

const functions = require("firebase-functions");
const axios = require("axios");
const hmacsha1 = require('hmacsha1');
const open = require('open');
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

const preSetList = [
    ['GiangStacks', token, tokenSecret],
]

var userName = '';

//const callBackURL = "http://localhost:5001/twitter-d7a18/us-central1/authorization/";

/* TODO: returns token info of user */
async function getToken(stepToken, verifier) {
    
    // making request
    try {
        const accessResult  = (await axios.post(
            `https://api.twitter.com/oauth/access_token/?oauth_token=${stepToken}&oauth_verifier=${verifier}`
        )).data.toString().split('&');
        
        const tokenInfo = ({
            'token'         : `${accessResult[0].substring(12)}`,
            'tokenSecret'   : `${accessResult[1].substring(19)}`,
            'id'            : `${accessResult[2].substring(8)}`,
            'name'          : `${accessResult[3].substring(12)}`,
            'success'       : `true`,
        });

        return tokenInfo;
    } catch {
        return {'success':'false'};
    }
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
function authSignature(config, requestToken = false) {

    const paramString = `oauth_consumer_key=${config.oauth_consumer_key}&`                      +
                        `oauth_nonce=${config.oauth_nonce}&`                                    +
                        `oauth_signature_method=${config.oauth_signature_method}&`              +
                        `oauth_timestamp=${config.oauth_timestamp}&`                            +
                        `${requestToken ? "" : ('oauth_token=' + config.oauth_token) + '&'}`    +
                        `oauth_version=${config.oauth_version}`

    const sig_base_string = `POST&${config.url}&${encodeURIComponent(paramString)}`;
    const sig_key = `${encodeURIComponent(apiSecret)}&${requestToken ? '' : config.oauth_token_secret}`;
    return hmacsha1(sig_key, sig_base_string);
}


/* retrieves user id based on twitter handle */
async function getUserId(username) {
    try {
        return ((await axios.get(`https://api.twitter.com/2/users/by/username/${username}`,
                {
                    headers: {
                        'Authorization': `Bearer ${bearer}`
                    }
                })
            ).data.data.id
        );
    } catch {
        return "invalid";
    }
}

/* performs the follow, id and tokenInfo belong to user doing the following*/
async function follow(tokenInfo) {

    const success = [];
    
    for (const item of followList) {
        // generating request's timestamp and special nonce
        const timeStamp = authTimestamp();
        const nonce = authNonce();

        // configurations for signature
        const signature = encodeURIComponent(authSignature(
            {
                'url': `${encodeURIComponent(`https://api.twitter.com/2/users/${tokenInfo.id}/following`)}`,
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
        try {
            const follow = await axios.post(
                        `https://api.twitter.com/2/users/${tokenInfo.id}/following`,
                        {
                            "target_user_id": `${item[0]}`
                        },
                        header
            );
            success.push(follow.data.data.following);
        } catch {
            return null;
        }
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


/* part 1 - get request token */
async function getRequestToken() {
    
    const timeStamp = authTimestamp();
    const nonce = authNonce();

    // configurations for signature
    const signature = encodeURIComponent(authSignature(
        {
            'url': `${encodeURIComponent(`https://api.twitter.com/oauth/request_token/`)}`,
            'oauth_consumer_key': `${encodeURIComponent(apiKey)}`,
            'oauth_nonce': `${nonce}`,
            'oauth_signature_method': `HMAC-SHA1`,
            'oauth_timestamp': `${timeStamp}`,
            'oauth_version': `1.0`
        },
        true        
    ));

    // header generation
    const header = {
        headers: {
            'Content-Type':     'application/json',
            'Authorization':    `OAuth oauth_signature_method="HMAC-SHA1",` +
                                `oauth_version="1.0",`                      +
                                `oauth_consumer_key="${apiKey}",`           + 
                                `oauth_timestamp="${timeStamp}",`           +
                                `oauth_nonce="${nonce}",`                   +
                                `oauth_signature="${signature}"`            
        }
    };

    // making request
    try {
        const requestToken  = (await axios.post(
            'https://api.twitter.com/oauth/request_token/',
            {},
            header,
        )).data.toString().split('&');
        
        //return requestToken;
        return ({
            'token'  : `${requestToken[0].substring(12)}`,
            'secret' : `${requestToken[1].substring(19)}`,
            'success': `${requestToken[2].substring(25)}`,
        });
    } catch {
        return {'success':'false'};
    }
}


/* part 2 - get authorization */
async function tokenAuthorize(requestToken, username) {

    // making request to login page
    const url = `https://api.twitter.com/oauth/authenticate/?oauth_token=${requestToken.token}&oauth_token_secret=${requestToken.secret}&screen_name=${username}`;
    try {
        open(url, '_blank');
        return 'true'

    } catch {
        return 'false';
    }
}
/* Webhook function: does the following */
async function followC9(request, response) {

    const tokenInfo = await getToken(request.query.oauth_token, request.query.oauth_verifier);
    if(tokenInfo.success === 'false') response.send(`Wrong step 2 token, wrong step 2 verifier, or mismatching username or id`);

    const success = await follow(tokenInfo);
    if (success === null) response.send('Follow request went wrong');

    response.send(displaySuccess(success));
}


/* Webhook function: access token authorization */
async function authorization(request, response) {
    
    const username = request.query.username;

    for (const item of preSetList) {
        if (item[0] === username) {
            const id = await getUserId(username);
            if (id === 'invalid') response.send(`${username} is an invalid Twitter Handle`);
            const tokenInfo = ({
                'token'         : `${item[1]}`,
                'tokenSecret'   : `${item[2]}`,
                'id'            : `${id}`,
                'name'          : `${username}`,
                'success'       : `true`,
            });

            const success = await follow(tokenInfo);
            if (success === null) response.send('Follow request went wrong');
            response.send(displaySuccess(success));
            return;
        }
    }

    const requestToken = await getRequestToken();
    if (requestToken.success === 'false') response.send('Failed to get request token');

    const authorize = await tokenAuthorize(requestToken, username);
    if (authorize === 'false') response.send('Failed to get token app authorization');
    response.send('Redirected');
}


exports.followC9 = functions.https.onRequest(followC9);
exports.authorization = functions.https.onRequest(authorization);
