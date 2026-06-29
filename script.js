//  laden: Nationalräte, Ständeräte und parlamentarische Statistiken
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
]).then(function(loadedData) {
    const nationalraete = loadedData[0];
    const staenderaete = loadedData[1];
    const stats = loadedData[2];

    const wrapper = document.querySelector(".swiper-wrapper");
    let searchInput = document.querySelector("#politician-search");
    let searchSuggestions = document.querySelector(".search-suggestions");
    let searchResult = document.querySelector(".search-result");

    const desktopSearchInput = document.querySelector("#politician-search");
    const mobileSearchInput = document.querySelector("#politician-search-mobile");

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

    renderSlides(currentSort);
    renderSuggestions("");
    activateSearch();

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


    function activateSearch() {
        if (desktopSearchInput) {
            desktopSearchInput.addEventListener("input", function() {
                handleSearch(desktopSearchInput.value, searchResult);
            });
        }

        if (mobileSearchInput) {

            let keyboardTimer;

            mobileSearchInput.addEventListener("input", function() {

                handleSearch(
                    mobileSearchInput.value,
                    document.querySelector(".search-result-mobile")
                );

                requestAnimationFrame(function() {
                    lockThirdCardToTop();
                });

                clearTimeout(keyboardTimer);

                keyboardTimer = setTimeout(function() {
                    mobileSearchInput.blur();
                }, 1450);
            });
        }

        const mobileSearchSection = document.querySelector(".search-section-mobile");

        function positionMobileSearchAboveKeyboard() {
            if (!window.visualViewport || !mobileSearchSection) {
                return;
            }

            const keyboardHeight =
                window.innerHeight -
                window.visualViewport.height -
                window.visualViewport.offsetTop;

            const searchOffset = 70;

            mobileSearchSection.style.bottom =
                Math.max(0, keyboardHeight - searchOffset) + "px";
        }

        if (mobileSearchInput && mobileSearchSection) {
            mobileSearchInput.addEventListener("focus", function() {
                lockThirdCardToTop();
                mobileSearchSection.classList.add("keyboard-active");
                positionMobileSearchAboveKeyboard();
            });

            mobileSearchInput.addEventListener("blur", function() {
                mobileSearchSection.classList.remove("keyboard-active");
                mobileSearchSection.style.bottom = "";
            });

            if (window.visualViewport) {
                window.visualViewport.addEventListener(
                    "resize",
                    positionMobileSearchAboveKeyboard
                );

                window.visualViewport.addEventListener(
                    "scroll",
                    positionMobileSearchAboveKeyboard
                );
            }
        }
    }

    function lockThirdCardToTop() {
        if (window.innerWidth >= 1000) {
            return;
        }

        const cards = document.querySelectorAll(".swiper-slide");

        if (cards.length < 3) {
            return;
        }

        window.scrollTo({
            top: cards[2].offsetTop,
            behavior: "auto"
        });
    }





    function renderSuggestions(searchValue) {
        const searchTerm = searchValue.trim().toLowerCase();
        const sortedData = getSortedData(currentSort);

        let suggestions = sortedData;

        if (searchTerm !== "") {
            suggestions = sortedData.filter(function(person) {
                const formattedName = formatName(person.name).toLowerCase();
                const originalName = person.name.toLowerCase();

                return (
                    formattedName.includes(searchTerm) ||
                    originalName.includes(searchTerm)
                );
            });
        }

        const visibleSuggestions = suggestions.slice(0, 8);

        if (visibleSuggestions.length === 0) {
            searchSuggestions.innerHTML = `<p class="no-result">No politician found.</p>`;
            return;
        }

        const suggestionsHtml = visibleSuggestions.map(function(person) {
            const displayName = formatName(person.name);

            return `
            <button class="search-suggestion" type="button">
                ${displayName}
            </button>
        `;
        });

        searchSuggestions.innerHTML = suggestionsHtml.join("");
    }








    function handleSearch(searchValue, resultElement) {
        const searchTerm = searchValue.trim().toLowerCase();

        if (searchTerm === "") {
            resultElement.innerHTML = "";
            renderSlides(currentSort);
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
            resultElement.innerHTML = `<p class="no-result">No politician found.</p>`;
            return;
        }

        const foundPerson = sortedData[foundIndex];

        renderSearchResult(foundPerson, foundIndex, searchValue);
        resultElement.innerHTML = "";
    }

    function renderSearchResult(foundPerson, foundIndex, searchValue) {
        const topTwo = getSortedData(currentSort).slice(0, 2);

        const slideHtml = topTwo.map(function(person, index) {
            return createSlide(person, index);
        });

        const resultSlide = createSlide(foundPerson, foundIndex).replace(
            '<div class="swiper-slide">',
            '<div class="swiper-slide search-match">'
        );


        slideHtml.push(resultSlide);

        wrapper.innerHTML = slideHtml.join("");
        lockThirdCardToTop();

        const activeInput = window.innerWidth < 1000 ? mobileSearchInput : desktopSearchInput;

        activeInput.focus({ preventScroll: true });
        activeInput.setSelectionRange(
            activeInput.value.length,
            activeInput.value.length
        );









    }

    function renderSlides(sortKey) {
        const sortedData = getSortedData(sortKey);
        const visibleData = sortedData.slice(0, 2);

        const slideHtml = visibleData.map(function(person, index) {
            return createSlide(person, index);
        });

        slideHtml.push(createPlaceholderSlide());

        wrapper.innerHTML = slideHtml.join("");
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
            return "Winner";
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
                    style="animation-delay: ${delay}s">
                </span>
            `;
        }

        return squares;
    }







    function createPlaceholderSlide() {
        return `
            <div class="swiper-slide placeholder-slide">
                <div class="portrait-card newspaper-card placeholder-card">

                    <div class="rank-label placeholder-rank">rank</div>

                    <div class="portrait-header">
                        <div class="portrait-main">

                            <div class="portrait-left placeholder-head">
                                <div class="head-circle"></div>
                                <div class="shoulder-shape"></div>
                            </div>

                            <div class="portrait-name-block-handy">
                                <h2>Preferred politician?</h2>
                                <p class="bio_text">
                                    Type a name in search field above
                                    
                                </p>
                            </div>

                           

                        </div>

                        <div class="portrait-name-block">
                            <h2>Your politician</h2>
                            <p class="bio_text">
                                Type a name in search field above
                            </p>
                        </div>
                    </div>

                    <div class="square-chart">

                        <div class="proposal-section demands-section">
                            <h3>Demands</h3>
                            <div class="proposal-grid placeholder-grid">
                                ${createSquares(10, 0, "motion-square placeholder-square", 0)}
                            </div>
                        </div>

                        

                        <div class="proposal-section questions-section">
                            <h3>Inquiries</h3>
                            <div class="proposal-grid placeholder-grid">
                                ${createSquares(5, 0, "interpellation-square placeholder-square", 0)}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        `;
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

                        <div class="portrait-main">

                            <div class="portrait-left">
                                <img src="${person.image}" alt="${person.name}" loading="${imageLoading}">
                            </div>

                            <div class="portrait-name-block-handy">
                                <h2>${displayName}</h2>
                                <p class="bio_text">
                                    ${person.chamber ?? ""}, ${person.party ?? ""}, ${person.place ?? ""}
                                    <br><span class="suc">${success} success</span>
                                </p>
                            </div>

                            <div class="success-summary">
                                <p>Total<br>success</p>
                                <strong>${success}</strong>
                            </div>

                        </div>

                        <div class="portrait-name-block">
                            <h2>${displayName}</h2>
                            <p class="bio_text">
                                ${person.chamber ?? ""}, ${person.party ?? ""}, ${person.place ?? ""}
                            </p>
                        </div>

                    </div>

                    <div class="square-chart">

                        <div class="proposal-section demands-section">
                            <h3>Demands</h3>
                            <div class="proposal-grid">
                                ${createSquares(motionsAndPostulates, successfulMotionsAndPostulates, "motion-square", 0.22)}
                            </div>
                        </div>

                        <div class="legend demand-legend">
                            <span><i class="legend-square no-success"></i> No success</span>
                            <span><i class="legend-square success"></i> Success</span>
                        </div>

                        <div class="proposal-section questions-section">
                            <h3>Inquiries</h3>
                            <div class="proposal-grid">
                                ${createSquares(interpellations, successfulInterpellations, "interpellation-square", 0)}
                            </div>
                        </div>

                        <div class="legend demand-legend">
                            <span><i class="legend-square interpell"></i>Submission only, no approval required</span>
                        </div>

                    </div>
                </div>
            </div>
        `;
    }

    function escapeHtml(text) {
        return String(text)
            .replaceAll("&", "&amp;")
            .replaceAll('"', "&quot;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;");
    }
});