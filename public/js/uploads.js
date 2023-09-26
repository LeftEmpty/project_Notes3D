// console.log('uploads script');
const uploadsURL = 'http://localhost:3333/uploads/';

// ADDING UPLOAD

const uploadForm = document.querySelector('#file-upload-form');

uploadForm.addEventListener("submit", (event) => {
    // prevent default form submit
    event.preventDefault();

    // ('files' is the reference name used by multer to intercept the uploads (in app.js))

    // create form data body
    const formData = new FormData();
    const noteField = document.querySelector('#new-upload--note');
    const filesField = document.querySelector('#upload-files');
    const filesUsername = document.querySelector('#upload-user');

    formData.append('fileUsername', filesUsername.value);
    formData.append('note', noteField.value);
    for (let i = 0; i < filesField.files.length; i++) {
        formData.append('files', filesField.files[i]);
    }

    // console.log('formdata:');
    // console.log(...formData);

    // !TODO temp - should be the environment variable.. somehow
    fetch(uploadsURL, {
        method: 'POST',
        body: formData,
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        location.reload();
    })
    .catch(error => {
        console.error('ERROR:', error);
    });
})

// DELETING UPLOAD

// add onclick events to upload list for deleting
const uploadsList = document.querySelector('#iu-um-list');

uploadsList.addEventListener("click", (event) => {
    if (event.target.classList.contains('iu_um_delanchor')) {
        const id = event.target.getAttribute('data-id');
        delUpload(id);
    }
});

function delUpload(id) {
    // !TODO temp - should be the environment variable.. somehow
    const url = uploadsURL + id;

    fetch (url, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        location.reload();
    })
}

// EDITING UPLOAD
const editBtn = document.querySelector('#btn--cur-note--edit');
editBtn.addEventListener("click", toggleReadOnly);

function toggleReadOnly() {
    var textarea = document.querySelector("#cur-upload--note");
    if (textarea.readOnly) {
        textarea.classList.remove('cur-note--readonly');
        textarea.classList.add('cur-note--editable');
        textarea.removeAttribute("readonly");
    } else {
        textarea.classList.remove('cur-note--editable');
        textarea.classList.add('cur-note--readonly');
        textarea.setAttribute("readonly", "true");
    }
}

const editForm = document.querySelector('#edit-upload-form');

editForm.addEventListener("submit", (event) => {
    // prevent default form submit
    event.preventDefault();

    const noteField = document.querySelector('#cur-upload--note');
    const url = uploadsURL + editForm.querySelector('#btn--cur-note--submit').getAttribute('data-id');

    console.log(url);

    fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ note: noteField.value })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        location.reload();
    })
})