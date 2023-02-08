const randomButton = document.getElementById("random-meal");

randomButton.addEventListener("click", function () {
    generateCardRandom()
});

renderHistory();

function saveHistory(meal) {
    // make sure something is in storage
    if (localStorage.getItem("meal-history") === null) {
        localStorage.setItem("meal-history", JSON.stringify([]));
    }
    // get history array from localstorage
    const history = JSON.parse(localStorage.getItem("meal-history"));

    // add new meal
    history.unshift(meal);

    // save new history array in localstorage
    const someHistory = JSON.stringify(history.slice(0, 7));
    localStorage.setItem("meal-history", someHistory)
}

function getHistory() {
    if (localStorage.getItem("meal-history") === null) {
        localStorage.setItem("meal-history", JSON.stringify([]));
    }
    return JSON.parse(localStorage.getItem("meal-history"));
}

function renderHistory() {
    document.querySelector(".history-container").innerHTML = ` 
        ${getHistory().map(history => `
                <button onclick="getSpecificMeal(this)" data-id="${history.id}">${history.mealName}</button>
            `).join("")
        }
    `;
}

function renderMeal(data) {
    renderHistory()
    document.querySelector(".meal-container").innerHTML = ` 
        <div class="meal-eatin">
            <h5 class="card-title">${data.mealName}</h5>
            <img class="card-img-top" src="${data.image}" alt="Card image cap">
            <div class="card-body">
                <ul>
                    ${data.ingredents.map(i => `<li>${i}</li>`).join("")}
                </ul>

                <button
                    type="button"
                    class="btn btn-primary"
                    data-toggle="modal"
                    data-target=".dialog-video"
                >
                    Video
                </button>
        
                <button
                    type="button"
                    class="btn btn-primary"
                    data-toggle="modal"
                    data-target=".dialog-cooking-instructions"
                >
                    Cooking Instructions
                </button>
        
                <div class="modal fade dialog-video" tabindex="-1" role="dialog" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <h3>Video</h3>
                            <div class="video-container">
                                <iframe width="640" height="385" src="${data.vidioLink?.replace("/watch?v=", "/embed/")}?autoplay=1&mute=1"></iframe>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal fade dialog-cooking-instructions" tabindex="-1" role="dialog" aria-hidden="true">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <h3>Cooking instructions</h3>
                            <p>${data.cookingInstructions}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
}

function getSpecificMeal(element) {
    const id = element.dataset.id
    getMealById(id).then(
        data => {
            renderMeal(data);
        }
    )
}

function generateCardRandom() {
    getRandomMeal().then(
        data => {
            saveHistory({
                id: data.id,
                mealName: data.mealName
            })
            renderMeal(data)
        }
    )
}

function toMealObj(response) {
    if (!response.meals || !response.meals.length) {
        // if there is no data throw an error
        throw "No Data";
    }
    const meal = response.meals[0]

    const ingredients = []
    const measurements = []

    for (const key in meal) {
        //because the api response doesn't  contain an array of ingredients we loop thought the keys to create an array
        if (key.startsWith("strIngredient")) {
            if (meal[key] !== "") {
                ingredients.push(meal[key].trim())
            }
        }
        if (key.startsWith("strMeasure")) {
            if (meal[key] !== "") {
                measurements.push(meal[key].trim())
            }
        }
    }
    const recipeIngredents = []
    for (let i = 0; i < ingredients.length; i++) {
        const ingredent = ingredients[i];
        const measurement = measurements[i]
        recipeIngredents.push(`${measurement} ${ingredent}`)
    }
    //for the meal name
    const mealName = meal.strMeal
    //this gets the ingredents
    const ingredents = recipeIngredents
    //cooking instructions
    const cookingInstructions = meal.strInstructions
    //for the the thumbnail image
    const image = meal.strMealThumb
    // for the u tube video link
    const vidioLink = meal.strYoutube
    return {
        id: meal.idMeal,
        mealName,
        ingredents,
        cookingInstructions,
        image,
        vidioLink
    }
}

function getMealById(id) {
    return fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
        .then(response => response.json())
        .then(toMealObj)
        .catch(() => {
            // if there is an error render some error message
            console.log("There was an error")
        })
}

function getRandomMeal() {
    return fetch(`https://www.themealdb.com/api/json/v1/1/random.php`)
        .then(response => response.json())
        .then(toMealObj)
        .catch(() => {
            // if there is an error render some error message
            console.log("There was an error")
        })
}




// let userInput = "toad in the hole"

// // this gets the ingredients
// fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${userInput}`)
//     .then(response => response.json())
//     .then(response => {

//         if (!response.meals) {
//             // if there is no data throw an error
//             throw "No Data";
//         }
//         const meal = response.meals[0]
//         const ingredients = []
//         const measurements = []

//         for (const key in meal) {
//             //because the api response doesn't  contain an array of ingredients we loop thought the keys to create an array
//             if (key.startsWith("strIngredient")) {
//                 if (meal[key] !== "") {
//                     ingredients.push(meal[key].trim())
//                 }
//             }
//             if (key.startsWith("strMeasure")) {
//                 if (meal[key] !== "") {
//                     measurements.push(meal[key].trim())
//                 }
//             }
//         }
//         const recipeIngredents = []
//         for (let i = 0; i < ingredients.length; i++) {
//             const ingredent = ingredients[i];
//             const measurement = measurements[i]
//             recipeIngredents.push(`${measurement} ${ingredent}`)
//         }
//         //for the meal name
//         console.log(response.meals[0].strMeal)
//         //this gets the ingredents
//         console.log(recipeIngredents)
//         //cooking instructions
//         console.log(response.meals[0].strInstructions)
//         //for the the thumbnail image
//         console.log(response.meals[0].strMealThumb)
//         // for the u tube video link
//         console.log(response.meals[0].strYoutube)

//         return
//     })

//     .catch(() => {
//         alert("no meal")
//     })
      // const options = {
        //     method: 'GET',
        //     headers: {
        //         'X-RapidAPI-Key': 'bda18aceb6msh4cfb8ec1d5bdafep1699e7jsnf33daa16b16d',
        //         'X-RapidAPI-Host': 'edamam-recipe-search.p.rapidapi.com'
        //     }
        // };
        // //fetch request with loop to pull put the ingredients and push into the ingredients array
        // fetch(`https://edamam-recipe-search.p.rapidapi.com/search?q=${userInput}`, options)
        //     .then(response => response.json())
        //     .then(response => {
        //         console.log(response)
        //         ingredients = []
        //         const path = response.hits[3].recipe.ingredientLines
        //         for (let i = 0; i < path.length; i++) {
        //             ingredients.push(path[i]);
        //         }

        //         // // meal name
        //         // console.log(response.q)
        //         // // ingredients
        //         // console.log(ingredients)
        //         // // calorie content
        //         // console.log(`calories ${Math.trunc(response.hits[3].recipe.calories)}`)
        //         // //image
        //         // console.log(response.hits[3].recipe.image)
        //         // //link to cooking istructions
        //         // console.log(response.hits[3].recipe.url)
        //     })
