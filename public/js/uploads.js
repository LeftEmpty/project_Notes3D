console.log('uploads script');


const uploadForm = document.querySelector('#file-upload-form');

console.log(uploadForm);

uploadForm.addEventListener("submit", (event) => {
    // prevent default form submit
    event.preventDefault();

    // ('files' is the reference name used by multer to intercept the uploads (in app.js))

    // create form data body
    const formData = new FormData();
    const noteField = document.querySelector('#upload-note');
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
    fetch('http://localhost:3333/uploads', {
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

function deleteThisUpload(filename) {
    console.log('trying to delete upload')
    const uploadData = [];
    uploadData.append(filename);


    fetch ('http://localhost:333/uploads', {
        method: 'DELETE',
        body: uploadData,
    })
    .then (response => json())
    .then(data => {
        console.log(data);
        location.reload();
    })
}