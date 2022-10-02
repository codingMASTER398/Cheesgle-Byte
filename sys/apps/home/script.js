let welcomeText = document.getElementById('wb'),
  pfp = document.getElementById('pfp'),
  appsContainer = document.getElementById('apps'),
  loadingApps = document.getElementById('loadingApps'),
  assistant = document.getElementById('rehe');

let launchingApp = false;

function greeting() {
  if (new Date().getHours() < 6) return `Good chight`
  else if (new Date().getHours() < 12) return `Good chorning`
  else if (new Date().getHours() < 21) return `Good chevening`
  else return `Good chight`
}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

const appTemplate = `<div class="app">
  <img src="">
  <p></p>
</div>`

window.addEventListener('message', async function(e) {
  data = e.data // Get the data from the message event

  switch (data.type) {
    case 'info':
      if (data.phone.isLoggedIn) {
        parent.postMessage({ type: "requestReplit" }, "*");
      } else {
        welcomeText.innerText = greeting() + "!"
      }

      document.body.style.background = `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ), url('${localStorage.getItem(`wallpaper`)}')`
      document.body.style.backgroundPosition = 'center'
      document.body.style.backgroundSize = 'cover'

      let apps = data.phoneApps
      appsContainer.style.display = `none`

      let appsDone = 0

      appsContainer.innerHTML = ''
      for (let i = 0; i < apps.length; i++) {
        fetch(`${apps[i]}/package.json`).then(async (re) => {
          if (re.status == 200) {
            let app = await re.json()
            let html = createElementFromHTML(appTemplate)
            if (app.icon) {
              html.getElementsByTagName(`img`)[0].src = `${apps[i]}/${app.icon}`
            } else {
              html.getElementsByTagName(`img`)[0].src = `/sys/img/unknown.png`
            }
            html.getElementsByTagName(`p`)[0].innerText = app.title
            appsContainer.appendChild(html)
            html.getElementsByTagName(`img`)[0].addEventListener('click', () => {
              console.log(`Click`)
              if (!launchingApp) {
                launchingApp = true
                parent.postMessage({ type: "launchApp", app: apps[i] }, "*")
              }
            })
          }
        }).catch(() => { }).finally(() => {
          appsDone++
          if (appsDone == apps.length) {
            setTimeout(() => {
              loadingApps.hidden = true
              appsContainer.style.display = `grid`;
              [...appsContainer.children]
                .sort((a,b)=>a.getElementsByTagName(`p`)[0].innerText.localeCompare(b.getElementsByTagName(`p`)[0].innerText))
                .forEach(node=>appsContainer.appendChild(node));

              assistant.addEventListener('click',()=>{
                if(!assistant.classList.contains(`rehe`)){
                  assistant.classList.add(`rehe`);
                  let rehe = new Audio(`./sounds/${Math.floor(Math.random()*14)+1}.mp3`)
                  rehe.play()
                  rehe.addEventListener('ended', function() { 
                    assistant.classList.remove(`rehe`);
                  }, {once:true});
                }
              })
            }, 500)
          }
        })
      }
      break;
    case 'replitInfo':
      if (data.data.loggedIn) {
        welcomeText.innerText = `${greeting()}, ${data.data.name}!`
        pfp.src = data.data.profileImage
      }
      break;
  }
});