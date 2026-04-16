# Testing Specification

> BDD-style test specifications for GraphViewer.

## Unit Tests

### DiagramConfig

**File**: `__tests__/lib/diagramConfig.test.ts`

#### Test Cases

```gherkin
Feature: Diagram Configuration

  Scenario: Get engine categories
    Given the diagram config is loaded
    When calling getEngineCategories()
    Then it should return all 6 categories
    And each category should have at least one engine

  Scenario: Get Kroki type
    Given a valid engine name
    When calling getKrokiType('mermaid')
    Then it should return the correct Kroki type identifier

  Scenario: Invalid engine handling
    Given an unknown engine name
    When calling getKrokiType('unknown')
    Then it should throw an error

  Scenario: Engine exists check
    Given the diagram config
    When calling engineExists('mermaid')
    Then it should return true
    When calling engineExists('unknown')
    Then it should return false
```

### ExportUtils

**File**: `__tests__/lib/exportUtils.test.ts`

#### Test Cases

```gherkin
Feature: Export Utilities

  Scenario: Export to SVG
    Given a diagram with SVG content
    When calling exportToSVG(svgString)
    Then it should return the SVG string unchanged

  Scenario: Export to PNG
    Given a diagram with base64 PNG content
    When calling exportToPNG(base64String)
    Then it should trigger a download with correct MIME type

  Scenario: Export to PDF
    Given a diagram with base64 content
    When calling exportToPDF(base64String, 'a4')
    Then it should generate a PDF with correct dimensions

  Scenario: Export format mapping
    Given the export format mappings
    When checking exportFormats
    Then it should include: svg, png, pdf, html, md
```

### Render API Route

**File**: `__tests__/api/render.test.ts`

#### Test Cases

```gherkin
Feature: Render API

  Scenario: Successful SVG render
    Given a valid Mermaid diagram code
    When POST /api/render with { engine: 'mermaid', format: 'svg', code: '...' }
    Then it should return 200
    And response should contain svg field
    And contentType should be 'image/svg+xml'

  Scenario: Successful PNG render
    Given a valid PlantUML diagram code
    When POST /api/render with { engine: 'plantuml', format: 'png', code: '...' }
    Then it should return 200
    And response should contain base64 field
    And contentType should be 'image/png'

  Scenario: Engine not supported
    When POST /api/render with { engine: 'unknown', format: 'svg', code: '...' }
    Then it should return 400
    And error code should be 'ENGINE_NOT_SUPPORTED'

  Scenario: Code too large
    When POST /api/render with code exceeding 100KB
    Then it should return 400
    And error code should be 'CODE_TOO_LARGE'

  Scenario: Empty code
    When POST /api/render with empty code
    Then it should return 400

  Scenario: Cache behavior
    Given two identical render requests
    When making the requests within 120 seconds
    Then the second request should use cached result
```

## Integration Tests

### Workspace Management

**File**: `__tests__/hooks/useDiagramState.test.ts`

#### Test Cases

```gherkin
Feature: Diagram State Management

  Scenario: Create new diagram
    Given an empty workspace
    When creating a new diagram
    Then it should have a unique ID
    And default engine should be 'mermaid'
    And default format should be 'svg'
    And code should contain sample content

  Scenario: Switch active diagram
    Given a workspace with multiple diagrams
    When setting activeDiagramId to another diagram
    Then activeDiagramId should update
    And the correct diagram should be selected

  Scenario: Persist to localStorage
    Given a workspace with changes
    When the changes are saved
    Then localStorage should contain updated workspace

  Scenario: Load from localStorage
    Given a workspace in localStorage
    When the app loads
    Then it should restore the workspace state

  Scenario: URL share encoding
    Given a diagram with code
    When generating share URL
    Then the URL should contain compressed data
    And decoding should restore the original code
```

### Version History

**File**: `__tests__/hooks/useVersionActions.test.ts`

#### Test Cases

```gherkin
Feature: Version History

  Scenario: Auto-save version
    Given a diagram with changes
    When the debounce period passes (5s)
    Then a new version should be saved

  Scenario: Restore version
    Given a diagram with version history
    When restoring a previous version
    Then the diagram code should match the version
    And a new version should be created for the restore action

  Scenario: Version limit enforcement
    Given a diagram with 50 versions
    When saving a new version
    Then the oldest version should be removed
    And total versions should remain 50

  Scenario: Clear version history
    Given a diagram with versions
    When clearing version history
    Then all versions should be deleted
```

## Smoke Tests

**File**: `__tests__/smoke.test.ts`

#### Test Cases

```gherkin
Feature: Smoke Tests

  Scenario: Health check endpoint
    When GET /api/healthz
    Then it should return 200
    And response should contain { status: 'ok' }

  Scenario: App loads
    When loading the application
    Then it should return 200
    And the page should contain diagram editor

  Scenario: Static export compatibility
    Given GITHUB_PAGES=true
    When running npm run build:static
    Then the build should succeed
    And output should be in out/ directory
```

## Performance Benchmarks

**File**: `__benchmarks__/render.bench.ts`

#### Benchmarks

```gherkin
Feature: Performance Benchmarks

  Scenario: Local render performance
    When rendering a simple Mermaid diagram locally
    Then it should complete in < 500ms

  Scenario: Remote render performance (cache miss)
    When rendering a diagram via Kroki
    Then it should complete in < 5000ms

  Scenario: Remote render performance (cache hit)
    When rendering a cached diagram via Kroki
    Then it should complete in < 100ms

  Scenario: Export performance
    When exporting a large diagram (4x PNG)
    Then it should complete in < 3000ms

  Scenario: localStorage persistence
    When saving a workspace with 50 diagrams
    Then it should complete in < 200ms
```

## Acceptance Criteria

### Feature: Multi-Diagram Workspace

```gherkin
Feature: Multi-Diagram Workspace

  As a user
  I want to manage multiple diagrams in one workspace
  So that I can work on related diagrams together

  Acceptance Criteria:
  - Create new diagram from workspace
  - Delete diagram with confirmation
  - Rename diagram inline
  - Switch between diagrams via sidebar
  - Persist all diagrams in localStorage
  - Export individual diagrams
```

### Feature: Version History

```gherkin
Feature: Version History

  As a user
  I want to view and restore previous versions of my diagram
  So that I can recover from accidental changes

  Acceptance Criteria:
  - Auto-save versions every 5 seconds of inactivity
  - Keep max 50 versions per diagram
  - View version list with timestamps
  - Compare version with current code
  - Restore any previous version
  - Deleted versions are permanent
```

### Feature: Export Diagrams

```gherkin
Feature: Export Diagrams

  As a user
  I want to export my diagram in various formats
  So that I can use it in documents and presentations

  Acceptance Criteria:
  - Export as SVG (vector)
  - Export as PNG (1x, 2x, 4x resolution)
  - Export as PDF (A4, Letter, custom size)
  - Export as standalone HTML
  - Export as Markdown with embedded image
  - Export should use current render state
```
