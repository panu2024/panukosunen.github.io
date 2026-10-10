
/* -----------------------------------
   Country Explorer - JavaScript
----------------------------------- */


/* Sivun elementit */
const hakuForm = document.getElementById("hakuForm");
const maaHaku = document.getElementById("maaHaku");
const maanosaSuodatin = document.getElementById("maanosaSuodatin");
const hakutulokset = document.getElementById("hakutulokset");
const suosikkiLista = document.getElementById("suosikkiLista");

// Bootstrap Modal -ikkunan elementit
const modalElement = document.getElementById("maanTiedotModal");
const modalOtsikko = document.getElementById("modalOtsikko");
const modalSisalto = document.getElementById("modalSisalto");


/* Sivun käynnistyessä näytetään tallennetut suosikit */
naytaSuosikit();


/* -----------------------------------
   Maan hakeminen nimellä
----------------------------------- */

hakuForm.addEventListener("submit", function(event) {

  // Estetään lomakkeen normaali lähetys
  event.preventDefault();

  // Luetaan käyttäjän kirjoittama hakusana
  const hakusana = maaHaku.value.trim();

  // Tarkistetaan tyhjä hakukenttä
  if (hakusana === "") {

    hakutulokset.innerHTML = `
      <div class="col-12">
        <div class="message-box" role="alert">
          Kirjoita ensin maan nimi.
        </div>
      </div>
    `;

    return;
  }

  // Tyhjennetään maanosavalinta
  maanosaSuodatin.value = "";

  // Käynnistetään maan haku
  haeMaa(hakusana);

});


/* -----------------------------------
   UUSI: Maanosasuodatus
----------------------------------- */

maanosaSuodatin.addEventListener("change", function() {

  // Luetaan valittu maanosa
  const maanosa = maanosaSuodatin.value;

  // Tyhjennetään maan hakukenttä
  maaHaku.value = "";

  // Jos käyttäjä valitsee oletusvaihtoehdon
  if (maanosa === "") {

    hakutulokset.innerHTML = "";
    return;

  }

  // Haetaan valitun maanosan maat
  haeMaanosanMaat(maanosa);

});


/* -----------------------------------
   JSON-datan hakeminen maan nimellä
----------------------------------- */

async function haeMaa(hakusana) {

  // Näytetään latausilmoitus
  hakutulokset.innerHTML = `
    <div class="col-12 text-center" role="status">
      <p>Haetaan maita...</p>
    </div>
  `;

  try {

    // Muodostetaan API-osoite
    const url =
      `https://countries.dev/name/${encodeURIComponent(hakusana)}`;

    // Haetaan JSON-data ulkoiselta palvelimelta
    const response = await fetch(url);

    // Tarkistetaan vastauksen onnistuminen
    if (!response.ok) {
      throw new Error("Maata ei löytynyt");
    }

    // Muutetaan JSON JavaScript-taulukoksi
    const maat = await response.json();

    // Näytetään hakutulokset
    naytaMaat(maat);

    // Tyhjennetään hakukenttä
    maaHaku.value = "";

  } catch (error) {

    hakutulokset.innerHTML = `
      <div class="col-12">
        <div class="message-box" role="alert">
          Maatietoja ei pystytä hakemaan.
          Tarkista maan nimi ja yritä uudelleen.
        </div>
      </div>
    `;

    console.error("Maan hakeminen epäonnistui:", error);

  }

}


/* -----------------------------------
   UUSI: JSON-haku maanosan mukaan
----------------------------------- */

async function haeMaanosanMaat(maanosa) {

  // Näytetään latausilmoitus
  hakutulokset.innerHTML = `
    <div class="col-12 text-center" role="status">
      <p>Haetaan maanosan maita...</p>
    </div>
  `;

  try {

    // Muodostetaan maanosan API-osoite
    const url =
      `https://countries.dev/region/${encodeURIComponent(maanosa)}`;

    // Haetaan maat ulkoisesta JSON-rajapinnasta
    const response = await fetch(url);

    // Tarkistetaan, onnistuiko haku
    if (!response.ok) {
      throw new Error("Maanosan tietoja ei löytynyt");
    }

    // Muutetaan JSON JavaScript-taulukoksi
    const maat = await response.json();

    // Järjestetään maat aakkosjärjestykseen
    maat.sort(function(a, b) {
      return a.name.localeCompare(b.name, "fi");
    });

    // Näytetään maat Bootstrap-kortteina
    naytaMaat(maat);

  } catch (error) {

    // Virheilmoitus epäonnistuneessa haussa
    hakutulokset.innerHTML = `
      <div class="col-12">
        <div class="message-box" role="alert">
          Maanosan tietoja ei pystytä hakemaan.
          Yritä myöhemmin uudelleen.
        </div>
      </div>
    `;

    console.error("Maanosahaku epäonnistui:", error);

  }

}


/* -----------------------------------
   Hakutulosten näyttäminen
----------------------------------- */

function naytaMaat(maat) {

  // Tyhjennetään vanhat hakutulokset
  hakutulokset.innerHTML = "";

  // Tarkistetaan, löytyikö maita
  if (!Array.isArray(maat) || maat.length === 0) {

    hakutulokset.innerHTML = `
      <div class="col-12">
        <div class="message-box" role="status">
          Maita ei löytynyt.
        </div>
      </div>
    `;

    return;
  }

  // Luodaan jokaiselle maalle oma kortti
  maat.forEach(function(maa) {

    const kortti = luoMaaKortti(maa, false);

    hakutulokset.appendChild(kortti);

  });

}


/* -----------------------------------
   Maakortin luominen
----------------------------------- */

function luoMaaKortti(maa, onSuosikki) {

  // Luodaan responsiivinen Bootstrap-sarake
  const sarake = document.createElement("div");

  sarake.className =
    "col-12 col-md-6 col-lg-4";

  // Luodaan Bootstrap-kortti
  const kortti = document.createElement("div");

  kortti.className = "card country-card";

  // Valitaan maan lippu
  let lippu = "";

  if (maa.flags && maa.flags.svg) {
    lippu = maa.flags.svg;
  } else if (maa.flags && maa.flags.png) {
    lippu = maa.flags.png;
  }

  // Luodaan lippukuva
  if (lippu) {

    const kuva = document.createElement("img");

    kuva.src = lippu;
    kuva.alt = maa.name + " lippu";
    kuva.className = "card-img-top";
    kuva.loading = "lazy";

    kortti.appendChild(kuva);

  }

  // Luodaan kortin sisältöalue
  const cardBody = document.createElement("div");

  cardBody.className = "card-body d-flex flex-column";

  // Maan nimi
  const otsikko = document.createElement("h3");

  otsikko.className = "card-title h4";
  otsikko.textContent = maa.name;

  cardBody.appendChild(otsikko);

  // Muotoillaan väkiluku
  const vakiluku =
    typeof maa.population === "number"
      ? maa.population.toLocaleString("fi-FI")
      : "Ei tietoa";

  // Kortissa näytettävät perustiedot
  const perustiedot = [
    ["Pääkaupunki", maa.capital || "Ei tietoa"],
    ["Maanosa", maa.region || "Ei tietoa"],
    ["Väkiluku", vakiluku]
  ];

  // Luodaan jokainen tietorivi
  perustiedot.forEach(function(tieto) {

    const rivi = document.createElement("p");
    const nimi = document.createElement("strong");

    nimi.textContent = tieto[0] + ": ";

    rivi.appendChild(nimi);

    rivi.appendChild(
      document.createTextNode(tieto[1])
    );

    cardBody.appendChild(rivi);

  });


  /* -----------------------------------
     Bootstrap Modal -painike
  ----------------------------------- */

  const lisatietoPainike = document.createElement("button");

  lisatietoPainike.type = "button";

  lisatietoPainike.className =
    "btn btn-primary mt-3";

  lisatietoPainike.textContent =
    "Näytä lisätiedot";

  // Avataan valitun maan tiedot
  lisatietoPainike.addEventListener("click", function() {
    naytaLisatiedot(maa);
  });

  cardBody.appendChild(lisatietoPainike);


  /* -----------------------------------
     Suosikkipainike
  ----------------------------------- */

  const painike = document.createElement("button");

  painike.type = "button";

  if (onSuosikki) {

    // Suosikeissa olevan maan poistaminen
    painike.className =
      "btn btn-outline-danger favorite-button mt-auto";

    painike.textContent = "Poista suosikeista";

    painike.addEventListener("click", function() {
      poistaSuosikki(maa.alpha3Code);
    });

  } else {

    // Maan lisääminen suosikkeihin
    painike.className =
      "btn btn-outline-primary favorite-button mt-auto";

    painike.textContent = "Lisää suosikiksi";

    painike.addEventListener("click", function() {
      lisaaSuosikki(maa);
    });

  }

  // Lisätään painike korttiin
  cardBody.appendChild(painike);

  // Lisätään kortin sisältö
  kortti.appendChild(cardBody);

  // Lisätään kortti sarakkeeseen
  sarake.appendChild(kortti);

  return sarake;

}


/* -----------------------------------
   Maan lisätiedot Bootstrap Modalissa
----------------------------------- */

function naytaLisatiedot(maa) {

  // Valuuttojen käsittely
  let valuutat = "Ei tietoa";

  if (Array.isArray(maa.currencies) &&
      maa.currencies.length > 0) {

    valuutat = maa.currencies.map(function(valuutta) {

      const nimi = valuutta.name || "Tuntematon valuutta";

      const koodi = valuutta.code
        ? ` (${valuutta.code})`
        : "";

      return nimi + koodi;

    }).join(", ");

  }

  // Kielten käsittely
  let kielet = "Ei tietoa";

  if (Array.isArray(maa.languages) &&
      maa.languages.length > 0) {

    kielet = maa.languages.map(function(kieli) {
      return kieli.name || "Ei tietoa";
    }).join(", ");

  }

  // Pinta-alan muotoilu
  const pintaAla =
    typeof maa.area === "number"
      ? maa.area.toLocaleString("fi-FI") + " km²"
      : "Ei tietoa";

  // Väkiluvun muotoilu
  const vakiluku =
    typeof maa.population === "number"
      ? maa.population.toLocaleString("fi-FI")
      : "Ei tietoa";

  // Modal-ikkunan otsikko
  modalOtsikko.textContent =
    maa.name + " – lisätiedot";

  // Näytettävät lisätiedot
  const tiedot = [
    ["Pääkaupunki", maa.capital || "Ei tietoa"],
    ["Maanosa", maa.region || "Ei tietoa"],
    ["Alue", maa.subregion || "Ei tietoa"],
    ["Väkiluku", vakiluku],
    ["Pinta-ala", pintaAla],
    ["Valuutta", valuutat],
    ["Kielet", kielet],
    ["Maakoodi", maa.alpha3Code || "Ei tietoa"]
  ];

  // Tyhjennetään aiemmat tiedot
  modalSisalto.innerHTML = "";

  // Luodaan Bootstrap-gridin mukainen tietolista
  const lista = document.createElement("dl");

  lista.className = "row";

  tiedot.forEach(function(tieto) {

    // Tiedon nimi
    const otsikko = document.createElement("dt");

    otsikko.className = "col-sm-4 mb-2";
    otsikko.textContent = tieto[0];

    // Tiedon arvo
    const arvo = document.createElement("dd");

    arvo.className = "col-sm-8 mb-2";
    arvo.textContent = tieto[1];

    lista.appendChild(otsikko);
    lista.appendChild(arvo);

  });

  // Lisätään lista Modal-ikkunaan
  modalSisalto.appendChild(lista);

  // Avataan Bootstrap Modal
  const modal =
    bootstrap.Modal.getOrCreateInstance(modalElement);

  modal.show();

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

  // Lisätään maa vain kerran
  if (!loytyyJo) {

    suosikit.push(maa);

    // Tallennetaan localStorageen JSON-muodossa
    localStorage.setItem(
      "suosikkimaat",
      JSON.stringify(suosikit)
    );

    // Päivitetään suosikit
    naytaSuosikit();

  }

}


/* -----------------------------------
   Suosikin poistaminen
----------------------------------- */

function poistaSuosikki(alpha3Code) {

  let suosikit = haeSuosikit();

  // Poistetaan valittu maa
  suosikit = suosikit.filter(function(maa) {
    return maa.alpha3Code !== alpha3Code;
  });

  // Tallennetaan päivitetty lista
  localStorage.setItem(
    "suosikkimaat",
    JSON.stringify(suosikit)
  );

  // Päivitetään suosikkinäkymä
  naytaSuosikit();

}


/* -----------------------------------
   Suosikkien lukeminen localStoragesta
----------------------------------- */

function haeSuosikit() {

  // Haetaan tallennettu JSON
  const tallennetut =
    localStorage.getItem("suosikkimaat");

  if (tallennetut === null) {
    return [];
  }

  // Muutetaan JSON takaisin taulukoksi
  try {

    const suosikit = JSON.parse(tallennetut);

    return Array.isArray(suosikit) ? suosikit : [];

  } catch (error) {

    console.error("Suosikkeja ei voitu lukea:", error);
    return [];

  }

}


/* -----------------------------------
   Suosikkien näyttäminen
----------------------------------- */

function naytaSuosikit() {

  // Haetaan tallennetut suosikit
  const suosikit = haeSuosikit();

  // Tyhjennetään aiempi lista
  suosikkiLista.innerHTML = "";

  // Jos suosikkeja ei ole
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

  // Luodaan suosikeille maakortit
  suosikit.forEach(function(maa) {

    const kortti = luoMaaKortti(maa, true);

    suosikkiLista.appendChild(kortti);

  });

}
