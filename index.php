<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON Editor</title>
    <link rel="stylesheet" href="app.css">
    <script src="jquery-3.6.0.min.js"></script>
</head>
<body>
    <div id="step1" class="step">
        <h2>Step 1: Upload, Paste, or Create New JSON Object</h2>
        <textarea id="jsonInput" placeholder="Paste your JSON here"></textarea>
        <button id="importBtn">Import JSON</button>
        <input type="file" id="fileInput" style="display: none;">
        <button id="customFileInputBtn">Upload JSON File</button>
        <button id="newObjectBtn">New JSON Object</button>
        <button id="toStep2Btn">Next Step</button>
    </div>
    
    <div id="step2" class="step" style="display: none;">
        <h2>Step 2: Edit JSON Object</h2>
        <div id="editor"></div>
        <button id="toStep1Btn">Previous Step</button>
        <button id="toStep3Btn">Next Step</button>
    </div>
    
    <div id="step3" class="step" style="display: none;">
        <h2>Step 3: Export JSON Object</h2>
        <textarea id="jsonOutput" readonly></textarea>
        <button id="toStep2BtnFrom3">Previous Step</button>
    </div>
    <script src="app.js"></script>
</body>
</html>
