let msg = document.querySelector(".message-body");
let sendBtn = document.querySelector(".send");


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
        console.log("Text Interned:", e.target.value)
    }
})

function MessageUI(text = '', type = false){
    let stricture = `
        ${type ? 'Sender' : "Resider"}, ${text}</br>
    `;
    return stricture;
}

function CheckURL() {
  const hash = window.location.hash.slice(1);
  const value = hash.replace(/^ai=/, '');
  console.log(decodeURIComponent(value));
}

CheckURL()

window.addEventListener('popstate', CheckURL)