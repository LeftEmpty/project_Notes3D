
// Dynamic Popup for every page
/*
class IUPopup extends HTMLElement {
    connectedCallback() {
        this.innerHTML =
        `
        
        `
    }
}
customElements.define('iu-popup', IUPopup);
*/

// Handle popup open/close
document.querySelector("#iu-show-login").addEventListener("click", function() {
    document.querySelector(".iu-popup").classList.add("iu-popup--active");
});
document.querySelector(".iu-popup .iu-btn--close").addEventListener("click", function() {
    document.querySelector(".iu-popup").classList.remove("iu-popup--active");
});
// Handle login / register popup page selection
document.querySelector(".iu-popup .iu-page-selection-btn--prev").addEventListener("click", function() {
    console.log('prev -> login');
    document.querySelector(".iu-popup").classList.add("iu-popup--login");
    document.querySelector(".iu-popup").classList.remove("iu-popup--register");
});
document.querySelector(".iu-popup .iu-page-selection-btn--next").addEventListener("click", function() {
    console.log('next -> register');
    document.querySelector(".iu-popup").classList.add("iu-popup--register");
    document.querySelector(".iu-popup").classList.remove("iu-popup--login");
});

document.querySelector('#iu-popup--logout-btn').addEventListener("click", function() {
    console.log('clicked it');
    fetch('/logout', {
        method: "POST"
    })
})

//<li class="iu-btn iu-btn--colored" id="iu-show-login"><a><%= bLoggedIn %></a></li>

