let jingle = new Audio('./jingle.wav');

let splash = document.getElementById('splash'),
  mainContent = document.getElementsByClassName(`content`)[0]
  loading = document.getElementsByClassName(`loading`)[0],
  centerSplash = document.getElementsByClassName(`center`)[0];

let OOBEstatus = 0

function toggleLoading(is){
  return new Promise((resolve) => {
    // Remove all animations
    mainContent.classList.remove(`fadeOut`)
    loading.classList.remove(`fadeIn`)
    mainContent.classList.remove(`fadeIn`)
    loading.classList.remove(`fadeOut`)

    // If loading, fade out content, if not fade out loading icon
    if(is){
      mainContent.classList.add(`fadeOut`)
    }else{
      loading.classList.add(`fadeOut`)
    }

    setTimeout(()=>{
      // If loading, fade in loading icon, if not fade in content
      if(is){
        mainContent.hidden = true
        loading.hidden = false
        loading.classList.add(`fadeIn`)
      }else{
        mainContent.hidden = false
        loading.hidden = true
        mainContent.classList.add(`fadeIn`)
      }
    },250)

    setTimeout(resolve,500)
  })
}

function startOOBE(data){
  console.log(`Loaded ${data.package.title} on ${data.phone.version}`)

  splash.classList.add("splashFade");
  jingle.play()

  setTimeout(async function () {
    centerSplash.hidden = true
    mainContent.hidden = false

    await toggleLoading(true)
    
    try{
      let finished = localStorage.getItem(`OOBE_finsihed`)
      if(finished){
        await toggleLoading(false)
        parent.postMessage({type:"close"},"*")
      }else{
        localStorage.setItem(`wallpaper`,`/wallpapers/5.png`)
        localStorage.setItem(`apps`,`["https://cheesgle-apps.codingmaster398.repl.co/apps/cheesgle"]`)
        fetch(`https://cheesgle-apps.codingmaster398.repl.co/install/cheesgle`).then(()=>{}).catch(()=>{})
        
        mainContent.innerHTML = `
        <h2>Welcome to Byte</h2> 
        <br> 
        <p><b>Byte</b> is a new generation of cheesy phone built upon the same technologies as the web, and is here to serve you.</p>
        <p>Sign in with <b>Replit</b> for extra features.</p>
        <div class="bottom">
          <button>Sign in with Replit</button>
          <button>Maybe later</button>
        </div>`
        
        mainContent.getElementsByTagName(`button`)[0].onclick = ()=>{
          // Sign in with Replit
          mainContent.getElementsByTagName(`button`)[1].disabled = true

          OOBEstatus = 1
          
          parent.postMessage({type:"requestReplit"},"*");
        }

        mainContent.getElementsByTagName(`button`)[1].onclick = async ()=>{
          await toggleLoading(true)
          localStorage.setItem(`OOBE_finsihed`,true)
          parent.postMessage({type:"close"},"*")
        }
        
        await toggleLoading(false)
      }
    }catch(error){
      mainContent.innerHTML = `<h2>Error</h2> <br> <p>${error.toString()}. Reboot the phone and try again.</p>`
      await toggleLoading(false)
    }
  }, 3000)
}

window.addEventListener('message', async function (e) {
  data = e.data // Get the data from the message event

  switch(data.type){
    case 'info':
      startOOBE(data)
      break;
    case 'replitInfo':
      if(OOBEstatus == 1){
        if(data.data.loggedIn){
          mainContent.getElementsByTagName(`button`)[0].disabled = true
          await toggleLoading(true)
          localStorage.setItem(`OOBE_finsihed`,true)
          parent.postMessage({type:"close"},"*")
        }else{
          mainContent.getElementsByTagName(`button`)[1].disabled = false
        }
      }
      break;
  }
});