// Game Catalog Loader - Lädt alle Spiele-Definitionen
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0
// STANDARD: IBM STANDARD - PERMANENT AKTIV

const fs = require('fs');
const path = require('path');

function loadAllGames() {
  const gamesDir = path.join(__dirname, 'definitions');
  const gameFiles = fs.readdirSync(gamesDir).filter(f => f.endsWith('.json'));
  
  const games = [];
  
  gameFiles.forEach(file => {
    try {
      const content = fs.readFileSync(path.join(gamesDir, file), 'utf8');
      const game = JSON.parse(content);
      games.push(game);
    } catch (e) {
      console.error(`Fehler beim Laden von ${file}:`, e.message);
    }
  });
  
  return games;
}

function getGamesByCategory(category) {
  return loadAllGames().filter(g => g.category === category);
}

function getGamesByEpoch(epoch) {
  return loadAllGames().filter(g => g.epoch === epoch);
}

function getGamesByPlayerCount(minPlayers, maxPlayers) {
  return loadAllGames().filter(g => 
    g.min_players <= maxPlayers && g.max_players >= minPlayers
  );
}

function getRandomGame() {
  const games = loadAllGames();
  return games[Math.floor(Math.random() * games.length)];
}

function getCommunicationGames() {
  return loadAllGames().filter(g => 
    g.ui_hints && g.ui_hints.communication_focus === true
  );
}

module.exports = {
  loadAllGames,
  getGamesByCategory,
  getGamesByEpoch,
  getGamesByPlayerCount,
  getRandomGame,
  getCommunicationGames
};


