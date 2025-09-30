// src/utils/scrollToHash.js
export const scrollToHash = (hash) => {
  if (!hash) return;

  const id = hash.replace("#", "");
  const element = document.getElementById(id);

  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};
