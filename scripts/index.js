const URLS = {
  countries: "https://countriesnow.space/api/v0.1/countries",
  methods: "https://api.aladhan.com/v1/methods",
  praysTime: new URL("http://api.aladhan.com/v1/timingsByCity"),
};
async function fetchURL(url, configration = {}) {
  const response = await fetch(url, configration);
  if (!response.ok) {
    throw new Error(
      `Http error with status code ${response.status}
       : fetchURL , URL{${url}}`
    );
  }
  return await response.json();
}
function get12TIme(time) {
  time =
    time.split(":")[0] > 12
      ? `${time.split(":")[0] - 12}:${time.split(":")[1]}`
      : time;
  return `${
    time.split(":")[0] >= 10 ? time.split(":")[0] : `0${time.split(":")[0]}`
  }:${time.split(":")[1]} PM`;
}
function updateTime(timings) {
  if (timings) {
    const fajrTime = document.querySelector(`[data-name="fajr"] .time`);
    const sunriseTime = document.querySelector(`[data-name="sunrise"] .time`);
    const duhurTime = document.querySelector(`[data-name="duhur"] .time`);
    const asrTime = document.querySelector(`[data-name="asr"] .time`);
    const maghribTime = document.querySelector(`[data-name="maghrib"] .time`);
    const ishaTime = document.querySelector(`[data-name="isha"] .time`);

    fajrTime.innerText = `${timings.Fajr} AM`;
    sunriseTime.innerText = `${timings.Sunrise} AM`;
    duhurTime.innerText = get12TIme(timings.Dhuhr);
    asrTime.innerText = get12TIme(timings.Asr);
    maghribTime.innerText = get12TIme(timings.Maghrib);
    ishaTime.innerText = get12TIme(timings.Isha);
  }
}
async function getTime(values) {
  if (values) {
    Object.entries(values).forEach((value) => {
      URLS.praysTime.searchParams.set(value[0], value[1]);
    });
    const timeValues = await fetchURL(URLS.praysTime);
    updateTime(timeValues.data.timings);
  }
}
function loadCountries(cities) {
  const optiHolder = document.getElementById("country");
  cities.forEach((citiy, country) => {
    const opt = document.createElement("option");
    opt.value = country;
    opt.innerText = country;
    optiHolder.appendChild(opt);
  });
  optiHolder.addEventListener("change", (e) => {
    const citiesHolder = document.getElementById("city");
    for (const citiy of cities.get(e.target.value)) {
      const opt = document.createElement("option");
      opt.value = citiy;
      opt.innerText = citiy;
      citiesHolder.appendChild(opt);
    }
  });
}
function loadMethods(allMethods) {
  const methodHolder = document.getElementById("method");
  Object.values(allMethods).forEach((e) => {
    if (!e.name) {
      return;
    }
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.innerText = e.name;
    methodHolder.appendChild(opt);
  });
}
function saveChanges() {
  const saveBtn = document.getElementById("save-changes");
  const methodHolder = document.getElementById("method");
  const countryHolder = document.getElementById("country");
  const citiesHolder = document.getElementById("city");
  saveBtn.onclick = () => {
    const methodSelected = Array.from(methodHolder.selectedOptions).map(
      (e) => e.value
    );
    const countrySelected = Array.from(countryHolder.selectedOptions).map(
      (e) => e.value
    );
    const citySelected = Array.from(citiesHolder.selectedOptions).map((e) => {
      if (e.value === "0") {
        return 0;
      }
      return e.value;
    });
    if (methodSelected[0] && countrySelected[0] && citySelected[0]) {
      methodHolder.classList.remove("is-invalid");
      countryHolder.classList.remove("is-invalid");
      citiesHolder.classList.remove("is-invalid");
      document.getElementById("close-btn").click();
      getTime({
        method: methodSelected[0],
        country: countrySelected[0],
        city: citySelected[0],
      });
      localStorage.setItem(
        "searchQuery",
        JSON.stringify({
          method: methodSelected[0],
          country: countrySelected[0],
          city: citySelected[0],
        })
      );
    } else {
      methodHolder.classList.add("is-invalid");
      countryHolder.classList.add("is-invalid");
      citiesHolder.classList.add("is-invalid");
    }
  };
}
(async () => {
  try {
    const searchQuery = JSON.parse(localStorage.getItem("searchQuery"));
    if (searchQuery) {
      await getTime(searchQuery);
    }
    const allCountries = (await fetchURL(URLS.countries)).data;
    const allMethods = (await fetchURL(URLS.methods)).data;
    const cities = new Map();
    allCountries.forEach((element) => {
      cities.set(element.country, element.cities);
    });

    loadCountries(cities);
    loadMethods(allMethods);
    if (searchQuery) {
      const { method, country, city } = searchQuery;
      document.getElementById("method").value = method;
      document.getElementById("country").value = country;

      // Populate the city dropdown after setting the country
      const citiesHolder = document.getElementById("city");
      cities.get(country).forEach((cityName) => {
        const opt = document.createElement("option");
        opt.value = cityName;
        opt.innerText = cityName;
        citiesHolder.appendChild(opt);
      });

      document.getElementById("city").value = city;
    }
    saveChanges();
  } catch (error) {
    console.log(error);
  }
})();
