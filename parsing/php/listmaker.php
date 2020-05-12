<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['words'])) {
    $lang = $_POST['words'][count($_POST['words']) - 1];
    file_put_contents('../../words/' . $lang . 'list.json', $_POST['words']);
}

header('Location: ../');
?>