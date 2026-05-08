/**
 * 导出工具 - 向后兼容层
 *
 * 此文件保持原有的导入路径可用，内部重定向到模块化的导出器
 *
 * @deprecated 请使用 `import { ... } from '@/lib/export'` 直接导入
 */

// 重导出所有内容
export * from './export';
