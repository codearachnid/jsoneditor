const itemList = document.getElementById('itemList');
const jsonInput = document.getElementById('jsonInput');
const addItemButton = document.getElementById('addItemButton');
const copyButton = document.getElementById('copyButton');
const errorMessage = document.getElementById('error-message');

jsonInput.addEventListener('input', () => {
  validateAndParseJson();
});

function validateAndParseJson() {
  try {
    const jsonArray = JSON.parse(jsonInput.value);
    if (Array.isArray(jsonArray)) {
      renderList(jsonArray);
      addItemButton.style.display = 'inline'; // Show the add item button
      copyButton.style.display = 'inline'; // Show the copy button
      errorMessage.textContent = ''; // Clear any error messages
    } else {
      throw new Error('The JSON is not an array.');
    }
  } catch (e) {
    errorMessage.textContent = 'Invalid JSON: ' + e.message;
    itemList.innerHTML = ''; // Clear the list if JSON is invalid
    addItemButton.style.display = 'none'; // Hide the add item button if JSON is invalid
    copyButton.style.display = 'none'; // Hide the copy button if JSON is invalid
  }
}

function renderList(array) {
  itemList.innerHTML = '';
  array.forEach((item, index) => {
    const listItem = document.createElement('li');
    listItem.setAttribute('data-id', index);
    listItem.innerHTML = `
      From: ${item.redirectFrom} -> To: ${item.redirectTo}
      <button onclick="editItem(${index})">Edit</button>
      <button onclick="deleteItem(${index})">Delete</button>
    `;
    itemList.appendChild(listItem);
  });

  new Sortable(itemList, {
    animation: 150,
    onEnd: function () {
      const newArray = [];
      itemList.querySelectorAll('li').forEach((li) => {
        const index = li.getAttribute('data-id');
        newArray.push(JSON.parse(jsonInput.value)[index]);
      });
      jsonInput.value = JSON.stringify(newArray, null, 2);
    }
  });
}

function addItem() {
  const newFrom = prompt("Enter redirectFrom:");
  const newTo = prompt("Enter redirectTo:");
  if (newFrom !== null && newTo !== null) {
    const jsonArray = JSON.parse(jsonInput.value);
    jsonArray.unshift({ redirectFrom: newFrom, redirectTo: newTo });
    jsonInput.value = JSON.stringify(jsonArray, null, 2);
    renderList(jsonArray);
  }
}

function editItem(index) {
  const jsonArray = JSON.parse(jsonInput.value);
  const item = jsonArray[index];
  const newFrom = prompt("Edit redirectFrom:", item.redirectFrom);
  const newTo = prompt("Edit redirectTo:", item.redirectTo);
  if (newFrom !== null && newTo !== null) {
    jsonArray[index] = { redirectFrom: newFrom, redirectTo: newTo };
    jsonInput.value = JSON.stringify(jsonArray, null, 2);
    renderList(jsonArray);
  }
}

function deleteItem(index) {
  if (confirm("Are you sure you want to delete this item?")) {
    const jsonArray = JSON.parse(jsonInput.value);
    jsonArray.splice(index, 1);
    jsonInput.value = JSON.stringify(jsonArray, null, 2);
    renderList(jsonArray);
  }
}

function copyToClipboard() {
  jsonInput.select();
  document.execCommand('copy');
  alert('JSON copied to clipboard!');
}
