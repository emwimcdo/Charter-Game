window.addEventListener("keydown", function(e) {
  const arrows = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
  if (arrows.includes(e.key)) {
    e.preventDefault();
  }
})

const params = new URLSearchParams(window.location.search)

let accountButton = document.getElementById("profilePic")
let dropdownOption = document.querySelectorAll(".dropdownOption")
let dropdownBtn = document.querySelector(".dropdownBtn")
let menu = document.querySelector(".dropdownMenu")
let logBtn = document.querySelector('[data-value="login"]')
let signBtn = document.querySelector('[data-value="signup"]')
/*
accountButton.addEventListener("click", (e) => {
  e.preventDefault()
})
*/
dropdownBtn.addEventListener("click", () => {
  const isClosed = menu.dataset.value === "closed"
  dropdownOption.forEach((e) => {
    e.style.display = isClosed ? "block":"none"
  })
  menu.dataset.value = isClosed ? "open":"closed"
})

logBtn.addEventListener("click", () => {
  window.location.href = "account.html?mode=login"
})

signBtn.addEventListener("click", () => {
  window.location.href = "account.html?mode=signup"
})

document.addEventListener("DOMContentLoaded", () => {
  if (params.get("mode") === "signup") {
    const el = document.querySelector('[data-type="signup"]')
    if (el) el.classList.remove("invis")
  }
  else if (params.get("mode") === "login") {
    const el = document.querySelector('[data-type="login"]')
    if (el) el.classList.remove("invis")
  }
})