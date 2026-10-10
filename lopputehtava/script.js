
/* -----------------------------------
   Country Explorer - JavaScript
----------------------------------- */


/* Sivun elementit */
const hakuForm = document.getElementById("hakuForm");
const maaHaku = document.getElementById("maaHaku");
const hakutulokset = document.getElementById("hakutulokset");
const suosikkiLista = document.getElementById("suosikkiLista");

// Bootstrap Modal -ikkunan elementit
const modalElement = document.getElementById("maanTiedotModal");
const modalOtsikko = document.getElementById("modalOtsikko");
const modalSisalto = document.getElementById("modalSisalto");


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
        <div class="message-box" role="alert">
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

    // Muutetaan JSON-vastaus JavaScript-objekteiksi
    const maat = await response.json();

    // Näytetään hakutulokset
    naytaMaat(maat);

    // Tyhjennetään hakukenttä onnistuneen haun jälkeen
    maaHaku.value = "";

  } catch (error) {

    // Näytetään virheilmoitus
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

  // Luodaan Bootstrap-kortti
  const kortti = document.createElement("div");

  kortti.className =
    "card country-card";

  // Valitaan maan lippukuva
  let lippu = "";

  if (maa.flags && maa.flags.svg) {
    lippu = maa.flags.svg;
  } else if (maa.flags && maa.flags.png) {
    lippu = maa.flags.png;
  }

  // Lisätään lippu turvallisesti DOM-elementtinä
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

  cardBody.className =
    "card-body d-flex flex-column";

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

  // Kortissa näkyvät perustiedot
  const perustiedot = [
    ["Pääkaupunki", maa.capital || "Ei tietoa"],
    ["Maanosa", maa.region || "Ei tietoa"],
    ["Väkiluku", vakiluku]
  ];

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
     Uusi Bootstrap Modal -painike
  ----------------------------------- */

  const lisatietoPainike =
    document.createElement("button");

  lisatietoPainike.type = "button";

  lisatietoPainike.className =
    "btn btn-primary mt-3";

  lisatietoPainike.textContent =
    "Näytä lisätiedot";

  // Avataan valitun maan lisätiedot
  lisatietoPainike.addEventListener("click", function() {
    naytaLisatiedot(maa);
  });

  // Lisätään painike korttiin
  cardBody.appendChild(lisatietoPainike);


  /* -----------------------------------
     Suosikkipainike
  ----------------------------------- */

  const painike =
    document.createElement("button");

  painike.type = "button";

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

  // Lisätään suosikkipainike korttiin
  cardBody.appendChild(painike);

  // Lisätään sisältö korttiin
  kortti.appendChild(cardBody);

  // Lisätään kortti Bootstrap-sarakkeeseen
  sarake.appendChild(kortti);

  return sarake;

}


/* -----------------------------------
   UUSI TOIMINTO:
   Maan lisätietojen näyttäminen Modalissa
----------------------------------- */

function naytaLisatiedot(maa) {

  // Muodostetaan valuutoista luettava teksti
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


  // Muodostetaan kielistä luettava teksti
  let kielet = "Ei tietoa";

  if (Array.isArray(maa.languages) &&
      maa.languages.length > 0) {

    kielet = maa.languages.map(function(kieli) {
      return kieli.name || "Ei tietoa";
    }).join(", ");

  }


  // Muotoillaan pinta-ala
  const pintaAla =
    typeof maa.area === "number"
      ? maa.area.toLocaleString("fi-FI") + " km²"
      : "Ei tietoa";


  // Muotoillaan väkiluku
  const vakiluku =
    typeof maa.population === "number"
      ? maa.population.toLocaleString("fi-FI")
      : "Ei tietoa";


  // Modal-ikkunan otsikoksi tulee maan nimi
  modalOtsikko.textContent =
    maa.name + " – lisätiedot";


  // Muodostetaan tarkempien tietojen lista
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


  // Tyhjennetään Modal-ikkunan vanha sisältö
  modalSisalto.innerHTML = "";

  // Luodaan Bootstrap-gridillä muotoiltu tietolista
  const lista = document.createElement("dl");

  lista.className = "row";

  tiedot.forEach(function(tieto) {

    // Tiedon otsikko
    const otsikko = document.createElement("dt");

    otsikko.className = "col-sm-4 mb-2";
    otsikko.textContent = tieto[0];

    // Tiedon arvo
    const arvo = document.createElement("dd");

    arvo.className = "col-sm-8 mb-2";
    arvo.textContent = tieto[1];

    // Lisätään otsikko ja arvo listaan
    lista.appendChild(otsikko);
    lista.appendChild(arvo);

  });

  // Lisätään valmis lista Modal-ikkunaan
  modalSisalto.appendChild(lista);


  // Haetaan Bootstrap Modal -olio
  const modal =
    bootstrap.Modal.getOrCreateInstance(modalElement);

  // Avataan Modal-ikkuna
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
