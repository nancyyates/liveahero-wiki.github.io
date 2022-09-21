function sortList(list, column, btn) {
  const oldOrder = parseInt(btn.dataset.order || '-1', 10);
  const newOrder = 0 - oldOrder;
  btn.dataset.order = newOrder;

  const array = [];
  for (const item of list.children) {
    const value = column == "name" ? item.dataset.name : parseInt(item.dataset[column], 10);
    array.push({ value: value, element: item });
  }
  array.sort((lhs, rhs) => {
    return lhs.value > rhs.value ? newOrder : lhs.value < rhs.value ? oldOrder : 0;
  });

  for (const x of array) {
    list.appendChild(x.element);
  }
}
document.querySelectorAll(".chara-sort").forEach(ele => {
  const list = document.querySelector(ele.dataset.list);
  for (const btn of ele.children) {
    btn.addEventListener("click", () => sortList(list, btn.dataset.sort, btn));
  }
  ele.addEventListener("click", (e) => {
    for (const btn of ele.children) {
      if (e.target.dataset.sort !== btn.dataset.sort) btn.dataset.order = "-1";
    }
  });
});

// Format: #collection/h:<compressed_ids>/s:<compressed_ids>
// compressed_ids is computed by taking difference of array[i]-array[i-1] for i>1, converted to base32, then joined by ','

let collectionMode = false;
const collectionBtn = document.querySelector("#collection-btn");
const hasUnit = "has-unit";
const heroList = document.querySelector("#hero-list");
const sidekickList = document.querySelector("#sidekick-list");
const base = 32;

function parseCollectionHash(hash) {
  const comp = hash.split("/");
  if (comp.length < 2) return;

  let heroes = null, sidekicks = null;

  for (let i = 1; i < comp.length; i++) {
    const comp2 = comp[i].split(":");
    const prefix = comp2[0];
    const ids = comp2[1].split(",").map(s => parseInt(s, base));
    const stringIds = decompressIds(ids).map(i => i.toString());
    if (prefix == "h") {
      heroes = new Set(stringIds);
    } else {
      sidekicks = new Set(stringIds);
    }
  }

  highlightUnit(heroList, heroes);
  highlightUnit(sidekickList, sidekicks);
}

function compressIds(input) {
  if (input.length <= 1) return input;

  let prev = input[0];
  for (let i = 1; i < input.length; i++) {
    const now = input[i];
    input[i] = now - prev;
    prev = now;
  }
  return input
}

function decompressIds(input) {
  for (let i = 1; i < input.length; i++) {
    input[i] += input[i - 1];
  }
  return input
}

function highlightUnit(list, unitSet) {
  for (const unit of list.children) {
    if (unitSet.has(unit.dataset.id)) {
      unit.classList.add(hasUnit);
    } else {
      unit.classList.remove(hasUnit);
    }
  }
}

function calculateHash(list) {
  let array = [];
  for (const unit of list.children) {
    if (unit.classList.contains(hasUnit)) {
      array.push(parseInt(unit.dataset.id, 10));
    }
  }
  return compressIds(array).map(i => i.toString(base)).join(",")
}

function onClick(e) {
  if (!collectionMode) return;

  e.currentTarget.classList.toggle(hasUnit);
  location.hash = `#collection/h:${calculateHash(heroList)}/s:${calculateHash(sidekickList)}`
}

collectionBtn.addEventListener("click", function (e) {
  if (!collectionMode) {
    location.hash = "#collection";
  }
  enableCollectionMode()
}, false);

function enableCollectionMode() {
  collectionMode = true;
  collectionBtn.disabled = true;
  collectionBtn.textContent = "Collection Mode: Click on character icon to mark them"
}

function onLoad() {
  const hash = window.location.hash;
  if (hash.startsWith("#collection")) {
    enableCollectionMode();
    try {
      parseCollectionHash(hash);
    } catch (e) {
      console.log(e);
      alert("Collection url is invalid");
    }
  }
  for (const unit of heroList.children) {
    unit.addEventListener("click", onClick, false);
  }
  for (const unit of sidekickList.children) {
    unit.addEventListener("click", onClick, false);
  }
}
onLoad();