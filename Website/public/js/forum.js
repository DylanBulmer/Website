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

getDiscord(function (data) {
    document.getElementById('om').innerText = data.members.length;
});
setInterval(function () {
    getDiscord(function (data) {
        document.getElementById('om').innerText = data.members.length;
    });
}, 10000);

var topics = document.getElementsByTagName('topics')[0];

forums.forEach(function (thread, index, array) {
    let ntopic = document.createElement('topic');
    let tname = document.createElement('name');
    tname.innerText = thread.topic;

    if (user && user.privilege > 8) {
        tname.innerHTML += '<span style="float: right; display:block; font-weight: normal; vertical-align: middle;"><a onclick="topic.edit(\'' + thread.topic + '\')">Edit <i class="fa fa-edit"></i></a>&nbsp;&nbsp;<a onclick="topic.delete(\'' + thread.topic + '\')">Delete <i class="fa fa-trash"></i></a></span>';
    }

    ntopic.appendChild(tname);

    thread.subtopics.forEach(function (sub) {
        let forum = document.createElement('forum');
        let fwrap = document.createElement('a');
        let fname = document.createElement('name');
        let twrap = document.createElement('a');
        let tname = document.createElement('name');
        let thread = document.createElement('thread');
        let author = document.createElement('author');
        let date = document.createElement('date');
        // create title
        fwrap.href = "#";
        fname.innerText = sub.subtopic;

        fwrap.appendChild(fname);
        forum.appendChild(fwrap);

        // create thread
        twrap.href = "#";
        tname.innerText = "Latest Thread: " + sub.thread.title;
        author.innerHTML = sub.thread.author.name + ",&nbsp";
        date.innerText = sub.thread.created;

        twrap.appendChild(tname);
        thread.appendChild(twrap);
        thread.appendChild(author);
        thread.appendChild(date);
        forum.appendChild(thread);

        ntopic.appendChild(forum);
    });

    topics.appendChild(ntopic);
});