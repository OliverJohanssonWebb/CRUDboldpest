const songList = document.querySelector(".song-list");
const artistList = document.querySelector(".artist-list");
const songInfo = document.querySelector(".song-info");
const searchInput = document.querySelector(".search-bar input");

const updateSongBtn = document.querySelector(".update-song");
const deleteSongBtn = document.querySelector(".delete-song");
const deleteArtistBtn = document.querySelector(".delete-artist");
const editSongBtn = document.querySelector(".edit-song");
const editArtistBtn = document.querySelector(".edit-artist");

let songs = [];
let artists = [];

let selectedSongId = null;
let selectedArtistId = null;

async function getSongById(id) {
    try {
        const res = await fetch(`http://localhost:3000/songs/${id}`);
        if (!res.ok) throw new Error();
        return await res.json();
    } catch (err) {
        console.error(err);
        alert("Kunde inte hämta låt.");
    }
}

async function getArtistById(id) {
    try {
        const res = await fetch(`http://localhost:3000/artists/${id}`);
        if (!res.ok) throw new Error();
        return await res.json();
    } catch (err) {
        console.error(err);
        alert("Kunde inte hämta artist.");
    }
}

async function loadData() {
    try {
        const [songsRes, artistsRes] = await Promise.all([
            fetch("http://localhost:3000/songs"),
            fetch("http://localhost:3000/artists")
        ]);

        if (!songsRes.ok || !artistsRes.ok) throw new Error();

        songs = await songsRes.json();
        artists = await artistsRes.json();

        renderSongList(songs);
        renderArtistList(artists);

    } catch (err) {
        console.error(err);
        alert("Kunde inte hämta data.");
    }
}

function renderSongList(songArray) {
    songList.innerHTML = "";

    songArray.forEach(song => {
        const li = document.createElement("li");
        li.id = song.id;

        const a = document.createElement("a");
        a.href = "#";
        a.textContent = song.title;

        li.appendChild(a);
        songList.appendChild(li);
    });
}

function renderArtistList(artistArray) {
    artistList.innerHTML = "";

    artistArray.forEach(artist => {
        const li = document.createElement("li");
        li.id = artist.id;

        const a = document.createElement("a");
        a.href = "#";
        a.textContent = artist.name;

        li.appendChild(a);
        artistList.appendChild(li);
    });
}

songList.addEventListener("click", async (event) => {
    const li = event.target.closest("li");
    if (!li) return;

    event.preventDefault();

    selectedSongId = li.id;

    const song = await getSongById(selectedSongId);
    if (!song) return;

    const songArtists = artists.filter(a =>
        (a.songs || []).map(String).includes(String(selectedSongId))
    );

    const artistNames = songArtists.map(a => a.name);

    songInfo.innerHTML = `
        <h2>${song.title}</h2>
        <p>Längd: ${song.length}</p>
        <p>Medverkande: ${artistNames.join(", ")}</p>
        <p>Inspelad: ${song.recorded}</p>
    `
    ;
});

artistList.addEventListener("click", async (event) => {
    const li = event.target.closest("li");
    if (!li) return;

    event.preventDefault();

    selectedArtistId = li.id;

    const artist = await getArtistById(selectedArtistId);
    if (!artist) return;

    const artistSongs = songs.filter(song =>
        (artist.songs || []).map(String).includes(String(song.id))
    );

    songInfo.innerHTML = "";

    const title = document.createElement("h2");
    title.textContent = artist.name;

    const list = document.createElement("ul");

    artistSongs.forEach(song => {
        const li = document.createElement("li");
        li.textContent = `${song.title} (${song.length})`;

        li.addEventListener("click", async () => {
            console.log("GET /songs/" + song.id);

            const fullSong = await getSongById(song.id);

            songInfo.innerHTML = `
                <h2>${fullSong.title}</h2>
                <p>Längd: ${fullSong.length}</p>
                <p>Inspelad: ${fullSong.recorded}</p>
            `
            ;
        });

        list.appendChild(li);
    });

    songInfo.append(title, list);
});

searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();

    const filteredSongs = songs.filter(song =>
        song.title.toLowerCase().includes(value)
    );

    const filteredArtists = artists.filter(artist =>
        artist.name.toLowerCase().includes(value)
    );

    renderSongList(filteredSongs);
    renderArtistList(filteredArtists);
});

loadData();