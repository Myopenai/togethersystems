/**
 * THYNK ORDERS - Zugangsbegrenzung und Kauf-Anreiz System
 * NUR FÜR THYNK ORDERS PRODUCTION
 * 
 * T,.&T,,.&T,,,.TOGETHERSYSTEMS. INTERNATIONAL TTT T,.&T,,.T,,,.(C)
 */

(function() {
    'use strict';
    
    // THYNK-spezifische Konfiguration
    const THYNK_CONFIG = {
        slots: {
            free: {
                delayMultiplier: 1.5,
                maxDelaySeconds: 10,
                features: ['view_orders', 'create_order', 'view_products']
            },
            prickle_user: {
                delayMultiplier: 2.0,
                maxDelaySeconds: 15,
                progressiveDelay: true,
                features: ['view_orders', 'create_order', 'view_products', 'view_customers', 'export_data']
            },
            purchased: {
                delayMultiplier: 0.1,
                maxDelaySeconds: 0,
                features: ['all']
            },
            premium: {
                delayMultiplier: 0.0,
                maxDelaySeconds: 0,
                features: ['all', 'premium_reports', 'advanced_statistics', 'priority_support']
            }
        },
        gracePeriod: {
            enabled: true,
            durationHours: 168 // 7 Tage
        },
        functionDelays: {
            create_order: { free: 2000, prickle_user: 4000, purchased: 100, premium: 0 },
            export_data: { free: 5000, prickle_user: 10000, purchased: 500, premium: 0 },
            view_statistics: { free: 3000, prickle_user: 6000, purchased: 200, premium: 0 }
        }
    };
    
    // Lade User-Slot
    function getUserSlot() {
        let slot = localStorage.getItem('thynk_user_slot');
        
        if (!slot) {
            // Erster Start - prüfe Grace-Periode
            const firstUse = localStorage.getItem('thynk_first_use');
            if (!firstUse) {
                // Erste Verwendung
                localStorage.setItem('thynk_first_use', new Date().toISOString());
                localStorage.setItem('thynk_grace_period_end', new Date(Date.now() + THYNK_CONFIG.gracePeriod.durationHours * 60 * 60 * 1000).toISOString());
                slot = 'free';
            } else {
                // Prüfe Grace-Periode
                const graceEnd = new Date(localStorage.getItem('thynk_grace_period_end'));
                if (new Date() < graceEnd) {
                    slot = 'free'; // Grace-Periode aktiv
                } else {
                    slot = 'prickle_user'; // Grace-Periode abgelaufen
                }
            }
            localStorage.setItem('thynk_user_slot', slot);
        }
        
        return slot;
    }
    
    // Prüfe ob Grace-Periode aktiv
    function isGracePeriodActive() {
        const graceEnd = localStorage.getItem('thynk_grace_period_end');
        if (!graceEnd) return false;
        return new Date() < new Date(graceEnd);
    }
    
    // Berechne Verzögerung für Funktion
    function calculateDelay(functionName, slot) {
        const slotConfig = THYNK_CONFIG.slots[slot];
        const functionDelay = THYNK_CONFIG.functionDelays[functionName];
        
        if (!functionDelay) return 0;
        
        let baseDelay = functionDelay[slot] || 0;
        
        // Progressive Delay für Prickle-User
        if (slot === 'prickle_user' && slotConfig.progressiveDelay) {
            const firstUse = new Date(localStorage.getItem('thynk_first_use'));
            const daysSinceFirstUse = Math.floor((Date.now() - firstUse.getTime()) / (1000 * 60 * 60 * 24));
            const multiplier = 1 + (daysSinceFirstUse * 0.1); // 10% mehr pro Tag
            baseDelay = Math.floor(baseDelay * multiplier);
            baseDelay = Math.min(baseDelay, slotConfig.maxDelaySeconds * 1000);
        }
        
        // Grace-Periode: Keine Verzögerung
        if (isGracePeriodActive()) {
            return 0;
        }
        
        return baseDelay;
    }
    
    // Wende Verzögerung an
    function applyDelay(functionName, callback) {
        const slot = getUserSlot();
        const delay = calculateDelay(functionName, slot);
        
        if (delay > 0) {
            // Zeige Warte-Anzeige
            showDelayMessage(delay, slot);
            
            setTimeout(() => {
                hideDelayMessage();
                callback();
            }, delay);
        } else {
            callback();
        }
    }
    
    // Zeige Verzögerungs-Nachricht
    function showDelayMessage(delay, slot) {
        // Erstelle Overlay falls nicht vorhanden
        let overlay = document.getElementById('thynk-delay-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'thynk-delay-overlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                flex-direction: column;
            `;
            document.body.appendChild(overlay);
        }
        
        const seconds = Math.ceil(delay / 1000);
        overlay.innerHTML = `
            <div style="background: white; padding: 30px; border-radius: 10px; text-align: center; max-width: 500px;">
                <div style="font-size: 3em; margin-bottom: 20px;">⏳</div>
                <h2 style="color: #e94560; margin-bottom: 10px;">Bitte warten...</h2>
                <p style="color: #666; margin-bottom: 20px;">Diese Funktion wird in ${seconds} Sekunden verfügbar sein.</p>
                <div style="background: #f0f0f0; height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 20px;">
                    <div id="thynk-delay-progress" style="background: #e94560; height: 100%; width: 0%; transition: width 0.1s linear;"></div>
                </div>
                <p style="color: #666; font-size: 0.9em;">⚡ Upgrade auf Premium für sofortigen Zugriff!</p>
                <button id="thynk-upgrade-btn" style="margin-top: 15px; padding: 10px 20px; background: #e94560; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Upgrade auf Premium
                </button>
            </div>
        `;
        
        overlay.style.display = 'flex';
        
        // Progress Bar Animation
        const progressBar = document.getElementById('thynk-delay-progress');
        let progress = 0;
        const interval = setInterval(() => {
            progress += (100 / (delay / 100));
            if (progress >= 100) {
                clearInterval(interval);
                progress = 100;
            }
            progressBar.style.width = progress + '%';
        }, 100);
        
        // Upgrade Button
        document.getElementById('thynk-upgrade-btn')?.addEventListener('click', () => {
            showUpgradeModal();
        });
    }
    
    // Verstecke Verzögerungs-Nachricht
    function hideDelayMessage() {
        const overlay = document.getElementById('thynk-delay-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    // Zeige Upgrade-Modal
    function showUpgradeModal() {
        // Implementation für Upgrade-Modal
        alert('Premium-Upgrade: Bitte kontaktieren Sie uns für weitere Informationen.');
    }
    
    // Exportiere Funktionen
    window.ThynkAccessControl = {
        getUserSlot: getUserSlot,
        applyDelay: applyDelay,
        isGracePeriodActive: isGracePeriodActive,
        setSlot: function(slot) {
            localStorage.setItem('thynk_user_slot', slot);
        },
        activateVoucher: function(voucherCode) {
            // Voucher-Aktivierung
            // TODO: Implementierung
        }
    };
    
    // Automatische Anwendung bei Seitenladung
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        // Prüfe User-Slot beim Start
        const slot = getUserSlot();
        console.log(`[THYNK] User Slot: ${slot}, Grace Period: ${isGracePeriodActive() ? 'Active' : 'Inactive'}`);
    }
    
})();

