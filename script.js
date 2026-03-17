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
const songContent = document.querySelector("#song-content");

let songs = [];
let artists = [];

// Load database ONCE
async function loadData() {
    const response = await fetch("db.json");
    const data = await response.json();

    songs = data.songs;
    artists = data.artists;
}

loadData();

songList.addEventListener("click", (event) => {

    const li = event.target.closest("li");
    if (!li) return;

    event.preventDefault();

    const songId = Number(li.id);

    // Find song
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    // Find artists connected to this song
    const songArtists = artists.filter(artist =>
        artist.songs.includes(songId)
    );

    // Get artist names
    const artistNames = songArtists.map(a => a.name);

    // Get instruments (and remove duplicates)
    const instrumentsList = [
        ...new Set(songArtists.map(a => a.instrument))
    ];

    // Clear old content
    songContent.replaceChildren();

    // Create elements
    const title = document.createElement("h2");
    const length = document.createElement("p");
    const instruments = document.createElement("p");
    const contributors = document.createElement("p");

    // Fill content
    title.textContent = song.title;
    length.textContent = "Längd: " + song.length;
    instruments.textContent = "Instrument: " + instrumentsList.join(", ");
    contributors.textContent = "Medverkande: " + artistNames.join(", ");

    // Append
    songContent.append(title, length, instruments, contributors);

});
































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
