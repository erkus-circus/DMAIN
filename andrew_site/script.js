const $ = (q) => document.querySelector(q);

async function loadImage(i) {
    var imgElem = new Image();
    imgElem.onload = function () {
        $(".images").appendChild(imgElem);
    }
    imgElem.src = `images/${i}.png`;
    imgElem.id = "a" + i;
    imgElem.className = "image"
}

async function loadImages() {
    // change
    var numImages = 6;

    var images = [];

    for (let i = 0; i < numImages; i++) {
        await loadImage(i);
    }
}

function makeQuestion(i, json) {
    const q = json[i];
    var div = document.createElement("DIV");
    div.id = "q" + i;
    div.className = "question";

    var title = document.createElement("DIV");
    title.innerText = q.title;
    div.appendChild(title);

    var options = document.createElement("DIV");

    for (let j = 0; j < q.options.length; j++) {

        const opt = q.options[j];

        var optElem = document.createElement("SPAN");
        optElem.className = "Option";
        optElem.innerText = opt + '\n';

        optElem.onclick = function () {
            if (q.correct == j) {
                alert("YAY");
            }
        };
        options.appendChild(optElem);


    }

    div.appendChild(options);

    $(".questions").appendChild(div)


}

async function loadQuestions() {
    var response = await fetch("question.json");
    var json = await response.json();

    for (let i = 0; i < json.length; i++) {
        makeQuestion(i, json);
    }

}

onload = async function () {

    await loadImages();
    await loadQuestions();


    var imgIndex = -1;
    setInterval(() => {
        var images = document.getElementsByClassName("image");
        for (var i = 0; i < images.length; i++) {
            images.item(i).style.display = "none";
        }
        images[Math.floor(Math.random() * images.length)].style.display = "block";
        if (++imgIndex >= images.length) {
            imgIndex = 0;
        }
    }, 25);
}