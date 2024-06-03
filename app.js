$(document).ready(function () {
    $('#importBtn').on('click', importJSON);
    $('#fileInput').on('change', handleFileUpload);
    $('#customFileInputBtn').on('click', () => $('#fileInput').click());
    $('#newObjectBtn').on('click', newJSONObject);
    $('#toStep2Btn').on('click', toStep2);
    $('#toStep1Btn').on('click', toStep1);
    $('#toStep3Btn').on('click', toStep3);
    $('#toStep2BtnFrom3').on('click', toStep2From3);

    let jsonObject = {};
    let dragSrcEl = null;
    let dragSrcPath = '';

    function handleFileUpload(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            jsonObject = JSON.parse(e.target.result);
            renderEditor();
            toStep2();
        };
        reader.readAsText(file);
    }

    function importJSON() {
        try {
            jsonObject = JSON.parse($('#jsonInput').val());
            renderEditor();
            toStep2();
        } catch (e) {
            alert('Invalid JSON');
        }
    }

    function newJSONObject() {
        jsonObject = {};
        renderEditor();
        toStep2();
    }

    function renderEditor() {
        const editor = $('#editor');
        editor.empty();
        createEditor(jsonObject, editor);
    }

    function createEditor(obj, container, path = '') {
        $.each(obj, (key, value) => {
            const fullPath = path ? `${path}.${key}` : key;
            const nodeContainer = $('<div>').addClass('node').attr('data-path', fullPath).attr('draggable', true);
            nodeContainer.on('dragstart', handleDragStart);
            nodeContainer.on('dragover', handleDragOver);
            nodeContainer.on('dragleave', handleDragLeave);
            nodeContainer.on('drop', handleDrop);
            nodeContainer.on('dragend', handleDragEnd);

            const keyInput = $('<input>').val(key).on('input', () => updateKey(fullPath, keyInput.val()));
            const typeSelect = $('<select>').on('change', () => updateType(fullPath, typeSelect.val()));
            const types = ['string', 'number', 'boolean', 'object', 'array'];
            $.each(types, (index, type) => {
                const option = $('<option>').val(type).text(type);
                typeSelect.append(option);
            });
            typeSelect.val(getType(value));
            const valueInput = createValueInput(value, fullPath, typeSelect.val());
            const deleteBtn = $('<button>').text('Delete').on('click', () => confirmDelete(fullPath));
            const toggleBtn = $('<button>').addClass('toggle').text('Toggle').on('click', () => toggleNode(nodeContainer));

            nodeContainer.append(keyInput, typeSelect, valueInput, deleteBtn);

            if (typeof value === 'object' && value !== null) {
                nodeContainer.append(toggleBtn);
                const childContainer = $('<div>').addClass('child-node');
                nodeContainer.append(childContainer);
                createEditor(value, childContainer, fullPath);
            }

            container.append(nodeContainer);
        });

        const addBtn = $('<button>').text('Add Node').on('click', () => addNode(path));
        container.append(addBtn);
    }

    function getType(value) {
        if (Array.isArray(value)) return 'array';
        if (typeof value === 'object') return 'object';
        return typeof value;
    }

    function createValueInput(value, path, type) {
        const input = $('<input>');
        if (type === 'object' || type === 'array') {
            input.val(JSON.stringify(value)).prop('disabled', true);
        } else {
            input.val(value);
        }
        input.on('input', () => updateValue(path, input.val(), type));
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
        const children = node.find('.child-node');
        children.toggle();
    }

    function handleDragStart(event) {
        dragSrcEl = this;
        dragSrcPath = $(event.target).data('path');
        event.originalEvent.dataTransfer.effectAllowed = 'move';
        event.originalEvent.dataTransfer.setData('text/plain', dragSrcPath);
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.originalEvent.dataTransfer.dropEffect = 'move';
        $(this).addClass('over');
    }

    function handleDragLeave(event) {
        $(this).removeClass('over');
    }

    function handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        $(this).removeClass('over');

        const destPath = $(this).data('path');
        const srcPath = event.originalEvent.dataTransfer.getData('text/plain');

        moveNode(srcPath, destPath);

        return false;
    }

    function handleDragEnd(event) {
        $('.node').removeClass('over');
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

        renderEditor();
    }

    function findParentObject(path) {
        const keys = path.split('.');
        let obj = jsonObject;
        for (let i = 0; i < keys.length; i++) {
            obj = obj[keys[i]];
        }
        return obj;
    }

    function toStep1() {
        $('#step1').show();
        $('#step2').hide();
        $('#step3').hide();
    }

    function toStep2() {
        $('#step1').hide();
        $('#step2').show();
        $('#step3').hide();
    }

    function toStep3() {
        $('#jsonOutput').val(JSON.stringify(jsonObject, null, 2));
        $('#step1').hide();
        $('#step2').hide();
        $('#step3').show();
    }

    function toStep2From3() {
        $('#step1').hide();
        $('#step2').show();
        $('#step3').hide();
    }
});
