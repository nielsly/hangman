<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['words']) && isset($_POST['language'])) {
    file_put_contents('../../words/' . $_POST['language'] . 'list.json', $_POST['words']);
}

header('Location: ../');
?>