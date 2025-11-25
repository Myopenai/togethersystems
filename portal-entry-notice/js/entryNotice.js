// Portal-Einstiegs-Hinweis (Baustellenmodus)
(function () {
  const cfg = window.TS_ENTRY_CONFIG || {};
  const STORAGE_KEY = cfg.localStorageKey || "TS_PORTAL_ENTRY_NOTICE_ACK_V1";
  const SHOW_ALWAYS = !!cfg.showOnEveryVisit;

  function hasAcknowledged() {
    if (SHOW_ALWAYS) return false;
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  }

  function setAcknowledged() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignorieren
    }
  }

  function createOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "ts-entry-overlay";

    const modal = document.createElement("div");
    modal.id = "ts-entry-modal";

    const title = document.createElement("h1");
    title.innerHTML = (cfg.portalName || "Together Systems Portal") + " – Live im Baustellenmodus <span class='ts-entry-badge'>Pre-Phase</span>";

    const intro = document.createElement("p");
    intro.textContent = "Dieses Portal ist aktiv erreichbar und kann bereits genutzt werden. Gleichzeitig befindet es sich in einer laufenden Produktions- und Ausbauphase.";

    // Status-Sektion
    const sectionStatusH = document.createElement("h2");
    sectionStatusH.textContent = "Status: Baustelle, aber mit Nutzungsabsicht";
    const sectionStatusP1 = document.createElement("p");
    sectionStatusP1.textContent = "Alle Beteiligten – Initiator und mitprogrammierende Partner – arbeiten daran, volle Funktionalität während der laufenden Entwicklung sicherzustellen. Funktionen können sich ändern, neue Module kommen hinzu, Fehler können sichtbar werden.";

    // Daten-Sektion
    const sectionDataH = document.createElement("h2");
    sectionDataH.textContent = "Datensicherheit & eigener Speicherort";
    const sectionDataP1 = document.createElement("p");
    sectionDataP1.textContent = "Die Applikation ist technisch so programmiert, dass deine Daten im Online-Portal und im Offline-Manifest-Portal erhalten bleiben sollen – auch bei weiteren Umbauarbeiten.";
    const sectionDataP2 = document.createElement("p");
    sectionDataP2.textContent = "Trotzdem gilt: Bitte sichere wichtige Dokumente und Texte zusätzlich in einem eigenen lokalen Ordner auf deinem Gerät (projektbezogen). So bist du doppelt abgesichert, falls systemarchitektonische Änderungen in der Praxis unerwartet wirken.";

    // Fehler-Sektion
    const sectionErrorH = document.createElement("h2");
    sectionErrorH.textContent = "Fehlermeldungen & technische Hinweise";
    const sectionErrorP1 = document.createElement("p");
    sectionErrorP1.textContent = "Du kannst auf der Oberfläche falsche oder irreführende Fehlermeldungen sehen (z. B. API-/JSON-Fehler, Hinweise auf nicht vorhandene Funktionen). Diese Meldungen sind meist systemtechnischer Natur und hängen mit verteilten Serverstrukturen und noch fehlenden Modulen zusammen.";
    const sectionErrorP2 = document.createElement("p");
    sectionErrorP2.textContent = "Wichtiger Hinweis: Diese Fehlermeldungen bedeuten in der Regel nicht, dass deine Daten verloren gehen. Backends können Korrekturen im Hintergrund vornehmen, ohne direkten Hinweis an dich. Langfristig soll die Darstellung solcher Fehlermeldungen bereinigt werden.";

    // Mitmachen-Sektion
    const sectionParticipateH = document.createElement("h2");
    sectionParticipateH.textContent = "Aktiv mitmachen – für alle Niveaus";
    const sectionParticipateP1 = document.createElement("p");
    sectionParticipateP1.textContent = "Du bist herzlich eingeladen, das Portal bereits jetzt aktiv zu nutzen: Projekte anlegen, Content erstellen, als Unternehmen oder interessierte Organisation mitdenken. Besonders willkommen sind Menschen mit technischen Kenntnissen oder Erfahrungen in der Softwareproduktion.";
    const sectionParticipateP2 = document.createElement("p");
    sectionParticipateP2.textContent = "Mitmachen können: Prompt-/No-Code-Nutzer, erfahrene Full-Stack-Developer, mittelständische Betriebe, große Industrieunternehmen und alle, die an einer zukunftsträchtigen, generationsübergreifenden Applikation mitwirken wollen.";
    const sectionParticipateP3 = document.createElement("p");
    sectionParticipateP3.innerHTML = `Über das veröffentlichte Projekt-Repository (z. B. auf <a href="${cfg.githubUrl || '#'}" target="_blank" rel="noopener">GitHub</a>) kannst du dich dem Projekt anschließen, Beiträge leisten und eigene Ideen einbringen.`;

    // Monetarisierung-Sektion
    const sectionMoneyH = document.createElement("h2");
    sectionMoneyH.textContent = "Monetarisierung – Vision und Beteiligung";
    const sectionMoneyP1 = document.createElement("p");
    sectionMoneyP1.textContent = "Die Frage nach Geld und Vergütung wird in diesem Projekt bewusst an das Ende des Weges gestellt: Zuerst steht die gemeinsame Entwicklung eines funktionierenden Produkts und einer starken Community.";
    const sectionMoneyP2 = document.createElement("p");
    sectionMoneyP2.textContent = "Wenn das System erfolgreich ist und eine hohe Anziehungskraft erreicht, können Investoren, Werbepartner und Integrationsprojekte hinzukommen. Dann sollen finanzielle Mittel so verteilt werden, dass alle beitragenden verifizierten Teilnehmer einen fairen Anteil erhalten – unabhängig davon, ob ihr Beitrag Ideen, Content, Code oder konzeptionelle Impulse war.";
    const sectionMoneyP3 = document.createElement("p");
    sectionMoneyP3.textContent = "Das Beteiligungsmodell ist eine Vision und kein Rechts- oder Zahlungsversprechen. Die technische Architektur soll Beiträge und beteiligte Identitäten (über das Manifest-Offline-Portal) nachvollziehbar machen. Eine mögliche Wallet-Integration (z. B. MetaMask) kann später genutzt werden, um Guthaben in Fiat oder Coins zu verwalten.";

    const sectionOutroP = document.createElement("p");
    sectionOutroP.innerHTML = "Der Initiator versteht dieses Projekt als Partnerschaft: Kommunikation zuerst, gemeinsame Entwicklung danach, Monetarisierung als möglicher dritter Schritt – abhängig vom tatsächlichen Erfolg und der Stärke der gemeinsamen Arbeit.";

    const smallNote = document.createElement("small");
    smallNote.textContent = "Hinweis: Dieses Portal ist ein lebendes System. Durch deine Nutzung und deine Rückmeldungen hilfst du mit, Fehler zu erkennen, Lösungen zu verbessern und neue Funktionen zu entwickeln.";

    // Buttons
    const buttons = document.createElement("div");
    buttons.id = "ts-entry-buttons";

    const btnPrimary = document.createElement("button");
    btnPrimary.className = "ts-entry-btn ts-entry-btn-primary";
    btnPrimary.textContent = "Verstanden und Portal nutzen";
    btnPrimary.addEventListener("click", () => {
      setAcknowledged();
      hideOverlay();
    });

    const btnLater = document.createElement("button");
    btnLater.className = "ts-entry-btn ts-entry-btn-ghost";
    btnLater.textContent = "Später nochmal anzeigen";
    btnLater.addEventListener("click", () => {
      hideOverlay();
    });

    const btnMore = document.createElement("button");
    btnMore.className = "ts-entry-btn ts-entry-btn-link";
    btnMore.textContent = "Mehr erfahren & Mitmachen";
    btnMore.addEventListener("click", () => {
      if (cfg.githubUrl) {
        window.open(cfg.githubUrl, "_blank", "noopener,noreferrer");
      } else {
        alert("GitHub-/Projekt-Link ist noch nicht konfiguriert.");
      }
    });

    buttons.appendChild(btnPrimary);
    buttons.appendChild(btnLater);
    buttons.appendChild(btnMore);

    // Alles zusammenfügen
    modal.appendChild(title);
    modal.appendChild(intro);
    modal.appendChild(sectionStatusH);
    modal.appendChild(sectionStatusP1);
    modal.appendChild(sectionDataH);
    modal.appendChild(sectionDataP1);
    modal.appendChild(sectionDataP2);
    modal.appendChild(sectionErrorH);
    modal.appendChild(sectionErrorP1);
    modal.appendChild(sectionErrorP2);
    modal.appendChild(sectionParticipateH);
    modal.appendChild(sectionParticipateP1);
    modal.appendChild(sectionParticipateP2);
    modal.appendChild(sectionParticipateP3);
    modal.appendChild(sectionMoneyH);
    modal.appendChild(sectionMoneyP1);
    modal.appendChild(sectionMoneyP2);
    modal.appendChild(sectionMoneyP3);
    modal.appendChild(sectionOutroP);
    modal.appendChild(smallNote);
    modal.appendChild(buttons);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    return overlay;
  }

  function showOverlay() {
    let overlay = document.getElementById("ts-entry-overlay");
    if (!overlay) {
      overlay = createOverlay();
    }
    overlay.style.display = "flex";
  }

  function hideOverlay() {
    const overlay = document.getElementById("ts-entry-overlay");
    if (overlay) {
      overlay.style.display = "none";
    }
  }

  window.PortalEntryNotice = {
    init() {
      if (hasAcknowledged()) return;
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showOverlay);
      } else {
        showOverlay();
      }
    }
  };
})();


