window.API_BASE = "http://127.0.0.1:8000/api/v1";

window.checkServerStatus = async function(dotId = "server-status-dot", textId = "server-status-text") {
  const dot = document.getElementById(dotId);
  const text = document.getElementById(textId);
  if (!dot || !text) return;

  try {
    const res = await fetch("http://127.0.0.1:8000/");
    if (res.ok) {
      dot.className = "h-2 w-2 rounded-full bg-emerald-500 mr-2";
      text.textContent = "Online";
      text.className = "text-[10px] font-bold text-emerald-600 uppercase tracking-wider";
    } else {
      throw new Error();
    }
  } catch (e) {
    dot.className = "h-2 w-2 rounded-full bg-rose-500 mr-2";
    text.textContent = "Offline";
    text.className = "text-[10px] font-bold text-rose-600 uppercase tracking-wider";
  }
};
