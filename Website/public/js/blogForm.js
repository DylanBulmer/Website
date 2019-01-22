if (!post) var post = document.getElementById("postBtn");
else post = document.getElementById("postBtn");

if (!save) var save = document.getElementById("saveBtn");
else save = document.getElementById("saveBtn");

if (!form) var form = document.getElementById("form");
else form = document.getElementById("form");

if (post) {
    post.addEventListener("click", function (e) {
        let type = document.createElement("input");
        type.setAttribute("type", "hidden");
        type.setAttribute("name", "type");
        type.setAttribute("value", "publish");

        form.append(type);

        form.submit();
    });
}

if (save) {
    save.addEventListener("click", (e) => {
        let type = document.createElement("input");
        type.setAttribute("type", "hidden");
        type.setAttribute("name", "type");
        type.setAttribute("value", "draft");

        form.append(type);

        form.submit();
    });
}