const BASE_URL = "https://api.harvardartmuseums.org";
const KEY = "apikey=64e1e567-7663-4d68-bb27-f92e4b35775f"; // USE YOUR KEY HERE

async function fetchObjects() {
  const url = `${BASE_URL}/object?${KEY}`;
  onFetchStart();
  try {
    const response = await fetch(url);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
}

// fetchObjects().then((x) => console.log(x));

async function fetchAllCenturies() {
  const url = `${BASE_URL}/century?${KEY}&size=100&sort=temporalorder`;

  if (localStorage.getItem("centuries")) {
    return JSON.parse(localStorage.getItem("centuries"));
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    const records = data.records;

    localStorage.setItem("centuries", JSON.stringify(records));

    return records;
  } catch (error) {
    console.error(error);
  }
}

async function fetchAllClassifications() {
  const url = `${BASE_URL}/classification?${KEY}&size=100&sort=name`;
  if (localStorage.getItem("classifications")) {
    return JSON.parse(localStorage.getItem("classifications"));
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    const records = data.records;

    localStorage.setItem("classifications", JSON.stringify(records));

    return records;
  } catch (error) {
    console.error(error);
  }
}

async function prefetchCategoryLists() {
  try {
    const [classifications, centuries] = await Promise.all([
      fetchAllClassifications(),
      fetchAllCenturies(),
    ]);

    // This provides a clue to the user, that there are items in the dropdown
    $(".classification-count").text(`(${classifications.length})`);

    classifications.forEach((classification) => {
      // append a correctly formatted option tag into
      // the element with id select-classification

      $("#select-classification").append(
        `<option value="${classification.name}"> ${classification.name} </option>`
      );
    });

    // This provides a clue to the user, that there are items in the dropdown
    $(".century-count").text(`(${centuries.length}))`);

    centuries.forEach((century) => {
      // append a correctly formatted option tag into
      // the element with id select-century

      $("#select-century").append(
        `<option value="${century.name}">${century.name}</option>`
      );
    });
  } catch (error) {
    console.error(error);
  }
}

function buildSearchString() {
  let classification = $("#select-classification").val();
  let century = $("#select-century").val();
  let keyword = $("#keywords").val();

  return `${BASE_URL}/object?${KEY}&classification=${classification}&century=${century}&keyword=${keyword}`;
}

$("#search").on("submit", async function (event) {
  // prevent the default
  event.preventDefault();

  try {
    // get the url from `buildSearchString`
    let url = buildSearchString();

    const encodedUrl = encodeURI(url);

    // fetch it with await, store the result
    const response = await fetch(encodedUrl);
    const data = await response.json();
    // log out both info and records when you get them
  } catch (error) {
    // log out the error
    console.error(error);
  }
});

function onFetchStart() {
  $("#loading").addClass("active");
}

function onFetchEnd() {
  $("#loading").removeClass("active");
}

// Module 2

prefetchCategoryLists();
