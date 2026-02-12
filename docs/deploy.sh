#!/bin/bash

# ============================================
# Siruvapuri One-Step Docker Deployment
# Run this on your EC2 instance
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Siruvapuri Docker Deployment Script  ${NC}"
echo -e "${GREEN}========================================${NC}"

# Configuration
DOMAIN="siruvapuri.webexcel.in"
APP_DIR="/var/www/siruvapuri"
REPO_URL="https://github.com/webexcel/siruvapuri.git"

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Please run as root (sudo ./deploy.sh)${NC}"
  exit 1
fi

# Step 1: Install Docker if not present
echo -e "\n${GREEN}[1/7] Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    usermod -aG docker ubuntu
    rm get-docker.sh
fi

if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

docker --version
docker-compose --version

# Step 2: Clone or update repository
echo -e "\n${GREEN}[2/7] Setting up application directory...${NC}"
if [ -d "$APP_DIR" ]; then
    echo "Updating existing repository..."
    cd $APP_DIR
    git pull origin master
else
    echo "Cloning repository..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# Step 3: Create server .env file if not exists
echo -e "\n${GREEN}[3/7] Checking environment configuration...${NC}"
if [ ! -f "$APP_DIR/server/.env" ]; then
    echo -e "${YELLOW}Creating server/.env from template...${NC}"
    if [ -f "$APP_DIR/server/.env.example" ]; then
        cp $APP_DIR/server/.env.example $APP_DIR/server/.env
        echo -e "${RED}IMPORTANT: Edit $APP_DIR/server/.env with your production values!${NC}"
        echo "Press Enter to continue after editing, or Ctrl+C to exit..."
        read
    else
        echo -e "${RED}No .env.example found. Please create server/.env manually.${NC}"
        exit 1
    fi
fi

# Step 4: Create .env for docker-compose
echo -e "\n${GREEN}[4/7] Setting up Docker environment...${NC}"
cat > $APP_DIR/.env << EOF
VITE_API_URL=https://${DOMAIN}/api
EOF

# Step 5: Build and start containers
echo -e "\n${GREEN}[5/7] Building and starting Docker containers...${NC}"
cd $APP_DIR
docker-compose down --remove-orphans 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

# Step 6: Setup Apache
echo -e "\n${GREEN}[6/7] Configuring Apache...${NC}"

# Enable required modules
a2enmod rewrite proxy proxy_http headers ssl 2>/dev/null || true

# Copy Apache config
cp $APP_DIR/siruvapuri-apache.conf /etc/apache2/sites-available/siruvapuri.conf

# Enable site
a2ensite siruvapuri.conf 2>/dev/null || true

# Get SSL certificate if not exists
if [ ! -f "/etc/letsencrypt/live/${DOMAIN}/fullchain.pem" ]; then
    echo -e "${YELLOW}Getting SSL certificate...${NC}"
    # Temporarily disable SSL in config for certbot
    sed -i 's/SSLEngine on/#SSLEngine on/g' /etc/apache2/sites-available/siruvapuri.conf
    sed -i 's/SSLCertificate/#SSLCertificate/g' /etc/apache2/sites-available/siruvapuri.conf
    systemctl restart apache2

    certbot --apache -d $DOMAIN --non-interactive --agree-tos --email admin@webexcel.in || true
fi

# Restart Apache
systemctl restart apache2

# Step 7: Verify deployment
echo -e "\n${GREEN}[7/7] Verifying deployment...${NC}"
sleep 5

# Check containers
echo -e "\nContainer Status:"
docker-compose ps

# Check health
echo -e "\nHealth Checks:"
curl -s http://localhost:5000/api/health && echo " - API: OK" || echo " - API: FAILED"
curl -s http://localhost:3000 > /dev/null && echo " - Client: OK" || echo " - Client: FAILED"
curl -s http://localhost:3001 > /dev/null && echo " - Admin: OK" || echo " - Admin: FAILED"

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Main Site:  https://${DOMAIN}"
echo -e "API:        https://${DOMAIN}/api"
echo -e "Admin:      http://localhost:3001 (or setup subdomain)"
echo -e "\n${YELLOW}Useful Commands:${NC}"
echo -e "  docker-compose logs -f        # View logs"
echo -e "  docker-compose restart        # Restart services"
echo -e "  docker-compose down           # Stop services"
echo -e "  docker-compose up -d --build  # Rebuild and restart"
