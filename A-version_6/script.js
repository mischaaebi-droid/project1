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

    const maxSlides = 30;
    let currentSort = "success_total";
    let swiper = null;

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
                        
                    </div>

                    <div class="success-summary">
                        
                        <div>
                       
                            <p>Total success</p>
                            <strong>${success}</strong>
                            
                        </div>
                    </div>
                    
                </div>
 <p class="bio_text">Party: ${person.party ?? ""}, District: ${person.place ?? ""}</p>
                

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
        const visibleData = sortedData.slice(0, maxSlides);

        const slideHtml = visibleData.map(function(person, index) {
            return createSlide(person, index);
        });

        wrapper.innerHTML = slideHtml.join("");

        if (swiper !== null) {
            swiper.destroy(true, true);
        }

        swiper = new Swiper(".swiper", {
            loop: true,
            initialSlide: 0,
            centeredSlides: false,
            slidesPerView: 1,
            spaceBetween: 18,
            speed: 500,
            grabCursor: true,
            watchSlidesProgress: true,

            breakpoints: {
                1000: {
                    slidesPerView: 3,
                    spaceBetween: 22
                }
            },



            keyboard: {
                enabled: true
            }
        });
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