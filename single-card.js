const FIXED_SORT_KEY = "success_total";

Promise.all([
    fetch("bio_nationalcounsil_scraped.json").then(function(response) {
        return response.json();
    }),
    fetch("bio_statescounsil_scraped.json").then(function(response) {
        return response.json();
    }),
    fetch("analysed_affaires.json").then(function(response) {
        return response.json();
    })
]).then(function(loadedData) {
    const nationalraete = loadedData[0];
    const staenderaete = loadedData[1];
    const stats = loadedData[2];

    const statsByPersonCode = {};

    stats.forEach(function(statItem) {
        statsByPersonCode[statItem.person_code] = statItem;
    });

    const allPeople = nationalraete.concat(staenderaete).map(function(person) {
        return {
            ...person,
            stats: statsByPersonCode[person.person_code] || {}
        };
    });

    const sortedData = getSortedData(allPeople, FIXED_SORT_KEY);

    const cardTargets = document.querySelectorAll(".single-politician-card");

    cardTargets.forEach(function(target) {
        const wantedName = target.dataset.politician.toLowerCase().trim();

        const foundIndex = sortedData.findIndex(function(person) {
            return (
                person.name.toLowerCase().includes(wantedName) ||
                formatName(person.name).toLowerCase().includes(wantedName)
            );
        });

        if (foundIndex === -1) {
            target.innerHTML = `<p class="no-result">No politician found.</p>`;
            return;
        }

        const foundPerson = sortedData[foundIndex];

        target.innerHTML = createSlide(foundPerson, foundIndex);
    });

    function getSortedData(data, sortKey) {
        const copiedData = [...data];

        copiedData.sort(function(personA, personB) {
            const valueA = personA.stats[sortKey] || 0;
            const valueB = personB.stats[sortKey] || 0;

            return valueB - valueA;
        });

        return copiedData;
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

    function createSlide(person, index) {
        const displayName = formatName(person.name);
        const rankLabel = getRankLabel(index + 1);

        const success = getPersonValue(person, "success_total");
        const interpellations = getPersonValue(person, "interpellationen");
        const motionsAndPostulates = getPersonValue(person, "mot_and_post");

        const successfulInterpellations = getPersonValue(person, "success_interpellationen");
        const successfulMotionsAndPostulates = getPersonValue(person, "success_mot_and_post");

        return `
            <div class="swiper-slide single-card-slide">
                <div class="portrait-card newspaper-card">

                    <div class="rank-label">${rankLabel}</div>

                    <div class="portrait-header">

                        <div class="portrait-main">

                            <div class="portrait-left">
                                <img src="${person.image}" alt="${person.name}" loading="lazy">
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
<span class="source">source: https://ws-old.parlament.ch/</span>
                    </div>
                </div>
            </div>
        `;
    }
});