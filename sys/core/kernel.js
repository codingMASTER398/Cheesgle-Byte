console.info(`[KERNEL] Script start`)

// Phone object
let phoneInfo = {
  version: 0.1,
  name: 'Cheesgle Byte One',
  contributors: `coding398`,
  isLoggedIn: false
}

// Sounds
const sounds = {
  appOpen: new Audio('/sys/sounds/appOpen.wav')
};

// Load app list
let systemApps = []
let apps = (JSON.parse(localStorage.getItem(`apps`)) || [])
fetch(`/sys/systemApps.json`).then(async (r) => {
  if (r.status == 200) {
    let j = await r.json()
    for (let i = 0; i < j.length; i++) {
      systemApps.push(j[i])
    }
  } else console.error(`[KERNEL] Couldn't load system app list`)
}).catch((e) => console.error(e))

// Phone & Frame, other elements too
let phone = $('#phone')[0],
  phoneFrame = $(`#phoneFrame`)[0],
  phoneOverlay = $(`.phoneOverlay`),
  homeButton = $(`#bottomSwipe`)[0],
  notchButton = $(`.goHome`)[0],
  currentAppTitle = ``,
  currentAppLocation = ``,
  currentAppPermissions = [];

window.addEventListener('resize', function(event) {
  phoneFrame.width = phone.clientWidth
  phoneFrame.height = phone.clientHeight - 20
}, true);

phoneFrame.width = phone.clientWidth
phoneFrame.height = phone.clientHeight - 20

// Notch
let notchTime = $(`#notchTime`)[0],
  notchCellularBars = $(`#cellularBars`)[0],
  loggedInIcon = $(`.loggedInIcon`)[0];

function updateNotchText() {
  notchTime.innerText = `${new Date().toLocaleTimeString('default', {
    hour: '2-digit',
    minute: '2-digit',
  })} ${currentAppTitle}`;
}
function updateBars() {
  let t = Date.now();
  fetch(`https://example.com`, {
    mode: 'no-cors'
  }).then(() => {
    let difference = Date.now() - t
    if (difference < 200) notchCellularBars.innerText = `signal_cellular_4_bar`
    else if (difference < 400) notchCellularBars.innerText = `signal_cellular_3_bar`
    else if (difference < 600) notchCellularBars.innerText = `signal_cellular_2_bar`
    else if (difference < 800) notchCellularBars.innerText = `signal_cellular_1_bar`
    else notchCellularBars.innerText = `signal_cellular_0_bar`
  }).catch(() => {
    notchCellularBars.innerText = `signal_cellular_nodata`
  })

  if (phoneInfo.isLoggedIn) {
    loggedInIcon.innerText = `person`
  } else {
    loggedInIcon.innerText = `person_off`
  }
}

setInterval(updateBars, 10000)
setInterval(updateNotchText, 1000)
updateNotchText()
updateBars()

// Check if logged in
function requestReplit() {
  return new Promise(async (resolve, reject) => {
    getUserInfo().then((ui) => {
      if (ui) {
        phoneInfo.isLoggedIn = true
        resolve(ui)
      } else {
        LoginWithReplit()
        reject()
      }
    }).catch(reject)
  })
}

getUserInfo().then((ui) => {
  if (ui) {
    phoneInfo.isLoggedIn = true
  }
}).catch(console.error)

// Apps

// TO DO: PERMISSIONS AND ERROR HANDLING

let launchingApp = false

function startApp(location) {
  if (launchingApp) return;
  launchingApp = true
  console.info(`[KERNEL] Starting app ${location}`)
  sounds.appOpen.play()
  phoneOverlay[0].hidden = false
  phoneOverlay.animate({ opacity: 1 }, 200)

  // Refresh apps
  apps = (JSON.parse(localStorage.getItem(`apps`)) || [])
  apps.push(...systemApps)
  apps = apps.sort((a, b) => {
    return a.localeCompare(b)
  })

  fetch(`${location}/package.json`).then(async (r) => {
    if (r.status == 200) {
      let pkg = await r.json()

      phoneFrame.setAttribute("sandbox", `allow-scripts allow-forms ${pkg.permissions.includes(`sameOrigin`) ? "allow-same-origin" : ""}`);
      phoneFrame.src = `${location}/${pkg.entrypoint}`

      currentAppLocation = location
      currentAppTitle = pkg.title
      currentAppPermissions = pkg.permissions
      if (pkg.color || pkg.colour) {
        document.getElementById('topNotch').style.backgroundColor = pkg.color || pkg.colour
      } else {
        document.getElementById('topNotch').style.backgroundColor = '#e69e19'
      }

      if (pkg.permissions.includes(`noHomeButton`)) {
        homeButton.hidden = true
      } else {
        homeButton.hidden = false
      }

      phoneFrame.addEventListener("load", function() {
        let dataToPass = {
          type: "info",
          package: pkg,
          phone: phoneInfo,
          phoneApps: apps,
          savedAppData: (localStorage.getItem(`store:${location}`) | null)
        }

        phoneFrame.contentWindow.postMessage(JSON.parse(JSON.stringify(dataToPass)), "*")

        console.info(`[KERNEL] Started app ${location} (${pkg.title})`)
        phoneOverlay.animate({ opacity: 0 }, 500)
        setTimeout(() => {
          phoneOverlay[0].classList.remove(`phoneOverlayBlack`)
          phoneOverlay[0].hidden = true
          launchingApp = false
        }, 500)
      }, { once: true });
    }
  }).catch((e) => {
    launchingApp = false
    console.error(`[KERNEL] Couldn't start app ${location} ${e}, rebooting to OOBE/Boot`)
    startApp(`/sys/apps/oobe`)
  })
}

function softCloseApp() {
  if (currentAppPermissions.includes(`noHomeButton`)) return;
  phoneOverlay[0].hidden = false
  phoneOverlay.animate({ opacity: 1 }, 500)
  phoneFrame.contentWindow.postMessage(JSON.parse(JSON.stringify({
    type: "closing"
  })), "*")
  setTimeout(() => {
    startApp(`/sys/apps/home`)
  }, 500)
}

if (localStorage.getItem('skip_boot')) {
  startApp(`/sys/apps/home`)
} else {
  startApp(`/sys/apps/oobe`)
}

window.addEventListener("message", (event) => {
  let data = event.data
  try {
    switch (data.type) {
      case "requestReplit":
        requestReplit().then((d) => {
          if (d) {
            d["loggedIn"] = true
          } else {
            d = { loggedIn: false }
          }
          event.source.postMessage(JSON.parse(JSON.stringify({
            type: "replitInfo",
            data: d
          })), "*")
        }).catch(() => {
          event.source.postMessage(JSON.parse(JSON.stringify({
            type: "replitInfo",
            data: { loggedIn: false }
          })), "*")
        })
        break;
      case `close`:
        startApp(`/sys/apps/home`)
        break;
      case `openSiteOnComputer`:
        if (currentAppPermissions.includes(`openSitesOnComputer`)) {
          if (data.site) {
            window.open(data.site,'_blank')
          } else console.error(`[KERNEL] App requested to lauch site on computer, but no site was provided`)
        } else console.error(`[KERNEL] App requested to lauch site on computer, but app doesn't have the openSitesOnComputer permission`)
        break;
      case `launchApp`:
        if (currentAppPermissions.includes(`openOtherApps`)) {
          if (apps.includes(data.app)) {
            startApp(data.app)
          } else console.error(`[KERNEL] App requested to lauch other app but other app is external or not in apps list (e.g. /sys/apps/settings)`)
        } else console.error(`[KERNEL] App requested to lauch other app but app doesn't have the openOtherApps permission`)
        break;
      case `setAppData`:
        localStorage.setItem(`store:${currentAppLocation}`, data.data)
        break;
    }
  }catch(e){
    console.error(`[KERNEL] App sent event to phone that threw an error, closing app. Error: ${e}`)
    softCloseApp()
  }
})

homeButton.addEventListener('click', softCloseApp)
notchButton.addEventListener('click', softCloseApp)
