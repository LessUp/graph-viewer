# Quick Start

Get GraphViewer up and running in under 5 minutes.

## Prerequisites

- **Node.js**: Version 20 or higher ([Download](https://nodejs.org/))
- **npm**: Version 10 or higher (included with Node.js)
- **Git**: For cloning the repository

Verify your environment:

```bash
node --version  # v20.0.0 or higher
npm --version   # 10.0.0 or higher
```

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/LessUp/graph-viewer.git
cd graph-viewer
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## First Steps

1. **Create Your First Diagram**
   - Select a diagram engine (e.g., Mermaid)
   - Choose a sample from the dropdown
   - Click "Render Preview"

2. **Export Your Diagram**
   - Click the export button in the preview toolbar
   - Choose from SVG, PNG (2x/4x), HTML, or Markdown formats

3. **Share Your Work**
   - Click "Share" to generate a compressed URL
   - Copy and share the link with others

## Next Steps

- Learn about [supported diagram engines](../04-features/02-rendering.md)
- Explore [export options](../04-features/01-export.md)
- Set up [Docker deployment](../03-deployment/01-docker.md)
