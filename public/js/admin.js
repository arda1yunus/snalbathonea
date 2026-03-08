async function loadAdminArticles() {
    try {
        const res = await fetch("/api/articles");
        const articles = await res.json();
        const container = document.getElementById("adminArticles");

        if (!container) return;

        if (articles.length === 0) {
            container.innerHTML = "<p>Henüz makale eklenmemiş.</p>";
            return;
        }

        container.innerHTML = articles.map(article => `
            <div class="article-item">
                <div>
                    <strong>${article.title}</strong><br>
                    <small style="color: #666;">Yazar: ${article.author || 'Belirtilmemiş'}</small>
                </div>
                <div>
                    <a href="/articles/${article._id}" target="_blank" style="margin-right: 15px; color: #007bff; text-decoration: none;">👁️ Oku</a>
                    
                    <a href="/edit-article.html?id=${article._id}" style="margin-right: 15px; color: #28a745; text-decoration: none; font-weight: bold;">✏️ Düzenle</a>
                    
                    <button onclick="deleteArticle('${article._id}')" style="background: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Sil <ion-icon name="trash-outline"></ion-icon></button>
                </div>
            </div>
        `).join("");
    } catch (err) {
        console.error("Yükleme hatası:", err);
    }
}
async function deleteArticle(id) {
    if (confirm("Silmek istediğine emin misin?")) {
        const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
        if (res.ok) loadAdminArticles();
    }
}

// Sayfa açıldığında makaleleri getir
loadAdminArticles();