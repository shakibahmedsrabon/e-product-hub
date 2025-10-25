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
        setTimeout(function(){
            let reply = aiMessageUI(msg)
            setTimeout(function(){
                reply.textContent = 'Replying: '+text;
                ReceiveSound()
                reply.classList.remove('waiting');
                reply.classList.add('text-message', 'show');
                scrollView(msg)
            }, 1000)
        }, 900)
        senderMessageUI(msg, text)
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


function senderMessageUI(append = document, text = '') {
  const section = document.createElement("section");
  section.className = "message Flex";

  const icon = document.createElement("section");
  icon.className = "icon";
  icon.innerHTML = `<svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4.0415 9.00098C2.8679 9.00098 1.9165 9.95234 1.9165 11.126C1.9165 12.2995 2.8679 13.251 4.0415 13.251C5.21511 13.251 6.1665 12.2995 6.1665 11.126C6.1665 9.95234 5.21511 9.00098 4.0415 9.00098Z" stroke="#ADADAD" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M11.125 9.00098C9.95136 9.00098 9 9.95234 9 11.126C9 12.2995 9.95136 13.251 11.125 13.251C12.2986 13.251 13.25 12.2995 13.25 11.126C13.25 9.95234 12.2986 9.00098 11.125 9.00098Z" stroke="#ADADAD" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8.99984 10.4177H6.1665" stroke="#ADADAD" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14.6667 7.58415C12.9266 6.71467 10.3978 6.16748 7.58333 6.16748C4.76883 6.16748 2.24008 6.71467 0.5 7.58415" stroke="#ADADAD" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12.5417 6.52183L11.7926 1.71396C11.6398 0.733446 10.5748 0.202147 9.71492 0.677488L9.2793 0.918293C8.22218 1.50265 6.94449 1.50265 5.8874 0.918293L5.45177 0.677488C4.59187 0.202147 3.52684 0.733453 3.37407 1.71396L2.625 6.52183" stroke="#ADADAD" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>`;

  const textNode = document.createElement("section");
  textNode.className = "text-message";
  textNode.textContent = text;

  section.append(icon, textNode);
  append.appendChild(section);

  setTimeout(function(){
      textNode.classList.add('show')
      scrollView(msg)
    SendSound()
  }, 100)
}

function aiMessageUI(append = document, text = '') {
  const section = document.createElement("section");
  section.className = "message temp Flex";

  const icon = document.createElement("section");
  icon.className = "icon";
  icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.07545 4.20909C6.31686 3.59697 7.18314 3.59697 7.42456 4.20909L8.10774 5.94121C8.54994 7.06249 9.43749 7.95008 10.5588 8.39228L12.2909 9.07546C12.903 9.31689 12.903 10.1831 12.2909 10.4246L10.5588 11.1077C9.43749 11.5499 8.54994 12.4375 8.10774 13.5588L7.42456 15.2909C7.18314 15.903 6.31686 15.903 6.07545 15.2909L5.39231 13.5588C4.95008 12.4375 4.06249 11.5499 2.94121 11.1077L1.20909 10.4246C0.596972 10.1831 0.596972 9.31689 1.20909 9.07546L2.94121 8.39228C4.06249 7.95008 4.95008 7.06249 5.39231 5.94121L6.07545 4.20909Z" stroke="#ADADAD" stroke-width="1"/>
                    <path d="M12.9689 0.941281C13.0695 0.68624 13.4305 0.68624 13.5311 0.941281L13.8157 1.663C14 2.1302 14.3698 2.50003 14.837 2.68429L15.5587 2.96893C15.8137 3.06952 15.8137 3.43047 15.5587 3.53107L14.837 3.81571C14.3698 3.99997 14 4.3698 13.8157 4.837L13.5311 5.55872C13.4305 5.81376 13.0695 5.81376 12.9689 5.55872L12.6843 4.837C12.5 4.3698 12.1302 3.99997 11.663 3.81571L10.9412 3.53107C10.6863 3.43047 10.6863 3.06952 10.9412 2.96893L11.663 2.68429C12.1302 2.50003 12.5 2.1302 12.6843 1.663L12.9689 0.941281Z" stroke="#ADADAD" stroke-width="1"/>
                    </svg>`;

  const textNode = document.createElement("section");
  textNode.className = "waiting";
  textNode.textContent = 'Thinking..';

  section.append(icon, textNode);
  append.appendChild(section);

  return textNode;
}

function scrollView(container) {
  requestAnimationFrame(() => {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth"
    });
  });
}