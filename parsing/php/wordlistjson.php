<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['wordlist'])) {
    $lang = substr($_POST['wordlist'], 0, 3);
    
    $words = json_decode(file_get_contents('../../words/' . $_POST['wordlist'] . '.json'));
    
    foreach ($words as $k => $str) {
        $str = str_replace('\'', '', $str);
        $words[$k] = $str;
    }

    $split_words = array();

    foreach ($words as $k => $str) {
        $str = strtolower($str);
        $len = strlen($str);

        if (!isset($split_words[$len])) {
            $split_words[$len] = array();
        }

        array_push($split_words[$len], $str);
    }
    
    foreach ($split_words as $k => $words) {
        $len = strlen($words[0]);
        $num = count($words);
        $lengths[$len] = $num;
        $lengths['total'] += $num;

        file_put_contents('../../words/' . $lang . $len . '.json', json_encode($words));
    }

    file_put_contents('../../words/' . $lang . 'lengths.json', json_encode($lengths, JSON_FORCE_OBJECT));
}

header('Location: ../');
?>