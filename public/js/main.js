// handle popup open/close
const loginBtnShow = document.querySelector("#iu-show-login");
const loginBtnClose = document.querySelector(".iu-popup .iu-btn--close");
if (loginBtnShow) {
    loginBtnShow.addEventListener("click", () => openPopup('login'));
}
if (loginBtnClose) {
    loginBtnClose.addEventListener("click", closePopup);
}
// call to action button
const loginBtnCta = document.querySelector('#iu-btn--cta');
if (loginBtnCta) {
    loginBtnCta.addEventListener("click", () => { openPopup('register') });
}

// handle login / register popup page selection
document.querySelector(".iu-popup .iu-page-selection-btn--prev").addEventListener("click", () => { swapPopupPage('login') });
document.querySelector(".iu-popup .iu-page-selection-btn--next").addEventListener("click", () => { swapPopupPage('register') });

// header navbar dropdown
const hamburger = document.querySelector('#iu-nav-toggle');
if (hamburger != null) {
    const navbar = document.querySelector('.iu-navbar');
    hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("iu-hamburger--active");
        navbar.classList.toggle("iu-navbar--active");
    });
}

// logout
const logoutBtn = document.querySelector('#iu-popup--logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener("click", function() {
        console.log('clicked it');
        fetch('/logout', {
            method: "POST"
        })
    });
}

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


