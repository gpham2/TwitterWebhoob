const {authNonce, authTimestamp, authSignature, displaySuccess} = require('./index.js');

/* authNonce test */
const authNonceTest = [
    7,
    100,
    -1,
    0,
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

const success = [true, false, true, true, false, true, false, false, true, false, true, false]

const result = 'a: true | b: false | c: true | d: true | e: false | f: true | g: false | h: false | i: true | k: false | null: true | 19: false';
test(`result: ${displaySuccess(success, nameList1)}`, () => {
    expect(displaySuccess(success, nameList1)).toBe(result);
});





