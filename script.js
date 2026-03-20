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

        if (!songsRes.ok || !artistsRes.ok) throw new Error();

        songs = await songsRes.json();
        artists = await artistsRes.json();

        renderSongList();
        renderArtistList();

    } catch {
        alert("Kunde inte hämta data från servern.");
    }
}

function renderSongList() {
    songList.replaceChildren();

    songs.forEach(song => {
        const li = document.createElement("li");
        li.id = song.id;

        if (song.id === selectedSongId) li.classList.add("active");

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

        if (artist.id === selectedArtistId) li.classList.add("active");

        const link = document.createElement("a");
        link.href = "#";
        link.textContent = artist.name;

        li.appendChild(link);
        artistList.appendChild(li);
    });
}

songList.addEventListener("click", (event) => {
    const li = event.target.closest("li");
    if (!li) return;

    event.preventDefault();

    selectedSongId = li.id;

    document.querySelectorAll(".song-list li").forEach(el => el.classList.remove("active"));
    li.classList.add("active");

    const song = songs.find(s => String(s.id) === String(selectedSongId));
    if (!song) return;

    const songArtists = artists.filter(a =>
        (Array.isArray(a.songs) ? a.songs : []).map(String).includes(String(selectedSongId))
    );

    const artistNames = songArtists.map(a => a.name);
    const instruments = [...new Set(songArtists.map(a => a.instrument))];

    songInfo.replaceChildren();

    songInfo.append(
        Object.assign(document.createElement("h2"), { textContent: song.title }),
        Object.assign(document.createElement("p"), { textContent: "Längd: " + song.length }),
        Object.assign(document.createElement("p"), { textContent: "Instrument: " + instruments.join(", ") }),
        Object.assign(document.createElement("p"), { textContent: "Medverkande: " + artistNames.join(", ") }),
        Object.assign(document.createElement("p"), { textContent: "Inspelad: " + song.recorded })
    );
});

artistList.addEventListener("click", (event) => {
    const li = event.target.closest("li");
    if (!li) return;

    event.preventDefault();

    selectedArtistId = li.id;

    document.querySelectorAll(".artist-list li").forEach(el => el.classList.remove("active"));
    li.classList.add("active");

    const artist = artists.find(a => String(a.id) === String(selectedArtistId));
    if (!artist) return;

    const artistSongs = songs.filter(song =>
        (Array.isArray(artist.songs) ? artist.songs : []).map(String).includes(String(song.id))
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
});

updateSongBtn.addEventListener("click", async () => {
    try {
        const title = prompt("Ange låttitel:");
        const length = prompt("Ange längd:");
        const recorded = prompt("Är låten inspelad (Ja/Nej):");

        if (!title || !length || !recorded) return;

        const container = document.createElement("div");
        container.classList.add("artist-select-container");

        const select = document.createElement("select");
        select.multiple = true;
        select.size = 6;

        artists.forEach(artist => {
            const option = document.createElement("option");
            option.value = artist.id;
            option.textContent = artist.name;
            select.appendChild(option);
        });

        const button = document.createElement("button");
        button.textContent = "Lägg till";

        const text = document.createElement("p");
        text.textContent = "Välj flera artister genom att hålla inne Ctrl och klicka på dem:";

        container.appendChild(text);
        container.appendChild(select);
        container.appendChild(button);

        document.body.appendChild(container);

        button.onclick = async () => {
            try {
                const selectedArtistIds = Array.from(select.selectedOptions).map(opt => opt.value);

                if (selectedArtistIds.length === 0) {
                    alert("Välj minst en artist.");
                    return;
                }

                const songRes = await fetch("http://localhost:3000/songs", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, length, recorded })
                });

                if (!songRes.ok) throw new Error();

                const newSong = await songRes.json();
                const newSongId = String(newSong.id);

                for (let artistId of selectedArtistIds) {
                    const artist = artists.find(a => String(a.id) === String(artistId));
                    if (!artist) continue;

                    const currentSongs = Array.isArray(artist.songs) ? artist.songs : [];
                    const updatedSongs = [...currentSongs.map(String), newSongId];

                    await fetch(`http://localhost:3000/artists/${artist.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: artist.id,
                            name: artist.name,
                            instrument: artist.instrument,
                            songs: updatedSongs
                        })
                    });
                }

                document.body.removeChild(container);

                await loadData();

            } catch {
                alert("Kunde inte koppla låten till artister.");
            }
        };

    } catch {
        alert("Kunde inte lägga till låten.");
    }
});

editSongBtn.addEventListener("click", async () => {
    try {
        if (!selectedSongId) return alert("Välj en låt först.");

        const song = songs.find(s => String(s.id) === String(selectedSongId));

        const newTitle = prompt("Ny titel:", song.title);
        const newLength = prompt("Ny längd:", song.length);
        const newRecorded = prompt("Inspelad (Ja/Nej):", song.recorded);

        if (!newTitle || !newLength || !newRecorded) return;

        const res = await fetch(`http://localhost:3000/songs/${selectedSongId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: song.id,
                title: newTitle,
                length: newLength,
                recorded: newRecorded
            })
        });

        if (!res.ok) throw new Error();

        await loadData();

    } catch {
        alert("Kunde inte uppdatera låten.");
    }
});

editArtistBtn.addEventListener("click", async () => {
    try {
        if (!selectedArtistId) return alert("Välj en artist först.");

        const artist = artists.find(a => a.id === selectedArtistId);

        const newName = prompt("Nytt namn:", artist.name);
        const newInstrument = prompt("Nytt instrument:", artist.instrument);

        if (!newName || !newInstrument) return;

        const res = await fetch(`http://localhost:3000/artists/${selectedArtistId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: artist.id,
                name: newName,
                instrument: newInstrument,
                songs: Array.isArray(artist.songs) ? artist.songs : []
            })
        });

        if (!res.ok) throw new Error();

        await loadData();

    } catch {
        alert("Kunde inte uppdatera artisten.");
    }
});

deleteSongBtn.addEventListener("click", async () => {
    try {
        if (!selectedSongId) return alert("Välj en låt först.");

        const res = await fetch(`http://localhost:3000/songs/${selectedSongId}`, {
            method: "DELETE"
        });

        if (!res.ok) throw new Error();

        for (let artist of artists) {
            const currentSongs = Array.isArray(artist.songs) ? artist.songs : [];
            const updatedSongs = currentSongs.map(String).filter(id => id !== selectedSongId);

            await fetch(`http://localhost:3000/artists/${artist.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: artist.id,
                    name: artist.name,
                    instrument: artist.instrument,
                    songs: updatedSongs
                })
            });
        }

        selectedSongId = null;

        await loadData();
        songInfo.replaceChildren();

    } catch {
        alert("Kunde inte ta bort låten.");
    }
});

deleteArtistBtn.addEventListener("click", async () => {
    try {
        if (!selectedArtistId) return alert("Välj en artist först.");

        const res = await fetch(`http://localhost:3000/artists/${selectedArtistId}`, {
            method: "DELETE"
        });

        if (!res.ok) throw new Error();

        selectedArtistId = null;

        await loadData();
        songInfo.replaceChildren();

    } catch {
        alert("Kunde inte ta bort artisten.");
    }
});

loadData();