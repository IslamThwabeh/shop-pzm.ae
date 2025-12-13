#!/bin/bash

# PZM iPhone Shop - R2 Image Upload Script
# This script uploads all product images to Cloudflare R2 bucket

echo "🚀 Starting R2 image upload..."
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Error: Wrangler CLI is not installed"
    echo "Please install it with: npm install -g wrangler"
    exit 1
fi

# Check if logged in
if ! wrangler whoami &> /dev/null; then
    echo "❌ Error: Not logged in to Cloudflare"
    echo "Please run: wrangler login"
    exit 1
fi

# Set bucket name
BUCKET_NAME="pzm-images"
FOLDER="products"

echo "📦 Uploading images to R2 bucket: $BUCKET_NAME/$FOLDER"
echo ""

# Array of image files
images=(
    "iphone-15-pro-max-black.png"
    "iphone-15-pro-max-gold.png"
    "iphone-15-pro-black.png"
    "iphone-15-black.png"
    "iphone-15-blue.png"
    "iphone-14-pro-black.png"
    "iphone-14-pro-max-black.png"
    "iphone-14-blue.png"
    "iphone-13-pro-gold.png"
    "iphone-13-black.png"
    "iphone-12-white.png"
)

# Upload each image
count=0
total=${#images[@]}

for image in "${images[@]}"; do
    ((count++))
    echo "[$count/$total] Uploading $image..."
    
    if [ -f "product-images/$image" ]; then
        wrangler r2 object put "$BUCKET_NAME/$FOLDER/$image" --file="product-images/$image" --remote
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully uploaded $image"
        else
            echo "❌ Failed to upload $image"
        fi
    else
        echo "⚠️  Warning: File not found: product-images/$image"
    fi
    
    echo ""
done

echo "🎉 Upload complete!"
echo ""
echo "Next steps:"
echo "1. Update your D1 database with image URLs"
echo "2. Run the SQL update script (see INSTALLATION_INSTRUCTIONS.md)"
echo "3. Deploy your frontend to test.pzm.ae"
echo ""
