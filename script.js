async function getArtist(id) {
    const response = await fetch(`http://localhost:3000/artists/${id}`);
    const data = await response.json();
    console.log(data);
}

getArtist("Oliver");