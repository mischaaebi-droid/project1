  const statsbodbod = {};

Promise.all([
  fetch("nationalraete.json").then(r => r.json()),
  fetch("parlamentarier_stats.json").then(r => r.json())
]).then(([nationalraete, stats]) => {

  const statsByCode = {};

  stats.forEach(s => {
    statsByCode[s.person_code] = s;
  });

  const data = nationalraete.map(person => {
    return {
      ...person,
      stats: statsByCode[person.person_code] || {}
    };
  });

  let currentSort = "interpellationen";
  let swiper;

  const wrapper = document.querySelector(".swiper-wrapper");
  const maxSlides = 30;

  function formatName(name) {
    const specialNames = {
      "Marti Min Li": "Min Li Marti"
    };

    if (specialNames[name]) {
      return specialNames[name];
    }

    const parts = name.trim().split(" ");

    if (parts.length >= 2) {
      return `${parts.slice(1).join(" ")} ${parts[0]}`;
    }

    return name;
  }

  function getSortedData(sortKey) {
    return [...data].sort((a, b) => {
      return (b.stats[sortKey] || 0) - (a.stats[sortKey] || 0);
    });
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

    return `${rank}${suffix} rank`;
  }

  function createSlide(person, index, sortKey) {
    const displayName = formatName(person.name);
    const imageLoading = index === 0 ? "eager" : "lazy";
    const rankLabel = getRankLabel(index + 1);

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
              <div class="chart-title">Interpellations</div>

              <div class="bar-row">
                <span>This member</span>
                <div class="bar-bg">
                  <div class="bar interpellation" style="width: ${Math.min((person.stats.interpellationen || 0) / 26 * 100, 100)}%"></div>
                </div>
                <strong>${person.stats.interpellationen ?? 0}</strong>
              </div>

              <div class="bar-row">
                <span>Council avg.</span>
                <div class="bar-bg">
                  <div class="bar average" style="width: 18%"></div>
                </div>
                <strong>8</strong>
              </div>

              <div class="chart-title motions-title">Motions</div>

              <div class="bar-row">
                <span>This member</span>
                <div class="bar-bg">
                  <div class="bar motion" style="width: ${Math.min((person.stats.motionen || 0) / 26 * 100, 100)}%"></div>
                </div>
                <strong>${person.stats.motionen ?? 0}</strong>
              </div>

              <div class="bar-row">
                <span>Council avg.</span>
                <div class="bar-bg">
                  <div class="bar average" style="width: 10%"></div>
                </div>
                <strong>4</strong>
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
    const sortedData = getSortedData(sortKey).slice(0, maxSlides);

    wrapper.innerHTML = sortedData
      .map((person, index) => createSlide(person, index, sortKey))
      .join("");

    if (swiper) {
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
        prevEl: ".swiper-button-prev",
      },

      keyboard: {
        enabled: true,
      },
    });
  }

  renderSlides(currentSort);

  document.querySelectorAll(".sort-button").forEach(button => {
    button.addEventListener("click", () => {
      currentSort = button.dataset.sort;

      document.querySelectorAll(".sort-button").forEach(b => {
        b.classList.remove("active");
      });

      button.classList.add("active");

      renderSlides(currentSort);
    });
  });

});