// Notary Manifest - Swift CLI Tool
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

import Foundation

struct Manifest: Codable {
    let name: String
    let data: String
}

func uploadManifest(pdfPath: String, apiUrl: String = "https://apple-pi.local/notary/manifest") {
    guard let url = URL(string: apiUrl) else {
        print("❌ Ungültige URL: \(apiUrl)")
        return
    }
    
    guard let pdfData = try? Data(contentsOf: URL(fileURLWithPath: pdfPath)) else {
        print("❌ Datei nicht gefunden: \(pdfPath)")
        return
    }
    
    let base64Data = pdfData.base64EncodedString()
    let manifest = Manifest(name: (pdfPath as NSString).lastPathComponent, data: base64Data)
    
    guard let jsonData = try? JSONEncoder().encode(manifest) else {
        print("❌ JSON-Encoding fehlgeschlagen")
        return
    }
    
    var request = URLRequest(url: url)
    request.httpMethod = "POST"
    request.addValue("application/json", forHTTPHeaderField: "Content-Type")
    request.httpBody = jsonData
    
    let sem = DispatchSemaphore(value: 0)
    
    URLSession.shared.dataTask(with: request) { data, response, error in
        if let error = error {
            print("❌ Fehler: \(error.localizedDescription)")
            sem.signal()
            return
        }
        
        if let httpResponse = response as? HTTPURLResponse {
            if httpResponse.statusCode == 201 {
                print("✅ Manifest erfolgreich hochgeladen")
                if let data = data, let json = try? JSONSerialization.jsonObject(with: data) {
                    print("📄 Antwort: \(json)")
                }
            } else {
                print("❌ HTTP \(httpResponse.statusCode)")
            }
        }
        
        sem.signal()
    }.resume()
    
    sem.wait()
}

// CLI
if CommandLine.arguments.count < 2 {
    print("Verwendung: NotaryManifest <pdf-datei> [api-url]")
    exit(1)
}

let pdfPath = CommandLine.arguments[1]
let apiUrl = CommandLine.arguments.count > 2 ? CommandLine.arguments[2] : "https://apple-pi.local/notary/manifest"

uploadManifest(pdfPath: pdfPath, apiUrl: apiUrl)


