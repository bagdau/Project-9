
document.getElementById("upload-comments").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { action: "upload_comments_to_excel" });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const SERVER_URL = "http://127.0.0.1:8010";

  async function pingServer() {
    try {
      const res = await fetch(`${SERVER_URL}/ping`);
      if (res.ok) {
        document.getElementById("apiStatus").textContent = "🟢 Сервер работает";
      } else {
        throw new Error();
      }
    } catch {
      document.getElementById("apiStatus").textContent = "🔴 Сервер не отвечает";
    }
  }

  pingServer();

  document.getElementById("send").addEventListener("click", async () => {
    const author = document.getElementById("author").value;
    const postId = document.getElementById("postId").value;
    const comment = document.getElementById("comment").value;

    const response = await fetch(`${SERVER_URL}/webhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, post_id: postId, comment })
    });

    const result = await response.json();
    document.getElementById("status").textContent =
      result.status === "saved" ? "✅ Отправлено!" : "❌ Ошибка";
  });

  document.getElementById("load").addEventListener("click", async () => {
    const response = await fetch(`${SERVER_URL}/comments`);
    const comments = await response.json();
    const output = comments
      .map((c) => `<b>${c.author || "anon"}:</b> ${c.comment}`)
      .join("<br>");
    document.getElementById("comments").innerHTML =
      output || "Нет комментариев.";
  });

  document.getElementById("startReading").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "startReading" });
    document.getElementById("loadingIcon").style.display = "block";
    setTimeout(() => {
      document.getElementById("loadingIcon").style.display = "none";
      alert("✅ Чтение завершено!");
    }, 3000);
  });
});