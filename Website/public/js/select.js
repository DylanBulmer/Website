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

const edit = () => {
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
};