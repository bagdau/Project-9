// Получение post_id из URL
function getPostId() {
  const path = window.location.pathname;
  const match = path.match(/\/p\/([^\/]+)/);  // Убрал экранирование — иначе regexp не работает!
  return match ? match[1] : "unknown_post";
}

// Функция обработки нового комментария
function handleNewComment(el) {
  const comment = el.querySelector('span')?.textContent || "";
  const author = el.querySelector('h3')?.textContent || "Неизвестный";
  const post_id = getPostId();

  if (comment.trim()) {
    fetch("http://127.0.0.1:8010/upload_comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comments: [{ comment, author, post_id }] })
    })
    .then(res => res.json())
    .then(data => console.log("📥 Добавлен коммент:", data))
    .catch(console.error);
  }
}

// Обработка запроса из popup.js на загрузку всех текущих комментариев
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "upload_comments_to_excel") {
    const post_id = getPostId();
    const comments = Array.from(document.querySelectorAll('ul > li')).map(el => {
      const comment = el.querySelector('span')?.textContent || "";
      const author = el.querySelector('h3')?.textContent || "Неизвестный";
      return { comment, author, post_id };
    });

    fetch("http://127.0.0.1:8010/upload_comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comments })
    })
    .then(res => res.json())
    .then(data => console.log("✅ Отправлено в Excel:", data))
    .catch(console.error);
  }
});

// Реакция на загрузку новых комментариев
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1 && node.querySelector("span")) {
        handleNewComment(node);
      }
    });
  });
});

observer.observe(document.body, { childList: true, subtree: true });
