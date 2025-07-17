/**
 * Toggles the menu items in the ScheduleTable.
 *
 * Adapted from code at the Intro to Rust StuCo website, Spring 2025.
 * Source: https://github.com/rust-stuco/rust-stuco.github.io/blob/main/assets/js/navbar.js
 *
 * Imported in the BaseLayout template page.
 *
 * For reference, see `src/components/ScheduleTable.tsx`.
 */

/* button to toggle all rows */
const buttonToggleAll = document.getElementById("toggleAllButton")!;
const toggleDivs = document.querySelectorAll("[id^=toggleDiv]");
buttonToggleAll.addEventListener("click", () => {
  if (
    buttonToggleAll.textContent &&
    buttonToggleAll.textContent === "show all ▼"
  ) {
    buttonToggleAll.textContent = "hide all ▲";
    toggleDivs.forEach((div) => {
      div.style.display = "inline";
    });
  } else {
    buttonToggleAll.textContent = "show all ▼";
    toggleDivs.forEach((div) => {
      div.style.display = "none";
    });
  }
});

/* make each row togglable */
document.querySelectorAll('a[id^="toggleButton"]').forEach((button) => {
  const idNumber = button.id.replace("toggleButton", "");
  const correspondingDiv = document.getElementById(`toggleDiv${idNumber}`);

  if (!correspondingDiv) {
    console.error(
      `clicked <button id='${button.id}' but <div id='toggleDiv${idNumber}'> doesn\'t exist`
    );
    return;
  }

  button.addEventListener("click", () => {
    /* toggle visibility */
    const display = correspondingDiv.style.display;
    correspondingDiv.style.display = display === "none" ? "block" : "none";

    /* toggle button symbol */
    if (button.textContent && button.textContent.includes("▲")) {
      button.textContent = "Details ▼";
    } else {
      button.textContent = "Details ▲";
    }
  });
});
