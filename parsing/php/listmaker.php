<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['words'])) {
    var_dump($_POST['words']);
    file_put_contents('../../words/list.json', $_POST['words']);
}

//header('Location: ../');
?>