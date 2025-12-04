package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "9090"
	}

	// Determine working directory - search for index.html
	workDir, err := os.Getwd()
	if err != nil {
		exePath, err2 := os.Executable()
		if err2 != nil {
			log.Fatal("FEHLER: Konnte Verzeichnis nicht bestimmen")
		}
		workDir = filepath.Dir(exePath)
	}

	// Search for index.html in current and parent directories
	var serveDir string
	searchPaths := []string{
		workDir,
		filepath.Join(workDir, ".."),
		filepath.Join(workDir, "..", ".."),
		filepath.Join(workDir, "..", "..", ".."),
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

	if !found {
		serveDir = workDir
	}

	mux := http.NewServeMux()

	// Serve index.html from determined directory
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			http.ServeFile(w, r, filepath.Join(serveDir, "index.html"))
		} else {
			http.ServeFile(w, r, filepath.Join(serveDir, r.URL.Path))
		}
	})

	// Status endpoint
	mux.HandleFunc("/api/status", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, `{"ok":true,"port":"%s","runtime":"go1.22","message":"CognitiveFabric server running"}`, port)
	})

	log.Printf("========================================")
	log.Printf("CognitiveFabric Server (Go 1.22)")
	log.Printf("========================================")
	log.Printf("Server running at: http://127.0.0.1:%s", port)
	log.Printf("Directory: %s", serveDir)
	if !found {
		log.Printf("HINWEIS: index.html not found in search paths")
	}
	log.Printf("Press Ctrl+C to stop")
	log.Printf("========================================")
	log.Printf("")

	log.Fatal(http.ListenAndServe(":"+port, mux))
}
