const profileURL = 'http://localhost:3333/profile/';

// open contact popup
document.querySelector('#btn-contactPopup').addEventListener("click", (event) => {
    document.querySelector(".iu-popup--contact").classList.add("iu-popup--active");
});
// close contact popup
document.querySelector('.iu-btn--contact-close').addEventListener("click", (event) => {
    console.log('close popup');
    document.querySelector(".iu-popup--contact").classList.remove("iu-popup--active");
})


// add friend request
document.querySelector('.iu-form--contact').addEventListener("submit", (event) => {
    // prevent default form submit
    event.preventDefault();

    const contactusernameField = document.querySelector('#contact-username');
    const url = profileURL + contactusernameField.value;

    fetch (url, {
        method: 'PUT'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        location.reload();
    })
});

// remove friend request
document.querySelector('#btn-removeContact').addEventListener("click", (event) => {
    // prevent default form submit
    event.preventDefault();

    const url = window.location.href;

    fetch (url, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        location.href = profileURL;
    })
});

