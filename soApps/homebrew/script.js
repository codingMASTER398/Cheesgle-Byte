let appsList = document.getElementById('apps')
const SeamLoop = new SeamlessLoop();
SeamLoop.addUri('https://i.haroon.repl.co/🧝‍♀️🧏🕠👩‍👩‍👧‍👦🏜️.wav', 4210.844, 'intro')
SeamLoop.addUri('https://i.haroon.repl.co/🦬🇺🇸🇹🇨🌦️🧋.wav', 8420.375, "loop");

let isRickbrew = Math.floor(Math.random() * 1000) == 69;

SeamLoop.callback(() => {
  if (isRickbrew) {
    window.rickbrew = new Audio('https://i.haroon.repl.co/🇳🇦🇬🇦⏭️◾😾.mp3');
    rickbrew.play()
    rickbrew.onended = () => {
      parent.postMessage({type:"close"},"*")
    }

    rickbrew.ontimeupdate = () => {
      if (rickbrew.currentTime > 3.446129) {
        // Activate the Astley.
        const astley = document.createElement('img')
        astley.className = "slide-up"
        astley.src = "https://media.discordapp.net/attachments/993546867164069910/1026153122600599572/unknown.png"
        astley.style.zIndex = "99999999999"
        document.body.appendChild(astley)
        setTimeout(() => {
          document.body.innerHTML = ""
          document.body.style.background = `url(https://media.tenor.com/x8v1oNUOmg4AAAAd/rickroll-roll.gif) 0px ${innerHeight/4.5}px no-repeat`
          document.body.style.backgroundSize = "cover"
        }, 500)
        document.getElementsByClassName('disclaimer')[0].remove()
        document.getElementsByClassName('header')[0].innerText = "Rickbrew"
        rickbrew.ontimeupdate = null;
      } // why... it won't stop i rigged it to always do it for now so i can test it
    }
  } else {
    SeamLoop.start('intro');
    SeamLoop.update('loop');
  }
});

let apps;

window.addEventListener('message', async function ({ data }) {
  if (data.type == "info") {
    apps = data.phoneApps;
    if (!isRickbrew) {
      updateList();
    }
  }
})
function updateList() {
  appsList.innerHTML = ""
  apps.forEach(async app => {
    try{
      let li = document.createElement('li')
      const json = await fetch(app + '/package.json').then(res => res.json())
  
      li.innerHTML = `<img class="app-icon" src="${json.icon ? app + '/' + json.icon : 'https://one.byte.cheesgle.com/sys/img/unknown.png'}" onerror="this.src='https://one.byte.cheesgle.com/sys/img/unknown.png'">`
  
      let e = document.createElement('span')
      e.className="app-title"
      e.innerText = `${json.title} (v${json.version})`
  
      li.appendChild(e)
  
      let ea = document.createElement('button')
      ea.style.backgroundColor = "rgba(255,255,255,0)"
      ea.style.border = "0px"
      let i = document.createElement('i')
      i.className="fa-solid fa-trash"
      i.style="color:#ff0000;"
      li.appendChild(ea)
      ea.appendChild(i)
  
      ea.onclick = () => window.removeApp(app)
  
      appsList.appendChild(li)
    }catch{}
  })
}

function addApp(URL) {    
  parent.postMessage({
    type: "installApp",
    app: URL
  }, "*")
}

function removeApp(URL) {
  parent.postMessage({
    type: "uninstallApp",
    app: URL
  }, "*")
}
