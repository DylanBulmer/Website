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

        // Adjust elements
        subtitle.innerHTML = servers[i].game;
        name.innerHTML = servers[i].name;
        name.style.marginBottom = "15px";
        name.style.fontStyle = "italic";
        version.innerHTML = "Version: " + servers[i].version;
        status.innerHTML = "Status: " + servers[i].status;
        status.style.marginBottom = "15px";

        // Create link
        link.href = servers[i].url;
        link.target = servers[i].target;
        link.innerHTML = "Play Now!";

        // Append everything together
        column.appendChild(subtitle);
        column.appendChild(name);
        column.appendChild(version);
        column.appendChild(status);
        column.appendChild(link);

        // Append column to dump location
        servs.appendChild(column);
    }
};

postServers();