<?php
// A standalone PHP example. It does not connect to or replace the Node API.
$name = '';
$email = '';
$errors = [];
$submitted = false;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $submitted = true;
    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');

    if ($name === '') {
        $errors[] = 'Please enter your name.';
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Please enter a valid email address.';
    }
}

function safeText(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>PHP Form Validation Demo</title>
    <style>
        body { max-width: 560px; margin: 48px auto; padding: 0 20px; font: 16px/1.5 system-ui, sans-serif; color: #172554; }
        label { display: block; margin-top: 16px; font-weight: 600; }
        input { box-sizing: border-box; width: 100%; padding: 10px; margin-top: 5px; }
        button { margin-top: 20px; padding: 10px 16px; color: white; background: #244ff0; border: 0; border-radius: 6px; }
        .errors { color: #b91c1c; }
        .success { color: #166534; }
    </style>
</head>
<body>
    <h1>PHP Form Validation Demo</h1>
    <p>This small example checks a name and email on the server with PHP.</p>

    <?php if ($submitted && $errors): ?>
        <ul class="errors">
            <?php foreach ($errors as $error): ?><li><?= safeText($error) ?></li><?php endforeach; ?>
        </ul>
    <?php elseif ($submitted): ?>
        <p class="success">Thanks, <?= safeText($name) ?>. The form passed validation.</p>
    <?php endif; ?>

    <form method="post" action="">
        <label for="name">Name</label>
        <input id="name" name="name" value="<?= safeText($name) ?>" required>

        <label for="email">Email</label>
        <input id="email" name="email" type="email" value="<?= safeText($email) ?>" required>

        <button type="submit">Validate form</button>
    </form>
</body>
</html>
