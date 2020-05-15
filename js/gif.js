/*
* Sleep method
* stops method execution for time according to input ms
* param ms : int time to sleep in milliseconds
* returns promise which finishes in ms milliseconds
*/
function sleep(ms) {
    //return a promise which will resolve after a setTimeout of ms milliseconds completes
    return new Promise(resolve => setTimeout(resolve, ms));
}

/*
* Gif method
* creates 'animation' of text image phases
* https://jsperf.com/switch-vs-array-return/1
*/
async function gif() {
    //get text image textImage array
    const textImage = await fetch('i/hangman.json').then(response => response.json());

    //create array holding all textImage subsets by tries mapping [index 0 to 14 tries,index 1 to 13 tries...,index 13 to 1 try]
    const textImageByTries = [textImage, textImage.slice(0, 2).concat(textImage.slice(3)), [textImage[0]].concat(textImage.slice(3)), textImage.slice(3), textImage.slice(4), textImage.slice(3, 13), textImage.slice(4, 13), textImage.slice(3, 11), textImage.slice(4, 11), textImage.slice(3, 7).concat([textImage[8], textImage[10]]), textImage.slice(4, 7).concat([textImage[8], textImage[10]]), [textImage[4], textImage[6], textImage[8], textImage[10]], [textImage[4], textImage[6], textImage[10]], [textImage[4], textImage[10]]];

    //centre text in body element
    document.body.style.textAlign = 'center';

    //create title element, set its font-family to sans-serif and add it to the body element
    const title = document.createElement('h1');
    title.style.fontFamily = 'sans-serif';
    document.body.appendChild(title);

    //create image container element, set its font-family to monospace and add it to the body element
    const image = document.createElement('div');
    image.style.fontFamily = 'monospace';
    document.body.appendChild(image);

    //loop forever
    while (true) {
        //loop over all textImage subsets for all amounts of tries
        for (let i = 0; i < textImageByTries.length; i++) {
            //get current subset of text images in a string array
            const currentSubset = textImageByTries[i];

            //set title element according to current tries amount
            title.innerHTML = textImageByTries.length - i + ' tries';

            //loop over all text images in the current array
            for (let j = 0; j < currentSubset.length; j++) {
                //set image text as current text image
                image.innerHTML = currentSubset[j];

                //sleep for 450ms
                await sleep(450);
            }

            //sleep for 550ms
            await sleep(550);
        }
    }
}

/*
* DOM Content Loaded Event Listener method
* creates 'animation' when DOM content loads
*/
document.addEventListener('DOMContentLoaded', function () {
    gif();
});