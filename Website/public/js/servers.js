
let search = (server, callback) => {
    let ajax;

    switch (server.game) {
        case "Garry's Mod":
        case "Unturned":
            ajax = new XMLHttpRequest();
            ajax.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    let body = this.response;
                    //console.log(typeof body, body); // Returns true/false as a String
                    if (body === "true") server.status = "Online";
                    callback(server);
                }
            };
            ajax.onerror = function (err) {
                console.log(err);
                callback(server);
            };
            ajax.open("GET", (config.https ? "https://" : "http://") + "gaming." + config.url + "/api/check/steam/" + server.host + "/" + server.port, true);
            ajax.send();

            break;
        case "Minecraft":
            ajax = new XMLHttpRequest();
            ajax.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    let body = this.response;
                    //console.log(typeof body, body); // Returns true/false as a String
                    if (body === "true") server.status = "Online";
                    console.log(server);
                    callback(server);
                }
            };
            ajax.onerror = function (err) {
                console.log(err);
                callback(server);
            };
            ajax.open("GET", (config.https ? "https://" : "http://") + "gaming." + config.url + "/api/check/minecraft/" + server.host + "/" + server.port, true);
            ajax.send();
            break;
    }
};

let postServers = () => {
    let servs = document.getElementById('servers');

    for (let i = 0; i < servers.length; i++) {
        // setup elements
        let column = document.createElement("column");
        let subtitle = document.createElement("subtitle");
        let name = document.createElement("info");
        let version = document.createElement("info");
        let status = document.createElement("info");
        let link = document.createElement("a");

        search(servers[i], (server) => {
            // Adjust elements
            subtitle.innerHTML = server.game;
            name.innerHTML = server.name;
            name.style.marginBottom = "15px";
            name.style.fontStyle = "italic";
            version.innerHTML = "Version: " + server.version;
            status.innerHTML = "Status: " + server.status;
            status.style.marginBottom = "15px";

            // Create link
            link.href = server.url;
            link.target = server.target;
            link.innerHTML = "Play Now!";

            // Append everything together
            column.appendChild(subtitle);
            column.appendChild(name);
            column.appendChild(version);
            column.appendChild(status);
            column.appendChild(link);

            // Append column to dump location
            servs.appendChild(column);
        });
    }
};

postServers();