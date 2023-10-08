const homeAppTemplate = `<div class="app">
  <img src="https://appserver.cheesgle.com/apps/calc/icon.png">
  <h3>Calculator</h3>
  <p class="categoryRight">Utility</p>
  <p>A basic calculator for your Cheesgle Byte.</p>
</div>`

const appTemplate=  `
    <button class='back'><span class="material-symbols-outlined">arrow_back</span> Back</button>
    <div id="top">
      <img src="https://appserver.cheesgle.com/apps/calc/icon.png" id="appIcon">
      <h2>Calculator<br><button id="stall">Install</button></h2>
    </div>
    <h4>A basic calculator for your Cheesgle Byte.</h4>
    <p>Created by Cheesgle<br>69420 total installs</p>
    <hr>
    <span id="permissions">No permissions required</span>
    <hr>
    <img src="https://appserver.cheesgle.com/apps/calc/screenshot.png" id="screenshot">`

let homeApps = document.getElementById(`homeApps`),
  info = document.getElementById(`info`),
  appsContainer = document.getElementById(`home`);

let phoneApps = []

const ap = {
  sameOrigin: `Administrator (Full phone access)`,
  openOtherApps: `Launch other apps`,
  noHomeButton: `Disable home buttons`,
  openSitesOnComputer: `Open sites on your computer`
}

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

function fetchHomeApps() {
  fetch(`https://appserver.cheesgle.com/all`).then(async (r) => {
    if (r.status == 200) {
      let json = await r.json()
      homeApps.innerHTML = ``
      for (let i = 0; i < json.length; i++) {
        let html = createElementFromHTML(homeAppTemplate)
        let app = json[i][1]

        let appPath = app.soLocation ? app.soLocation : `https://appserver.cheesgle.com/apps/${json[i][0]}`
        
        html.getElementsByTagName(`img`)[0].src = `${appPath}/${app.icon}`
        
        html.getElementsByTagName(`h3`)[0].innerText = app.title
        html.getElementsByTagName(`p`)[1].innerText = app.description
        html.getElementsByTagName(`p`)[0].innerText = app.category
        
        homeApps.appendChild(html)
        html.addEventListener('click', () => {
          info.innerHTML = appTemplate

          // Icon
          info.getElementsByTagName(`img`)[0].src = `${appPath}/${app.icon}`
          // Title + Install button
          info.getElementsByTagName(`h2`)[0].innerHTML = ``
          info.getElementsByTagName(`h2`)[0].innerText = app.title
          info.getElementsByTagName(`h2`)[0].innerHTML+= `<br><button id="stall">Install</button>`
          // Description
          info.getElementsByTagName(`h4`)[0].innerText = app.description
          // Author and installs
          info.getElementsByTagName(`p`)[0].innerHTML = ``
          info.getElementsByTagName(`p`)[0].innerText = `By `+app.author
          info.getElementsByTagName(`p`)[0].innerHTML+= `<br>${json[i][2]} total installs`
          // Screenshot
          info.getElementsByTagName(`img`)[1].src = `${appPath}/${app.screenshot}`
          // Permissions
          if(app.permissions.length > 0) {
            info.getElementsByTagName(`span`)[1].innerHTML = `<p>App permissions</p><ul>`
            for(let i=0;i<app.permissions.length;i++){
              info.getElementsByTagName(`span`)[1].innerHTML+= `<li>${ap[app.permissions[i]]?ap[app.permissions[i]]:"Unknown permission"}</li>`
            }
            info.getElementsByTagName(`span`)[1].innerHTML+= `</ul>`
          }

          // Show
          info.hidden = false
          appsContainer.hidden = true

          info.getElementsByTagName(`button`)[0].addEventListener('click', () => {
            info.hidden = true
            appsContainer.hidden = false
          })

          if(phoneApps.includes(appPath)){
            info.getElementsByTagName(`button`)[1].innerText = `Uninstall`
            info.getElementsByTagName(`button`)[1].addEventListener('click', () => {
              let lcpa = JSON.parse(localStorage.getItem(`apps`))
              
              let ind = phoneApps.indexOf(appPath);
              if (ind > -1) {
                phoneApps.splice(ind, 1);
              }
              ind = lcpa.indexOf(appPath);
              if (ind > -1) {
                lcpa.splice(ind, 1);
              }

              localStorage.setItem(`apps`, JSON.stringify(lcpa))
              localStorage.removeItem(`store:${appPath}`)
              
              info.hidden = true
              appsContainer.hidden = false
              html.click()
            })
          }else{
            info.getElementsByTagName(`button`)[1].addEventListener('click', () => {
              let lcpa = JSON.parse(localStorage.getItem(`apps`))
              
              phoneApps.push(appPath)
              lcpa.push(appPath)

              localStorage.setItem(`apps`, JSON.stringify(lcpa))

              console.log(`Install`)
              fetch(`https://appserver.cheesgle.com/install/${json[i][0]}`).then(()=>{}).catch(()=>{})
              
              info.hidden = true
              appsContainer.hidden = false
              html.click()
            })
          }
        })
      }
    } else {
      fetchHomeApps()
    }
  }).catch(console.error)
}

fetchHomeApps()

window.addEventListener('message', async function(e) {
  data = e.data // Get the data from the message event

  switch (data.type) {
    case 'info':
      phoneApps = data.phoneApps
      break;
  }
})
