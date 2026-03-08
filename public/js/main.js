window.addEventListener("DOMContentLoaded", function () {
    const el = document.getElementById("typing-text");
    const text = '"Hiçbir şey düşünceden daha hızlı değildir, çünkü o bütün evreni dolaşır...  -Thales';
    let i = 0;

    function type() {
        if (el && i < text.length) {
            el.textContent += text[i];
            i++;
            setTimeout(type, 70);
        }
    }
    type();

    // Resim listesini API'den çek ve DOM'a ekle
    async function loadImages() {
        try {
            const res = await fetch('/api/images');
            if (!res.ok) throw new Error('Resimler yüklenemedi');
            
            const images = await res.json();
            if (images.length === 0) {
                console.warn('Hiçbir resim bulunamadı');
                return;
            }

            // 4 sütuna dağıt - her sütuna tüm resimleri 3 kez ekle
            const lists = document.querySelectorAll('.img-list');
            
            lists.forEach((list, columnIndex) => {
                // Her sütuna tüm resimleri 3 kez ekle (animasyon için yeterli)
                for (let repeat = 0; repeat < 3; repeat++) {
                    images.forEach(imageSrc => {
                        const img = document.createElement('img');
                        img.src = imageSrc;
                        list.appendChild(img);
                    });
                }
            });

            // Resimler yüklendikten sonra shuffleImages'i çağır
            shuffleImages();
        } catch (err) {
            console.error('Resim yükleme hatası:', err);
        }
    }

    loadImages();

    // Hero içindeki resimlerin sıralamasını karıştır
    function shuffleImages() {
        const lists = document.querySelectorAll('.bg-catalog .img-list');
        lists.forEach(list => {
            const imgs = Array.from(list.querySelectorAll('img'));
            for (let i = imgs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                list.appendChild(imgs[j]);
                imgs.splice(j, 1);
            }
        });
    }
    
    // Hakkımızda bölümü için scroll ile görünürlük efektini uygula
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                el.classList.add('show');
            }
        });
    }

    window.addEventListener('scroll', revealOnScroll);
    // Sayfa yüklenince kontrol et, böylece eğer üst kısımdaysa da görünür olur
    revealOnScroll();

    // Son 3 duyuruyu al ve DOM'a ekle
    async function loadAnnouncements(){
        const container = document.getElementById('announcements-list');
        if(!container) return;
        try{
            const res = await fetch('/api/announcements/latest');
            if(!res.ok) throw new Error('Fetch error');
            const list = await res.json();
            if(list.length === 0){
                container.innerHTML = '<p>Henüz duyuru yok.</p>';
                return;
            }
            container.innerHTML = '';
            list.forEach(item => {
                const el = document.createElement('div');
                el.className = 'announcement';
                el.innerHTML = `<h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.content)}</p><small>${new Date(item.createdAt).toLocaleString()}</small>`;
                container.appendChild(el);
            });
        } catch(err){
            container.innerHTML = '<p>Yüklenirken hata oluştu.</p>';
        }
    }

    function escapeHtml(str){
        return String(str).replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});
    }

    loadAnnouncements();
});