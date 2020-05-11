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
        const data = (await fetch('../../words/' + wordLists[i] + '.txt').then(x => x.text())).split('\n');
        words = words.concat(data);
    }

    //sort, remove duplicates
    const regExp = new RegExp('^[A-Za-z\']+[A-Za-z\'-]*$', 'g');
    words = words.sort().filter(function(item, pos, ary) {
        return regExp.test(item) && (!pos || item != ary[pos - 1]);
    });

    for (let i = 0; i < words.length; i++) {
        words[i] = words[i].toLowerCase();
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'php/listmaker.php';

    const output = document.createElement('input');
    output.name = 'words';
    output.value = JSON.stringify(words);
    form.appendChild(output);

    document.body.appendChild(form);

    form.submit();
}
