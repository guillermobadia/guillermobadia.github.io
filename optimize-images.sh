#!/bin/bash

# Script para optimizar imágenes y convertirlas a WebP
# Requiere: cwebp, jpegoptim, optipng, imagemagick

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Directorios a procesar
DIRS=("img" "blog/img" "es/img" "en/img")

# Función para optimizar imágenes
optimize_image() {
    local file=$1
    local ext="${file##*.}"
    local filename="${file%.*}"
    
    echo -e "${YELLOW}Procesando: $file${NC}"
    
    # Optimizar según el tipo de imagen
    case $ext in
        jpg|jpeg)
            jpegoptim --strip-all --max=85 "$file"
            cwebp -q 85 "$file" -o "${filename}.webp"
            ;;
        png)
            optipng -o7 "$file"
            cwebp -q 85 "$file" -o "${filename}.webp"
            ;;
        gif)
            if [ -f "$file" ]; then
                convert "$file" -coalesce -layers optimize "${filename}.gif"
            fi
            ;;
    esac
    
    echo -e "${GREEN}✓ Optimizado: $file${NC}"
}

# Función para procesar directorio
process_directory() {
    local dir=$1
    if [ -d "$dir" ]; then
        echo -e "${YELLOW}Procesando directorio: $dir${NC}"
        find "$dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" \) | while read -r file; do
            optimize_image "$file"
        done
    else
        echo -e "${RED}✗ Directorio no encontrado: $dir${NC}"
    fi
}

# Verificar dependencias
check_dependencies() {
    local deps=("cwebp" "jpegoptim" "optipng" "convert")
    local missing=0
    
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            echo -e "${RED}✗ Falta dependencia: $dep${NC}"
            missing=1
        fi
    done
    
    if [ $missing -eq 1 ]; then
        echo -e "${RED}Por favor, instala las dependencias faltantes:${NC}"
        echo "brew install webp jpegoptim optipng imagemagick"
        exit 1
    fi
}

# Main
echo -e "${YELLOW}Iniciando optimización de imágenes...${NC}"
check_dependencies

for dir in "${DIRS[@]}"; do
    process_directory "$dir"
done

echo -e "${GREEN}✓ Optimización completada${NC}"

# Generar reporte
echo -e "\n${YELLOW}Resumen de optimización:${NC}"
find . -type f \( -iname "*.webp" -o -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.gif" \) -exec du -h {} \; | sort -hr 