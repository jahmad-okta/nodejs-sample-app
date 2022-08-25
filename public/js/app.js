const el = (selector) => document.querySelector(selector);

const displayUser = (userID) => {
    const info = el("#user-detail-info");
    tag = document.createElement("p");
    text = document.createTextNode("Loading");
    tag.appendChild(text);
    info.appendChild(tag);
}

const gotoCreate = () => {
    location.href = '/admin/create';
}

const create = () => {
    console.log("Create");
    var myform = document.getElementById("user-data");
    myform.submit();
}