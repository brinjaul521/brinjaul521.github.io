/* 全站背景音乐播放器 - 纯前端版 */
(function () {
    const PLAY_LIST = ['/music/偏向.mp3'];          // 多首就继续 push
    const volumeKey = 'bg-player-volume';        // localStorage 记忆音量
    let muted = localStorage.getItem('bg-player-muted') === '1';
    let current = 0, audio = new Audio();
  
    audio.src = PLAY_LIST[current];
    audio.loop = PLAY_LIST.length === 1;         // 只有一首就循环
    audio.volume = +(localStorage.getItem(volumeKey) || 0.6);
    audio.muted = muted;
  
    /* DOM 播放器小浮窗 */
    const css = document.createElement('style');
    css.textContent = `
  #bg-player{position:fixed;bottom:20px;right:20px;z-index:9999;width:50px;height:50px;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .3s}
  #bg-player:hover{transform:scale(1.1)}
  #bg-player svg{width:24px;height:24px;fill:#333}
  #bg-panel{position:fixed;bottom:80px;right:20px;background:rgba(255,255,255,.9);border-radius:6px;padding:10px 14px;display:none;flex-direction:column;box-shadow:0 2px 8px rgba(0,0,0,.2);font-size:12px;color:#333}
  #bg-panel button{margin:4px 0;border:none;background:#ddd;border-radius:4px;padding:4px 8px;cursor:pointer}
  #bg-panel input{width:100px}
    `;
    document.head.appendChild(css);
  
    const player = document.createElement('div');
    player.id = 'bg-player';
    player.innerHTML = `<svg id="bg-icon" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;
    document.body.appendChild(player);
  
    const panel = document.createElement('div');
    panel.id = 'bg-panel';
    panel.innerHTML = `
  <button id="bg-toggle">播放/暂停</button>
  <input id="bg-volume" type="range" min="0" max="1" step="0.05" value="${audio.volume}">
  <button id="bg-mute">静音/取消</button>
    `;
    document.body.appendChild(panel);
  
    /* 事件 */
    player.onclick = () => panel.style.display = panel.style.display === 'flex' ? 'none' : 'flex';
    document.getElementById('bg-toggle').onclick = () => audio.paused ? audio.play() : audio.pause();
    document.getElementById('bg-mute').onclick = () => {
      audio.muted = !audio.muted;
      localStorage.setItem('bg-player-muted', audio.muted ? '1' : '0');
    };
    document.getElementById('bg-volume').oninput = (e) => {
      audio.volume = e.target.value;
      localStorage.setItem(volumeKey, audio.volume);
    };
  
    /* 自动播放（浏览器可能拦截，首次交互后触发） */
    document.body.addEventListener('click', () => {
      if (audio.paused && !muted) audio.play().catch(() => {});
    }, { once: true });
  
    /* 多首随机/顺序切歌 */
    audio.onended = () => {
      current = (current + 1) % PLAY_LIST.length;
      audio.src = PLAY_LIST[current];
      audio.play();
    };
  })();