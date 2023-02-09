const apiKey = `85ab5ccbe5924069b86a34a443887846`

const button = document.getElementById("buttonSearch");

document.getElementById("location").addEventListener("input", (e) => {
    if (e.target.value === "") {
        button.classList.add("disabled")
        return;
    }
    button.classList.remove("disabled");
});

function setLoading(isLoading) {
    const loadingSpinner = document.querySelector("#buttonSearch .loading")
    if (isLoading) {
        loadingSpinner.classList.remove("d-none");
        button.classList.add("disabled")
        return
    }
    loadingSpinner.classList.add("d-none");
    button.classList.remove("disabled")
}

function saveCache(places) {
    localStorage.setItem("location-history", JSON.stringify(places));
}

function getCache() {
    if (localStorage.getItem("location-history") === null) {
        return [];
    }
    return JSON.parse(localStorage.getItem("location-history"));
}


// {
//     "name": "Brocco On The Park",
//     "country": "United Kingdom",
//     "country_code": "gb",
//     "state": "England",
//     "county": "South Yorkshire Mayoral Combined Authority",
//     "city": "Sheffield",
//     "postcode": "S11 8RS",
//     "district": "Broomfield",
//     "suburb": "Sharrow Vale",
//     "street": "Brocco Bank",
//     "housenumber": "92",
//     "lon": -1.5021718858522726,
//     "lat": 53.3681689,
//     "state_code": "ENG",
//     "formatted": "Brocco On The Park, 92 Brocco Bank, Sheffield S11 8RS, United Kingdom",
//     "address_line1": "Brocco On The Park",
//     "address_line2": "92 Brocco Bank, Sheffield S11 8RS, United Kingdom",
//     "categories": [
//         "accommodation",
//         "accommodation.hotel",
//         "building",
//         "building.accommodation",
//         "building.catering",
//         "catering",
//         "catering.restaurant"
//     ],
//     "details": [
//         "details",
//         "details.contact"
//     ],
//     "datasource": {
//         "sourcename": "openstreetmap",
//         "attribution": "© OpenStreetMap contributors",
//         "license": "Open Database Licence",
//         "url": "https://www.openstreetmap.org/copyright",
//         "raw": {
//             "name": "Brocco On The Park",
//             "email": "hello@brocco.co.uk",
//             "phone": "+44 114 266 1233",
//             "osm_id": 99515829,
//             "amenity": "restaurant",
//             "fhrs:id": 838970,
//             "tourism": "hotel",
//             "website": "https://www.brocco.co.uk/",
//             "building": "yes",
//             "osm_type": "w",
//             "addr:city": "Sheffield",
//             "addr:street": "Brocco Bank",
//             "addr:postcode": "S11 8RS",
//             "opening_hours": "Mo-Sa 08:30-22:00; Su 08:30-18:00",
//             "addr:housenumber": 92
//         }
//     },
//     "place_id": "517497ee98dd08f8bf59e029fe6420af4a40f00102f901b57dee050000000092031242726f63636f204f6e20546865205061726b"
// }

function getSpecificPlace(e) {
    const { id } = e.dataset;

    const width = 400;
    const height = 300;

    const place = getCache().find(history => history.properties.place_id === id).properties
    const lon = place.lon
    const lat = place.lat

    let website = "";
    if (place.datasource.raw.website) {
        website = `<p><a target="_blank" href="${place.datasource.raw.website}">Website</a></p>`
    }

    let openingHours = ""
    if (place.datasource.raw.opening_hours) {
        openingHours = `<p> Opening hours ${place.datasource.raw.opening_hours}</p>`
    }

    let phone = "";
    if (place.datasource.raw.phone) {
        phone = `<p>Contact Number: <a href="tel:${place.datasource.raw.phone}">${place.datasource.raw.phone}</a></p>`
    }

    document.getElementById("selected-restaurant").innerHTML = `
        <h1>${place.name}</h1>
        ${website}
        <p> ${place.address_line2}</p>
        ${openingHours}
        ${phone}
        <img width="${width}" height="${height}" class="map-image" src="https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=${width}&height=${height}&center=lonlat:${lon},${lat}&zoom=13&marker=lonlat:${lon},${lat};type:material;color:%23ff3421;icontype:awesome|lonlat:${lon},${lat};type:material;color:%23ff3421;icontype:awesome&apiKey=${apiKey}"></img>
    `
}

// https://maps.geoapify.com/v1/staticmap?style=osm-bright-smooth&width=600&height=400&center=lonlat%3A-122.29009844646316%2C47.54607447032754&zoom=14.3497&marker=lonlat%3A-122.29188334609739%2C47.54403990655936%3Btype%3Aawesome%3Bcolor%3A%23bb3f73%3Bsize%3Ax-large%3Bicon%3Apaw%7Clonlat%3A-122.29282631194182%2C47.549609195001494%3Btype%3Amaterial%3Bcolor%3A%234c905a%3Bicon%3Atree%3Bicontype%3Aawesome%7Clonlat%3A-122.28726954893025%2C47.541766557545884%3Btype%3Amaterial%3Bcolor%3A%234c905a%3Bicon%3Atree%3Bicontype%3Aawesome&apiKey=85ab5ccbe5924069b86a34a443887846

button.addEventListener("click", e => {
    e.preventDefault();

    const locationSelecton = document.getElementById("location").value;
    setLoading(true)
    getLocation(locationSelecton).then(placeId => {
        getRestaurants(placeId).then(restaurants => {
            const places = restaurants.features.filter(x => x.properties.name)
            saveCache(places);

            document.getElementById("input-locations").innerHTML = `
                ${places.map(place => `<button class="btn" data-id="${place.properties.place_id}" onclick="getSpecificPlace(this)">${place.properties.name}</button>`).join("")}
            `

            setLoading(false)
        })
    }).catch(() => {
        setLoading(false)
    })
})



function getLocation(place) {
    return fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${place}&type=city&format=json&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(result => result.results[0].place_id);
}

function getRestaurants(placeId) {
    return fetch(`https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=place:${placeId}&limit=20&apiKey=${apiKey}`)
        .then(response => response.json())
        .then(result => result)
}
