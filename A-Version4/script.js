// Daten laden: Nationalräte und ihre parlamentarischen Statistiken
Promise.all([
    fetch("nationalraete.json").then(function(response) {
        return response.json();
    }),
    fetch("parlamentarier_stats.json").then(function(response) {
        return response.json();
    })
]).then(function(loadedData) {
    const nationalraete = loadedData[0];
    const stats = loadedData[1];

    const wrapper = document.querySelector(".swiper-wrapper");

    // Einstellungen, die du bei Bedarf einfach ändern kannst
    const maxSlides = 30;
    const maxBarValue = 26;

    const averageInterpellations = 8;
    const averageMotions = 4;

    let currentSort = "success";
    let swiper = null;

    // Aus der Statistikliste wird ein schneller Nachschlage-Index erstellt.
    // Dadurch kann man die Statistik einer Person sehr schnell über person_code finden.
    //ein Objekt wie folgt: {"3090": {person_code: 3090, interpellationen: 34, motionen: 12, postulate: 5 }, "3127": { person_code: 3127,interpellationen: 8,motionen: 4,postulate: 2}}

    const statsByPersonCode = createStatsLookup(stats);

    // Jede Person erhält ihre Statistik direkt als neues Feld "stats".
    const data = combinePeopleWithStats(nationalraete, statsByPersonCode);

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
            if (lastDigit === 1) {
                suffix = "st";
            }

            if (lastDigit === 2) {
                suffix = "nd";
            }

            if (lastDigit === 3) {
                suffix = "rd";
            }
        }

        return rank + suffix + " rank";
    }

    function getBarWidth(value) {
        const percentage = (value / maxBarValue) * 90;

        return Math.min(percentage, 100);
    }

    function getPersonValue(person, statsKey) {
        return person.stats[statsKey] || 0;
    }



    function createSlide(person, index) {
        const displayName = formatName(person.name);
        const imageLoading = index === 0 ? "eager" : "lazy";
        const rankLabel = getRankLabel(index + 1);

        const total = getPersonValue(person, "total");
        const success = getPersonValue(person, "success");
        const successrate = Math.round(getPersonValue(person, "suc_percent") * 10) / 10;
        const interpellations = getPersonValue(person, "interpellationen");
        const motions = getPersonValue(person, "motionen");


        const totalWidth = getBarWidth(total);
        const successWidth = getBarWidth(success);
        const sucessrateWidth = getBarWidth(successrate);

        const interpellationWidth = getBarWidth(interpellations);
        const motionWidth = getBarWidth(motions);

        const averageInterpellationWidth = getBarWidth(averageInterpellations);
        const averageMotionWidth = getBarWidth(averageMotions);

        return `
      <div class="swiper-slide">
        <div class="portrait-card">
          <div class="portrait-left">
            <img src="${person.image}" alt="${person.name}" loading="${imageLoading}">
            <p class="text">Party: ${person.party ?? ""}, District: ${person.place ?? ""}</p>
          </div>

          <div class="portrait-right">
            <div class="rank-label">${rankLabel}</div>
            <h2>${displayName}</h2>

            <div class="chart-box">
              <div class="chart-title">Interfudi</div>

              <div class="bar-row">
                <span>Total<br> proposals</span>
                <div class="bar-bg">
                  <div class="bar interpellation" style="width: ${totalWidth}%"></div>
                </div>
                <strong>${total}</strong>
              </div>
              
              
               <div class="bar-row">
                <span>Successful proposals</span>
                <div class="bar-bg">
                  <div class="bar interpellation" style="width: ${successWidth}%"></div>
                </div>
                <strong>${success}</strong>
              </div>
              
              
               <div class="bar-row">
                <span>Success rate</span>
                <div class="bar-bg">
                  <div class="bar interpellation" style="width: ${sucessrateWidth}%"></div>
                </div>
                <strong>${successrate} %</strong>
              </div>
              
              
              
              
              <div class="bar-row">
                <span>Questions</span>
                <div class="bar-bg">
                  <div class="bar interpellation" style="width: ${interpellationWidth}%"></div>
                </div>
                <strong>${interpellations}</strong>
              </div>

              <div class="bar-row">
                <span>Council avg.</span>
                <div class="bar-bg">
                  <div class="bar average" style="width: ${averageInterpellationWidth}%"></div>
                </div>
                <strong>${averageInterpellations}</strong>
              </div>

              <div class="chart-title motions-title">Motions</div>

              <div class="bar-row">
                <span>This member</span>
                <div class="bar-bg">
                  <div class="bar motion" style="width: ${motionWidth}%"></div>
                </div>
                <strong>${motions}</strong>
              </div>

              <div class="bar-row">
                <span>Council avg.</span>
                <div class="bar-bg">
                  <div class="bar average" style="width: ${averageMotionWidth}%"></div>
                </div>
                <strong>${averageMotions}</strong>
              </div>

              <div class="legend">
                <span><i class="dot interpellation-dot"></i> Interpellations</span>
                <span><i class="dot motion-dot"></i> Motions</span>
                <span><i class="dot average-dot"></i> Council average</span>
              </div>
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
            centeredSlides: true,
            slidesPerView: 1,
            spaceBetween: 0,
            speed: 500,
            grabCursor: true,
            watchSlidesProgress: true,

            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev"
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