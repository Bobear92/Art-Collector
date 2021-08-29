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
prefetchCategoryLists();

function buildSearchString() {
  let classification = $("#select-classification").val();
  let century = $("#select-century").val();
  let keyword = $("#keywords").val();

  return `${BASE_URL}/object?${KEY}&classification=${classification}&century=${century}&keyword=${keyword}`;
}

$("#search").on("submit", async function (event) {
  // prevent the default
  event.preventDefault();
  onFetchStart();

  try {
    // get the url from `buildSearchString`
    let url = buildSearchString();

    const encodedUrl = encodeURI(url);

    // fetch it with await, store the result
    const response = await fetch(encodedUrl);
    const { info, records } = await response.json();
    // log out both info and records when you get them
    updatePreview(info, records);
  } catch (error) {
    // log out the error
    console.error(error);
  } finally {
    onFetchEnd();
  }
});

function onFetchStart() {
  $("#loading").addClass("active");
}

function onFetchEnd() {
  $("#loading").removeClass("active");
}

// Module 2

function renderPreview(record) {
  const { description, title, primaryimageurl } = record;

  const myImage = primaryimageurl ? primaryimageurl : "";
  let element = $(`<div class="object-preview">
    <a href="#">
    <img src="${myImage}" alt="Image not available" />
      <h3>${title ? title : ""}</h3>
      <h3>${description ? description : ""}</h3>
    </a>
  </div>`).data("record", record);
  return element;
}

function updatePreview(info, records) {
  const root = $("#preview");

  const results = root.find(".results");
  results.empty();

  if (info.next) {
    $(".next").data("url", info.next);
    $(".next").prop("disabled", false);
  } else {
    $(".next").data("url", null);
    $(".next").prop("disabled", true);
  }
  if (info.prev) {
    $(".previous").data("url", info.prev);
    $(".previous").prop("disabled", false);
  } else {
    $(".previous").data("url", null);
    $(".previous").prop("disabled", true);
  }

  records.forEach((element) => {
    results.append(renderPreview(element));
  });
}

$("#preview .next, #preview .previous").on("click", async function () {
  onFetchStart();
  try {
    let newUrl = $(this).data("url");
    const response = await fetch(newUrl);
    const { info, records } = await response.json();
    updatePreview(info, records);
  } catch (error) {
    console.error(error);
  } finally {
    onFetchEnd();
  }
});

// module 3

$("#preview").on("click", ".object-preview", function (event) {
  event.preventDefault(); // they're anchor tags, so don't follow the link
  // find the '.object-preview' element by using .closest() from the target

  const object = $(this).closest(".object-preview");

  // recover the record from the element using the .data('record') we attached

  const record = object.data("record");

  $("#feature").html(renderFeature(record));

  // log out the record object to see the shape of the data
});

function renderFeature(record) {
  /**
   * We need to read, from record, the following:
   * HEADER: title, dated
   * FACTS: description, culture, style, technique, medium, dimensions, people, department, division, contact, creditline
   * PHOTOS: images, primaryimageurl
   */

  // build and return template

  const {
    description,
    culture,
    style,
    technique,
    medium,
    dimensions,
    people,
    department,
    division,
    contact,
    creditline,
    images,
    primaryimageurl,
  } = record;

  return $(`<div class="object-feature">
  <header>
    <h3>${record.title}</h3>
    <h4>${record.dated}</h4>
  </header>
  <section class="facts">
  ${factHTML("Description", description)}
  ${factHTML("Culture", culture)}
  ${factHTML("Style", style)}
  ${factHTML("Technique", technique)}
  ${factHTML("Medium", medium)}
  ${factHTML("Dimensions", dimensions)}
  ${
    people
      ? people
          .map(function (person) {
            return factHTML("Person", person.displayname);
          })
          .join("")
      : ""
  }
  ${factHTML("Department", department)}
  ${factHTML("Division", division)}
  ${factHTML(
    "Contact",
    `<a target="_blank" href="mailto:${contact}">${contact}</a>`
  )}
  ${factHTML("Credit", creditline)}

  </section>

  <section class="photos">
  ${photosHTML(images, primaryimageurl)}
    
  </section>
</div>`);
}

function searchURL(searchType, searchString) {
  return `${BASE_URL}/object?${KEY}&${searchType}=${searchString}`;
}

function factHTML(title, content, searchTerm = null) {
  if (!content) {
    // if content is empty or undefined, return an empty string ''
    return "";
  } else if (!searchTerm) {
    // otherwise, if there is no searchTerm, return the two spans
    return `<span class="title">${title}</span>
    <span class="content">${content}</span>`;
  } else {
    // otherwise, return the two spans, with the content wrapped in an anchor tag
    return `<span class="title">${title}</span>
    <span class="content"><a href="WELL_FORMED_URL">${searchURL(
      searchTerm,
      content
    )}</a></span>`;
  }
}

function photosHTML(images, primaryimageurl) {
  if (images && images.length > 0) {
    // if images is defined AND images.length > 0, map the images to the correct image tags, then join them into a single string.  the images have a property called baseimageurl, use that as the value for src

    const imgArray = images.map(function (image) {
      return `<img src="${image.baseimageurl}" />`;
    });
    return imgArray.join();
  } else if (primaryimageurl) {
    // else if primaryimageurl is defined, return a single image tag with that as value for src

    return `<img src="${primaryimageurl}" />`;
  } else {
    // else we have nothing, so return the empty string
    return "";
  }
}

$("#feature").on("click", "a", async function (event) {
  // read href off of $(this) with the .attr() method

  let value = $(this).attr();

  if (href.startsWith("mailto")) {
    return;
  }
  // prevent default
  event.preventDefault();
  // call onFetchStart
  onFetchStart();
  // fetch the href
  try {
    const response = await fetch(value);
    const { info, records } = await response.json();
    // render it into the preview

    updatePreview(info, records);

    console.log(data);
  } catch (error) {
    console.error(error);
  } finally {
    // call onFetchEnd
    onFetchEnd();
  }
});
