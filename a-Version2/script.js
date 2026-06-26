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
  
  data.sort((a, b) => {
  return (b.stats.interpellationen || 0) - (a.stats.interpellationen || 0);
});
  
  
  

  const startIndex = data.reduce((bestIndex, person, index) => {
    const current = person.stats.interpellationen || 0;
    const best = data[bestIndex].stats.interpellationen || 0;

    return current > best ? index : bestIndex;
  }, 0);

  const wrapper = document.querySelector(".swiper-wrapper");

  data.forEach(person => {
    wrapper.innerHTML += `
  <div class="swiper-slide">
    <div class="portrait-card">
      <div class="portrait-left">
        <img src="${person.image}" alt="${person.name}">
        <p class="text">Party: ${person.party ?? ""}, District: ${person.place ?? ""}</p>
      </div>

      <div class="portrait-right">
        <h2>${person.name}</h2>

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
          <br><p>
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
          <br><p>
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
  });

  new Swiper(".swiper", {
    loop: true,
    initialSlide: startIndex,
    centeredSlides: true,
    slidesPerView: 1,
    spaceBetween: 0,
    speed: 500,
    grabCursor: true,
	watchSlidesProgress: true,

    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    keyboard: {
      enabled: true,
    },
  });
});