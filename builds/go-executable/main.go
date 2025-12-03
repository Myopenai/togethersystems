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
	// Bestimme Arbeitsverzeichnis
	workDir, err := os.Getwd()
	if err != nil {
		// Fallback: verwende Executable-Verzeichnis
		exePath, err2 := os.Executable()
		if err2 != nil {
			fmt.Println("FEHLER: Konnte Verzeichnis nicht bestimmen")
			fmt.Println("Druecke eine Taste zum Beenden...")
			var input string
			fmt.Scanln(&input)
			os.Exit(1)
		}
		workDir = filepath.Dir(exePath)
	}

	// Suche index.html
	var serveDir string
	searchPaths := []string{
		workDir,
		filepath.Join(workDir, ".."),
		filepath.Join(workDir, "..", ".."),
		filepath.Join(workDir, "..", "..", ".."),
		filepath.Join(workDir, "..", "..", "..", ".."),
		filepath.Join(workDir, "..", "..", "..", "..", ".."),
	}

	found := false
	for _, searchPath := range searchPaths {
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
	fmt.Println("OSTOSOS Server")
	fmt.Println("========================================")
	fmt.Printf("Server laeuft auf: http://localhost:%d\n", port)
	fmt.Printf("Verzeichnis: %s\n", serveDir)
	if !found {
		fmt.Println("HINWEIS: index.html nicht gefunden")
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
