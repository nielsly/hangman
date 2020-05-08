/*
*
*   This function does work, but needs a LOT of RAM for larger lists, was a bad idea.
*
*/

const regExps = {};

async function parse(size = 5) {
    const wordsArray = (await fetch('../../words/' + size + '.txt').then(x => x.text())).split('\n');

    for (let i = 0; i < wordsArray.length; i++) {
        wordsArray[i] = wordsArray[i].toUpperCase();
    }

    const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

    for (let i = 0; i < alphabet.length; i++) {
        regExps[alphabet[i]] = new RegExp('[A-Z]*' + alphabet[i].toUpperCase() + '[A-Z]*');
    }

    const dict = guess(wordsArray, alphabet);
    
    return dict;
}

function guess(inputArray, inputAlphabet, guesses = 0) {
    //initialise dictionary
    const dict = {'words': inputArray};
    
    //for each letter not guessed
    for (let i = 0; i < inputAlphabet.length; i++) {
        //initialise future words array
        const wordsArray = [];

        //remove letter from future alphabet
        const alphabet = inputAlphabet.slice();
        alphabet.splice(i, 1);
        
        //find regexp for letter
        const regExp = regExps[inputAlphabet[i]];

        //loop over all words in input array
        for (let j = 0; j < inputArray.length; j++) {
            //if they don't contain letter
            if (!regExp.test(inputArray[j])) {
                //add them to future words array
                wordsArray.push(inputArray[j]);
            }
        }

        //if future words array has elements
        if (wordsArray.length > 0 && guesses < 7) {
            //do guess for remaining words
            const result = guess(wordsArray, alphabet, guesses + 1);

            //if remaining word dictionary for letter has elements
            if (Object.keys(result).length > 0) {
                //add remaining word dictionary for letter to dictionary
                dict[inputAlphabet[i]] = result;
            }
        }
        console.log(guesses)
    }

    //return dictionary up to now
    return dict;
}