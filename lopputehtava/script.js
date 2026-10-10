/* -----------------------------------
   Country Explorer - JavaScript
----------------------------------- */


/* Sivun elementit */
const hakuForm = document.getElementById("hakuForm");
const maaHaku = document.getElementById("maaHaku");
const hakutulokset = document.getElementById("hakutulokset");
const suosikkiLista = document.getElementById("suosikkiLista");


/* Sivun käynnistyessä näytetään tallennetut suosikit */
naytaSuosikit();


/* -----------------------------------
   Maan hakeminen
----------------------------------- */

hakuForm.addEventListener("submit", function(event) {

  // Estetään lomakkeen normaali lähetys
  event.preventDefault();

  // Otetaan käyttäjän kirjoittama hakusana
  const hakusana = maaHaku.value.trim();

  // Tarkistetaan, ettei hakukenttä ole tyhjä
  if (hakusana === "") {

    hakutulokset.innerHTML = `
      <div class="col-12">
        <div class="message-box">
          Kirjoita ensin maan nimi.
        </div>
      </div>
    `;

    return;
  }


  // Käynnistetään haku
  haeMaa(hakusana);

});


/* -----------------------------------
   JSON-datan hakeminen API-palvelusta
----------------------------------- */

async function haeMaa(hakusana) {

  // Näytetään käyttäjälle, että tietoja haetaan
  hakutulokset.innerHTML = `
    <div class="col-12 text-center">
      <p>Haetaan maita...</p>
    </div>
  `;


  try {

    // Muodostetaan API-osoite
    const url =
      `https://countries.dev/name/${encodeURIComponent(hakusana)}`;


    // Haetaan JSON-data ulkoiselta palvelimelta
    const response = await fetch(url);


    // Jos hakua ei löydy, aiheutetaan virhe
    if (!response.ok) {
      throw new Error("Maata ei löytynyt");
    }


    // Muutetaan JSON-vastaus JavaScript-muotoon
    const maat = await response.json();


    // Näytetään hakutulokset
    naytaMaat(maat);


    // Tyhjennetään hakukenttä onnistuneen haun jälkeen
    maaHaku.value = "";


  } catch (error) {

    // Näytetään selkeä virheilmoitus käyttäjälle
    hakutulokset.innerHTML = `
      <div class="col-12">
        <div class="message-box">
          Maata ei löytynyt. Tarkista kirjoitusasu ja yritä uudelleen.
        </div>
      </div>
    `;

  }

}


/* -----------------------------------
   Hakutulosten näyttäminen
----------------------------------- */

function naytaMaat(maat) {

  // Tyhjennetään vanhat hakutulokset
  hakutulokset.innerHTML = "";


  // Käydään kaikki löytyneet maat läpi
  maat.forEach(function(maa) {

    // Luodaan maalle Bootstrap-kortti
    const kortti = luoMaaKortti(maa, false);

    // Lisätään kortti sivulle
    hakutulokset.appendChild(kortti);

  });

}


/* -----------------------------------
   Maakortin luominen
----------------------------------- */

function luoMaaKortti(maa, onSuosikki) {

  // Bootstrap-gridin sarake
  const sarake = document.createElement("div");

  sarake.className =
    "col-12 col-md-6 col-lg-4";


  // Valitaan maan lippukuva
  let lippu = "";

  if (maa.flags && maa.flags.svg) {
    lippu = maa.flags.svg;
  } else if (maa.flags && maa.flags.png) {
    lippu = maa.flags.png;
  }


  // Jos pääkaupunkia ei löydy
  const paakaupunki =
    maa.capital || "Ei tietoa";


  // Jos maanosaa ei löydy
  const maanosa =
    maa.region || "Ei tietoa";


  // Muotoillaan väkiluku suomalaisella numeromuodolla
  const vakiluku =
    maa.population
      ? maa.population.toLocaleString("fi-FI")
      : "Ei tietoa";


  // Luodaan Bootstrap-kortti
  const kortti = document.createElement("div");

  kortti.className =
    "card country-card";


  // Lisätään kortin sisältö
  kortti.innerHTML = `
    <img
      src="${lippu}"
      class="card-img-top"
      alt="${maa.name} lippu">

    <div class="card-body d-flex flex-column">

      <h3 class="card-title h4">
        ${maa.name}
      </h3>

      <p>
        <strong>Pääkaupunki:</strong>
        ${paakaupunki}
      </p>

      <p>
        <strong>Maanosa:</strong>
        ${maanosa}
      </p>

      <p>
        <strong>Väkiluku:</strong>
        ${vakiluku}
      </p>

    </div>
  `;


  // Haetaan kortin card-body
  const cardBody =
    kortti.querySelector(".card-body");


  // Luodaan suosikkipainike
  const painike =
    document.createElement("button");


  // Jos kortti näkyy suosikeissa
  if (onSuosikki) {

    painike.className =
      "btn btn-outline-danger favorite-button mt-auto";

    painike.textContent =
      "Poista suosikeista";


    // Poistetaan maa suosikeista
    painike.addEventListener("click", function() {
      poistaSuosikki(maa.alpha3Code);
    });

  } else {

    painike.className =
      "btn btn-outline-primary favorite-button mt-auto";

    painike.textContent =
      "Lisää suosikiksi";


    // Lisätään maa suosikkeihin
    painike.addEventListener("click", function() {
      lisaaSuosikki(maa);
    });

  }


  // Lisätään painike korttiin
  cardBody.appendChild(painike);


  // Lisätään kortti Bootstrap-sarakkeeseen
  sarake.appendChild(kortti);


  return sarake;

}


/* -----------------------------------
   Suosikin lisääminen
----------------------------------- */

function lisaaSuosikki(maa) {

  // Haetaan nykyiset suosikit
  const suosikit = haeSuosikit();


  // Tarkistetaan, onko maa jo suosikeissa
  const loytyyJo = suosikit.some(function(suosikki) {
    return suosikki.alpha3Code === maa.alpha3Code;
  });


  // Lisätään vain, jos maa ei ole jo suosikeissa
  if (!loytyyJo) {

    suosikit.push(maa);


    // Tallennetaan suosikit localStorageen
    localStorage.setItem(
      "suosikkimaat",
      JSON.stringify(suosikit)
    );


    // Päivitetään suosikkilista
    naytaSuosikit();

  }

}


/* -----------------------------------
   Suosikin poistaminen
----------------------------------- */

function poistaSuosikki(alpha3Code) {

  // Haetaan nykyiset suosikit
  let suosikit = haeSuosikit();


  // Poistetaan valittu maa
  suosikit = suosikit.filter(function(maa) {
    return maa.alpha3Code !== alpha3Code;
  });


  // Tallennetaan uusi lista selaimeen
  localStorage.setItem(
    "suosikkimaat",
    JSON.stringify(suosikit)
  );


  // Päivitetään suosikkien näkymä
  naytaSuosikit();

}


/* -----------------------------------
   Suosikkien hakeminen localStoragesta
----------------------------------- */

function haeSuosikit() {

  // Haetaan tallennettu JSON-merkkijono
  const tallennetut =
    localStorage.getItem("suosikkimaat");


  // Jos suosikkeja ei ole, palautetaan tyhjä taulukko
  if (tallennetut === null) {
    return [];
  }


  // Muutetaan JSON takaisin JavaScript-taulukoksi
  return JSON.parse(tallennetut);

}


/* -----------------------------------
   Suosikkien näyttäminen
----------------------------------- */

function naytaSuosikit() {

  // Haetaan suosikit
  const suosikit = haeSuosikit();


  // Tyhjennetään vanha lista
  suosikkiLista.innerHTML = "";


  // Jos suosikkeja ei vielä ole
  if (suosikit.length === 0) {

    suosikkiLista.innerHTML = `
      <div class="col-12 text-center">
        <p>
          Et ole vielä lisännyt suosikkimaita.
        </p>
      </div>
    `;

    return;
  }


  // Luodaan jokaiselle suosikille kortti
  suosikit.forEach(function(maa) {

    const kortti =
      luoMaaKortti(maa, true);

    suosikkiLista.appendChild(kortti);

  });

}
