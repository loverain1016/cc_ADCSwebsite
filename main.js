  // 主要 JavaScript 功能

  // 平滑滾動
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target =
  document.querySelector(this.getAttribute('href'));
          if (target) {
              target.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
              });
          }
      });
  });

  // 導覽列背景變化
  window.addEventListener('scroll', function() {
      const navbar = document.querySelector('.navbar');
      if (window.scrollY > 100) {
          navbar.style.background = 'rgba(255, 255, 255, 0.98)';
          navbar.style.boxShadow = '0 2px 20px rgba(45, 139, 186, 
  0.1)';
      } else {
          navbar.style.background = 'rgba(255, 255, 255, 0.95)';
          navbar.style.boxShadow = 'none';
      }
  });

  // 滾動動畫效果
  const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver(function(entries) {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('visible');
          }
      });
  }, observerOptions);

  // 觀察所有需要動畫的元素
  document.querySelectorAll('.reveal').forEach(el => {
      observer.observe(el);
  });

  // 服務按鈕切換
  document.querySelectorAll('.service-btn').forEach(btn => {
      btn.addEventListener('click', function() {
          // 移除所有按鈕的 active 狀態
          document.querySelectorAll('.service-btn').forEach(b =>
  b.classList.remove('active'));
          // 為當前按鈕添加 active 狀態
          this.classList.add('active');
      });
  });

  // 主題卡片點選切換
  document.querySelectorAll('.dot').forEach((dot, index) => {
      dot.addEventListener('click', function() {
          // 移除所有點的 active 狀態
          document.querySelectorAll('.dot').forEach(d =>
  d.classList.remove('active'));
          // 為當前點添加 active 狀態
          this.classList.add('active');

          // 可以在這裡添加切換主題卡片的邏輯
          console.log(`切換到主題 ${index + 1}`);
      });
  });

  // 電子報訂閱表單
  document.querySelector('.newsletter-form')?.addEventListener('submit'    
  , function(e) {
      e.preventDefault();
      const email = this.querySelector('.newsletter-input').value;
      if (email) {
          alert('感謝您的訂閱！我們會將最新資訊寄送至您的信箱。');
          this.querySelector('.newsletter-input').value = '';
      }
  });

  // 頁面載入完成後的初始化
  document.addEventListener('DOMContentLoaded', function() {
      // 移除初始的 reveal 類別，讓動畫可以正常觸發
      setTimeout(() => {
          document.querySelectorAll('.reveal.visible').forEach(el => {     
              el.classList.remove('visible');
          });
      }, 100);

      console.log('ADCS 網站載入完成');
  });
