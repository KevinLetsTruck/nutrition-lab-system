#!/bin/bash

# FNTP Nutrition System - Database Helper Commands

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}FNTP Nutrition System - Database Commands${NC}"
echo "========================================="
echo ""
echo "Available commands:"
echo ""
echo -e "${YELLOW}Start Database:${NC}"
echo "  docker-compose up -d"
echo ""
echo -e "${YELLOW}Stop Database:${NC}"
echo "  docker-compose down"
echo ""
echo -e "${YELLOW}View Logs:${NC}"
echo "  docker-compose logs -f postgres"
echo ""
echo -e "${YELLOW}Connect to Database:${NC}"
echo "  docker exec -it fntp_postgres psql -U fntp_admin -d fntp_nutrition"
echo ""
echo -e "${YELLOW}Reset Database (WARNING: Deletes all data):${NC}"
echo "  docker-compose down -v && docker-compose up -d"
echo ""
echo -e "${YELLOW}Backup Database:${NC}"
echo "  docker exec fntp_postgres pg_dump -U fntp_admin fntp_nutrition > backup_\$(date +%Y%m%d_%H%M%S).sql"
echo ""
echo -e "${YELLOW}Check Database Status:${NC}"
echo "  docker-compose ps"
echo ""
