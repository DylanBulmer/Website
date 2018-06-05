function getDiscord(callback) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            return callback(JSON.parse(this.responseText));
        }
    };
    xhttp.open("GET", "https://discordapp.com/api/guilds/236255792737681408/widget.json", true);
    xhttp.send();
}

document.addEventListener("DOMContentLoaded", getDiscord(function (data) {
    document.getElementById('om').innerText = data.members.length;
}));

setInterval(function () {
    getDiscord(function (data) {
        document.getElementById('om').innerText = data.members.length;
    });
}, 10000);

var topics = document.getElementsByTagName('topics')[0];

forums.forEach(function (thread, index, array) {
    let ntopic = document.createElement('topic');   // topic wrapper
    let tname = document.createElement('name');     // topic name
    tname.innerText = thread.topic;

    // add admin controls
    tname.innerHTML += '<span style="float: right; display:block; font-weight: normal; vertical-align: middle;">';

    if (user && user.privilege >= 8) {
        tname.innerHTML += '<a onclick="topic.edit(\'' + thread.topic + '\')">Edit <i class="fa fa-edit"></i></a>&nbsp;&nbsp;<a onclick="topic.delete(\'' + thread.topic + '\')">Delete <i class="fa fa-trash"></i></a>';
    }

    tname.innerHTML += '</span>';

    // append name to topic
    ntopic.appendChild(tname);

    // foreach subtopic
    thread.subtopics.forEach(function (sub) {
        let forum = document.createElement('forum');
        let fwrap = document.createElement('a');
        let fname = document.createElement('name');
        let twrap = document.createElement('a');
        let tname = document.createElement('name');
        let nthread = document.createElement('thread');
        let author = document.createElement('author');
        let date = document.createElement('date');

        // create title
        fwrap.href = "/forums/" + sub.subtopic + "/";
        fname.innerText = sub.subtopic;

        fwrap.appendChild(fname);
        forum.appendChild(fwrap);

        // create thread
        twrap.href = "/forums/" + sub.subtopic + "/" + (sub.thread.id || "new");
        tname.innerText = "Latest Thread: " + sub.thread.title;
        author.innerHTML = sub.thread.author.name ? sub.thread.author.name + ",&nbsp" : "No posts yet.";
        date.innerText = sub.thread.created;

        twrap.appendChild(tname);
        nthread.appendChild(twrap);
        nthread.appendChild(author);
        nthread.appendChild(date);
        forum.appendChild(nthread);

        ntopic.appendChild(forum);
    });

    topics.appendChild(ntopic);
});