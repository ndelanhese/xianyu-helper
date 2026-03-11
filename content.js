/* Slet Xianyu Helper - Software Original por Slet
   Versão: v1.9.1 (Base Estável) + CSSBuy + Bateria Anti-Ciclos + Eficiência
   Licença: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 (CC BY-NC-SA 4.0)
*/

console.log("%c Slet Xianyu Helper v1.9.1 - Ativo ", "color: #ffda00; background: #2c3e50; font-weight: bold; font-size: 14px;");

// --- 1. CONFIGURAÇÕES ---
let taxaYuanReal = 1.22;
const LINK_DISCORD = "https://discord.gg/KbkyMm2fgT";
const LINK_INSTA = "https://www.instagram.com/slet_import/";
const ICONE_DISCORD_MINIMAL = "https://img.icons8.com/ios-filled/50/ffffff/discord-logo.png";
const ICONE_INSTA_MINIMAL = "https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png";
const FOTO_GRUPO_LOCAL = chrome.runtime.getURL('logo.png'); 

// --- 2. BLOQUEIO SILENCIOSO E ESTILOS ---
const injectSilencerStyles = () => {
    if (document.getElementById('slet-silencer-styles')) return;
    const style = document.createElement('style');
    style.id = 'slet-silencer-styles';
    style.innerHTML = `
        .ant-modal-root, .ant-modal-mask, .ant-modal-wrap, 
        .loginCon--d9IpwYeU, .login-modal-wrapper, [role="dialog"],
        .ant-modal, .login-iframe-wrap--gc03OP5a, .closeIconBg--cubvOqVh { 
            display: none !important; visibility: hidden !important; pointer-events: none !important; opacity: 0 !important;
        }
        html, body { overflow: auto !important; height: auto !important; position: relative !important; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }
        .slet-btn-social:hover { transform: translateY(-2px); filter: brightness(1.2); }
        .slet-minimized { 
            width: 44px !important; height: 44px !important; padding: 0 !important; 
            background-color: transparent !important; border: none !important;
            box-shadow: none !important; display: flex !important;
            align-items: center !important; justify-content: center !important;
            overflow: visible !important; cursor: pointer; transition: 0.3s; 
        }
        .slet-minimized .slet-content, .slet-minimized #btn-minimize, .slet-minimized .slet-title-text { display: none !important; }
        .slet-minimized #slet-toggle-btn img { border: none !important; width: 44px !important; height: 44px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }
    `;
    document.head.appendChild(style);
};

// --- 3. CONVERSOR DE PREÇO ---
const convertPrice = (badge) => {
    const priceEl = document.querySelector('[class*="priceText--"]') || 
                    document.querySelector('[class*="price--"]') ||
                    document.querySelector('.price--OEWLbcxC');
    
    if (!priceEl) return;
    const oldSection = document.getElementById('price-conv-section');
    if (oldSection) oldSection.remove();

    const rawText = priceEl.innerText.replace(/¥/g, '').trim();
    let displayReal = "";

    if (rawText.includes('-')) {
        const partes = rawText.split('-').map(p => parseFloat(p.replace(/[^\d.]/g, '')));
        const realMin = (partes[0] / taxaYuanReal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const realMax = (partes[1] / taxaYuanReal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        displayReal = `${realMin} - ${realMax}`;
    } else {
        const valorYuan = parseFloat(rawText.replace(/[^\d.]/g, ''));
        displayReal = (valorYuan / taxaYuanReal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    const priceDiv = document.createElement('div');
    priceDiv.id = 'price-conv-section';
    priceDiv.className = 'slet-content'; 
    priceDiv.innerHTML = `
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.15); margin: 10px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
            <span style="font-size: 12px; font-weight: bold; color: #5efb6e; opacity: 0.9;">💰 Valor em R$:</span>
            <input type="number" id="taxa-manual" step="0.01" value="${taxaYuanReal}" 
                style="width: 42px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #fff; font-size: 10px; border-radius: 3px; text-align: center;">
        </div>
        <div style="font-size: ${displayReal.length > 18 ? '16px' : '22px'}; font-weight: 900; color: #fff; letter-spacing: -0.5px;">${displayReal}</div>
        
        <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.08); font-size: 7.5px; opacity: 0.5; text-align: center; line-height: 1.2; color: #eee;">
            AVISO: O bot fornece apenas análise técnica. <br> 
            Não constitui recomendação de compra. <br> 
            Slet © 2026 | Licença CC BY-NC-SA 4.0
        </div>
    `;
    badge.appendChild(priceDiv);
    document.getElementById('taxa-manual').addEventListener('change', (e) => {
        taxaYuanReal = parseFloat(e.target.value) || 1.22;
        convertPrice(badge);
    });
};

// --- 4. SCANNER DE HARDWARE (BATERIA ANTI-CICLOS + EFICIÊNCIA) ---
const analyzeProduct = (badge) => {
    const desc = document.querySelector('.desc--GaIUKUQY') || document.querySelector('[class*="desc--"]');
    const labels = document.querySelector('.labels--ndhPFgp8');
    if (!desc && !labels) return;
    if (document.getElementById('product-analysis-section')) return;

    const fullText = ((desc ? desc.innerText : "") + " " + (labels ? labels.innerText : "")).toLowerCase();
    const hasMDM = /mdm|监管|绕过|bypass|enterprise|配置锁|管理锁/i.test(fullText);
    if (hasMDM) badge.style.backgroundColor = "#c0392b";

    const caps = fullText.match(/(\d+)(gb|tb)/gi) || [];
    let ram = "N/A", ssd = "N/A";
    if (caps.length > 0) {
        const sorted = caps.map(c => ({ t: c, v: parseInt(c) * (c.toLowerCase().includes('tb') ? 1024 : 1) })).sort((a,b) => a.v - b.v);
        ram = sorted[0].t.toUpperCase();
        ssd = sorted[sorted.length - 1].t.toUpperCase();
    }

    // --- LÓGICA DE BATERIA BLINDADA ---
    let bateria = "N/A";
    
    // 1. Busca prioritária por "Saúde" (健康), "Capacidade" (容量), "Vida útil" (寿命) ou "Eficiência" (效率)
    const healthMatch = fullText.match(/(?:健康|容量|寿命|效率)[^\d]{0,10}?(\d{2,3})/);
    if (healthMatch && parseInt(healthMatch[1]) <= 100) {
        bateria = healthMatch[1] + "%";
    } 
    // 2. Busca número com '%' logo após a palavra "Bateria" (电池)
    else {
        const batPctMatch = fullText.match(/电池[^\d]{0,20}?(\d{2,3})\s?%/);
        if (batPctMatch && parseInt(batPctMatch[1]) <= 100) {
            bateria = batPctMatch[1] + "%";
        } 
        // 3. Fallback genérico para '%' solto no texto (<= 100)
        else {
            const genericPct = fullText.match(/(\d{2,3})\s?%/);
            if (genericPct && parseInt(genericPct[1]) <= 100) {
                bateria = genericPct[1] + "%";
            } 
            // 4. Busca número solto após "Bateria", mas IGNORA se a palavra "Ciclo" (循环) estiver na frente
            else {
                const batMatches = fullText.match(/电池[^\d]{0,30}?(\d{2,3})/g);
                if (batMatches) {
                    for (let m of batMatches) {
                        if (m.includes('循环')) continue; // Pula os ciclos!
                        let num = parseInt(m.match(/\d+/)[0]);
                        if (num > 0 && num <= 100) {
                            bateria = num + "%";
                            break;
                        }
                    }
                }
            }
        }
    }

    const section = document.createElement('div');
    section.id = 'product-analysis-section';
    section.className = 'slet-content'; 
    section.innerHTML = `
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.15); margin: 10px 0;">
        <div style="font-weight: bold; font-size: 11px; color: #ffd700; margin-bottom: 4px; text-transform: uppercase;">📦 Especificações:</div>
        <ul style="margin: 0; padding-left: 12px; font-size: 11px; list-style: disc; line-height: 1.3; color: rgba(255,255,255,0.9);">
            ${hasMDM ? `<li style="font-weight: bold; animation: blink 1s infinite; color: #ff4d4f;">🚨 MDM DETECTADO</li>` : ""}
            <li>💻 RAM: ${ram} | SSD: ${ssd}</li>
            <li>🔧 Selado: ${fullText.includes('无拆') ? "✅ Sim" : "⚠️ Verificar"}</li>
            <li>🔋 Bateria: ${bateria}</li>
        </ul>
    `;
    badge.appendChild(section);
};

// --- 5. BADGE PRINCIPAL COM TOGGLE E LÓGICA VIP ---
const analyzeSeller = () => {
    if (!window.location.href.includes('goofish.com')) return;
    const container = document.querySelector('.item-user-info-intro--ZN1A0_8Y');
    if (!container || document.getElementById('seller-status-badge')) return;

    const labels = container.querySelectorAll('.item-user-info-label--NLTMHARN');
    let v = 0, f = 0;
    labels.forEach(l => {
        if (l.innerText.includes('卖出')) v = parseInt(l.innerText.replace(/\D/g, '')) || 0;
        if (l.innerText.includes('好评率')) f = parseInt(l.innerText.replace(/\D/g, '')) || 0;
    });

    let txt = "⚖️ Neutro", col = "#2c3e50";
    if (v > 10000 && f >= 95) { txt = "✅ Confiável (Vip)"; col = "#27ae60"; }
    else if (f >= 99 && v >= 100) { txt = "✅ Confiável"; col = "#27ae60"; }
    else if (f >= 98 && v >= 50) { txt = "🟡 Mediano"; col = "#f39c12"; }
    else if (f <= 90 || v === 0) { txt = "⚠️ Perigoso"; col = "#c0392b"; }

    const b = document.createElement('div');
    b.id = 'seller-status-badge';
    b.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <div id="slet-toggle-btn" style="display: flex; align-items: center; cursor: pointer;">
                <img src="${FOTO_GRUPO_LOCAL}" style="width: 36px; height: 36px; border-radius: 8px; object-fit: cover; border: 1px solid rgba(255,255,255,0.1);">
                <div class="slet-title-text" style="font-weight: bold; font-size: 15px; color: #fff; line-height: 1.1; margin-left: 10px;">Slet Xianyu</div>
            </div>
            <div class="slet-content" style="display: flex; gap: 6px; align-items: center;">
                <a href="${LINK_DISCORD}" target="_blank" class="slet-btn-social" style="display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; background-color: rgba(114, 137, 218, 0.15); border-radius: 6px;"><img src="${ICONE_DISCORD_MINIMAL}" style="width: 14px; opacity: 0.9;"></a>
                <a href="${LINK_INSTA}" target="_blank" class="slet-btn-social" style="display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; background-color: rgba(225, 48, 108, 0.15); border-radius: 6px;"><img src="${ICONE_INSTA_MINIMAL}" style="width: 14px; opacity: 0.9;"></a>
                <div id="btn-minimize" style="cursor: pointer; padding: 5px; opacity: 0.6; font-weight: bold; color: #fff; font-size: 16px; line-height: 0.5;">_</div>
            </div>
        </div>
        <div class="slet-content">
            <div style="font-size: 11px; font-weight: bold; margin-bottom: 1px; color: rgba(255,255,255,0.9);">Vendedor: ${txt}</div>
            <div style="font-size: 10px; opacity: 0.8; color: #eee;">Vendas: ${v} | Nota: ${f}%</div>
        </div>
    `;

    Object.assign(b.style, {
        position: 'fixed', top: '20px', left: '20px', zIndex: '2147483647',
        backgroundColor: col, color: 'white', padding: '12px 15px', borderRadius: '14px',
        boxShadow: '0 6px 18px rgba(0,0,0,0.3)', fontFamily: 'Segoe UI, sans-serif', width: '230px',
        border: '1px solid rgba(255,255,255,0.08)', transition: '0.3s'
    });

    document.body.appendChild(b);
    const toggleBadge = () => b.classList.toggle('slet-minimized');
    document.getElementById('btn-minimize').addEventListener('click', (e) => { e.stopPropagation(); toggleBadge(); });
    document.getElementById('slet-toggle-btn').addEventListener('click', () => { toggleBadge(); });

    analyzeProduct(b);
    convertPrice(b);
};

// --- 6. MÓDULO CSSBUY ---
const handleCSSBuy = () => {
    if (!window.location.href.includes('cssbuy.com')) return;
    const urlParams = new URLSearchParams(window.location.search);
    const itemID = urlParams.get('item-xianyu') || window.location.href.match(/item-xianyu-(\d+)/)?.[1];

    if (itemID && !document.getElementById('btn-view-xianyu')) {
        const btn = document.createElement('a');
        btn.id = 'btn-view-xianyu';
        btn.href = `https://www.goofish.com/item?id=${itemID}`;
        btn.target = '_blank';
        btn.innerHTML = `<img src="${FOTO_GRUPO_LOCAL}" style="width:18px; height:18px; margin-right:8px; border-radius:4px; object-fit: cover;"> Ver na Xianyu`;
        Object.assign(btn.style, {
            position: 'fixed', top: '20px', left: '20px', zIndex: '2147483647',
            backgroundColor: '#ffda00', color: '#000', padding: '12px 20px', borderRadius: '8px', 
            fontWeight: 'bold', textDecoration: 'none', display: 'flex', alignItems: 'center', 
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)', fontFamily: 'sans-serif'
        });
        document.body.appendChild(btn);
    }
};

// --- 7. EXECUÇÃO ---
const main = () => { 
    injectSilencerStyles(); 
    handleCSSBuy(); 
    analyzeSeller(); 
};
const observer = new MutationObserver(main);
observer.observe(document.documentElement, { childList: true, subtree: true });
setTimeout(main, 1000);