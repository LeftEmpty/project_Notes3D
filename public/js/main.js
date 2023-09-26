// handle popup open/close
document.querySelector("#iu-show-login").addEventListener("click", () => openPopup('login'));
document.querySelector(".iu-popup .iu-btn--close").addEventListener("click", closePopup);

// call to action button
document.querySelector('#iu-btn--cta').addEventListener("click", () => { openPopup('register') });

// handle login / register popup page selection
document.querySelector(".iu-popup .iu-page-selection-btn--prev").addEventListener("click", () => { swapPopupPage('login') });
document.querySelector(".iu-popup .iu-page-selection-btn--next").addEventListener("click", () => { swapPopupPage('register') });

// logout
document.querySelector('#iu-popup--logout-btn').addEventListener("click", function() {
    console.log('clicked it');
    fetch('/logout', {
        method: "POST"
    })
});

function openPopup(page = null) {
    console.log('open');
    document.querySelector(".iu-popup").classList.add("iu-popup--active");
    if (page == 'login') {
        swapPopupPage('login');
    }
    else if (page == 'register') {
        swapPopupPage('register');
    }
}

function closePopup() {
    document.querySelector(".iu-popup").classList.remove("iu-popup--active");
}

function swapPopupPage(page) {
    if (page == 'login') {
        console.log('prev -> login');
        document.querySelector(".iu-popup").classList.add("iu-popup--login");
        document.querySelector(".iu-popup").classList.remove("iu-popup--register");
    }
    else if (page == 'register') {
        console.log('next -> register');
        document.querySelector(".iu-popup").classList.add("iu-popup--register");
        document.querySelector(".iu-popup").classList.remove("iu-popup--login");
    }
}