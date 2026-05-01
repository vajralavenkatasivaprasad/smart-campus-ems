#!/bin/bash
# ============================================================
# Smart Campus EMS - Quick Setup Script
# ============================================================

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║     Smart Campus EMS - Setup Script         ║"
echo "╚══════════════════════════════════════════════╝"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check Java
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -1)
    echo -e "${GREEN}✅ Java found: ${JAVA_VERSION}${NC}"
else
    echo -e "${RED}❌ Java not found. Please install Java 17+${NC}"
    exit 1
fi

# Check MySQL
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}✅ MySQL found${NC}"
else
    echo -e "${YELLOW}⚠️  MySQL not found in PATH${NC}"
fi

echo ""
echo -e "${BLUE}📋 Setup Instructions:${NC}"
echo ""
echo "1. DATABASE SETUP:"
echo "   mysql -u root -p < database/schema.sql"
echo ""
echo "2. CONFIGURE application.properties:"
echo "   backend/src/main/resources/application.properties"
echo "   → Update DB password and email credentials"
echo ""
echo "3. RUN BACKEND:"
echo "   cd backend && mvn spring-boot:run"
echo "   → Backend: http://localhost:8080"
echo ""
echo "4. RUN FRONTEND:"
echo "   Open frontend/index.html in browser"
echo "   OR use VS Code Live Server (port 5500)"
echo ""
echo -e "${YELLOW}🔑 Demo Credentials (no backend needed):${NC}"
echo "   Admin:     admin@campus.edu / password123"
echo "   Organizer: priya@campus.edu / password123"
echo "   Student:   rahul@campus.edu / password123"
echo ""
echo -e "${GREEN}✨ The frontend works in DEMO MODE without backend!${NC}"
echo ""
