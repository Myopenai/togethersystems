# Add Sample Content Script
# Adds sample content to the project for development and testing

param(
    [string]$TargetPath = "$PSScriptRoot\..\src\samples",
    [ValidateSet("all", "html", "css", "js", "data")]
    [string]$ContentType = "all",
    [switch]$Force
)

# Function to create sample HTML file
function Add-SampleHtml {
    $htmlContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample Page</title>
    <link rel="stylesheet" href="../css/sample.css">
</head>
<body>
    <header>
        <h1>Welcome to Sample Page</h1>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="home">
            <h2>Home Section</h2>
            <p>This is a sample home section.</p>
        </section>
        
        <section id="about">
            <h2>About Us</h2>
            <p>This is a sample about section.</p>
        </section>
        
        <section id="contact">
            <h2>Contact Us</h2>
            <form id="contactForm">
                <div class="form-group">
                    <label for="name">Name:</label>
                    <input type="text" id="name" name="name" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" required>
                </div>
                <div class="form-group">
                    <label for="message">Message:</label>
                    <textarea id="message" name="message" required></textarea>
                </div>
                <button type="submit">Send Message</button>
            </form>
        </section>
    </main>

    <footer>
        <p>&copy; $(Get-Date -Format 'yyyy') Sample Project. All rights reserved.</p>
    </footer>

    <script src="../js/sample.js"></script>
</body>
</html>
"@

    $filePath = Join-Path -Path $TargetPath -ChildPath "sample.html"
    if (-not (Test-Path $filePath) -or $Force) {
        $htmlContent | Out-File -FilePath $filePath -Encoding utf8 -Force
        Write-Host "Created sample HTML file: $filePath" -ForegroundColor Green
    } else {
        Write-Host "Sample HTML file already exists. Use -Force to overwrite." -ForegroundColor Yellow
    }
}

# Function to create sample CSS file
function Add-SampleCss {
    $cssContent = @"
/* Sample CSS File */
:root {
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --text-color: #333;
    --light-gray: #f5f5f5;
    --dark-gray: #777;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: #fff;
}

header {
    background-color: var(--primary-color);
    color: white;
    padding: 1rem 2rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

nav ul {
    display: flex;
    list-style: none;
    margin-top: 1rem;
}

nav ul li {
    margin-right: 1.5rem;
}

nav ul li a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
}

nav ul li a:hover {
    color: #f1c40f;
}

main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

section {
    margin-bottom: 3rem;
    padding: 2rem;
    background-color: var(--light-gray);
    border-radius: 5px;
}

h1, h2, h3 {
    margin-bottom: 1rem;
    color: var(--primary-color);
}

.form-group {
    margin-bottom: 1.5rem;
}

label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

input[type="text"],
input[type="email"],
textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
}

textarea {
    min-height: 150px;
    resize: vertical;
}

button {
    background-color: var(--secondary-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

button:hover {
    background-color: #27ae60;
}

footer {
    text-align: center;
    padding: 1.5rem;
    background-color: var(--dark-gray);
    color: white;
    margin-top: 2rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    nav ul {
        flex-direction: column;
    }
    
    nav ul li {
        margin-bottom: 0.5rem;
    }
    
    main {
        padding: 1rem;
    }
    
    section {
        padding: 1rem;
    }
}
"@

    $cssDir = Join-Path -Path $TargetPath -ChildPath "..\css"
    if (-not (Test-Path $cssDir)) {
        New-Item -ItemType Directory -Path $cssDir -Force | Out-Null
    }
    
    $filePath = Join-Path -Path $cssDir -ChildPath "sample.css"
    if (-not (Test-Path $filePath) -or $Force) {
        $cssContent | Out-File -FilePath $filePath -Encoding utf8 -Force
        Write-Host "Created sample CSS file: $filePath" -ForegroundColor Green
    } else {
        Write-Host "Sample CSS file already exists. Use -Force to overwrite." -ForegroundColor Yellow
    }
}

# Function to create sample JavaScript file
function Add-SampleJs {
    $jsContent = @"
/**
 * Sample JavaScript File
 * Contains common functionality for the sample application
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    console.log('Application initialized');
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Adjust for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Form submission handling
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const formObject = {};
            formData.forEach((value, key) => {
                formObject[key] = value;
            });
            
            // In a real application, you would send this data to a server
            console.log('Form submitted:', formObject);
            
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
        });
    }
    
    // Add animation to sections when they come into view
    const animateOnScroll = function() {
        const sections = document.querySelectorAll('section');
        
        sections.forEach(section => {
            const sectionTop = section.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (sectionTop < windowHeight * 0.85) {
                section.style.opacity = '1';
                section.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Initial call to check visible sections
    animateOnScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', animateOnScroll);
    
    // Set initial styles for animation
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });
});

// Sample utility functions
const Utils = {
    // Format date to readable string
    formatDate: function(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Debounce function for performance optimization
    debounce: function(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    },
    
    // Check if element is in viewport
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};
"@

    $jsDir = Join-Path -Path $TargetPath -ChildPath "..\js"
    if (-not (Test-Path $jsDir)) {
        New-Item -ItemType Directory -Path $jsDir -Force | Out-Null
    }
    
    $filePath = Join-Path -Path $jsDir -ChildPath "sample.js"
    if (-not (Test-Path $filePath) -or $Force) {
        $jsContent | Out-File -FilePath $filePath -Encoding utf8 -Force
        Write-Host "Created sample JavaScript file: $filePath" -ForegroundColor Green
    } else {
        Write-Host "Sample JavaScript file already exists. Use -Force to overwrite." -ForegroundColor Yellow
    }
}

# Function to create sample data file
function Add-SampleData {
    $sampleData = @{
        users = @(
            @{
                id = 1
                name = "John Doe"
                email = "john.doe@example.com"
                role = "Admin"
                joinDate = "2023-01-15"
            },
            @{
                id = 2
                name = "Jane Smith"
                email = "jane.smith@example.com"
                role = "Editor"
                joinDate = "2023-02-20"
            },
            @{
                id = 3
                name = "Bob Johnson"
                email = "bob.johnson@example.com"
                role = "Viewer"
                joinDate = "2023-03-10"
            }
        )
        products = @(
            @{
                id = 101
                name = "Product A"
                description = "High-quality product with advanced features"
                price = 199.99
                inStock = $true
                categories = @("Electronics", "Gadgets")
            },
            @{
                id = 102
                name = "Product B"
                description = "Essential item for everyday use"
                price = 49.99
                inStock = $true
                categories = @("Home", "Essentials")
            },
            @{
                id = 103
                name = "Product C"
                description = "Premium service package"
                price = 299.99
                inStock = $false
                categories = @("Services", "Premium")
            }
        )
        settings = @{
            theme = "light"
            notifications = @{
                email = $true
                push = $true
                frequency = "daily"
            }
            features = @("darkMode", "notifications", "analytics")
            version = "1.0.0"
        }
    }

    $dataDir = Join-Path -Path $TargetPath -ChildPath "..\data"
    if (-not (Test-Path $dataDir)) {
        New-Item -ItemType Directory -Path $dataDir -Force | Out-Null
    }
    
    $filePath = Join-Path -Path $dataDir -ChildPath "sample-data.json"
    if (-not (Test-Path $filePath) -or $Force) {
        $sampleData | ConvertTo-Json -Depth 10 | Out-File -FilePath $filePath -Encoding utf8 -Force
        Write-Host "Created sample data file: $filePath" -ForegroundColor Green
    } else {
        Write-Host "Sample data file already exists. Use -Force to overwrite." -ForegroundColor Yellow
    }
}

# Main script execution
Write-Host "=== Add Sample Content ===" -ForegroundColor Cyan

# Create target directory if it doesn't exist
if (-not (Test-Path $TargetPath)) {
    New-Item -ItemType Directory -Path $TargetPath -Force | Out-Null
    Write-Host "Created target directory: $TargetPath" -ForegroundColor Green
}

# Add requested content types
switch ($ContentType) {
    "html" { 
        Add-SampleHtml
    }
    "css" { 
        Add-SampleCss 
    }
    "js" { 
        Add-SampleJs 
    }
    "data" { 
        Add-SampleData 
    }
    "all" {
        Add-SampleHtml
        Add-SampleCss
        Add-SampleJs
        Add-SampleData
    }
    default {
        Write-Host "Invalid content type specified." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Sample content generation completed!" -ForegroundColor Green
