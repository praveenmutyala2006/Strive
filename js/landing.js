window.addEventListener("load", () => {
    const intro = document.getElementById("intro");
    const main = document.getElementById("main-content");
    const agent = document.querySelector(".momentum-agent");
    const wordSet = document.querySelector(".word-set");
    const wordStrive = document.querySelector(".word-strive");
    const wordSoar = document.querySelector(".word-soar");

    // Animation Logic
    setTimeout(() => wordSet.style.opacity = 0.8, 500);
    setTimeout(() => wordStrive.style.opacity = 0.8, 1000);
    setTimeout(() => wordSoar.style.opacity = 0.8, 1500);
    setTimeout(() => {
        wordSet.classList.add('fade-out');
        wordSoar.classList.add('fade-out');
        wordStrive.classList.add('hero');
    }, 5500);

    // Transition to main content
    setTimeout(() => {
      intro.style.opacity = "0";
      intro.style.pointerEvents = "none";
      setTimeout(() => {
          intro.style.display = "none";
          if (main) {
            main.style.display = "flex";
            requestAnimationFrame(() => main.classList.add("show"));
          }
      }, 600); 
    }, 8200); 
  });

const toggle = document.getElementById("togglePassword");
const passwordInput = document.getElementById("password");

toggle.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  toggle.textContent = isHidden ? "Hide" : "Show";
});

// Form Validation Logic
passwordInput.addEventListener("input", () => {
  const error = document.getElementById("error");
  if (passwordInput.value.length === 0) {
    error.textContent = "";
  } 
  else if (!passwordInput.validity.valid) {
    error.textContent = "Must contain atleast 7 chars with atleast 2 special characters.";
  } 
  else {
    error.textContent = "";
  }
});

function handleLogin() {
  const password = document.getElementById("password");
  const error = document.getElementById("error");

  if (!password.validity.valid) {
    error.textContent = "Must contain atleast 7 chars with atleast 2 special characters.";
    return;
  }

  error.textContent = "";
  localStorage.setItem("displayName", document.getElementById("username_input").value.trim());
  localStorage.setItem("email", document.getElementById("email").value.trim());
  goTo("dashboard.html");
}