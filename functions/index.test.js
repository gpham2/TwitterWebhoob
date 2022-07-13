const {authNonce, authTimestamp, authSignature, displaySuccess} = require('./index.js');

/* authNonce test */
const authNonceTest = [
    7,
    100,
    -1,
    0,
    -23232,
    300,
    11,
    "some string",
    null,
    undefined,
];

authNonceTest.forEach(function(item) {
    test(`case: ${item} result: ${authNonce(item)}`, () => {
        expect(authNonce(item).length).toBe((item !== null && item > 0 && !isNaN(item)) ? item : 11);
    });
});


/* authTimestamp test */
const trials = 10;
for (let i = 0; i < trials; i++) {
    test(`case: ${i} result: ${authTimestamp()}`, () => {
        expect(authTimestamp() > 0).toBe(true);
    });
}


/* displaySuccess test */

//1
const nameList1 = [
    ['','a'], 
    ['', 'b'],
    ['','c'], 
    ['', 'd'],
    ['','e'], 
    ['', 'f'],
    ['','g'], 
    ['', 'h'],
    ['','i'], 
    ['', 'k'],
    ['', null], 
    ['', 19],
]
const success1 = [true, false, true, true, false, true, false, false, true, false, true, false]
const result1 = 'a: true | b: false | c: true | d: true | e: false | f: true | g: false | h: false | i: true | k: false | null: true | 19: false';
test(`result: ${displaySuccess(success1, nameList1)}`, () => {
    expect(displaySuccess(success1, nameList1)).toBe(result1);
});

//2
const nameList2 = [
    ['','a'], 
    ['', 'b'],
]
const success2 = [true, false, true, true, false, true, false, false, true, false, true, false]
const result2 = 'Length missmatch between followList and result';
test(`result: ${displaySuccess(success2, nameList2)}`, () => {
    expect(displaySuccess(success2, nameList2)).toBe(result2);
});

//3
const nameList3 = [
    ['','a'], 
    ['', undefined],
]
const success3 = [null, undefined]
const result3 = 'a: null | undefined: undefined';
test(`result: ${displaySuccess(success3, nameList3)}`, () => {
    expect(displaySuccess(success3, nameList3)).toBe(result3);
});

//4
const nameList4 = [
    ['',''], 
    ['',''],
]
const success4 = ['', '']
const result4 = ':  | : ';
test(`result: ${displaySuccess(success4, nameList4)}`, () => {
    expect(displaySuccess(success4, nameList4)).toBe(result4);
});

//5
const nameList5 = [
    ['', null], 
    ['', null],
]
const success5 = [null, null]
const result5 = 'null: null | null: null';
test(`result: ${displaySuccess(success5, nameList5)}`, () => {
    expect(displaySuccess(success5, nameList5)).toBe(result5);
});

//6
const nameList6 = [
    ['', undefined], 
    ['', undefined],
]
const success6 = [undefined, undefined]
const result6 = 'undefined: undefined | undefined: undefined';
test(`result: ${displaySuccess(success6, nameList6)}`, () => {
    expect(displaySuccess(success6, nameList6)).toBe(result6);
});


/* authSignature */

authSignatureTest = [
    //1
    [{
        'url': `${encodeURIComponent(`https://www.google.com/`)}`,
        'oauth_consumer_key': `theAPIkey`,
        'oauth_consumer_secret': `theAPISecret`,
        'oauth_nonce': `thenonce`,
        'oauth_signature_method': `HMAC-SHA1`,
        'oauth_timestamp': `1657731629`,
        'oauth_token': `thetoken`,
        'oauth_token_secret': `thesecret`,
        'oauth_version': `1.0`
    }, false,
    'yXAfZXy9/nk0jwgV5BvQvG/Opk4='
    ],

    //2
    [{
        'url': `${encodeURIComponent('https://www.google.com/')}`,
        'oauth_consumer_key': 'a',
    }, false,
    null
    ],

    //3
    [{
        'url': `${encodeURIComponent(`https://www.google.com/`)}`,
        'oauth_consumer_key': `theAPIkey`,
        'oauth_consumer_secret': `theAPISecret`,
        //'oauth_nonce': `thenonce`, missing
        'oauth_signature_method': `HMAC-SHA1`,
        'oauth_timestamp': `1657731629`,
        'oauth_token': `thetoken`,
        'oauth_token_secret': `thesecret`,
        'oauth_version': `1.0`
    }, false,
    null
    ],

    //4
    [{
        'url': `${encodeURIComponent(`https://www.google.com/`)}`,
        'oauth_consumer_key': `theAPIkey`,
        'oauth_consumer_secret': `theAPISecret`,
        'oauth_nonce': `thenonce`,
        'oauth_signature_method': `NOT NOT NOT HMAC-SHA1`,
        'oauth_timestamp': `1657731629`,
        'oauth_token': `thetoken`,
        'oauth_token_secret': `thesecret`,
        'oauth_version': `1.0`
    }, false,
    null
    ],

    //5
    [{
        'url': `${encodeURIComponent(`https://www.google.com/`)}`,
        'oauth_consumer_key': `theAPIkey`,
        'oauth_consumer_secret': `theAPISecret`,
        'oauth_nonce': `thenonce`,
        'oauth_signature_method': `HMAC-SHA1`,
        'oauth_timestamp': `1657731629`,
        'oauth_token': `thetoken`,
        'oauth_token_secret': `thesecret`,
        'oauth_version': `999.0`
    }, false,
    null
    ],

    
    //6
    [{
        'url': `${encodeURIComponent(`https://www.google.com/`)}`,
        'oauth_consumer_key': `theAPIkey`,
        'oauth_consumer_secret': `theAPISecret`,
        'oauth_nonce': `thenonce`,
        'oauth_signature_method': `HMAC-SHA1`,
        'oauth_timestamp': `1657731629`,
        //'oauth_token': `thetoken`,
        //'oauth_token_secret': `thesecret`,
        'oauth_version': `1.0`
    }, false,
    null
    ],

    //7
    [{
        'url': `${encodeURIComponent(`https://www.google.com/`)}`,
        'oauth_consumer_key': `theAPIkey`,
        'oauth_consumer_secret': `theAPISecret`,
        'oauth_nonce': `thenonce`,
        'oauth_signature_method': `HMAC-SHA1`,
        'oauth_timestamp': `1657731629`,
        //'oauth_token': `thetoken`,
        //'oauth_token_secret': `thesecret`,
        'oauth_version': `1.0`
    }, true,
    'DTNi0zxbfGcI4U3S1/Vp6FhUjDk='
    ],

    //8
    [{
        'url': `${encodeURIComponent(`https://www.google.com/`)}`,
        'oauth_consumer_key': `theAPIkey`,
        'oauth_consumer_secret': `theAPISecret`,
        'oauth_nonce': `thenonce`,
        'oauth_signature_method': `HMAC-SHA1`,
        'oauth_timestamp': `-4000`,
        'oauth_token': `thetoken`,
        'oauth_token_secret': `thesecret`,
        'oauth_version': `1.0`
    }, false,
    null
    ],

    //9
    [{
        'url': `${encodeURIComponent(`https://www.google.com/`)}`,
        'oauth_consumer_key': `theAPIkey`,
        'oauth_consumer_secret': `theAPISecret`,
        'oauth_nonce': `thenonce`,
        'oauth_signature_method': `HMAC-SHA1`,
        'oauth_timestamp': `abcd`,
        'oauth_token': `thetoken`,
        'oauth_token_secret': `thesecret`,
        'oauth_version': `1.0`
    }, false,
    null
    ],

    //9
    [{
        'url': null,
        'oauth_consumer_key': null,
        'oauth_consumer_secret': null,
        'oauth_nonce': null,
        'oauth_signature_method': null,
        'oauth_timestamp': null,
        'oauth_token': null,
        'oauth_token_secret': null,
        'oauth_version': null
    }, false,
    null
    ],
]

authSignatureTest.forEach(function(item) {
    test(`result: ${authSignature(item[0],item[1])}`, () => {
        expect(authSignature(item[0],item[1])).toBe(item[2]);
    });
});





