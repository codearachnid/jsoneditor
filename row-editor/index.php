<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON Editor</title>
    <link rel="stylesheet" href="app.css">
</head>

<body>
    <textarea id="jsonInput" placeholder="Enter JSON array here..."></textarea>
    <button id="addItemButton" onclick="addItem()">Add New Item</button>
    <button id="copyButton" onclick="copyToClipboard()">Copy to Clipboard</button>
    <ul id="itemList"></ul>
    <div id="error-message"></div>


    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.14.0/Sortable.min.js"></script>
    <script src="app.js"></script>
</body>

</html>