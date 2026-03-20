////////////////////////////////////////////TEST/////////////////////////////////////////////////////
// async function getArtist(id) {
//     const response = await fetch(`http://localhost:3000/artists/${id}`);
//     const data = await response.json();
//     console.log(data);
// }
                                                        
// getArtist("Oliver");

// async function getSongs(songId) {
//     const response = await fetch(`http://localhost:3000/songs/${songId}`);
//     const data = await response.json();
//     console.log(data);
// }

// getSongs("1");
////////////////////////////////////////////TEST/////////////////////////////////////////////////////

const songList = document.querySelector(".song-list");
const artistList = document.querySelector(".artist-list");
const songInfo = document.querySelector(".song-info");

const updateSongBtn = document.querySelector(".update-song");
const deleteSongBtn = document.querySelector(".delete-song");
const deleteArtistBtn = document.querySelector(".delete-artist");
const editSongBtn = document.querySelector(".edit-song");
const editArtistBtn = document.querySelector(".edit-artist");

let songs = [];
let artists = [];

let selectedSongId = null;
let selectedArtistId = null;


async function loadData() {
    try {
        const [songsRes, artistsRes] = await Promise.all([
            fetch("http://localhost:3000/songs"),
            fetch("http://localhost:3000/artists")
        ]);

        if (!songsRes.ok || !artistsRes.ok) {
            throw new Error("Kunde inte hämta /songs eller /artists");
        }

        songs = await songsRes.json();
        artists = await artistsRes.json();

        renderSongList();
        renderArtistList();

    } catch (error) {
        console.error("loadData error:", error.message);
        alert("Kunde inte hämta /songs eller /artists");
    }
}


function renderSongList() {
    songList.replaceChildren();

    songs.forEach(song => {
        const li = document.createElement("li");
        li.id = song.id;

        if (song.id === selectedSongId) {
            li.classList.add("active");
        }

        const link = document.createElement("a");
        link.href = "#";
        link.textContent = song.title;

        li.appendChild(link);
        songList.appendChild(li);
    });
}


function renderArtistList() {
    artistList.replaceChildren();

    artists.forEach(artist => {
        const li = document.createElement("li");
        li.id = artist.id;

        if (artist.id === selectedArtistId) {
            li.classList.add("active");
        }

        const link = document.createElement("a");
        link.href = "#";
        link.textContent = artist.name;

        li.appendChild(link);
        artistList.appendChild(li);
    });
}


songList.addEventListener("click", (event) => {
    try {
        const li = event.target.closest("li");
        if (!li) return;

        event.preventDefault();

        const songId = li.id;
        selectedSongId = songId;

        document.querySelectorAll(".song-list li").forEach(el => {
            el.classList.remove("active");
        });
        li.classList.add("active");

        const song = songs.find(s => String(s.id) === String(songId));
        if (!song) return;

        const songArtists = artists.filter(a =>
            a.songs.map(String).includes(String(songId))
        );

        const artistNames = songArtists.map(a => a.name);
        const instrumentsList = [...new Set(songArtists.map(a => a.instrument))];

        songInfo.replaceChildren();

        const title = document.createElement("h2");
        const length = document.createElement("p");
        const instruments = document.createElement("p");
        const contributors = document.createElement("p");
        const recorded = document.createElement("p");

        title.textContent = song.title;
        length.textContent = "Längd: " + song.length;
        instruments.textContent = "Instrument: " + instrumentsList.join(", ");
        contributors.textContent = "Medverkande: " + artistNames.join(", ");
        recorded.textContent = "Inspelad: " + song.recorded;

        songInfo.append(title, length, instruments, contributors, recorded);

    } catch (error) {
        console.error("Kunde inte visa. Saknas information om låt/artist:", error.message);
    }
});


artistList.addEventListener("click", (event) => {
    try {
        const li = event.target.closest("li");
        if (!li) return;

        event.preventDefault();

        document.querySelectorAll(".artist-list li").forEach(el => {
            el.classList.remove("active");
        });
        li.classList.add("active");

        const artistId = li.id;
        selectedArtistId = artistId;

        const artist = artists.find(a => String(a.id) === String(artistId));
        if (!artist) return;

        const artistSongs = songs.filter(song =>
            artist.songs.map(String).includes(String(song.id))
        );

        songInfo.replaceChildren();

        const title = document.createElement("h2");
        title.textContent = artist.name;

        const list = document.createElement("ul");

        artistSongs.forEach(song => {
            const li = document.createElement("li");
            li.textContent = `${song.title} (${song.length})`;
            list.appendChild(li);
        });

        songInfo.append(title, list);

    } catch (error) {
        console.error("Kunde inte visa.", error.message);
    }
});


updateSongBtn.addEventListener("click", async () => {
    try {
        const title = prompt("Song titel:");
        const length = prompt("Song längd(ex 3:45):");
        const recorded = prompt("Inspelad(Ja/Nej):");

        if (!title || !length || !recorded) return;

        const songRes = await fetch("http://localhost:3000/songs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, length, recorded })
        });

        if (!songRes.ok) throw new Error("Kunde inte skapa låt");

        const newSong = await songRes.json();
        const newSongId = String(newSong.id);

        await loadData();

        const artistName = prompt("Artist namn(ex:Oliver, Joel, Viktor):");
        const instrument = prompt("Instrument:(ex:Gitarr, Trummor, bas):");

        if (!artistName || !instrument) return;

        let artist = artists.find(a => a.name === artistName);

        if (artist) {
            const updatedSongs = [...artist.songs.map(String), newSongId];

            await fetch(`http://localhost:3000/artists/${artist.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ songs: updatedSongs })
            });

        } else {
            await fetch("http://localhost:3000/artists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: artistName,
                    name: artistName,
                    songs: [newSongId],
                    instrument
                })
            });
        }

        await loadData();

    } catch (error) {
        console.error("Update error:", error.message);
        alert("Något gick fel!");
    }
});


editSongBtn.addEventListener("click", async () => {
    try {
        if (!selectedSongId) {
            alert("Välj en låt först!");
            return;
        }

        const song = songs.find(s => String(s.id) === String(selectedSongId));
        if (!song) return;

        const newTitle = prompt("Ny titel:", song.title);
        const newLength = prompt("Ny längd:", song.length);
        const newRecorded = prompt("Inspelad (Ja/Nej):", song.recorded);

        if (!newTitle || !newLength || !newRecorded) return;

        await fetch(`http://localhost:3000/songs/${selectedSongId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                title: newTitle,
                length: newLength,
                recorded: newRecorded
            })
        });

        await loadData();

    } catch (error) {
        console.error("Edit song error:", error.message);
        alert("Kunde inte uppdatera låt.");
    }
});


editArtistBtn.addEventListener("click", async () => {
    try {
        if (!selectedArtistId) {
            alert("Välj en artist först!");
            return;
        }

        const artist = artists.find(a => String(a.id) === String(selectedArtistId));
        if (!artist) return;

        const newName = prompt("Nytt namn:", artist.name);
        const newInstrument = prompt("Nytt instrument:", artist.instrument);

        if (!newName || !newInstrument) return;

        await fetch(`http://localhost:3000/artists/${selectedArtistId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: newName,
                instrument: newInstrument
            })
        });

        await loadData();

    } catch (error) {
        console.error("Edit artist error:", error.message);
        alert("Kunde inte uppdatera artist.");
    }
});


deleteSongBtn.addEventListener("click", async () => {
    try {
        if (!selectedSongId) {
            alert("Välj en låt först!");
            return;
        }

        await fetch(`http://localhost:3000/songs/${selectedSongId}`, {
            method: "DELETE"
        });

        const affectedArtists = artists.filter(a =>
            a.songs.map(String).includes(String(selectedSongId))
        );

        for (let artist of affectedArtists) {
            const updatedSongs = artist.songs
                .map(String)
                .filter(id => id !== String(selectedSongId));

            await fetch(`http://localhost:3000/artists/${artist.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ songs: updatedSongs })
            });
        }

        selectedSongId = null;

        await loadData();
        songInfo.replaceChildren();

    } catch (error) {
        console.error("Delete error:", error.message);
        alert("Kunde inte ta bort låt.");
    }
});


deleteArtistBtn.addEventListener("click", async () => {
    try {
        if (!selectedArtistId) {
            alert("Välj en artist först!");
            return;
        }

        if (!confirm("Är du säker?")) return;

        await fetch(`http://localhost:3000/artists/${selectedArtistId}`, {
            method: "DELETE"
        });

        selectedArtistId = null;

        await loadData();
        songInfo.replaceChildren();

    } catch (error) {
        console.error("Delete artist error:", error.message);
        alert("Kunde inte ta bort artist.");
    }
});


async function init() {
    await loadData();
}

init();

















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
