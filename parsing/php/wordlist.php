<?php
if ($_SERVER['REQUEST_METHOD'] == "POST" && isset($_POST['wordlist'])) {
    $data = file_get_contents('../../words/' . $_POST['wordlist'] . '.txt');
    $words = array();
    preg_match_all('/\b[A-Za-z\'-]*\b/', $data, $words);
    $words = array_unique($words[0], SORT_REGULAR);
    sort($words);

    foreach ($words as $k => $str) {
        $str = str_replace('\'', '', $str);
        $str = str_replace('-', '', $str);
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

    $lengths = array('total' => 0);

    foreach ($split_words as $k => $words) {
        $len = strlen($words[0]);
        $num = count($words);
        $lengths[$len] = $num;
        $lengths['total'] += $num;
        file_put_contents('../../words/' . $len . '.json', json_encode($words));
    }

    file_put_contents('../../words/lengths.json', json_encode($lengths, JSON_FORCE_OBJECT));
}

//header('Location: ../');
?>