const randomButton = document.getElementById("random-meal");
const searchInput = document.getElementById("search-input");
const inputButton = document.getElementById("search-button");

randomButton.addEventListener("click", function () {
    generateCardRandom()
    generateCardSelected()
});

inputButton.addEventListener("click", (event) => {
    event.preventDefault()
    const userInput = document.querySelector('#search-input').value;
    getSelectedMeal(userInput).then((data) => {
        saveHistory(data)
        renderMeal(data)
    })
})


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
    const history = getHistory();
    let title = "";
    if (history.length) {
        title = "<h3>Meals you looked at before</h3>"
    }

    document.querySelector(".history-container").innerHTML = `
        ${title}
        ${history.map(history => `
            <button class="btn mb-2 text-white bg-dark search-button" onclick="getSpecificMeal(this)" data-id="${history.id}">
                <span class="material-icons text-primary">restaurant</span> ${history.mealName}
            </button>
        `).join("")
        }
    `;
}

function renderMeal(data) {
    renderHistory()

    const cookingInstructions = data.cookingInstructions.split("\r\n").filter(x => x);

    document.querySelector(".meal-container").innerHTML = ` 
        <div class="meal-eatin">
            <h2 class="card-title p-0 m-0 mb-4">${data.mealName}</h2>
            <div class="d-flex flex-column flex-sm-row gap-4 align-items-start">
                <img class="card-img-top" src="${data.image}" alt="Card image cap">
                <div class="card-body w-100">
                    <div class="btn-container mb-4 gap-2">
                    <button
                        type="button"
                        class="btn text-white bg-dark d-block w-100"
                        data-toggle="modal"
                        data-target=".dialog-cooking-instructions"
                    >
                        Get cooking
                    </button>
                    <button
                        type="button"
                        class="btn text-dark search-button d-block w-100 link"
                        data-toggle="modal"
                        data-target=".dialog-video"
                    >
                        Watch it being made
                    </button>
            
                    </div>
                    <ul>
                        ${data.ingredents.map(i => `<li>${i}</li>`).join("")}
                    </ul>
                </div>
            </div>
        </div>
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
                <div class="modal-content p-4">
                    <h3>Cooking instructions</h3>
                    <ol>
                        ${cookingInstructions.map(step => `
                            <li>${step}</li>
                        `).join("")}
                    </ol>
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
function getSelectedMeal(userInput) {
    // this gets the ingredients

    return fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${userInput}`)
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





