let hg;

String.prototype.replaceAt = function(index, replacement) {
    return this.substr(0, index) + replacement+ this.substr(index + replacement.length);
}

class ClassHangMan {
    constructor() {
        this.container = document.createElement('div');

        const alphabet = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

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
        }

        this.container.appendChild(this.input)

        this.setup();

        document.body.appendChild(this.container);
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
            //this.textImage = ["\n\n\n\n\n _ _ _","\n|\n|\n|\n|\n|_ _ _","_____\n|\n|\n|\n|\n|_ _ _","_____\n|/   \n|\n|\n|\n|_ _ _","_____\n|/  |\n|\n|\n|\n|_ _ _","_____\n|/  |\n|   O\n|\n|\n|_ _ _","_____\n|/  |\n|   O\n|   |\n|\n|_ _ _","_____\n|/  |\n|   O\n|  /|\n|\n|_ _ _","_____\n|/  |\n|   O\n|  /|\\\n|\n|_ _ _","_____\n|/  |\n|   O\n|  /|\\\n|  /\n|_ _ _","_____\n|/  |\n|   O\n|  /|\\\n|  / \\\n|_ _ _","_____\n|/  |\n|   O\n|  /|\\\n| _/ \\\n|_ _ _","_____\n|/  |\n|   O\n|  /|\\\n| _/ \\_\n|_ _ _","_____\n|/  |\n|   O\n| _/|\\\n| _/ \\_\n|_ _ _","_____\n|/  |\n|   O\n| _/|\\_\n| _/ \\_\n|_ _ _"];
            this.image = document.createElement('pre');
        }

        this.updateImage();
        
        this.container.appendChild(this.image);

        this.answer = document.createElement('p');
        this.guessed = '_'.repeat(this.size);
        this.answer.innerHTML = this.guessed;
        this.container.appendChild(this.answer);
    }

    reset() {
        this.toggleButtons(false);
        this.image.remove();
        this.answer.remove();

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
    }

    toggleButtons(disabled) {
        for (let i = 0; i < this.input.children.length; i++) {
            this.input.children[i].disabled = disabled;
        }
    }

    updateAnswer(letter, locs) {
        for (let i = 0; i < locs.length; i++) {
            this.guessed = this.guessed.replaceAt(locs[i], letter);
        }      

        if (this.guessed == this.word) {
            this.win();
        } else {
            this.answer.innerHTML = this.guessed;
        }
    }

    lose() {
        this.answer.innerHTML = this.wordsArray[Math.random() * this.wordsArray.length | 0];
        this.toggleButtons(true);
    }

    win() {
        this.answer.innerHTML = this.word;
        this.toggleButtons(true);
    }

    pickWord(letter) {
        this.word = this.wordsArray[Math.random() * this.wordsArray.length | 0];
        this.wordArray = this.word.split('');

        let locs = [];

        for (let i = 0; i < this.size; i++) {
            if (this.wordArray[i] == letter) {
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
                if(this.phase == this.textImage.length - 1) {
                    this.lose();
                }
            } else {
                console.log('wow this is pretty much impossible');
    
                //TODO: Implement giving letters better
                let regExp = new RegExp('[a-z]*' + letter + '[a-z]*' + letter + '[a-z]*')
                newArray = [];
                for (let i = 0; i < this.wordsArray.length; i++) {
                    if (!regExp.test(this.wordsArray[i])) {
                        newArray.push(wordsArray[i]);
                    }
                }
    
                let newerArray = [];
                for (let i = 0; i < this.size; i++) {
                    newerArray.push([]);
                    regExp = new RegExp('[a-z]{' + i + '}' + letter + '[a-z]*');
                    for (let j = 0; j < newArray.size; j++) {
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
    
                if (max == 0) {
                    this.pickWord(letter);
                } else {
                    this.wordsArray = newerArray[maxi];
                    this.updateAnswer(letter, [maxi]);
                }
            }
        } else {
            this.wordArray;
            let locs = [];
            let num = 0;

            for (let i = 0; i < this.size; i++) {
                if (this.wordArray[i] == letter) {
                    locs.push(i);
                    num++;
                }
            }
            
            if (num == 0) {
                this.wordsArray = newArray;
                this.phase++;
                this.updateImage();
                if(this.phase == this.textImage.length - 1) {
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