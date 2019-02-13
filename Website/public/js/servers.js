
let search = (server, callback) => {
    switch (server.game) {
        case "Garry's Mod":
        case "Unturned":

            let ajax = new XMLHttpRequest();
            ajax.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {
                    let body = JSON.parse(this.response);
                    if (body.response.servers.length > 0) server.status = "Online";
                    servs.push(server);
                }
                console.log(this.getAllResponseHeaders());
            };
            ajax.onerror = function (err) {
                callback(server);
            };
            ajax.open("GET", "https://api.steampowered.com/ISteamApps/GetServersAtAddress/v0001?addr=" + server.host + ":" + server.port + "&format=json", true);
            ajax.setRequestHeader('Access-Control-Allow-Credentials', true);
            ajax.setRequestHeader('Access-Control-Allow-Origin', '*');
            ajax.setRequestHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
            ajax.setRequestHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
            ajax.send();

            break;
        case "Minecraft":
            callback(server);
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