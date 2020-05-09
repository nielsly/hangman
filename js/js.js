let hg;

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

    setup() {
        this.wordsPicker();
        this.phase = 0;

        if (this.imageMode) {
            this.image = document.createElement('img');
        } else {
            this.textImage = ["\n\n\n\n\n _ _ _","\n|\n|\n|\n|\n|_ _ _","_____\n|\n|\n|\n|\n|_ _ _","_____\n|/   \n|\n|\n|\n|_ _ _","_____\n|/  |\n|\n|\n|\n|_ _ _","_____\n|/  |\n|   O\n|\n|\n|_ _ _","_____\n|/  |\n|   O\n|  /|\n|\n|_ _ _","_____\n|/  |\n|   O\n|  /|\\\n|\n|_ _ _","_____\n|/  |\n|   O\n|  /|\\\n|  /\n|_ _ _","_____\n|/  |\n|   O\n|  /|\\\n|  / \\\n|_ _ _","_____\n|/  |\n|   O\n|  /|\\\n| _/ \\\n|_ _ _","_____\n|/  |\n|   O\n|  /|\\\n| _/ \\_\n|_ _ _","_____\n|/  |\n|   O\n| _/|\\\n| _/ \\_\n|_ _ _","_____\n|/  |\n|   O\n| _/|\\_\n| _/ \\_\n|_ _ _"];
            this.image = document.createElement('pre');
        }

        this.updateImage();
        
        this.container.appendChild(this.image);

        //this.size = Math.random*14 | 0;
        //this.size = 26;
        this.size = 5;

        this.answer = document.createElement('p');
        this.answer.innerHTML = "_".repeat(this.size);
        this.container.appendChild(this.answer);
    }

    reset() {
        this.input.children[0].disabled = false;
        this.image.remove();
        this.answer.remove();

        this.setup();
    }

    updateImage() {
        if (this.imageMode) {
            this.image.src = "i/hangman_" + this.phase + ".svg";
        } else {
            this.image.innerHTML = this.textImage[this.phase];
        }
    }
    
    async wordsPicker() {
    //wordsPicker() {
        this.wordsArray = (await fetch('words/' + this.size + '.json').then(x => x.text())).split('\n');
        //this.wordsArray = ['a'.repeat(26),'b'.repeat(26),'a'.repeat(13) + 'b'.repeat(13) ,'abcdefghijklmnopqrstuvwxyz'];
    }

    lose() {
        this.answer.innerHTML = this.wordsArray[Math.random() * this.wordsArray.length | 0];
    }
    
    guess(letter) {
        const newArray = [];
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
            //TODO: Implement giving letters;
            console.log("wow this is pretty much impossible");
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    hg = new ClassHangMan();
});