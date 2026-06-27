// Daten laden: Nationalräte und ihre parlamentarischen Statistiken
Promise.all([
    fetch("nationalraete.json").then(function(response) {
        return response.json();
    }),
    fetch("staenderaete.json").then(function(response) {
        return response.json();
    }),
    fetch("parlamentarier_stats.json").then(function(response) {
        return response.json();
    })
])


.then(function(loadedData) {
    const nationalraete = loadedData[0];
    const staenderaete = loadedData[1];
    const stats = loadedData[2];
    const a = 0;
    const wrapper = document.querySelector(".swiper-wrapper");

    const searchInput = document.querySelector("#politician-search");
    const searchList = document.querySelector("#politician-list");
    const searchResult = document.querySelector(".search-result");

    const maxSlides = 30;
    let currentSort = "success_total";


    const statsByPersonCode = createStatsLookup(stats);

    const alleParlamentarier = [
        ...nationalraete,
        ...staenderaete
    ];

    const data = combinePeopleWithStats(
        alleParlamentarier,
        statsByPersonCode
    );


    function createSearchList() {
        const sortedData = getSortedData(currentSort);

        const optionsHtml = sortedData.map(function(person) {
            return `<option value="${formatName(person.name)}"></option>`;
        });

        searchList.innerHTML = optionsHtml.join("");
    }

    function activateSearch() {
        searchInput.addEventListener("input", function() {
            const searchTerm = searchInput.value.trim().toLowerCase();

            if (searchTerm === "") {
                searchResult.innerHTML = "";
                return;
            }

            const sortedData = getSortedData(currentSort);

            const foundIndex = sortedData.findIndex(function(person) {
                const formattedName = formatName(person.name).toLowerCase();
                const originalName = person.name.toLowerCase();

                return (
                    formattedName.includes(searchTerm) ||
                    originalName.includes(searchTerm)
                );
            });

            if (foundIndex === -1) {
                searchResult.innerHTML = `<p class="no-result">No politician found.</p>`;
                return;
            }

            const foundPerson = sortedData[foundIndex];

            const topTwo = getSortedData(currentSort).slice(0, 2);
            const newVisibleData = [
                ...topTwo,
                foundPerson
            ];

            const newHtml = newVisibleData.map(function(person, index) {
                if (index === 2) {
                    return createSlide(person, foundIndex).replace(
                        '<div class="swiper-slide">',
                        '<div class="swiper-slide search-match">'
                    );
                }

                return createSlide(person, index);
            });

            wrapper.innerHTML = newHtml.join("");
            searchResult.innerHTML = "";
        });
    }







    renderSlides(currentSort);
    createSearchList();
    activateSearch();
    activateSortButtons();

    function createStatsLookup(statsList) {
        const lookup = {};

        statsList.forEach(function(statItem) {
            lookup[statItem.person_code] = statItem;
        });

        return lookup;
    }

    function combinePeopleWithStats(peopleList, statsLookup) {
        return peopleList.map(function(person) {
            return {
                ...person,
                stats: statsLookup[person.person_code] || {}
            };
        });
    }

    function formatName(name) {
        const specialNames = {
            "Marti Min Li": "Min Li Marti"
        };

        if (specialNames[name]) {
            return specialNames[name];
        }

        const nameParts = name.trim().split(" ");

        if (nameParts.length >= 2) {
            const firstName = nameParts[0];
            const lastName = nameParts.slice(1).join(" ");

            return lastName + " " + firstName;
        }

        return name;
    }

    function getSortedData(sortKey) {
        const copiedData = [...data];

        copiedData.sort(function(personA, personB) {
            const valueA = personA.stats[sortKey] || 0;
            const valueB = personB.stats[sortKey] || 0;

            return valueB - valueA;
        });

        return copiedData;
    }

    function getRankLabel(rank) {
        if (rank === 1) {
            return "WINNER";
        }

        const lastTwoDigits = rank % 100;
        const lastDigit = rank % 10;

        let suffix = "th";

        if (lastTwoDigits < 11 || lastTwoDigits > 13) {
            if (lastDigit === 1) suffix = "st";
            if (lastDigit === 2) suffix = "nd";
            if (lastDigit === 3) suffix = "rd";
        }

        return rank + suffix + " rank";
    }

    function getPersonValue(person, statsKey) {
        return person.stats[statsKey] || 0;
    }

    function createSquares(totalNumber, successfulNumber, typeClass, delayOffset) {
        let squares = "";

        for (let i = 0; i < totalNumber; i++) {
            const isSuccessful = i < successfulNumber;
            const delay = delayOffset + i * 0.012;

            squares += `
            <span 
                class="proposal-square ${typeClass} ${isSuccessful ? "successful" : ""}"
                style="animation-delay: ${delay}s"
            >
                ${isSuccessful ? "" : ""}
            </span>
        `;
        }

        return squares;
    }


    function createSlide(person, index) {
        const displayName = formatName(person.name);
        const imageLoading = index < 3 ? "eager" : "lazy";
        const rankLabel = getRankLabel(index + 1);

        const success = getPersonValue(person, "success_total");
        const interpellations = getPersonValue(person, "interpellationen");
        const motionsAndPostulates = getPersonValue(person, "mot_and_post");

        const successfulInterpellations = getPersonValue(person, "success_interpellationen");
        const successfulMotionsAndPostulates = getPersonValue(person, "success_mot_and_post");

        return `
        <div class="swiper-slide">
            <div class="portrait-card newspaper-card">

             <div class="rank-label">${rankLabel}</div>

                <div class="portrait-header">
                    <div class="portrait-left">
                        <img src="${person.image}" alt="${person.name}" loading="${imageLoading}">
                    </div>

                    <div class="portrait-name-block">
                        
                        <h2>${displayName}</h2>
                        <p class="bio_text">${person.chamber ?? ""}, Party: ${person.party ?? ""}, District: ${person.place ?? ""}</p>
                        
                   

                    </div>

                    <div class="success-summary">
                        
                       
                            <p>Total <br>success</p>
                            <strong>${success}</strong>
                            
            
                    </div>
                    
                </div>
 
                

                <div class="square-chart">

                   

                    <div class="proposal-section">
                        <h3>Demands</h3>
                        <div class="proposal-grid">
                            ${createSquares(motionsAndPostulates, successfulMotionsAndPostulates, "motion-square", 0.22)}
                        </div>
                    </div>

                     <div class="proposal-section">
                        <h3>Questions</h3>
                        <div class="proposal-grid">
                            ${createSquares(interpellations, successfulInterpellations, "interpellation-square", 0)}
                        </div>
                    </div>





                    <div class="legend">
                        <span><i class="legend-square no-success"></i> No success</span>
                        <span><i class="legend-square success"></i> Success</span>
                        
                    </div>

                </div>
            </div>
        </div>
    `;
    }


    function renderSlides(sortKey) {
        const sortedData = getSortedData(sortKey);
        const visibleData = sortedData.slice(0, 3);

        const slideHtml = visibleData.map(function(person, index) {
            return createSlide(person, index);
        });

        wrapper.innerHTML = slideHtml.join("");
    }







    function activateSortButtons() {
        const sortButtons = document.querySelectorAll(".sort-button");

        sortButtons.forEach(function(button) {
            button.addEventListener("click", function() {
                currentSort = button.dataset.sort;

                sortButtons.forEach(function(otherButton) {
                    otherButton.classList.remove("active");
                });

                button.classList.add("active");

                renderSlides(currentSort);
            });
        });
    }
});