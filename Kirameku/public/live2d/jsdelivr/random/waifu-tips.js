/* eslint-disable @typescript-eslint/no-unused-expressions */
/*!
 * Live2D APi
 * https://github.com/nova1751/live2d-api
 */
!function () {
  "use strict";

  // 随机选取数组元素
  function pick(arr) {
    return Array.isArray(arr) ? arr[Math.floor(Math.random() * arr.length)] : arr;
  }

  let tipTimer;

  // 显示消息
  function showMessage(msg, duration, _priority) {
    if (!msg) return;
    if (tipTimer) { clearTimeout(tipTimer); tipTimer = null; }
    msg = pick(msg);
    sessionStorage.setItem("waifu-text", _priority);
    const el = document.getElementById("waifu-tips");
    el.innerHTML = msg;
    el.classList.add("waifu-tips-active");
    tipTimer = setTimeout(() => {
      sessionStorage.removeItem("waifu-text");
      el.classList.remove("waifu-tips-active");
    }, duration);
  }

  // ========== CDN 模型加载器 ==========
  class ModelLoader {
    constructor({ apiPath, cdnPath }) {
      let useCDN = false;
      if (typeof cdnPath === "string") {
        useCDN = true;
        if (!cdnPath.endsWith("/")) cdnPath += "/";
      } else {
        if (typeof apiPath !== "string") throw "Invalid initWidget argument!";
        if (!apiPath.endsWith("/")) apiPath += "/";
      }
      this.useCDN = useCDN;
      this.apiPath = apiPath;
      this.cdnPath = cdnPath;
    }

    async loadModelList() {
      const res = await fetch(`${this.cdnPath}model_list.json`);
      this.modelList = await res.json();
    }

    async loadOtherModel() {
      let id = localStorage.getItem("modelId");
      if (this.useCDN) {
        if (!this.modelList) await this.loadModelList();
        const next = ++id >= this.modelList.models.length ? 0 : id;
        this.loadModel(next, 0, this.modelList.messages[next]);
      } else {
        fetch(`${this.apiPath}switch/?id=${id}`)
          .then(r => r.json())
          .then(d => this.loadModel(d.model.id, 0, d.model.message));
      }
    }

    async loadModel(id, tid, msg) {
      localStorage.setItem("modelId", id);
      localStorage.setItem("modelTexturesId", tid);
      showMessage(msg, 4000, 10);
      if (this.useCDN) {
        if (!this.modelList) await this.loadModelList();
        const path = this.modelList.models[id][0];
        loadlive2d("live2d", `${this.cdnPath}model/${path}/index.json`);
      } else {
        loadlive2d("live2d", `${this.apiPath}get/?id=${id}-${tid}`);
        console.log(`Live2D 模型 ${id}-${tid} 加载完成`);
      }
    }

    async loadRandModel() {
      const id = localStorage.getItem("modelId");
      const tid = localStorage.getItem("modelTexturesId");
      if (this.useCDN) {
        if (!this.modelList) await this.loadModelList();
        const path = pick(this.modelList.models[id]);
        loadlive2d("live2d", `${this.cdnPath}model/${path}/index.json`);
        showMessage("我的新衣服好看嘛？", 4000, 10);
      } else {
        fetch(`${this.apiPath}rand_textures/?id=${id}-${tid}`)
          .then(r => r.json())
          .then(d => {
            if (d.textures.id !== 1 || (tid !== 1 && tid !== 0)) {
              this.loadModel(id, d.textures.id, "我的新衣服好看嘛？");
            } else {
              showMessage("我还没有其他衣服呢！", 4000, 10);
            }
          });
      }
    }
  }

  // ========== 工具按钮 ==========
  const SVG = {
    hitokoto: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M512 240c0 114.9-114.6 208-256 208c-37.1 0-72.3-6.4-104.1-17.9c-11.9 8.7-31.3 20.6-54.3 30.6C73.6 471.1 44.7 480 16 480c-6.5 0-12.3-3.9-14.8-9.9c-2.5-6-1.1-12.8 3.4-17.4l0 0 0 0 0 0 0 0 .3-.3c.3-.3 .7-.7 1.3-1.4c1.1-1.2 2.8-3.1 4.9-5.7c4.1-5 9.6-12.4 15.2-21.6c10-16.6 19.5-38.4 21.4-62.9C17.7 326.8 0 285.1 0 240C0 125.1 114.6 32 256 32s256 93.1 256 208z"/></svg>',
    asteroids: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"/></svg>',
    switchModel: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M399 384.2C376.9 345.8 335.4 320 288 320H224c-47.4 0-88.9 25.8-111 64.2c35.2 39.2 86.2 63.8 143 63.8s107.8-24.7 143-63.8zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 16a72 72 0 1 0 0-144 72 72 0 1 0 0 144z"/></svg>',
    switchTexture: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M320 64A64 64 0 1 0 192 64a64 64 0 1 0 128 0zm-96 96c-35.3 0-64 28.7-64 64v48c0 17.7 14.3 32 32 32h1.8l11.1 99.5c1.8 16.2 15.5 28.5 31.8 28.5h38.7c16.3 0 30-12.3 31.8-28.5L318.2 304H320c17.7 0 32-14.3 32-32V224c0-35.3-28.7-64-64-64H224zM132.3 394.2c13-2.4 21.7-14.9 19.3-27.9s-14.9-21.7-27.9-19.3c-32.4 5.9-60.9 14.2-82 24.8c-10.5 5.3-20.3 11.7-27.8 19.6C6.4 399.5 0 410.5 0 424c0 21.4 15.5 36.1 29.1 45c14.7 9.6 34.3 17.3 56.4 23.4C130.2 504.7 190.4 512 256 512s125.8-7.3 170.4-19.6c22.1-6.1 41.8-13.8 56.4-23.4c13.7-8.9 29.1-23.6 29.1-45c0-13.5-6.4-24.5-14-32.6c-7.5-7.9-17.3-14.3-27.8-19.6c-21-10.6-49.5-18.9-82-24.8c-13-2.4-25.5 6.3-27.9 19.3s6.3 25.5 19.3 27.9c30.2 5.5 53.7 12.8 69 20.5c3.2 1.6 5.8 3.1 7.9 4.5c3.6 2.4 3.6 7.2 0 9.6c-8.8 5.7-23.1 11.8-43 17.3C374.3 457 318.5 464 256 464s-118.3-7-157.7-17.9c-19.9-5.5-34.2-11.6-43-17.3c-3.6-2.4-3.6-7.2 0-9.6c2.1-1.4 4.8-2.9 7.9-4.5c15.3-7.7 38.8-14.9 69-20.5z"/></svg>',
    photo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M220.6 121.2L271.1 96 448 96v96H333.2c-21.9-15.1-48.5-24-77.2-24s-55.2 8.9-77.2 24H64V128H192c9.9 0 19.7-2.3 28.6-6.8zM0 128V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H271.1c-9.9 0-19.7 2.3-28.6 6.8L192 64H160V48c0-8.8-7.2-16-16-16H80c-8.8 0-16 7.2-16 16l0 16C28.7 64 0 92.7 0 128zM168 304a88 88 0 1 1 176 0 88 88 0 1 1 -176 0z"/></svg>',
    info: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>',
    quit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg>'
  };

  const tools = {
    hitokoto: {
      icon: SVG.hitokoto,
      callback: function () {
        // 重置状态，确保立刻显示
        if (tipTimer) { clearTimeout(tipTimer); tipTimer = null; }
        sessionStorage.removeItem("waifu-text");
        document.getElementById("waifu-tips").classList.remove("waifu-tips-active");
        // 加缓存破坏参数，每次请求新内容
        fetch("https://v1.hitokoto.cn?" + Date.now())
          .then(r => r.json())
          .then(d => { showMessage(d.hitokoto, 6000, 9); });
      }
    },
    asteroids: {
      icon: SVG.asteroids,
      callback: () => {
        if (window.Asteroids) {
          window.ASTEROIDSPLAYERS || (window.ASTEROIDSPLAYERS = []);
          window.ASTEROIDSPLAYERS.push(new Asteroids());
        } else {
          const s = document.createElement("script");
          s.src = "/live2d/asteroids.js";
          document.head.appendChild(s);
        }
      }
    },
    "switch-model": { icon: SVG.switchModel, callback: () => {} },
    "switch-texture": { icon: SVG.switchTexture, callback: () => {} },
    photo: {
      icon: SVG.photo,
      callback: () => {
        showMessage("照好了嘛，是不是很可爱呢？", 6000, 9);
        Live2D.captureName = "photo.png";
        Live2D.captureFrame = true;
      }
    },
    info: { icon: SVG.info, callback: () => { open("https://hiromu.top/"); } },
    quit: {
      icon: SVG.quit,
      callback: () => {
        localStorage.setItem("waifu-display", Date.now());
        showMessage("愿你有一天能与重要的人重逢。", 2000, 11);
        const el = document.getElementById("waifu");
        // 切回 bottom 定位以便退场动画正常
        el.style.transition = "transform 0.3s ease-in-out, bottom 3s ease-in-out";
        el.style.left = "auto";
        el.style.top = "auto";
        el.style.right = "0";
        el.style.bottom = "-500px";
        setTimeout(() => {
          el.style.display = "none";
          document.getElementById("waifu-toggle").classList.add("waifu-toggle-active");
        }, 3000);
      }
    }
  };

  // ========== 初始化 ==========
  function init(config) {
    const loader = new ModelLoader(config);

    function setupTips(tipsData) {
      let lastActivity = false;
      let idleTimer;
      let hoveredEl = null; // 按元素判断重复，而非选择器字符串
      let idleMsgs = tipsData.message.default;

      // 检测用户活动
      window.addEventListener("mousemove", () => { lastActivity = true; });
      window.addEventListener("keydown", () => { lastActivity = true; });

      // 空闲提示
      setInterval(() => {
        if (lastActivity) {
          lastActivity = false;
          clearInterval(idleTimer);
          idleTimer = null;
        } else if (!idleTimer) {
          idleTimer = setInterval(() => { showMessage(idleMsgs, 6000, 9); }, 20000);
        }
      }, 1000);

      // 时间问候与位置欢迎
      function getTimeGreeting(timeRules) {
        // 尝试从 sessionStorage 获取访客位置
        let locationStr = "";
        try {
          const locData = sessionStorage.getItem("visitor_location");
          if (locData) {
            const loc = JSON.parse(locData);
            const parts = [loc.region, loc.city].filter(Boolean);
            if (parts.length) locationStr = parts.join("");
          }
        } catch (e) {}

        if (location.pathname === "/") {
          if (locationStr) {
            return `欢迎来自 <span>${locationStr}</span> 的朋友～<br>祝您在这里玩得开心！`;
          }
          return "欢迎来到这里～<br>祝您玩得开心！";
        }

        const title = `欢迎阅读<span>「${document.title.split(" - ")[0]}」</span>`;
        if (document.referrer !== "") {
          const ref = new URL(document.referrer);
          const site = ref.hostname.split(".")[1];
          const map = { baidu: "百度", so: "360搜索", google: "谷歌搜索" };
          if (location.hostname === ref.hostname) return title;
          const from = site in map ? map[site] : ref.hostname;
          if (locationStr) {
            return `Hello！来自 <span>${from}</span> 的 ${locationStr} 朋友<br>${title}`;
          }
          return `Hello！来自 <span>${from}</span> 的朋友<br>${title}`;
        }
        if (locationStr) {
          return `欢迎来自 <span>${locationStr}</span> 的朋友～<br>${title}`;
        }
        return title;
      }
      showMessage(getTimeGreeting(tipsData.time), 7000, 11);

      // 延时检查位置数据，到达后替换首页欢迎语
      if (location.pathname === "/" && !sessionStorage.getItem("visitor_location")) {
        let retries = 0;
        const checkLoc = setInterval(() => {
          try {
            const d = sessionStorage.getItem("visitor_location");
            if (d) {
              clearInterval(checkLoc);
              const loc = JSON.parse(d);
              const parts = [loc.region, loc.city].filter(Boolean);
              if (parts.length) {
                showMessage(`欢迎来自 <span>${parts.join("")}</span> 的朋友～<br>祝您在这里玩得开心！`, 7000, 12);
              }
            }
          } catch (e) {}
          if (++retries > 20) clearInterval(checkLoc);
        }, 300);
      }

      // 鼠标悬停提示（按元素判断，同一选择器的不同元素各自触发）
      window.addEventListener("mouseover", (e) => {
        for (const { selector, text } of tipsData.mouseover) {
          const el = e.target.closest(selector);
          if (el) {
            if (hoveredEl === el) return;
            hoveredEl = el;
            let msg = pick(text);
            msg = msg.replace("{text}", el.innerText || "");
            showMessage(msg, 4000, 8);
            return;
          }
        }
      });

      // 点击提示
      window.addEventListener("click", (e) => {
        for (const { selector, text } of tipsData.click) {
          const el = e.target.closest(selector);
          if (el) {
            let msg = pick(text);
            msg = msg.replace("{text}", el.innerText || "");
            showMessage(msg, 4000, 8);
            return;
          }
        }
      });

      // 节日祝福
      tipsData.seasons.forEach(({ date, text }) => {
        const now = new Date();
        const [start, end] = date.split("-");
        const [sm, sd] = start.split("/");
        const [em, ed] = (end || start).split("/");
        if (sm <= now.getMonth() + 1 && now.getMonth() + 1 <= em && sd <= now.getDate() && now.getDate() <= ed) {
          let msg = pick(text);
          msg = msg.replace("{year}", now.getFullYear());
          idleMsgs.push(msg);
        }
      });

      // 控制台提示
      const trap = () => {};
      console.log("%c", trap);
      trap.toString = () => { showMessage(tipsData.message.console, 6000, 9); };

      // 复制提示
      window.addEventListener("copy", () => { showMessage(tipsData.message.copy, 6000, 9); });

      // 页面重新可见
      window.addEventListener("visibilitychange", () => {
        if (!document.hidden) showMessage(tipsData.message.visibilitychange, 6000, 9);
      });

      // 一言按钮点击时重置 hover 跟踪
      const hitokotoBtn = document.getElementById("waifu-tool-hitokoto");
      if (hitokotoBtn) hitokotoBtn.addEventListener("click", () => { hoveredEl = null; });

      // 派菜单选中项变化时显示对应提示
      const radialTips = {
        "首页": ["回到温暖的首页吧～", "想回到起点吗？", "首页在等你呢！"],
        "文章": ["来看看有什么新文章吧！", "知识的海洋在向你招手～", "有没有感兴趣的文章呢？"],
        "说说": ["来看看大家在聊什么吧～", "有什么新鲜事呢？", "说说里藏着小心思哦～"],
        "留言": ["来留言区逛逛吧～", "有什么想说的都可以留言哦！", "留下你的足迹吧～"],
        "小说": ["想看小说了吗？这里好多故事呢！", "来挑一本喜欢的小说吧～", "沉浸在故事的世界里吧～"],
        "项目": ["来看看主人的项目吧！", "这里都是厉害的作品呢～", "代码的世界很有趣哦！"],
        "友链": ["这是我的朋友们哦～", "去大佬们的家串串门吧！", "友情链接，温暖你我他～"],
        "照片墙": ["来看看好看的照片吧！", "每张照片都有故事呢～", "照片墙在向你招手哦！"],
        "归档": ["文章都整理好啦，来看看？", "翻页太麻烦？归档在这里～", "时间线里藏着回忆呢～"],
        "音乐": ["来听听音乐吧～", "音乐是最好的陪伴呢～", "让旋律陪你一会儿吧～"],
        "关于": ["想知道主人是谁吗？", "这里有一些小秘密哦～", "关于页里有彩蛋呢！"]
      };
      window.addEventListener("radial-nav-hover", (e) => {
        const { label } = e.detail;
        if (!label) return;
        const tips = radialTips[label] || ["去 <span>" + label + "</span> 看看吧！"];
        showMessage(pick(tips), 2500, 8);
      });
    }

    // 初始化
    localStorage.removeItem("waifu-display");
    sessionStorage.removeItem("waifu-text");

    document.body.insertAdjacentHTML("beforeend",
      '<div id="waifu">' +
        '<div id="waifu-tips"></div>' +
        '<canvas id="live2d" width="800" height="800"></canvas>' +
        '<div id="waifu-tool"></div>' +
      '</div>'
    );

    // 恢复保存的位置，或默认右下角
    const waifuEl = document.getElementById("waifu");
    const saved = localStorage.getItem("waifu-pos");
    if (saved) {
      try {
        const { left, top } = JSON.parse(saved);
        waifuEl.style.transition = "none";
        waifuEl.style.left = left + "px";
        waifuEl.style.top = top + "px";
        waifuEl.style.right = "auto";
        waifuEl.style.bottom = "auto";
      } catch {
        setTimeout(() => { waifuEl.style.bottom = 0; }, 0);
      }
    } else {
      setTimeout(() => { waifuEl.style.bottom = 0; }, 0);
    }
    initDrag();

    // 注册工具按钮
    tools["switch-model"].callback = () => loader.loadOtherModel();
    tools["switch-texture"].callback = () => loader.loadRandModel();

    const toolList = Array.isArray(config.tools) ? config.tools : Object.keys(tools);
    for (const name of toolList) {
      if (!tools[name]) continue;
      const { icon, callback } = tools[name];
      document.getElementById("waifu-tool").insertAdjacentHTML("beforeend",
        `<span id="waifu-tool-${name}">${icon}</span>`
      );
      document.getElementById(`waifu-tool-${name}`).addEventListener("click", callback);
    }

    // 加载模型和提示语
    let modelId = localStorage.getItem("modelId");
    let texId = localStorage.getItem("modelTexturesId");
    if (modelId === null) { modelId = 0; texId = 0; }
    loader.loadModel(modelId, texId);
    fetch(config.waifuPath).then(r => r.json()).then(setupTips);
  }

  // ========== 拖拽功能 ==========
  function initDrag() {
    const el = document.getElementById("waifu");
    if (!el) return;

    let dragging = false;
    let moved = false;
    let startX, startY, origLeft, origTop;

    function getPos() {
      const r = el.getBoundingClientRect();
      return { left: r.left, top: r.top };
    }

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }

    function onStart(e) {
      // 点击工具按钮不触发拖拽
      if (e.target.closest("#waifu-tool")) return;
      e.preventDefault();
      dragging = true;
      el.style.transition = "none";
      const ev = e.touches ? e.touches[0] : e;
      const pos = getPos();
      startX = ev.clientX;
      startY = ev.clientY;
      origLeft = pos.left;
      origTop = pos.top;
      moved = false;
    }

    function onMove(e) {
      if (!dragging) return;
      e.preventDefault();
      if (!moved) {
        moved = true;
        showMessage(pick(["你要带我去哪里呀～", "哇，飞起来了！", "嘿咻嘿咻～", "抓稳啦！", "这是要去哪呢？"]), 2000, 8);
      }
      const ev = e.touches ? e.touches[0] : e;
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const newLeft = clamp(origLeft + ev.clientX - startX, 0, window.innerWidth - w);
      const newTop = clamp(origTop + ev.clientY - startY, 0, window.innerHeight - h);
      el.style.left = newLeft + "px";
      el.style.top = newTop + "px";
      el.style.right = "auto";
      el.style.bottom = "auto";
    }

    function onEnd() {
      if (!dragging) return;
      dragging = false;
      if (!moved) return;
      localStorage.setItem("waifu-pos", JSON.stringify({
        left: parseInt(el.style.left),
        top: parseInt(el.style.top)
      }));
      // 阻止松开时触发的 click 事件
      const block = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
      el.addEventListener("click", block, { capture: true, once: true });
      setTimeout(() => el.removeEventListener("click", block, { capture: true }), 100);
      showMessage(pick(["就这里好啦！", "这里不错呢～", "放我下来，累死了！", "新家感觉怎么样？", "好，就住这了！"]), 3000, 8);
    }

    el.addEventListener("mousedown", onStart);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onEnd);
    el.addEventListener("touchstart", onStart, { passive: false });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
  }

  // ========== 全局入口 ==========
  window.initWidget = function (opts, apiPath) {
    if (typeof opts === "string") opts = { waifuPath: opts, apiPath: apiPath };

    document.body.insertAdjacentHTML("beforeend",
      '<div id="waifu-toggle"><span>看板娘</span></div>'
    );

    const toggle = document.getElementById("waifu-toggle");
    toggle.addEventListener("click", () => {
      toggle.classList.remove("waifu-toggle-active");
      if (toggle.getAttribute("first-time")) {
        init(opts);
        toggle.removeAttribute("first-time");
      } else {
        localStorage.removeItem("waifu-display");
        const el = document.getElementById("waifu");
        el.style.display = "";
        const pos = localStorage.getItem("waifu-pos");
        if (pos) {
          try {
            const { left, top } = JSON.parse(pos);
            el.style.transition = "none";
            el.style.left = left + "px";
            el.style.top = top + "px";
            el.style.right = "auto";
            el.style.bottom = "auto";
          } catch {
            setTimeout(() => { el.style.bottom = 0; }, 0);
          }
        } else {
          setTimeout(() => { el.style.bottom = 0; }, 0);
        }
      }
    });

    if (localStorage.getItem("waifu-display") && Date.now() - localStorage.getItem("waifu-display") <= 86400000) {
      toggle.setAttribute("first-time", "true");
      setTimeout(() => { toggle.classList.add("waifu-toggle-active"); }, 0);
    } else {
      init(opts);
    }
  };
}();
