package main

import (
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"
)

func findFreePort(startPort int) (int, error) {
	for port := startPort; port < startPort+1000; port++ {
		addr := fmt.Sprintf(":%d", port)
		listener, err := net.Listen("tcp", addr)
		if err == nil {
			listener.Close()
			return port, nil
		}
	}
	return 0, fmt.Errorf("kein freier Port gefunden im Bereich %d-%d", startPort, startPort+1000)
}

func main() {
	// Bestimme Arbeitsverzeichnis - OSOTOSOS Ordner
	exePath, err := os.Executable()
	if err != nil {
		fmt.Println("FEHLER: Konnte Executable-Pfad nicht bestimmen")
		fmt.Println("Druecke eine Taste zum Beenden...")
		var input string
		fmt.Scanln(&input)
		os.Exit(1)
	}
	
	// OSOTOSOS Ordner finden
	workDir := filepath.Dir(exePath)
	
	// Suche OSOTOSOS-OS-COMPLETE-SYSTEM.html
	var serveDir string
	searchPaths := []string{
		workDir,
		filepath.Join(workDir, ".."),
		filepath.Join(workDir, "..", ".."),
		filepath.Join(workDir, "..", "..", ".."),
		filepath.Join(workDir, "..", "..", "..", ".."),
		filepath.Join(workDir, "..", "..", "..", "..", ".."),
		// Spezifisch OSOTOSOS-COMPLETE-OS-SYSTEM
		filepath.Join(workDir, "OSTOSOS-COMPLETE-OS-SYSTEM"),
		filepath.Join(workDir, "..", "OSTOSOS-COMPLETE-OS-SYSTEM"),
		filepath.Join(workDir, "..", "..", "OSTOSOS-COMPLETE-OS-SYSTEM"),
	}

	found := false
	for _, searchPath := range searchPaths {
		mainFile := filepath.Join(searchPath, "OSTOSOS-OS-COMPLETE-SYSTEM.html")
		if _, err := os.Stat(mainFile); err == nil {
			serveDir = searchPath
			found = true
			break
		}
		// Fallback: index.html
		indexPath := filepath.Join(searchPath, "index.html")
		if _, err := os.Stat(indexPath); err == nil {
			serveDir = searchPath
			found = true
			break
		}
	}

	// Wenn nicht gefunden, verwende aktuelles Verzeichnis
	if !found {
		serveDir = workDir
	}

	// Port bestimmen - automatisch freien Port finden
	startPort := 8080
	if len(os.Args) > 1 {
		if p, err := strconv.Atoi(os.Args[1]); err == nil {
			startPort = p
		}
	}

	// Finde freien Port
	port, err := findFreePort(startPort)
	if err != nil {
		fmt.Printf("FEHLER: %v\n", err)
		fmt.Println("Druecke eine Taste zum Beenden...")
		var input string
		fmt.Scanln(&input)
		os.Exit(1)
	}

	// Statischer File Server
	fs := http.FileServer(http.Dir(serveDir))
	http.Handle("/", http.StripPrefix("/", fs))

	// Ausgabe
	fmt.Println("========================================")
	fmt.Println("T,. OSTOSOS Operating System Server")
	fmt.Println("========================================")
	fmt.Printf("Server laeuft auf: http://localhost:%d\n", port)
	fmt.Printf("Verzeichnis: %s\n", serveDir)
	
	// Prüfe ob Hauptdatei existiert
	mainFile := filepath.Join(serveDir, "OSTOSOS-OS-COMPLETE-SYSTEM.html")
	if _, err := os.Stat(mainFile); err == nil {
		fmt.Printf("Hauptsystem: http://localhost:%d/OSTOSOS-OS-COMPLETE-SYSTEM.html\n", port)
	} else {
		fmt.Println("HINWEIS: OSTOSOS-OS-COMPLETE-SYSTEM.html nicht gefunden")
		fmt.Println("Server laeuft trotzdem - Dateien werden aus Verzeichnis bereitgestellt")
	}
	
	fmt.Println("Druecke Ctrl+C zum Beenden")
	fmt.Println("========================================")
	fmt.Println("")

	// Server mit Timeout starten
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", port),
		Handler:      nil,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Server starten
	if err := server.ListenAndServe(); err != nil {
		log.Printf("FEHLER: Server konnte nicht gestartet werden: %v\n", err)
		fmt.Println("Druecke eine Taste zum Beenden...")
		var input string
		fmt.Scanln(&input)
		os.Exit(1)
	}
}

