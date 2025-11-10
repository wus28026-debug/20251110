let bombs = [];
let colors = ["#f20c0c", "#ffaa00", "#f2f20c", "#0cf259", "#0ca6f2", "#590cf2", "#f20ca6"];
let cnv = null; // 新增：canvas 變數以便置中或 resize

function setup() {
    // 全螢幕：依視窗大小建立畫布並移到左上角
    document.body.style.margin = '0';
    document.body.style.background = '#000000';
    cnv = createCanvas(windowWidth, windowHeight);
    cnv.position(0, 0);

    // 新增：建立左側隱藏選單
    createSideMenu();

    rectMode(CENTER);
    strokeWeight(2);
    for (let i = 0; i < 20; i++) {
        bombs.push(new Bomb());
    }
}

function draw() {
	background(0);
	for (let b of bombs) {
		b.run();
	}
}

function easeInCubic(t) {
	return t * t * t;
}

function easeOutCubic(t) {
	return (--t) * t * t + 1;
}

class Bomb {
	constructor() {
		this.forms = [];
		this.setValues();
	}

	run() {
		for (let f of this.forms) {
			stroke(255);
			f.run();
		}
		if (this.forms[0].isDead()) {
			this.forms.length = 0;
			this.setValues();
		}
	}

	setValues() {
		let x = random(-0.1, 1.1) * width;
		let y = random(-0.1, 1.1) * height;
		let s = random(10, 100);
		let t = -int(random(100));
		let t1 = int(random(60, 150));
		let num = int(random(6, 23));
		let aa = random(10);
		let rnd = int(random(4));
		let col = color(random(colors));
		for (let a = 0; a < TAU; a += (TAU / num)) {
			if (rnd == 0) this.forms.push(new Form01(x, y, s, a + aa, t, t1, col));
			if (rnd == 3) this.forms.push(new Form04(x, y, s, a + aa, t, t1, col));
		}
		if (rnd == 1) this.forms.push(new Form02(x, y, s, aa, t, t1, col));
		if (rnd == 2) this.forms.push(new Form03(x, y, s, aa, t, t1, col));
	}
}

class Form01 {
	constructor(x, y, l, a, t, t1, col) {
		this.x = x;
		this.y = y;
		this.len = l;
		this.l1 = 0;
		this.l2 = 0;
		this.t = t;
		this.t1 = t1;
		this.ang = a;
		this.col = col;
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.ang);
		stroke(this.col);

		line(this.l1, 0, this.l2, 0);
		pop();
	}

	move() {
		if (0 < this.t) {
			let nrm = norm(this.t, 0, this.t1);
			this.l1 = lerp(0, this.len, easeOutCubic(nrm));
			this.l2 = lerp(0, this.len, easeInCubic(nrm));
		}
		this.t++;
	}

	isDead() {
		if (this.t > this.t1) return true;
		return false;
	}

	run() {
		if (0 < this.t) this.show();
		this.move();
	}
}

class Form02 extends Form01 {
	constructor(x, y, l, a, t, t1, col) {
		super(x, y, l, a, t, t1, col);
	}

	show() {
		push();
		translate(this.x, this.y);

		noFill();
		stroke(this.col);

		circle(0, 0, this.l1 * 2);
		circle(0, 0, this.l2 * 2);

		pop();
	}
}

class Form03 extends Form01 {
	constructor(x, y, l, a, t, t1, col) {
		super(x, y, l, a, t, t1, col);
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.ang);
		noFill();
		stroke(this.col);
		square(0, 0, this.l1 * 2);
		square(0, 0, this.l2 * 2);
		pop();
	}
}

class Form04 extends Form01 {
	constructor(x, y, l, a, t, t1, col) {
		super(x, y, l, a, t, t1, col);
	}

	show() {
		push();
		translate(this.x, this.y);
		rotate(this.ang);
		noStroke();
		fill(this.col);
		circle(this.l1, 0, 5);
		circle(this.l2, 0, 5);
		pop();
	}
}

// 新增：側選單建立與控制（改：選項可點選、滑鼠 hover 變黃、支援鍵盤 Enter）
function createSideMenu() {
    // 加入 CSS（含 iframe overlay 樣式）
    const css = `
    #sideMenu {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 320px;
        background: rgba(20,20,20,0.95);
        color: #ffffff;
        transform: translateX(-100%);
        transition: transform 0.5s cubic-bezier(.2,.8,.2,1);
        z-index: 9999;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        padding-left: 20px;
        padding-top: 20px;
        box-sizing: border-box;
        -webkit-user-select: none;
        user-select: none;
    }
    #sideMenu.open { transform: translateX(0); }
    #sideMenu .menu-item {
        font-size: 32px;
        margin: 8px 0;
        cursor: pointer;
        color: #fff;
        text-decoration: none;
        padding-left: 6px;
        outline: none;
    }
    #sideMenu .menu-item:hover,
    #sideMenu .menu-item:focus {
        color: #ff0; /* hover / focus 變黃色 */
    }
    #menuHandle {
        position: fixed;
        top: 50%;
        left: 0;
        transform: translate(-50%, -50%);
        width: 28px;
        height: 84px;
        background: rgba(255,255,255,0.03);
        border-radius: 0 8px 8px 0;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
    }
    #menuHandle:after {
        content: '≡';
        color: #fff;
        font-size: 18px;
        transform: translateX(1px);
    }

    /* 子選單樣式 */
    #sideMenu .menu-group { width: 100%; }
    #sideMenu .submenu {
        display: none;
        margin-left: 8px;
        margin-top: 6px;
        box-sizing: border-box;
    }
    /* 當群組被 hover 或 focus 時顯示子選單 */
    #sideMenu .menu-group:hover .submenu,
    #sideMenu .menu-group:focus-within .submenu {
        display: block;
    }
    #sideMenu .submenu .menu-item {
        font-size: 24px;
        margin: 6px 0;
        color: #ddd;
        padding-left: 12px;
    }
    #sideMenu .submenu .menu-item:hover,
    #sideMenu .submenu .menu-item:focus {
        color: #ff0;
    }

    /* iframe overlay */
    #iframeOverlay {
        position: fixed;
        inset: 0;
        display: none;
        align-items: center;
        justify-content: center;
        background: rgba(0,0,0,0.6);
        z-index: 20000;
    }
    #iframeContainer {
        width: 70vw;            /* 70% 視窗寬 */
        height: 85vh;           /* 85% 視窗高 */
        background: #ffffff;
        box-shadow: 0 8px 40px rgba(0,0,0,0.6);
        border-radius: 6px;
        overflow: hidden;
        position: relative;
    }
    #iframeContainer iframe {
        width: 100%;
        height: 100%;
        border: 0;
        display: block;
    }
    #iframeCloseBtn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: rgba(0,0,0,0.6);
        color: #fff;
        border: none;
        padding: 6px 10px;
        font-size: 18px;
        border-radius: 4px;
        cursor: pointer;
        z-index: 2;
    }
    `;
    const style = document.createElement('style');
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);

    // 建立 menu DOM
    const menu = document.createElement('nav');
    menu.id = 'sideMenu';
    // 四個選項：第一單元作品、第一單元講義、測驗系統、回到首頁
    const items = [
        { text: '第一單元作品', action: 'iframe', url: 'https://wus28026-debug.github.io/20251020/' },
        { text: '第一單元講義', action: 'iframe', url: 'https://hackmd.io/-vg_gBO4RuCCxOnJCADrRQ?both' },
        { text: '測驗系統', action: 'iframe', url: 'https://wus28026-debug.github.io/20251103/' },
        { text: '測驗卷筆記', action: 'iframe', url: 'https://hackmd.io/@BaN-RevzTta1yPjQLaJ-Ew/rkyK7qr1-e' },
        { text: '作品筆記', action: 'iframe', url: 'https://hackmd.io/xJIwS4zFTECwJCVvxXfS1g' },
        { text: '淡江大學', submenu: [ { text: '教育科技學系', action: 'iframe', url: 'https://hackmd.io/p2N4tFB4TzS7uymBekXbEA' } ] },
        { text: '回到首頁', href: 'index.html' }
    ];

    items.forEach(item => {
        // 若有子選單，建立一個群組（主選單 + 隱藏子選單）
        if (item.submenu && Array.isArray(item.submenu)) {
            const group = document.createElement('div');
            group.className = 'menu-group';

            const main = document.createElement('div');
            main.className = 'menu-item';
            main.textContent = item.text;
            main.tabIndex = 0;
            group.appendChild(main);

            const subWrap = document.createElement('div');
            subWrap.className = 'submenu';
            item.submenu.forEach(sub => {
                const subEl = document.createElement('div');
                subEl.className = 'menu-item';
                subEl.textContent = sub.text;
                subEl.tabIndex = 0;
                if (sub.action === 'iframe') {
                    subEl.addEventListener('click', () => openIframe(sub.url));
                    subEl.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            openIframe(sub.url);
                        }
                    });
                } else if (sub.href) {
                    subEl.addEventListener('click', () => { window.location.href = sub.href; });
                    subEl.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            window.location.href = sub.href;
                        }
                    });
                }
                subWrap.appendChild(subEl);
            });

            group.appendChild(subWrap);
            menu.appendChild(group);
            return;
        }

        // 標準單一選項（無子選單）
        const el = document.createElement('div');
        el.className = 'menu-item';
        el.textContent = item.text;
        el.tabIndex = 0;
        if (item.action === 'iframe') {
            el.addEventListener('click', () => {
                openIframe(item.url);
            });
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    openIframe(item.url);
                }
            });
        } else if (item.href) {
            el.addEventListener('click', () => {
                window.location.href = item.href;
            });
            el.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    window.location.href = item.href;
                }
            });
        }
        menu.appendChild(el);
    });
    document.body.appendChild(menu);

    // 建立 handle（可選）
    const handle = document.createElement('div');
    handle.id = 'menuHandle';
    document.body.appendChild(handle);

    // 建立 iframe overlay 元素（隱藏）
    const overlay = document.createElement('div');
    overlay.id = 'iframeOverlay';
    overlay.innerHTML = `
        <div id="iframeContainer" role="dialog" aria-modal="true">
            <button id="iframeCloseBtn" aria-label="關閉">關閉</button>
            <iframe id="contentIframe" src="" allowfullscreen></iframe>
        </div>
    `;
    document.body.appendChild(overlay);

    const iframe = document.getElementById('contentIframe');
    const closeBtn = document.getElementById('iframeCloseBtn');

    function openIframe(url) {
        const iframe = document.getElementById('contentIframe');
        iframe.src = url;
        const overlay = document.getElementById('iframeOverlay');
        overlay.style.display = 'flex';
        // 讓 menu 收回
        const menu = document.getElementById('sideMenu');
        if (menu) menu.classList.remove('open');
    }
    function closeIframe() {
        // 停止並清除 src（釋放資源）
        iframe.src = 'about:blank';
        overlay.style.display = 'none';
    }

    closeBtn.addEventListener('click', closeIframe);
    // 點擊 backdrop 區域關閉（但點擊 container 不關閉）
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeIframe();
    });
    // Esc 關閉
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (overlay.style.display === 'flex') closeIframe();
        }
    });

    // 控制行為：滑鼠移到最左側 100px 自動打開，離開超過 menuWidth 則收回
    const menuWidth = 320;
    const openZone = 100; // <- 觸發區域：最左側 100px
    let hideTimeout = null;
    const openMenu = () => {
        clearTimeout(hideTimeout);
        menu.classList.add('open');
    };
    const closeMenu = () => {
        menu.classList.remove('open');
    };

    handle.addEventListener('click', () => {
        if (menu.classList.contains('open')) closeMenu();
        else openMenu();
    });

    window.addEventListener('mousemove', (e) => {
        if (e.clientX <= openZone) {
            openMenu();
        } else if (e.clientX > menuWidth) {
            clearTimeout(hideTimeout);
            hideTimeout = setTimeout(() => closeMenu(), 600);
        }
    });

    window.addEventListener('touchstart', (ev) => {
        const x = ev.touches[0].clientX;
        if (x <= openZone) openMenu();
        else if (x > menuWidth) closeMenu();
    });
}

function windowResized() {
    // 視窗大小改變時重新調整畫布大小並定位
    if (cnv) {
        resizeCanvas(windowWidth, windowHeight);
        cnv.position(0, 0);
    }
    // iframeContainer 使用 vw/vh，瀏覽器會自動調整；若 overlay 正在顯示可強制重繪或其他行為
    const overlay = document.getElementById('iframeOverlay');
    if (overlay && overlay.style.display === 'flex') {
        // 若需可在此加入其他 resize 處理
    }
}
