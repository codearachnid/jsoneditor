document.getElementById('importBtn').addEventListener('click', importJSON);
document.getElementById('exportBtn').addEventListener('click', exportJSON);
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('customFileInputBtn').addEventListener('click', () => document.getElementById('fileInput').click());
document.getElementById('newObjectBtn').addEventListener('click', newJSONObject);

let jsonObject = {};
let dragSrcEl = null;
let dragSrcPath = '';

function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        jsonObject = JSON.parse(e.target.result);
        renderEditor();
    };
    reader.readAsText(file);
}

function importJSON() {
    try {
        jsonObject = JSON.parse(document.getElementById('jsonInput').value);
        renderEditor();
    } catch (e) {
        alert('Invalid JSON');
    }
}

function exportJSON() {
    document.getElementById('jsonOutput').value = JSON.stringify(jsonObject, null, 2);
}

function newJSONObject() {
    jsonObject = {};
    renderEditor();
}

function renderEditor() {
    const editor = document.getElementById('editor');
    editor.innerHTML = '';
    createEditor(jsonObject, editor);
}

function createEditor(obj, container, path = '') {
    for (let key in obj) {
        const fullPath = path ? `${path}.${key}` : key;
        const nodeContainer = document.createElement('div');
        nodeContainer.classList.add('node');
        nodeContainer.draggable = true;
        nodeContainer.setAttribute('data-path', fullPath);
        nodeContainer.addEventListener('dragstart', handleDragStart);
        nodeContainer.addEventListener('dragover', handleDragOver);
        nodeContainer.addEventListener('dragleave', handleDragLeave);
        nodeContainer.addEventListener('drop', handleDrop);
        nodeContainer.addEventListener('dragend', handleDragEnd);

        const keyInput = document.createElement('input');
        keyInput.value = key;
        keyInput.addEventListener('input', () => updateKey(fullPath, keyInput.value));

        const typeSelect = document.createElement('select');
        const types = ['string', 'number', 'boolean', 'object', 'array'];
        types.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            typeSelect.appendChild(option);
        });
        typeSelect.value = getType(obj[key]);
        typeSelect.addEventListener('change', () => updateType(fullPath, typeSelect.value));

        const valueInput = createValueInput(obj[key], fullPath, typeSelect.value);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => confirmDelete(fullPath));

        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = 'Toggle';
        toggleBtn.classList.add('toggle');
        toggleBtn.addEventListener('click', () => toggleNode(nodeContainer));

        nodeContainer.appendChild(keyInput);
        nodeContainer.appendChild(typeSelect);
        nodeContainer.appendChild(valueInput);
        nodeContainer.appendChild(deleteBtn);

        if (typeof obj[key] === 'object' && obj[key] !== null) {
            nodeContainer.appendChild(toggleBtn);
            const childContainer = document.createElement('div');
            childContainer.classList.add('child-node');
            nodeContainer.appendChild(childContainer);
            createEditor(obj[key], childContainer, fullPath);
        }

        container.appendChild(nodeContainer);
    }

    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add Node';
    addBtn.addEventListener('click', () => addNode(path));
    container.appendChild(addBtn);
}

function getType(value) {
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return typeof value;
}

function createValueInput(value, path, type) {
    const input = document.createElement('input');
    if (type === 'object' || type === 'array') {
        input.value = JSON.stringify(value);
        input.disabled = true;
    } else {
        input.value = value;
    }
    input.addEventListener('input', () => updateValue(path, input.value, type));
    return input;
}

function updateKey(path, newKey) {
    const keys = path.split('.');
    let obj = jsonObject;
    for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
    }
    const oldKey = keys.pop();
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];
    renderEditor();
}

function updateValue(path, newValue, type) {
    const keys = path.split('.');
    let obj = jsonObject;
    for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
    }
    const key = keys.pop();
    obj[key] = castValue(newValue, type);
}

function updateType(path, newType) {
    const keys = path.split('.');
    let obj = jsonObject;
    for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
    }
    const key = keys.pop();
    obj[key] = getDefaultValue(newType);
    renderEditor();
}

function getDefaultValue(type) {
    switch (type) {
        case 'string': return '';
        case 'number': return 0;
        case 'boolean': return false;
        case 'object': return {};
        case 'array': return [];
    }
}

function castValue(value, type) {
    switch (type) {
        case 'string': return value;
        case 'number': return parseFloat(value);
        case 'boolean': return value === 'true';
        case 'object': return JSON.parse(value);
        case 'array': return value.split(',');
    }
}

function confirmDelete(path) {
    const confirmAction = confirm('Are you sure you want to delete this node?');
    if (confirmAction) {
        deleteNode(path);
    }
}

function deleteNode(path) {
    const keys = path.split('.');
    let obj = jsonObject;
    for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
    }
    const key = keys.pop();
    if (Array.isArray(obj)) {
        obj.splice(key, 1);
    } else {
        delete obj[key];
    }
    renderEditor();
}


function addNode(path) {
    const keys = path.split('.');
    let obj = jsonObject;
    for (let i = 0; i < keys.length; i++) {
        if (!obj[keys[i]]) {
            obj[keys[i]] = {};
        }
        obj = obj[keys[i]];
    }
    const newKey = prompt('Enter new key:');
    if (newKey) {
        obj[newKey] = '';
        renderEditor();
    }
}

function toggleNode(node) {
    const children = node.querySelector('.child-node');
    if (children.style.display === 'none') {
        children.style.display = 'block';
    } else {
        children.style.display = 'none';
    }
}

function handleDragStart(event) {
    dragSrcEl = this;
    dragSrcPath = event.target.dataset.path;
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', dragSrcPath); // Correct data type
    this.classList.add('dragging');
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragLeave(event) {
    this.classList.remove('dragging');
}

function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    const dropTarget = event.target.closest('.node');
    if (dragSrcEl !== dropTarget) {
        const dropTargetPath = dropTarget.dataset.path;
        moveNode(dragSrcPath, dropTargetPath);
        renderEditor();
    }
    return false;
}

function handleDragEnd(event) {
    this.classList.remove('dragging');
}

function moveNode(srcPath, destPath) {
    if (!srcPath || !destPath || srcPath === destPath) {
        return;
    }

    const srcKeys = srcPath.split('.');
    const destKeys = destPath.split('.');
    const srcKey = srcKeys.pop();
    const destKey = destKeys.pop();
    
    const srcParent = findParentObject(srcKeys.join('.'));
    const destParent = findParentObject(destKeys.join('.'));
    
    const nodeToMove = srcParent[srcKey];
    
    // Remove from source
    if (Array.isArray(srcParent)) {
        srcParent.splice(srcKey, 1);
    } else {
        delete srcParent[srcKey];
    }

    // Add to destination
    if (Array.isArray(destParent)) {
        destParent.splice(destKey, 0, nodeToMove);
    } else {
        destParent[destKey] = nodeToMove;
    }
}


function findParentObject(path) {
    const keys = path.split('.');
    let parent = jsonObject;
    for (let i = 0; i < keys.length - 1; i++) {
        parent = parent[keys[i]];
    }
    return parent;
}
