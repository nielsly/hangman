/*
* i used
* https://stackoverflow.com/questions/9229645/remove-duplicate-values-from-js-array
* https://jsperf.com/unique-array-sorted/1
* to find the most efficient way of creating a sorted unique array
*/
async function combineLists(input) {
    const wordLists = input.split(' ');

    let words = [];

    for (let i = 0; i < wordLists.length; i++) {
        if (wordLists[i].length < 4 || wordLists[i].charAt(2) !== '/') {
            window.alert("Don't forget the language identifier! (E.g. nl/ or en/.)");
            return;
        }

        const data = (await fetch('../../words/' + wordLists[i] + '.txt').then(x => x.text())).split('\n');
        words = words.concat(data);
    }

    //sort, remove duplicates
    const regExp = new RegExp('^[A-Za-z\']+[A-Za-z\'-]*[A-Za-z]+$', 'g');

    words = words.sort().filter(function (item, pos, ary) {
        return regExp.test(item) && (!pos || item != ary[pos - 1]);
    });

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].toLowerCase();
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'php/listmaker.php';

    const wordsString = document.createElement('input');
    wordsString.type = 'hidden';
    wordsString.name = 'words';
    wordsString.value = JSON.stringify(words);
    form.appendChild(wordsString);

    const language = document.createElement('input');
    language.type = 'hidden';
    language.name = 'language';
    language.value = wordLists[0].substring(0, 3);
    form.appendChild(language);

    document.body.appendChild(form);

    form.submit();
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('listsubmit').onclick = function () {
        combineLists(document.getElementById("wordlists").value);
    }
});