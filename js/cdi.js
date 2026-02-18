const di_properties = [
  {
    title: "Alphaville Nova Esplanada",
    price: "R$ 1.950.000",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
  },
  {
    title: "Campolim High Glass",
    price: "R$ 890.000",
    image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde"
  },
  {
    title: "Condomínio Ibiti Royal",
    price: "R$ 1.200.000",
    image: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c"
  }
];

function di_renderProperties() {
  const scroll = document.getElementById("prop-list");
  const full = document.getElementById("full-prop-list");

  scroll.innerHTML = "";
  full.innerHTML = "";

  di_properties.forEach(prop => {
    const card = `
      <div class="prop-card" onclick="di_haptic()">
        <div class="prop-image" style="background-image:url('${prop.image}')"></div>
        <div class="prop-overlay"></div>
        <div class="prop-content">
          <div class="prop-title">${prop.title}</div>
          <div class="prop-price">${prop.price}</div>
        </div>
      </div>
    `;

    scroll.innerHTML += card;
    full.innerHTML += card;
  });
}

document.addEventListener("DOMContentLoaded", di_renderProperties);
