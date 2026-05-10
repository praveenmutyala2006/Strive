// Button Click Logic

function buttonColor(btn) {
    const buttons = document.getElementsByClassName("rating-btn");
    
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].style.background = "";
        buttons[i].style.color = "";
        buttons[i].style.borderColor = "";
    }
    btn.style.background = "var(--amber)";
    btn.style.color = "var(--bg)";
    btn.style.borderColor = "var(--amber)";
}


