(() => {
  "use strict";
  const form = document.getElementById("feedback-form");
  const ratingButtons = [...document.querySelectorAll(".rating")];
  const ratingError = document.getElementById("rating-error");
  const message = document.getElementById("message");
  const count = document.getElementById("char-count");
  const hint = document.getElementById("message-hint");
  const email = document.getElementById("email");
  const consent = document.getElementById("contact-consent");
  const status = document.getElementById("form-status");
  const toast = document.getElementById("toast");
  let selectedRating = 0;
  let toastTimer;

  document.getElementById("year").textContent = new Date().getFullYear();

  function notify(text) {
    toast.textContent = text;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function setRating(value) {
    selectedRating = Number(value);
    ratingButtons.forEach(button => {
      button.setAttribute("aria-pressed", String(Number(button.dataset.rating) === selectedRating));
    });
    ratingError.textContent = "";
  }

  ratingButtons.forEach((button, index) => {
    button.addEventListener("click", () => setRating(button.dataset.rating));
    button.addEventListener("keydown", event => {
      if (!["ArrowRight", "ArrowLeft"].includes(event.key)) return;
      event.preventDefault();
      const delta = event.key === "ArrowRight" ? 1 : -1;
      const next = (index + delta + ratingButtons.length) % ratingButtons.length;
      ratingButtons[next].focus();
      setRating(ratingButtons[next].dataset.rating);
    });
  });

  message.addEventListener("input", () => {
    count.textContent = String(message.value.length);
    hint.textContent = message.value.trim().length >= 5
      ? "Thanks for sharing your thoughts."
      : "Please share at least 5 characters.";
    hint.style.color = message.value.trim().length >= 5 ? "var(--success)" : "";
  });

  consent.addEventListener("change", () => {
    if (consent.checked && !email.value.trim()) {
      notify("Add your email if you would like us to contact you.");
      email.focus();
    }
  });
  email.addEventListener("input", () => {
    email.setCustomValidity("");
    if (!email.value.trim()) consent.checked = false;
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    status.textContent = "";

    if (!selectedRating) {
      ratingError.textContent = "Please choose a rating before submitting.";
      ratingButtons[0].focus();
      notify("Choose an experience rating first.");
      return;
    }
    if (message.value.trim().length < 5) {
      message.setCustomValidity("Please enter at least 5 characters.");
      message.reportValidity();
      message.focus();
      return;
    }
    message.setCustomValidity("");

    if (email.value.trim() && !email.checkValidity()) {
      email.reportValidity();
      email.focus();
      return;
    }
    if (consent.checked && !email.value.trim()) {
      email.setCustomValidity("Enter an email address or uncheck contact permission.");
      email.reportValidity();
      email.focus();
      return;
    }

    const entry = {
      rating: selectedRating,
      category: document.getElementById("category").value,
      message: message.value.trim(),
      email: email.value.trim() || null,
      contactConsent: consent.checked,
      submittedAt: new Date().toISOString()
    };

    // Demo only: submissions are stored locally on this browser/device.
    try {
      const key = "aura-feedback-submissions";
      const saved = JSON.parse(localStorage.getItem(key) || "[]");
      if (!Array.isArray(saved)) throw new Error("Unexpected saved data");
      saved.push(entry);
      localStorage.setItem(key, JSON.stringify(saved));
      status.textContent = "Thank you! Your feedback has been saved in this browser.";
    } catch (error) {
      console.warn("Local storage is unavailable.", error);
      status.textContent = "Thank you! Your feedback was submitted in this demo, but could not be saved on this device.";
    }

    notify("Thanks for helping Aura improve!");
    form.reset();
    setRating(0);
    count.textContent = "0";
    hint.textContent = "Please share at least 5 characters.";
    hint.style.color = "";
  });
})();
