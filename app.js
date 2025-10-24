let msg = document.querySelector(".message-body");
let sendBtn = document.querySelector(".send");

for(let i = 0; i < 100; i++){
    msg.innerHTML += "<button> Hello,"+ i+"</button>";
}

let textInput = document.getElementById("prompt");

textInput.addEventListener("keyup", function(e){
    let text = e.target.value;
    if(text.length < 2){
        sendBtn.classList.remove("active")
        return;
    }else {
        sendBtn.classList.add("active")
    }
    if(e.key === "Enter" || e.keyCode === 13){
        console.log("Text Intered:", e.target.value)
    }
})