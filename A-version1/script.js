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
        <img src="${person.image}" alt="${person.name}">
        <h2>${person.name}</h2>
       
        <p>submitted ${person.stats.interpellationen ?? 0} inquiries<br> to the government.</p>
		<p> Party: ${person.party ?? ""} <br>District: ${person.place ? "· " + person.place : ""}</p>
      </div>
    `;
  });

  new Swiper(".swiper", {
    loop: true,
    initialSlide: startIndex,
    centeredSlides: true,
    slidesPerView: 1.55,
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