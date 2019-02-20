document.addEventListener("DOMContentLoaded", function () {
    try {
        Barba.Pjax.init();
        //Barba.Pjax.cacheEnabled = false;
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
    } catch(e) {
        addPageSources();
    }
});

var navOpen = function navOpen() {
    document.getElementsByTagName("nav")[0].style.width = "250px";
};

var navClose = function navClose() {
    document.getElementsByTagName("nav")[0].style.width = "0px";
};

var addPageSources = function addPageSources() {
    window.location.hash = '';
    switch (window.location.hostname.split('.')[0]) {
        case 'account':
            switch (window.location.pathname) {
                case '/':
                    //let tag = document.createElement("script");
                    //tag.src = "/js/tabs.js";
                    //document.getElementsByTagName("head")[0].appendChild(tag);
                    break;
            }
            break;
        case 'blog':
            let pieces = window.location.pathname.split('/');
            switch (pieces[pieces.length - 1]) {
                case 'new':
                case 'edit':
                    let scripts = document.head.children;

                    for (let i = 0; i < scripts.length; i++) {
                        if (scripts.item(i).tagName === "SCRIPT" && scripts.item(i).getAttribute("src") === "/js/blogForm.js") {
                            console.log("deleting script");
                            document.head.removeChild(scripts.item(i));
                        }
                    }

                    console.log("adding script");
                    let tag = document.createElement("script");
                    tag.src = "/js/blogForm.js";
                    document.head.appendChild(tag);

                    break;
            }
            break;
        default:
            switch (window.location.pathname) {
                case '/':
                    break;
            }
    }
};

addPageSources();