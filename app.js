const BASE_URL = "https://api.harvardartmuseums.org";
const KEY = "apikey=64e1e567-7663-4d68-bb27-f92e4b35775f"; // USE YOUR KEY HERE

async function fetchObjects() {
  const url = `${BASE_URL}/object?${KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  }
}

fetchObjects().then((x) => console.log(x));

async function fetchAllCenturies() {
  const url = `${BASE_URL}/century?${KEY}&size=100&sort=temporalorder`;

  if (localStorage.getItem("centuries")) {
    return JSON.parse(localStorage.getItem("centuries"));
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    const records = data.records;

    records.centuries = localStorage; // don't think this worked

    return records;
  } catch (error) {
    console.error(error);
  }
}

async function fetchAllClassifications() {
  const url = `${BASE_URL}/classification?${KEY}&size=100&sort=name`;
  if (localStorage.getItem("classification")) {
    return JSON.parse(localStorage.getItem("classification"));
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    const records = data.records;

    records.classification = localStorage; // don't think this worked

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
  } catch (error) {
    console.error(error);
  }
}

// This provides a clue to the user, that there are items in the dropdown
$(".classification-count").text(`(${classifications.length})`);

classifications.forEach((classification) => {
  // append a correctly formatted option tag into
  // the element with id select-classification

  $("#select-classification").append(
    <option value="value text">${classification.name}</option>
  );
});

// This provides a clue to the user, that there are items in the dropdown
$(".century-count").text(`(${centuries.length}))`);

centuries.forEach((century) => {
  // append a correctly formatted option tag into
  // the element with id select-century

  $("#select-century").append(
    <option value="value text">${century.name}</option>
  );
});
