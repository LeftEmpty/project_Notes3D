// console.log('fileuploads script');

const uploadForm = document.querySelector('#file-upload-form');

uploadForm.addEventListener("submit", (event) => {
    // prevent default form submit
    event.preventDefault();

    // ('files' is the reference name used by multer to intercept the uploads (in app.js))

    // create form data body
    const formData = new FormData();
    const noteField = document.querySelector('#upload-note');
    const filesField = document.querySelector('#upload-files');
    const filesUserkey = document.querySelector('#upload-user');

    formData.append('userkey', filesUserkey.value);
    formData.append('note', noteField.value);
    for (let i = 0; i < filesField.files.length; i++) {
        formData.append('files', filesField.files[i]);
    }

    console.log('formdata:');
    console.log(...formData);

    // !TODO temp - should be the environment variable.. somehow
    fetch('http://localhost:3333/uploads', {
        method: 'POST',
        body: formData,
    })
    // !TODO reaction or feedback to the user
    .then(res => res.json())
    .then(data => console.log(data));
})