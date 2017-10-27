document.addEventListener("DOMContentLoaded", function () {
    Barba.Pjax.init();
    Barba.Pjax.cacheEnabled = false;
    Barba.Pjax.start();

    var HideShowTransition = Barba.BaseTransition.extend({
        start: function () {
            let thing = this;
            document.getElementById("barba-wrapper").style.opacity = 0;
            document.body.style.overflowY = "hidden";
            setTimeout(function () {
                thing.newContainerLoading.then(thing.finish.bind(thing));
            }, 250);
        },

        finish: function () {
            // Load Javascript for page
            addPageSources();
            // Close Nav
            navClose();
            // Fix page transition
            window.location.hash = '';
            document.body.style.overflowY = "auto";
            document.getElementById("barba-wrapper").style.opacity = 1;
            document.body.scrollTop = 0;
            // Finish
            this.done();
        }
    });

    Barba.Pjax.getTransition = function () {
        return HideShowTransition;
    };
});

var navOpen = function navOpen() {
    document.getElementsByClassName("title")[0].style.left = "260px";
    document.getElementsByTagName("nav")[0].style.width = "250px";
}

var navClose = function navClose() {
    document.getElementsByClassName("title")[0].style.left = "50px";
    document.getElementsByTagName("nav")[0].style.width = "0px";
}

var addPageSources = function addPageSources() {
    window.location.hash = '';
    switch (window.location.pathname) {
        case '/manage':
            let tag = document.createElement("script");
            tag.src = "/js/tabs.js";
            document.getElementsByTagName("head")[0].appendChild(tag);
            break;
    }
}

addPageSources();