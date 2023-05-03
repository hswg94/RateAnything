const fileInput = document.querySelector("#formFileMultiple");
const maxSize = 10 * 1024 * 1024; // 1MB in bytes
const invalidSize = document.querySelector("#invalid-size");
invalidSize.style.display = "none";
fileInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file && file.size > maxSize) {
    this.value = null;
    invalidSize.style.display = "block";
  } else {
    invalidSize.style.display = "none";
  }
});