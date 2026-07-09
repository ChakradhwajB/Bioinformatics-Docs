// Dynamically select the best active backend API
let localOnline = false;
try {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", "http://127.0.0.1:8000/", false);
  xhr.send(null);
  if (xhr.status >= 200 && xhr.status < 400) {
    localOnline = true;
  }
} catch (e) {
  localOnline = false;
}

window.API_BASE = localOnline
  ? "http://127.0.0.1:8000/api/v1"
  : "https://bioinformatics-library.onrender.com/api/v1";

window.checkServerStatus = async function (
  dotId = "server-status-dot",
  textId = "server-status-text",
) {
  const dot = document.getElementById(dotId);
  const text = document.getElementById(textId);
  if (!dot || !text) return;

  // Ping the active root endpoint (local or Render)
  const rootUrl = window.API_BASE.replace("/api/v1", "");
  try {
    const res = await fetch(rootUrl + "/");
    if (res.ok) {
      dot.className = "h-2 w-2 rounded-full bg-emerald-500 mr-2";
      text.textContent = "Online";
      text.className =
        "text-[10px] font-bold text-emerald-600 uppercase tracking-wider";
    } else {
      throw new Error();
    }
  } catch (e) {
    dot.className = "h-2 w-2 rounded-full bg-rose-500 mr-2";
    text.textContent = "Offline";
    text.className =
      "text-[10px] font-bold text-rose-600 uppercase tracking-wider";
  }
};
