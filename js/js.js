//initialise global variable which will hold the hangman game once DOM content loads
let hm;

/*
* Class Hangman
* create hangman game
* created by Niels Gorter in 2020
* https://github.com/nielsly/hangman
*/
class ClassHangman {
    /*
    * Constructor method
    * creates non-regenerated hangman game elements, sets image mode, language variables, wins, losses, resets and runs setup
    */
    constructor() {
        //make reference to this for functions which override this
        const hangman = this;

        //create container element which will hold all hangman game elements
        this.container = document.createElement('div');

        //TODO: implement image mode
        //TOOD: implement animations
        //set mode to textMode
        this.imageMode = false;

        //TODO: implement different languages
        //set language to Dutch (English = false)
        this.en = false;

        //set language variable for file extensions
        this.extension = this.en ? 'en/' : 'nl/';

        //add blank line
        this.container.appendChild(document.createElement('br'));

        //create title element and set its text according to language, then add it to the game container
        const title = document.createElement('h1');
        title.innerHTML = (this.en ? "Hangman" : "Galgje");
        this.container.appendChild(title);

        //add blank line
        this.container.appendChild(document.createElement('br'));

        //create tries selector element
        this.tries = document.createElement('select');

        //for amount of tries in [14,13,...,1]
        for (let i = 14; i > 0; i--) {
            //create option element and set its value to the amount of tries
            const option = document.createElement('option');
            option.value = i;

            //if amount of tries is not 1 make option element text the amount of tries and the word 'tries' plural
            //else make option element text the amount of tries and the word 'try' singular
            if (i !== 1) {
                option.innerHTML = i + (this.en ? ' tries' : ' kansen');
            } else {
                option.innerHTML = (this.en ? '1 try' : '1 kans');
            }

            //add option element to tries selector element
            this.tries.appendChild(option);
        }

        //make the option element for amount of tries = 10 selected
        this.tries.children[4].selected = true;

        //any time a different option in the tries selector element is picked, reset the game
        this.tries.onchange = function () {
            hangman.reset();
        }

        //add the tries selector element to the container element
        this.container.appendChild(this.tries);

        //create input checkbox element for the 'AI may cheat' toggle and make it checked
        this.cheating = document.createElement('input');
        this.cheating.type = 'checkbox';
        this.cheating.checked = true;
        this.cheating.id = 'cheating';

        //any time the 'AI may cheat' toggle is clicked, reset the game
        this.cheating.onclick = function () {
            hangman.reset();
        }

        //add the input checkbox element for the 'AI may cheat' toggle to the game container
        this.container.appendChild(this.cheating);

        //create label element for the 'AI may cheat' toggle and set its text according to language,
        //link it to the input checkbox element besides it and then add it to the game container
        const label = document.createElement('label');
        label.innerHTML = (this.en ? 'AI may cheat' : 'AI mag valsspelen');
        label.setAttribute('for', 'cheating');
        this.container.appendChild(label);

        //add blank line
        this.container.appendChild(document.createElement('br'));

        //create container element for holding the input buttons
        this.input = document.createElement('div');

        //create alphabet string in qwerty order, for use in the input buttons
        const alphabet = 'qwertyuiopasdfghjklzxcvbnm';

        //loop over all letters in the alphabet string
        for (let i = 0; i < alphabet.length; i++) {
            //create input button element and set its text to the current letter
            const button = document.createElement('button');
            button.innerHTML = alphabet[i];

            //any time button is clicked, disable it and guess the current letter
            button.onclick = function () {
                this.disabled = true;
                hangman.guess(this.innerHTML);
            }

            //add the input button to the input container
            this.input.appendChild(button);

            //add blank line after letters 'p' and 'l'
            if (i === 9 || i === 18) {
                this.input.appendChild(document.createElement('br'));
            }
        }

        //add input container holding input buttons for each letter in the alphabet to the game container
        this.container.appendChild(this.input);

        //initialise the amount of wins, losses and resets as 0
        this.wins = 0;
        this.losses = 0;
        this.resets = 0;

        //create container element holding the amount of wins and losses
        this.progressCounter = document.createElement('div');

        //add blank line
        this.progressCounter.append(document.createElement('br'));

        //add 'wins' text according to language
        this.progressCounter.append(this.en ? 'Wins: ' : 'Gewonnen: ');

        //create span element and set its text to the wins number, then add it to the wins and losses container
        const winsCounter = document.createElement('span');
        winsCounter.innerHTML = this.wins;
        this.progressCounter.appendChild(winsCounter);

        //add 'losses' text according to language
        this.progressCounter.append(this.en ? ' Losses: ' : ' Verloren: ');

        //create span element and set its text to the losses number, then add it to the wins and losses container
        const lossesCounter = document.createElement('span');
        lossesCounter.innerHTML = this.losses;
        this.progressCounter.appendChild(lossesCounter);

        //add the wins and losses container to the game container
        this.container.appendChild(this.progressCounter);

        //create reset button element
        this.resetButton = document.createElement('button');
        this.resetButton.innerHTML = 'Reset';
        this.resetButton.id = 'resetbutton';

        //any time the reset button is clicked, reset the game
        this.resetButton.onclick = function () {
            hangman.reset();
        }

        //add the reset button to the game container
        this.container.appendChild(this.resetButton);

        //set the element above which all elements which regenerate every setup will be inserted to the wins and losses container
        this.elementBelowRegeneratedStuff = this.progressCounter;

        //run the setup
        this.setup();

        //add the game container to the page container, above the footer
        document.getElementById('container').insertBefore(this.container, document.getElementsByTagName('footer')[0]);
    }

    /*
    * Play Audio method
    * plays an audio file
    * param file : string of audio file name
    */
    playAudio(file) {
        //create audio element and set its source as the mp3 file requested
        const audio = new Audio('audio/' + file + '.mp3');
        //play the audio
        audio.play();
    }

    /*
    * Setup method
    * sets wordLength, wordsArray, image, correctLetters, potentially picks word
    */
    async setup() {
        //play setup indication audio
        this.playAudio('setup');

        //gets weighted random length and wordsArray according to language and length
        this.wordLength = await this.generateWordLength();
        this.wordsArray = await fetch('words/' + this.extension + this.wordLength + '.json').then(response => response.json());

        //initlialise image phase at 0
        this.phase = 0;

        if (this.imageMode) {
            //if image mode is enabled, create image element
            this.image = document.createElement('img');
        } else {
            //else set textImage (according to possible phases)
            this.textImage = await this.getTextImage();
            //create image container element
            this.image = document.createElement('div');
        }

        //set the image (container) elements id
        this.image.id = 'image';

        //update image (container) elements contents
        this.updateImage();

        //if the 'AI may cheat' toggle is checked
        if (this.cheating.checked) {
            //remove all words with a dash characters ('-') in them (as a user cannot pick dashes)
            this.removeDashWords();
        } else {
            //pick a word from the word array (according to length and language)
            this.pickWord();
            //change guessedLetters element if word has dash characters ('-') in them (as a user cannot pick dashes)
            this.findDashes();
        }

        //add image (container) to the middle of the game container
        this.container.insertBefore(this.image, this.elementBelowRegeneratedStuff);

        //create underline element to hold guessed letters
        this.guessedLetters = document.createElement('u');
        this.guessedLetters.id = 'guessedLetters';

        //create array to hold guessed letters of the word, with the word's length
        this.guessed = new Array(this.wordLength);
        //fill it with non-breaking space characters
        this.guessed.fill('&nbsp;');

        //set number of correctly guessed letters as 0
        this.correctLetters = 0;

        //update the guessed letters element (to fill in the spaces)
        this.updateGuessedLetters();

        //add guessed letters element to the middle of the game container
        this.container.insertBefore(this.guessedLetters, this.elementBelowRegeneratedStuff);
    }

    /*
    * Generate Word Length method
    * generates a weighted random word length
    * returns : int wordLength
    */
    async generateWordLength() {
        //get word lengths object according to language
        const wordsByLength = await fetch('words/' + this.extension + 'lengths.json').then(response => response.json());

        //get array of word lengths (strings) from the words by length object's keys
        const wordLengthsArray = Object.keys(wordsByLength);
        //create array storing chosen choices of word lengths
        const chosenLengthChoices = [];

        //loop over all word lengths in the word lengths object
        for (let i = 0; i < wordLengthsArray.length; i++) {
            //skip 'total', if length is larger than 1 and has either more more words than the total amount of words/100 or by a 1/40 random chance
            if (wordLengthsArray[i] !== 'total' && wordLengthsArray[i] > 1 && (wordsByLength[wordLengthsArray[i]] > wordsByLength.total / 100 || Math.random() < 0.025)) {
                //add word length to length choices array
                chosenLengthChoices.push(wordLengthsArray[i]);
            }
        }

        //if no words lengths satisfied the requirements above, pick one at random from the array (should be unlikely) and return it
        //else pick one at random from the chosen length choices and return it
        if (chosenLengthChoices.length === 0) {
            return parseInt(wordLengthsArray[Math.random() * wordLengthsArray.length | 0])
        } else {
            return parseInt(chosenLengthChoices[Math.random() * chosenLengthChoices.length | 0])
        }
    }

    /*
    * Remove Dash Words method
    * removes words with dash characters ('-') from the words array
    * performance of different methods:
    * https://jsperf.com/regex-vs-indexof-filter-for
    */
    removeDashWords() {
        //create new array for holding updated words list
        const updatedWordsArray = [];

        //loop over all words in the words array
        for (let i = 0; i < this.wordsArray.length; i++) {
            //if word does not contain dash character ('-'), add it to the updated words array
            if (this.wordsArray[i].indexOf('-') === -1) {
                updatedWordsArray.push(this.wordsArray[i]);
            }
        }

        //update the words list to be the new updated words array
        this.wordsArray = updatedWordsArray;
    }

    /*
    * Get Text Image method
    * gets textImage and then gives a subset of the phases depending on tries selector value
    * returns : string array textImage with length in [2,...,15]
    */
    async getTextImage() {
        //get text image array
        const textImage = await fetch('i/hangman.json').then(response => response.json());

        //return subset of text image array depending on tries selector value
        //for an 'animation' showing all possibilities see /gif.html
        switch (parseInt(this.tries.value)) {
            case 14:
                return textImage;
            case 13:
                return textImage.slice(0, 2).concat(textImage.slice(3));
            case 12:
                return [textImage[0]].concat(textImage.slice(3));
            case 11:
                return textImage.slice(3);
            case 10:
                return textImage.slice(4);
            case 9:
                return textImage.slice(3, 13);
            case 8:
                return textImage.slice(4, 13);
            case 7:
                return textImage.slice(3, 11);
            case 6:
                return textImage.slice(4, 11);
            case 5:
                return textImage.slice(3, 7).concat([textImage[8], textImage[10]]);
            case 4:
                return textImage.slice(4, 7).concat([textImage[8], textImage[10]]);
            case 3:
                return [textImage[4], textImage[6], textImage[8], textImage[10]];
            case 2:
                return [textImage[4], textImage[6], textImage[10]];
            case 1:
                return [textImage[4], textImage[10]];
        }
    }

    /*
    * Reset method
    * resets input buttons, removes image, guessed letters, word and runs setup
    */
    reset() {
        //log reset to console
        console.log('reset');

        //enable buttons in input container
        this.toggleButtons(false);
        //remove image (container) element
        this.image.remove();
        //remove guessed letters element
        this.guessedLetters.remove();
        //sets word to undefined
        this.word = undefined;
        //increments amount of resets
        this.resets++;

        //run the setup
        this.setup();
    }

    /*
    * Update Image method
    * updates contents of image (container) element according to image mode and phase
    */
    updateImage() {
        //if image mode is images, set image source to svg file according to phase
        //else set image container text to text image according to phase
        if (this.imageMode) {
            this.image.src = 'i/hangman_' + this.phase + '.svg';
        } else {
            this.image.innerHTML = this.textImage[this.phase];
        }
    }

    /*
    * Toggle Buttons method
    * disables or enables all button elements inside the input container element according to input
    * param disabled : boolean, true if buttons should be disabled, false if buttons should be enabled
    */
    toggleButtons(disabled) {
        //loop over all button elements inside the input container element
        for (let i = 0; i < this.input.children.length; i++) {
            //change disabled attribute for button according to 'disabled' boolean
            this.input.children[i].disabled = disabled;
        }
    }

    /*
    * Update Guessed Letters method
    * updates the contents of the guessed letters element according to input letter and locations
    * param letter : char/string letter being added to the guessed letters, standard value is non-breaking space character
    * param locations : string/int array containing locations of letters being updated, standard value is empty array
    */
    updateGuessedLetters(letter = '&nbsp;', locations = []) {
        //loop over all locations as i in locations input
        for (let i = 0; i < locations.length; i++) {
            //if location is not empty string
            if (locations[i] !== '') {
                //set letter at location i in string to input letter
                this.guessed[locations[i]] = letter;
                //increment amount of correctly guessed letters
                this.correctLetters++;
            }
        }

        //set guessed letters element text to concatenation of all strings/chars in the guessed letters array
        this.guessedLetters.innerHTML = this.guessed.join('');
        //add blank line to guessed letters element
        this.guessedLetters.appendChild(document.createElement('br'));

        //if the amount of correctly guessed letters is equal to the word length run win
        if (this.correctLetters === this.wordLength) {
            this.win();
        }
    }

    /*
    * Lose method
    * sets game to lost state
    */
    lose() {
        //log loss to console
        console.log('lost');

        //play loss indication audio
        this.playAudio('lose');

        //set guessed letters element text to word if picked, else set it to a random word in the words array
        this.guessedLetters.innerHTML = this.word || this.wordsArray[Math.random() * this.wordsArray.length | 0];
        //add blank line to guessed letters element
        this.guessedLetters.appendChild(document.createElement('br'));

        //disable all buttons in input container
        this.toggleButtons(true);

        //increment amount of losses
        this.losses++;
        //set losses counter text to amount of losses
        this.progressCounter.children[2].innerHTML = this.losses;
    }

    /*
    * Win method
    * sets game to won state
    */
    win() {
        //log win to console
        console.log('won');

        //play loss indication audio
        this.playAudio('win');

        //disable all buttons in input container
        this.toggleButtons(true);

        //increment amount of wins
        this.wins++;
        //set wins counter text to amount of wins
        this.progressCounter.children[1].innerHTML = this.wins;
    }

    /*
    * Pick Word method
    * picks random word
    */
    pickWord() {
        //log word picking to console
        console.log('picked word');

        //set word to random word from words array
        this.word = this.wordsArray[Math.random() * this.wordsArray.length | 0];
    }

    /*
    * Update Words Array method
    * analyses and updates the words array according to input letter
    * param letter : char/string being checked
    * returns : locations string
    * https://jsperf.com/for-loop-of-vs-normal
    * https://jsperf.com/array-vs-in-vs-keys
    */
    updateWordsArray(letter) {
        //create empty object for holding the word lists according to input letter locations in its words
        let wordsByLocations = {};

        //loop over all words in the words array
        for (let i = 0; i < this.wordsArray.length; i++) {
            //get current word
            let word = this.wordsArray[i];
            //initialise locations as empty string
            let locations = '';

            //until and including the current word has no more locations with the letter, add location to the locations string (for string without letter this results in '-1,')
            for (let j; j != -1; j = word.indexOf(letter, j + 1), locations += j + ',');

            //if the words by locations for the current location is not yet an array, create it with the current word, else add current word to that array
            wordsByLocations[locations] === undefined ? wordsByLocations[locations] = [word] : wordsByLocations[locations].push(word);
        }

        //set current maximum to -1
        let max = -1;
        //initlialise variable to store keys of the words by locations object where length of the array is equal to current maximum
        let maxlocations;

        //loop over all locations in the words by locations object
        for (const locations in wordsByLocations) {
            //get words array length for location
            const wordsLength = wordsByLocations[locations].length;

            //if words array length is larger than max, make it the new max and set maxlocations as new array containing current locations
            //else if word array length is equal to max, add current locations to maxlocations
            if (wordsLength > max) {
                max = wordsLength;
                maxlocations = [locations];
            } else if (wordsLength === max) {
                maxlocations.push(locations);
            }
        }

        //get random locations string from maxlocations
        const locations = maxlocations[Math.random() * maxlocations.length | 0];

        //set words array as the words array for this locations string
        this.wordsArray = wordsByLocations[locations];

        //return locations string
        return locations.slice(0, locations.length - 3);
    }

    /*
    * Guess method
    * guesses letter
    * param letter : string letter being guessed
    */
    guess(letter) {
        //check if word hasn't been picked
        if (this.word === undefined) {
            //if so, update words array according to input letter and get locations of letter
            let locations = this.updateWordsArray(letter);

            //check if the biggest word list was the one without the current letter
            if (locations === '') {
                //if so, increment phase
                this.updatePhase(locations, letter);
            } else {
                //else if the biggest list was for the current letter, log letter picking to console
                console.log('picked letter');

                //update phase according to locations and current letter
                this.updateGuessedLetters(letter, locations.split(','))
            }
        } else {
            //else if word was picked, initialise string for holding letter locations
            let locations = '';

            //until and including the word has no more locations with the letter, add location to the locations string (for string without letter this results in '-1,')
            for (let i = -2; i != -1; i = this.word.indexOf(letter, i + 1), locations += i + ',');

            //update phase according to locations and current letter
            this.updatePhase(locations.slice(0, locations.length - 3), letter);
        }
    }

    /*
    * Update Phase method
    * updates phase by either changing the image or changing the guessed letters element
    * param locations : locations of letter in word/words in words array, depending on calling method
    * param letter : char/string letter being guessed
    */
    updatePhase(locations, letter) {
        //check if locations string is empty (if word hasn't been picked this means that the current words list is without the letter, else it means the word doesn't contain the letter)
        if (locations === '') {
            //if so, increment phase
            //increment current phase
            this.phase++;

            //update image according to phase
            this.updateImage();

            //if phase is final phase, lose the game
            if (this.phase === this.textImage.length - 1) {
                this.lose();
            }
        } else {
            //else if the biggest list was for the current letter, log letter picking to console
            console.log('picked letter');

            //and update the guessed letters element according to letter and the array of locations
            this.updateGuessedLetters(letter, locations.split(','))
        }
    }

    /*
    * Find Dashes method
    * finds dash characters ('-') in the picked word and updates guessed letters element according to their locations
    */
    findDashes() {
        //initialise string for holding letter locations
        let locations = '';

        //until and including the word has no more locations with a dash, add location to the locations string (for string without letter this results in '-1,')
        for (let i = -2; i != -1; i = this.word.indexOf('-', i + 1), locations += i + ',');

        //if dashes were found update guessed letters element according to the dashes' locations
        if (locations !== ',-1') {
            this.updateGuessedLetters('-', locations.slice(0, locations.length - 3).split(','));
        }
    }
}

/*
* DOM Content Loaded Event Listener method
* creates hangman game when DOM content loads
*/
document.addEventListener('DOMContentLoaded', function () {
    //set hm to be a new instance of the hangman game
    hm = new ClassHangman();
});