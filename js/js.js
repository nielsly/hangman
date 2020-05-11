let hg;

class ClassHangMan {
    constructor() {
        const hangman = this;
        this.container = document.createElement('div');

        //TODO: implement image mode
        this.imageMode = false;

        this.tries = document.createElement('select');

        for (let i = 14; i > 0; i--) {
            const option = document.createElement('option');
            option.value = i;
            if (i !== 1) {
                option.innerHTML = i + ' tries';
            } else {
                option.innerHTML = '1 try';
            }

            this.tries.appendChild(option);
        }

        this.tries.children[4].selected = true;

        this.tries.onchange = function () {
            hangman.reset();
        }

        this.container.appendChild(this.tries);

        this.cheating = document.createElement('input');
        this.cheating.type = 'checkbox';
        this.cheating.checked = true;
        this.cheating.id = 'cheating';

        this.cheating.onclick = function () {
            hangman.reset();
        }

        this.container.appendChild(this.cheating);

        const label = document.createElement('label');
        label.innerHTML = 'AI may cheat';
        label.setAttribute('for', 'cheating');
        this.container.appendChild(label);

        this.input = document.createElement('div');

        const alphabet = 'qwertyuiopasdfghjklzxcvbnm';

        for (let i = 0; i < alphabet.length; i++) {
            const button = document.createElement('button');
            button.innerHTML = alphabet[i];

            button.onclick = function () {
                this.disabled = true;
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
        this.resetButton.id = 'resetbutton';

        this.resetButton.onclick = function () {
            hangman.reset();
        }

        this.container.appendChild(this.resetButton);

        this.setup();

        document.getElementById('container').insertBefore(this.container, document.getElementsByTagName('footer')[0]);
    }

    playAudio(file) {
        const audio = new Audio('audio/' + file + '.mp3');
        audio.play();
    }

    async setup() {
        this.playAudio('reset');
        //TODO: add word list parsing
        //TOOD: size randomization
        this.size = 5;
        this.wordsArray = this.getWords();
        this.phase = 0;

        if (this.imageMode) {
            this.image = document.createElement('img');
        } else {
            this.textImage = await this.pickPhases();
            this.image = document.createElement('div');
        }

        this.image.id = 'image';

        this.updateImage();

        if (this.cheating.checked) {
            this.removeDashWords();
        } else {
            this.pickWord();
        }

        this.container.insertBefore(this.image, this.resetButton);

        this.answer = document.createElement('u');
        this.answer.id = 'answer';

        this.guessed = new Array(this.size);
        this.guessed.fill('&nbsp;');
        this.correct = 0;

        this.updateAnswer();

        this.container.insertBefore(this.answer, this.resetButton);
    }

    //https://jsperf.com/regex-vs-indexof-filter-for
    removeDashWords() {
        const newList = [];

        for (let i = 0; i < this.wordsArray.length; i++) {
            if (this.wordsArray[i].indexOf('-') === -1) {
                newList.push(this.wordsArray[i]);
            }
        }

        this.wordsArray = newList;
    }

    async pickPhases() {
        const textImage = await fetch('i/hangman.json').then(response => response.json());
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

    reset() {
        console.log('reset');
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

    async getWords() {
        return await fetch('words/' + this.size + '.json').then(response => response.json());
    }

    toggleButtons(disabled) {
        for (let i = 0; i < this.input.children.length; i++) {
            this.input.children[i].disabled = disabled;
        }
    }

    updateAnswer(letter = '&nbsp;', locs = []) {
        for (let i = 0; i < locs.length; i++) {
            if (locs[i] !== '') {
                this.guessed[locs[i]] = letter;
                this.correct++;
            }
        }

        if (this.correct === this.size) {
            this.win();
        } else {
            this.answer.innerHTML = this.guessed.join('');
            this.answer.appendChild(document.createElement('br'));
        }
    }

    lose() {
        console.log('lost');
        this.answer.innerHTML = this.word || this.wordsArray[Math.random() * this.wordsArray.length | 0];
        this.answer.appendChild(document.createElement('br'));
        this.toggleButtons(true);
        this.playAudio('lose');
    }

    win() {
        console.log('won');
        this.answer.innerHTML = this.guessed.join('');
        this.answer.appendChild(document.createElement('br'));
        this.toggleButtons(true);
        this.playAudio('win');
    }

    pickWord() {
        console.log('picked word');
        this.word = this.wordsArray[Math.random() * this.wordsArray.length | 0];
    }

    /*
    * list : array containing words
    * letter : char
    */
    analyse(list, letter) {
        let newList = {};
        for (const word of list) {
            let locs = '';
            for (let i = -2; i != -1; i = word.indexOf(letter, i + 1), locs += ',' + i);
            newList[locs] === undefined ? newList[locs] = [word] : newList[locs].push(word);
        }

        let max = 0;
        let maxLoc = [];
        for (const loc in newList) {
            if (newList[loc].length > max) {
                max = newList[loc].length;
                maxLoc = [loc];
            } else if (loc.length === max) {
                maxLoc.push(loc);
            }
        }

        const loc = maxLoc[Math.random() * maxLoc.length | 0];

        return [newList[loc], loc.slice(0, loc.length - 2)];
    }

    guess(letter) {
        if (this.word === undefined) {
            let newArray, loc;
            [newArray, loc] = this.analyse(this.wordsArray, letter);

            this.wordsArray = newArray;

            if (loc === ',') {
                this.phase++;
                this.updateImage();

                if (this.phase === this.textImage.length - 1) {
                    this.lose();
                }
            } else {
                console.log('picked letter');

                this.updateAnswer(letter, loc.split(','))
            }
        } else {
            let locs = '';

            for (let i = -2; i != -1; i = this.word.indexOf(letter, i + 1), locs += ',' + i);

            if (locs === ',-1') {
                this.phase++;
                this.updateImage();

                if (this.phase === this.textImage.length - 1) {
                    this.lose();
                }
            } else {
                this.updateAnswer(letter, locs.slice(0, locs.length - 2).split(','));
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    hg = new ClassHangMan();
});