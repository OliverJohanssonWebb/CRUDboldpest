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

async function getSongs() {
    const response = await fetch("db.json");
    const data = await response.json();
    return data.songs;
}

songList.addEventListener("click", async (event) => {

    const li = event.target.closest("li");
    if (!li) return;

    event.preventDefault();

    const songId = li.id;

    const songs = await getSongs();

    const song = songs.find(s => s.id === songId);

    if (!song) return;

    songContent.replaceChildren();

    const title = document.createElement("h2");
    const description = document.createElement("p");

    title.textContent = song.title;
    description.textContent = song.description;

    songContent.append(title, description);

});
