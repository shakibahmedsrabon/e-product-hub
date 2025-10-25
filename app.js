let msg = document.querySelector(".message-body");
let sendBtn = document.querySelector(".send");
let BackBtn = document.querySelector(".back");
let chatBody = document.querySelector(".chat-body");
let chatBtn = document.querySelector(".chat-button");

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
        textInput.value = '';
        SendSound()
        setTimeout(function(){
            ReceiveSound()
        }, 900)
        console.log("Text Interned:", text)
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

BackBtn.addEventListener('click', function(){
    BackBtn.classList.add('close');
    chatBody.classList.add('close');
})

chatBtn.addEventListener('click', function(){
    BackBtn.classList.remove('close');
    chatBody.classList.remove('close');
})

// Sound for outgoing messages
const outgoing = new Audio("./sounds/outgoing.mp3");
outgoing.preload = "auto";
outgoing.load();

function SendSound(){
    outgoing.currentTime = 0;
    outgoing.play()
}

// Sound for incoming messages
const incoming = new Audio("./sounds/incoming.mp3");
incoming.preload = "auto";
incoming.load();

function ReceiveSound(){
    incoming.currentTime = 0;
    incoming.play()
}