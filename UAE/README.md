# Universe All Enterprises (UAE) System

A comprehensive enterprise management system for Universe All Enterprises, including CEOC management, licensing, and monetization features.

## Project Structure

```
UAE/
├── UAE-Core/               # Backend services and API
├── UAE-Portal/            # Frontend application
├── UAE-Docs/              # Documentation
├── UAE-Legal/             # Legal documents
├── UAE-Scripts/           # Utility scripts
└── docker-compose.yml     # Docker compose configuration
```

## Getting Started

### Prerequisites

- Node.js 16+
- MongoDB 5.0+
- Docker (optional, for containerized deployment)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   cd UAE-Core
   npm install
   
   cd ../UAE-Portal
   npm install
   ```

3. Configure environment variables (see .env.example files in each directory)

4. Start the development servers:
   ```bash
   # In UAE-Core
   npm run dev
   
   # In UAE-Portal
   npm start
   ```

## License

Proprietary - © 2025 Universe All Enterprises
