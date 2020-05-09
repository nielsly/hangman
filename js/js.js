let hg;

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement + this.substr(index + replacement.length);
}

class ClassHangMan {
    constructor() {
        this.container = document.createElement('div');

        const alphabet = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm'];

        this.regExps = {};

        for (let i = 0; i < alphabet.length; i++) {
            this.regExps[alphabet[i]] = new RegExp('[a-z]*' + alphabet[i] + '[a-z]*');
        }

        //TODO: implement image mode
        this.imageMode = false;

        this.input = document.createElement('div');
        const hangman = this;

        for (let i = 0; i < alphabet.length; i++) {
            const button = document.createElement('button');
            button.innerHTML = alphabet[i];
            button.onclick = function() { 
                button.disabled = true;
                hangman.guess(this.innerHTML); 
            }

            this.input.appendChild(button);

            if (i === 9 || i === 18) {
                this.input.appendChild(document.createElement('br'));
            }
        }

        this.container.appendChild(this.input)

        this.resetButton = document.createElement('button');
        this.resetButton.innerHTML = 'Reset';
        this.resetButton.id = 'resetbutton'

        this.resetButton.onclick = function() {
            hangman.reset();
        }

        this.container.appendChild(this.resetButton);

        this.setup();        

        document.getElementById('container').insertBefore(this.container, document.getElementsByTagName('footer')[0]);
    }

    async setup() {
        this.size = 5;
        //this.size = Math.random*14 | 0;
        //this.size = 26;
        this.wordsPicker();
        this.phase = 0;

        if (this.imageMode) {
            this.image = document.createElement('img');
        } else {
            this.textImage = await fetch('i/hangman.json').then(response => response.json());
            //this.textImage = ['&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>&nbsp;_&nbsp;_&nbsp;_&nbsp;','&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|_&nbsp;_&nbsp;_&nbsp;','_____&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|_&nbsp;_&nbsp;_&nbsp;','_____&nbsp;&nbsp;<br>|/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|_&nbsp;_&nbsp;_&nbsp;','_____&nbsp;&nbsp;<br>|/&nbsp;&nbsp;|&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|_&nbsp;_&nbsp;_&nbsp;','_____&nbsp;&nbsp;<br>|/&nbsp;&nbsp;|&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;O&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|_&nbsp;_&nbsp;_&nbsp;','_____&nbsp;&nbsp;<br>|/&nbsp;&nbsp;|&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;O&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|_&nbsp;_&nbsp;_&nbsp;','_____&nbsp;&nbsp;<br>|/&nbsp;&nbsp;|&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;O&nbsp;&nbsp;<br>|&nbsp;&nbsp;/|&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|_&nbsp;_&nbsp;_&nbsp;','_____&nbsp;&nbsp;<br>|/&nbsp;&nbsp;|&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;O&nbsp;&nbsp;<br>|&nbsp;&nbsp;/|\\&nbsp;<br>|&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>|_&nbsp;_&nbsp;_&nbsp;','_____&nbsp;&nbsp;<br>|/&nbsp;&nbsp;|&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;O&nbsp;&nbsp;<br>|&nbsp;&nbsp;/|\\&nbsp;<br>|&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;<br>|_&nbsp;_&nbsp;_&nbsp;','_____&nbsp;&nbsp;<br>|/&nbsp;&nbsp;|&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;O&nbsp;&nbsp;<br>|&nbsp;&nbsp;/|\\&nbsp;<br>|&nbsp;&nbsp;/&nbsp;\\&nbsp;<br>|_&nbsp;_&nbsp;_&nbsp;','_____&nbsp;&nbsp;<br>|/&nbsp;&nbsp;|&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;O&nbsp;&nbsp;<br>|&nbsp;&nbsp;/|\\&nbsp;<br>|&nbsp;_/&nbsp;\\&nbsp;<br>|_&nbsp;_&nbsp;_&nbsp;','_____&nbsp;&nbsp;<br>|/&nbsp;&nbsp;|&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;O&nbsp;&nbsp;<br>|&nbsp;&nbsp;/|\\&nbsp;<br>|&nbsp;_/&nbsp;\\_<br>|_&nbsp;_&nbsp;_&nbsp;','_____&nbsp;&nbsp;<br>|/&nbsp;&nbsp;|&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;O&nbsp;&nbsp;<br>|&nbsp;_/|\\&nbsp;<br>|&nbsp;_/&nbsp;\\_<br>|_&nbsp;_&nbsp;_&nbsp;','_____&nbsp;&nbsp;<br>|/&nbsp;&nbsp;|&nbsp;&nbsp;<br>|&nbsp;&nbsp;&nbsp;O&nbsp;&nbsp;<br>|&nbsp;_/|\\_<br>|&nbsp;_/&nbsp;\\_<br>|_&nbsp;_&nbsp;_&nbsp;'];
            this.image = document.createElement('div');
        }
        
        this.image.id = 'image';

        this.updateImage();
        
        this.container.insertBefore(this.image, this.resetButton);

        this.answer = document.createElement('u');
        this.answer.id = 'answer';

        this.guessed = new Array(this.size);
        this.guessed.fill('&nbsp;');
        this.correct = 0;

        this.updateAnswer();

        this.container.insertBefore(this.answer, this.resetButton);
    }

    reset() {
        this.toggleButtons(false);
        this.image.remove();
        this.answer.remove();
        this.word = undefined;

        this.setup();
    }

    updateImage() {
        if (this.imageMode) {
            this.image.src = 'i/hangman_' + this.phase + '.svg';
        } else {
            this.image.innerHTML = this.textImage[this.phase];
        }
    }
    
    async wordsPicker() {
        this.wordsArray = await fetch('words/' + this.size + '.json').then(response => response.json());
        //this.wordsArray = ['a'.repeat(26),'b'.repeat(26),'a'.repeat(13) + 'b'.repeat(13) ,'abcdefghijklmnopqrstuvwxyz'];
        //this.wordsArray = ['drugs', 'kunst', 'lucht', 'lunch', 'truck', 'tyfus'];
    }

    toggleButtons(disabled) {
        for (let i = 0; i < this.input.children.length; i++) {
            this.input.children[i].disabled = disabled;
        }
    }

    updateAnswer(letter = '&nbsp;', locs = []) {
        for (let i = 0; i < locs.length; i++) {
            this.guessed[locs[i]] = letter;
            this.correct++;
        }

        if (this.correct === this.size) {
            this.win();
        } else {
            this.answer.innerHTML = this.guessed.join('');
            this.answer.appendChild(document.createElement('br'));
        }
    }

    lose() {    
        this.answer.innerHTML = this.wordsArray[Math.random() * this.wordsArray.length | 0];
        this.answer.appendChild(document.createElement('br'));
        this.toggleButtons(true);
    }

    win() {
        this.answer.innerHTML = this.guessed.join('');
        this.answer.appendChild(document.createElement('br'));
        this.toggleButtons(true);
    }

    pickWord(letter) {
        console.log('picked word')
        this.word = this.wordsArray[Math.random() * this.wordsArray.length | 0];
        this.wordArray = this.word.split('');

        let locs = [];

        for (let i = 0; i < this.size; i++) {
            if (this.wordArray[i] === letter) {
                locs.push(i);
            }
        }

        this.updateAnswer(letter, locs);
    }

    /*count(array, letter) {
        const newArray = [];
        newArray.push(array);
        for (let num = 2; newArray[num - 2].length > 0; num++) {
            regExp = new RegExp('[a-z]*' + (letter + '[a-z]*').repeat(num));
            console.log(regExp);
            newArray[num - 1] = [];
            for (let i = 0; i < newArray[num - 2].length; i++) {
                if (regExp.test(newArray[num - 2][i])) {
                    newArray[num - 1].push(newArray[num - 2][i]);
                }
            }
        }
        for (let i = 0; i < newArray.length - 1; i++) {
            if (newArray[i] < newArray[i-1])
        }
    }*/

    /*
    *
    * TODO: Can be improved
    * 
    */
    /*count(array, letter) {
        const newArray = [];
        for (let i = 0; i < this.size; i++) {
            newArray.push([]);
            const regExp = new RegExp('[a-z]{' + i + '}' + letter + '[a-z]*');

            for (let j = 0; j < array.length; j++) {
                if (regExp.test(array[j])) {
                    newArray[i].push(array[j]);
                }
            }
        }

        console.log(newArray);

        let max = 0;
        let maxi = 0;

        for (let i = 0; i < this.size; i++) {
            if (newArray[i].length > max) {
                max = newArray[i].length;
                maxi = i;
            }
        }

        const regExp = new RegExp('[a-z]{' + maxi + '}' + letter + '[a-z]*');

        const newerArray = [];
        for (let num = 1; num < this.size + 1; num++) {
            regExp2 = new RegExp('[a-z]*' + (letter + '[a-z]*').repeat(num));
            regExp3 = new RegExp('[a-z]*' + (letter + '[a-z]*').repeat(num + 1));
            newerArray.push([]);
            for (let i = 0; i < newArray[maxi].length; i++) {
                if (regExp2.test(newArray[maxi][i]) && !regExp3.test(newArray[maxi][i])) {
                    newerArray[num - 1].push(newArray[maxi][i]);
                }
            }
        }

        console.log(newerArray);

        max = 0;
        maxi = 0;
        
        for (let i = 0; i < newerArray.length; i++) {
            if(newerArray[i].length > max) {
                max = newerArray[i].length;
                maxi = i;
            }
        }

        return [newerArray[maxi], maxi + 1];
    }*/
    
    /*
    *
    * This function currently works in such a way that it gives at most 1 letter, if no words with 1 letter are left it picks a word at random which is used the rest of the game
    * 
    */
    guess(letter) {
        if(this.word === undefined) {
            let newArray = [];
            for (let i = 0; i < this.wordsArray.length; i++) {
                if (!this.regExps[letter].test(this.wordsArray[i])) {
                    newArray.push(this.wordsArray[i]);
                }
            }
    
            if (newArray.length > 0) {
                this.wordsArray = newArray;
                this.phase++;
                this.updateImage();
                if(this.phase === this.textImage.length - 1) {
                    this.lose();
                }
            } else {
                console.log('picked letter');
    
                //TODO: Implement giving letters better
                let regExp = new RegExp('[a-z]*' + letter + '[a-z]*' + letter + '[a-z]*')
                newArray = [];
                for (let i = 0; i < this.wordsArray.length; i++) {
                    if (!regExp.test(this.wordsArray[i])) {
                        newArray.push(this.wordsArray[i]);
                    }
                }
    
                let newerArray = [];
                for (let i = 0; i < this.size; i++) {
                    newerArray.push([]);
                    regExp = new RegExp('^[a-z]{' + i + '}' + letter + '[a-z]{' + (this.size - i - 1) + '}$');
                    for (let j = 0; j < newArray.length; j++) {
                        if (regExp.test(newArray[j])) {
                            newerArray[i].push(newArray[j]);
                        }
                    }
                }
    
                let max = 0;
                let maxi = 0;
    
                for (let i = 0; i < this.size; i++) {
                    if (newerArray[i].length > max) {
                        max = newerArray[i].length;
                        maxi = i;
                    }
                }
    
                if (max === 0) {
                    this.pickWord(letter);
                } else {
                    this.wordsArray = newerArray[maxi];
                    this.updateAnswer(letter, [maxi]);
                }
            }
        } else {
            let locs = [];
            let num = 0;

            for (let i = 0; i < this.size; i++) {
                if (this.wordArray[i] === letter) {
                    locs.push(i);
                    num++;
                }
            }
            
            if (num === 0) {
                this.phase++;
                this.updateImage();
                if(this.phase === this.textImage.length - 1) {
                    this.lose();
                }
            } else {
                this.updateAnswer(letter, locs);
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    hg = new ClassHangMan();
});