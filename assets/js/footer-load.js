document.addEventListener("click", function (e) {
    if (e.target.matches(".social-icons a")) {
        const url = e.target.getAttribute("href");
        if (url && url !== "#") {
            window.open(url, "_blank");
        }
    }
});