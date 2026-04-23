# Changelog: 2026-04-23 - Template Entry Point

## Summary

Added "Create from Template" feature to allow users to quickly create new diagrams from pre-defined templates.

## Changes

### New Files

- `lib/diagramTemplates.ts` - Template data module with 18 pre-defined templates across 6 categories
- `components/dialogs/TemplateModal.tsx` - Template selection modal with category tabs and code preview

### Modified Files

- `hooks/useDiagramState.ts` - Extended `createDiagram` to support template name and engine
- `hooks/useWorkspaceActions.ts` - Added `handleCreateFromTemplate` function
- `components/sidebar/DiagramList.tsx` - Added "模板" button to open template modal
- `app/editor/page.tsx` - Integrated TemplateModal component

## Features

- Templates organized by category: 流程图, 时序图, 架构图, 数据可视化, 网络拓扑, 其他
- Code preview panel shows template code before creation
- Static export mode filters templates to locally-supported engines only
- Templates automatically set the correct diagram engine

## Related

- OpenSpec change: `create-from-template`
- Closes: Phase 3 roadmap item "Template library entry point"
