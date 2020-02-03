const select = (id) => {
    let element = document.getElementById(id);

    if (element.getAttribute("class") === "selected") {
        element.setAttribute("class", "");
        element.children[0].children[0].checked = false;
    } else {
        element.setAttribute("class", "selected");
        element.children[0].children[0].checked = true;
    }
};

/**
 * @description Redirects to a different URL to edit a user
 * @param {number} id User to edit first
 * @param {number[]} next User(s) to edit after
 * @returns {boolean} Returns false if event is canceled
 */
const edit = (id, next) => {
    if (id) {
        let dest = "/users/" + id + "/edit";

        if (next && next.length !== 0) {
            let url = "?next=";
            
            for (let i = 0; i < next.length; i++) {
                if (i === next.length - 1) {
                    url += next[i];
                } else {
                    url += next[i] + ",";
                }
            }

            dest += url;
        }

        window.location.assign(dest);
    } else {
        let selected = document.getElementsByClassName('selected');

        if (selected.length > 0) {
            let dest = "/users/" + selected[0].getAttribute("id") + "/edit";

            if (selected.length > 1) {
                let url = "?next=";

                // offset by one
                for (let i = 1; i < selected.length; i++) {
                    if (i === selected.length - 1) {
                        url += selected[i].getAttribute("id");
                    } else {
                        url += selected[i].getAttribute("id") + ",";
                    }
                }

                dest += url;
            }

            window.location.assign(dest);
        } else {
            return false;
        }
    }
};

/**
 * 
 * @param {number[]} ids An array of next users to query
 */
const next = (ids) => {
    edit(ids.shift(), ids);
};