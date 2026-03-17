async function getArtist(id) {
    const response = await fetch(`http://localhost:3000/artists/${id}`);
    const data = await response.json();
    console.log(data);
}

getArtist("Oliver");

async function getSongs(songId) {
    const response = await fetch(`http://localhost:3000/songs/${songId}`);
    const data = await response.json();
    console.log(data);
}

getSongs("1");


const songList = document.querySelector(".song-list");
const songInfo = document.querySelector(".song-info");
const updateSongBtn = document.querySelector(".update-song");
const deleteSongBtn = document.querySelector(".delete-song");

let songs = [];
let artists = [];


async function loadData() {
    const [songsRes, artistsRes] = await Promise.all([
        fetch("http://localhost:3000/songs"),
        fetch("http://localhost:3000/artists")
    ]);

    songs = await songsRes.json();
    artists = await artistsRes.json();
}

loadData();


songList.addEventListener("click", (event) => {

    const li = event.target.closest("li");
    if (!li) return;

    event.preventDefault();

    const songId = li.id; 


    document.querySelectorAll(".song-list li").forEach(el => {
        el.classList.remove("active");
    });
    li.classList.add("active");

    const song = songs.find(s => s.id == songId); 
    if (!song) return;

    const songArtists = artists.filter(a =>
        a.songs.map(String).includes(songId) 
    );

    const artistNames = songArtists.map(a => a.name);

    const instrumentsList = [
        ...new Set(songArtists.map(a => a.instrument))
    ];

    songInfo.replaceChildren();

    const title = document.createElement("h2");
    const length = document.createElement("p");
    const instruments = document.createElement("p");
    const contributors = document.createElement("p");

    title.textContent = song.title;
    length.textContent = "Längd: " + song.length;
    instruments.textContent = "Instrument: " + instrumentsList.join(", ");
    contributors.textContent = "Medverkande: " + artistNames.join(", ");

    songInfo.append(title, length, instruments, contributors);
});

// Add/update
updateSongBtn.addEventListener("click", async () => {

    const title = prompt("Song title:");
    const length = prompt("Song length:");

    if (!title || !length) return;


    const songRes = await fetch("http://localhost:3000/songs", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            title,
            length
        })
    });

    const newSong = await songRes.json();
    const newSongId = String(newSong.id); 

    await loadData();

    const artistName = prompt("Artist name(ex: Oliver, Joel, Viktor):");
    const instrument = prompt("Instrument(ex: guitar, bass, drums):");

    if (!artistName || !instrument) return;

    let artist = artists.find(a => a.name === artistName);

    if (artist) {
        const updatedSongs = [...artist.songs.map(String), newSongId];

        const res = await fetch(`http://localhost:3000/artists/${artist.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                songs: updatedSongs
            })
        });

        artist = await res.json();

    } else {
        const res = await fetch("http://localhost:3000/artists", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: artistName,
                songs: [newSongId],
                instrument: instrument
            })
        });

        artist = await res.json();
        artists.push(artist);
    }

    const li = document.createElement("li");
    li.id = newSongId;

    const link = document.createElement("a");
    link.href = "#";
    link.textContent = title;

    li.appendChild(link);
    songList.appendChild(li);

    console.log("Saved:", newSong, artist);
});


//delete
deleteSongBtn.addEventListener("click", async () => {

    const selectedLi = document.querySelector(".song-list li.active");

    if (!selectedLi) {
        alert("Select a song first!");
        return;
    }

    const songId = selectedLi.id;

    await fetch(`http://localhost:3000/songs/${songId}`, {
        method: "DELETE"
    });

    const affectedArtists = artists.filter(a =>
        a.songs.map(String).includes(songId)
    );

    for (let artist of affectedArtists) {

        const updatedSongs = artist.songs
            .map(String)
            .filter(id => id !== songId);

        await fetch(`http://localhost:3000/artists/${artist.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                songs: updatedSongs
            })
        });

        artist.songs = updatedSongs;
    }

    songs = songs.filter(s => String(s.id) !== songId);

    selectedLi.remove();

    songContent.replaceChildren();

    console.log("Deleted song:", songId);
});

function renderSongList() {
    songList.replaceChildren();

    songs.forEach(song => {
        const li = document.createElement("li");
        li.id = song.id;

        const link = document.createElement("a");
        link.href = "#";
        link.textContent = song.title;

        li.appendChild(link);
        songList.appendChild(li);
    });
}

async function loadData() {
    const [songsRes, artistsRes] = await Promise.all([
        fetch("http://localhost:3000/songs"),
        fetch("http://localhost:3000/artists")
    ]);

    songs = await songsRes.json();
    artists = await artistsRes.json();

    renderSongList();
}




















// const songList = document.querySelector(".song-list");
// const songContent = document.querySelector("#song-content");

// async function getSongs() {
//     const response = await fetch("db.json");
//     const data = await response.json();
//     return data.songs;
// }

// songList.addEventListener("click", async (event) => {

//     const li = event.target.closest("li");
//     if (!li) return;

//     event.preventDefault();

//     const songId = li.id;

//     const songs = await getSongs();

//     const song = songs.find(s => s.id === songId);

//     if (!song) return;

//     songContent.replaceChildren();

//     const title = document.createElement("h2");
//     const description = document.createElement("p");

//     title.textContent = song.title;
//     description.textContent = song.description;

//     songContent.append(title, description);

// });
