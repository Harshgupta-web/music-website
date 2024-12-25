let currentSong = new Audio();
let Songs;
let currfolder;
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");
  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currfolder = folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  Songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      Songs.push(element.href.split(`/${folder}/`)[1]);
    }
    }
    
    

  // Show All the song in the playlist.
  let songUL = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of Songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li><img src="Pic/music.svg" alt="Music">
                                    <div class="info">
                                        <div>${song.replaceAll(
                                          "%20",
                                          " "
                                        )}</div>
                                        <div>Harsh</div>
                                    </div>
                                    <div class="playnow">
                                        <span>Play Now</span>
                                        <img class="invert" src="Pic/play.svg" alt="Play Now">
                                        </div></li>`;
  }

  // Attach Event listner to Each Song
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      // console.log(e.querySelector(".info").firstElementChild.innerHTML)
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
    return Songs
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currfolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "Pic/pause.svg";
  }
  // let audio = new Audio("/Songs/"+ track)

  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`/Songs`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/Songs/"&& !e.href.includes(".htaccess"))) {
      let folder = e.href.split("/").slice(-1)[0];

      // Get the metadata of the folder

      let a = await fetch(`/Songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">
                                <path d="M8 5v14l11-7L8 5Z" fill="#000" />
                            </svg>
                        </div>
                        <img src="/Songs/${folder}/cover.jpg" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
    }
  }
  //load the playlist whenever card is clicked

  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
        Songs = await getSongs(`Songs/${item.currentTarget.dataset.folder}`);
        playMusic(Songs[0])
    });
  });
}

async function main() {
  //Get the list of Songs
  await getSongs("Songs/ncs");
  playMusic(Songs[0], true);
  // console.log(Songs)

  //Display all the albums on the page
  displayAlbums();

  // Attach an event listner to play, Next and Previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "Pic/pause.svg";
    } else {
      currentSong.pause();
      play.src = "Pic/play.svg";
    }
  });

  //Listen for time update Event
  currentSong.addEventListener("timeupdate", () => {
    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )}/${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  //Add event listener for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  //Add event listner to close hamburger
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });
  //Add Eventlistner to previous and next
  previous.addEventListener("click", () => {
    console.log("previous clicked");
    console.log(currentSong);
    let index = Songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index - 1 >= 0) {
      playMusic(Songs[index - 1]);
    }
  });

  next.addEventListener("click", () => {
    console.log("Next clicked");
    let index = Songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < Songs.length - 1) {
      playMusic(Songs[index + 1]);
    }
  });

  //Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currentSong.volume = parseInt(e.target.value) / 100;
      if (currentSong.volume > 0) {
        document.querySelector(".volume > img").src=document.querySelector(".volume > img").src.replace("Pic/mute.svg","Pic/volume.svg")
      }
      else {
        document.querySelector(".volume > img").src=document.querySelector(".volume > img").src.replace("Pic/volume.svg","Pic/mute.svg")
      }
    });

    // Add Event listener to mute track
    document.querySelector(".volume > img").addEventListener("click", e => {
        if (e.target.src.includes("Pic/volume.svg")) {
            e.target.src=e.target.src.replace("Pic/volume.svg","Pic/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src=e.target.src.replace("Pic/mute.svg","Pic/volume.svg")
            currentSong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    });
    
}
main();
