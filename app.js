const BASE_URL = "https://2024-03-06.currency-api.pages.dev/v1/currencies";

const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("form button");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const msg = document.querySelector(".msg");
const clearBtn = document.getElementById("clearBtn");
const loadingOverlay = document.getElementById("loading");
const modal = document.getElementById("modal");
const modalClose = document.getElementById("modalClose");

// Populate dropdowns
for (let select of dropdowns) {
  for (let currCode in countryList) {
    let newOption = document.createElement("option");
    newOption.innerText = currCode;
    newOption.value = currCode;

    if (select.name === "from" && currCode === "USD") {
      newOption.selected = "selected";
    } else if (select.name === "to" && currCode === "PKR") {
      newOption.selected = "selected";
    }

    select.append(newOption);
  }

  select.addEventListener("change", (evt) => {
    updateFlag(evt.target);
  });
}

// Update exchange rate
const updateExchangeRate = async () => {
  let showLoadingTimeout;

  try {
    let amount = document.querySelector(".amount input");
    let amtVal = parseFloat(amount.value);

    // ✅ Validation: minimum value check
    if (!amtVal || amtVal < 1) {
      showModal("🚫 Minimum value 1 rakhni hai. Please enter a valid amount.");
      return; // stop execution
    }

    // Delay overlay by 300ms (only shows if fetch takes longer)
    showLoadingTimeout = setTimeout(() => {
      loadingOverlay.style.display = "flex";
    }, 300);

    const URL = `${BASE_URL}/${fromCurr.value.toLowerCase()}.json`;
    let response = await fetch(URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let data = await response.json();
    let rate = data[fromCurr.value.toLowerCase()][toCurr.value.toLowerCase()];
    if (!rate) {
      throw new Error("Currency rate not found in API response");
    }

    let finalAmount = (amtVal * rate).toFixed(2);
    msg.innerText = `${amtVal} ${fromCurr.value} = ${finalAmount} ${toCurr.value}`;
  } catch (err) {
    msg.innerText = "Error fetching exchange rate. Please try again.";
  } finally {
    clearTimeout(showLoadingTimeout); // cancel timeout if fetch is fast
    loadingOverlay.style.display = "none"; // hide overlay
  }
};

// Update flag
const updateFlag = (element) => {
  let currCode = element.value;
  let countryCode = countryList[currCode];
  let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
  let img = element.parentElement.querySelector("img");
  img.src = newSrc;
};

// Show modal
const showModal = (text) => {
  modal.querySelector("p").innerText = text;
  modal.style.display = "flex";
};

// Close modal
modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});

// Get Exchange Rate button
btn.addEventListener("click", (evt) => {
  evt.preventDefault();
  updateExchangeRate();
});

// Clear button
clearBtn.addEventListener("click", () => {
  const amount = document.querySelector(".amount input");
  amount.value = "1";

  fromCurr.value = "USD";
  toCurr.value = "PKR";
  updateFlag(fromCurr);
  updateFlag(toCurr);

  msg.innerText = "Refreshing...";
  updateExchangeRate();
});

// Auto fetch on page load
window.addEventListener("load", () => {
  updateExchangeRate();
});
