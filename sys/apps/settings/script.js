function to(page){
  for(let i=0;i<document.body.children.length;i++){
    if(document.body.children[i].id==page){
      document.body.children[i].hidden = false
    }else{
      document.body.children[i].hidden = true
    }
  }
}
window.addEventListener('message', async function(e) {
  let data = e.data // Get the data from the message event

  switch (data.type) {
    case 'info':
      // Replit info
      if (data.phone.isLoggedIn) {
        parent.postMessage({ type: "requestReplit" }, "*");
      }else{
        replitStatus.innerText = `Logged out of Replit`
      }

      // Apps
      for(let i=0;i<data.phoneApps.length;i++){
        fetch(`${data.phoneApps[i]}/package.json`).then(async (re) => {
          if (re.status == 200) {
            let app = await re.json()
            let html = createElementFromHTML(appTemplate)
            if (app.icon) {
              html.getElementsByTagName(`img`)[0].src = `${data.phoneApps[i]}/${app.icon}`
            } else {
              html.getElementsByTagName(`img`)[0].src = `/sys/img/unknown.png`
            }
            html.getElementsByTagName(`b`)[0].innerText = app.title
            console.log(data.phoneApps[i], data.phoneApps[i].startsWith(`/sys/apps/`))
            html.getElementsByTagName(`span`)[0].innerHTML = `${data.phoneApps[i].startsWith(`/sys/apps/`) ?  `` : `<a class="uninstall"><span class="material-symbols-outlined">delete</span></a>`} v${Number(app.version)}`
            
            appsContainer.appendChild(html)

            if(!data.phoneApps[i].startsWith(`/sys/apps/`)){
              html.getElementsByTagName(`a`)[0].addEventListener('click', () => {
                html.remove()
                let a = JSON.parse(localStorage.getItem(`apps`))
                a = a.filter(function(item) {
                  return item !== data.phoneApps[i]
                })
                localStorage.setItem(`apps`, JSON.stringify(a))
                localStorage.removeItem(`store:${data.phoneApps[i]}`)
              })
            }
          }
        }).catch(console.error)
      }
      break;
    case 'replitInfo':
      if (data.data.loggedIn) {
        replitStatus.innerText = `Logged in to Replit as ${data.data.name}. ${data.data.bio ? `"${data.data.bio}"` : "No bio."}`
      }
      break;
  }
})

// Wallpapers

for(let i=0; i<document.getElementsByClassName('wallpaper').length; i++){
  document.getElementsByClassName('wallpaper')[i].addEventListener('click',()=>{
    for(let e=0; e<document.getElementsByClassName('wallpaper').length; e++) document.getElementsByClassName('wallpaper')[e].classList.remove('chosenWallpaper')

    localStorage.setItem(`wallpaper`,new URL(document.getElementsByClassName('wallpaper')[i].src).pathname)

    document.getElementsByClassName('wallpaper')[i].classList.add('chosenWallpaper')
  })
}

// Internet
let internetText = document.getElementById("internetText")

let tn = Date.now()
fetch(`https://example.com`,{mode:'no-cors'}).then(()=>{
  let tt = Date.now() - tn
  internetText.innerHTML = `Time to fetch example.com was ${tt}ms.<br>Checking for CORS...`
  fetch(`https://google.com`).then((r)=>{
    if(r.status == 200){
      internetText.innerHTML = `Time to fetch example.com was ${tt}ms.<br>CORS is disabled.`
    }else{
      internetText.innerHTML = `Time to fetch example.com was ${tt}ms.<br>CORS is enabled.`
    }
  }).catch(()=>{
    internetText.innerHTML = `Time to fetch example.com was ${tt}ms.<br>CORS is enabled.`
  })
}).catch((e)=>{
  console.log(e)
  internetText.innerHTML = `You're offline.`
})

// Replit
let replitStatus = document.getElementById("replitStatus")

function replit(){
  parent.postMessage({ type: "requestReplit" }, "*");
}

// Apps
function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

let appsContainer = document.getElementById(`appsContainer`)

const appTemplate = `<div class="app">
  <img class="appimg" src="/sys/apps/settings/icon.png">
  <span class="right"></span>
  <b>Settings</b>
</div>`

// System info
function reset(){ // FULL SYSTEM RESET
  localStorage.clear();
  parent.location.reload()
}