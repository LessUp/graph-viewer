#!/bin/bash

# 导出功能修复验证脚本

echo "🔍 验证导出功能修复..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1"
        return 0
    else
        echo -e "${RED}✗${NC} $1 (缺失)"
        return 1
    fi
}

check_content() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $1 包含 '$2'"
        return 0
    else
        echo -e "${RED}✗${NC} $1 不包含 '$2'"
        return 1
    fi
}

# 计数器
total=0
passed=0

echo "📁 检查核心文件..."
echo "---"

# 检查主要文件
files=(
    "lib/exportUtils.ts"
    "lib/exportUtils.backup.ts"
    "components/PreviewToolbar.tsx"
    "components/PreviewPanel.tsx"
)

for file in "${files[@]}"; do
    ((total++))
    if check_file "$file"; then
        ((passed++))
    fi
done

echo ""
echo "📄 检查文档文件..."
echo "---"

# 检查文档
docs=(
    "docs/EXPORT_IMPROVEMENTS.md"
    "docs/TESTING_GUIDE.md"
    "changelog/2025-12-08-export-quality-improvements.md"
    "EXPORT_FIX_SUMMARY.md"
    "QUICK_START.md"
    "test-export.html"
)

for doc in "${docs[@]}"; do
    ((total++))
    if check_file "$doc"; then
        ((passed++))
    fi
done

echo ""
echo "🔬 检查关键功能..."
echo "---"

# 检查关键代码
((total++))
if check_content "lib/exportUtils.ts" "html2canvas"; then
    ((passed++))
fi

((total++))
if check_content "lib/exportUtils.ts" "preprocessSvg"; then
    ((passed++))
fi

((total++))
if check_content "lib/exportUtils.ts" "svgToCanvas"; then
    ((passed++))
fi

((total++))
if check_content "lib/exportUtils.ts" "exportPng"; then
    ((passed++))
fi

((total++))
if check_content "lib/exportUtils.ts" "copyPngToClipboard"; then
    ((passed++))
fi

echo ""
echo "📦 检查依赖..."
echo "---"

((total++))
if check_content "package.json" "html2canvas"; then
    ((passed++))
fi

echo ""
echo "================================"
echo "验证结果: $passed/$total 通过"
echo "================================"

if [ $passed -eq $total ]; then
    echo -e "${GREEN}✅ 所有检查通过！${NC}"
    echo ""
    echo "🚀 下一步："
    echo "1. 运行 'npm install' 安装依赖"
    echo "2. 运行 'npm run dev' 启动开发服务器"
    echo "3. 或者直接打开 'test-export.html' 进行快速测试"
    echo ""
    echo "📖 查看文档："
    echo "- QUICK_START.md - 快速启动指南"
    echo "- EXPORT_FIX_SUMMARY.md - 修复总结"
    echo "- docs/EXPORT_IMPROVEMENTS.md - 详细改进说明"
    exit 0
else
    echo -e "${RED}❌ 有 $((total - passed)) 项检查失败${NC}"
    echo ""
    echo "请检查缺失的文件或内容"
    exit 1
fi
