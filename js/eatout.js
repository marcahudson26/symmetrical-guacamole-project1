// const userInputt = "clowne"

// const apiKey = `85ab5ccbe5924069b86a34a443887846`
// //
// function getLocation(place) {
//     return fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${place}&type=city&format=json&apiKey=${apiKey}`)
//         .then(response => response.json())
//         .then(result => result.results[0].place_id);
// }

// function getRestaurants(placeId) {
//     return fetch(`https://api.geoapify.com/v2/places?categories=catering.restaurant&filter=place:${placeId}&limit=20&apiKey=${apiKey}`)
//         .then(response => response.json())
//         .then(result => result)
// }

// getLocation(userInputt).then(placeId => {
//     getRestaurants(placeId).then(restaurants => {
//         console.log(restaurants.features.map(x => x.properties.name).filter(x => x))
//     })
// })
