# Merchant Additional Image Prompt Pack

Purpose: raise Merchant Center image-per-offer quality by generating consistent second-angle images that match the current storefront style.

## What I Checked

- Existing Gemini image workflow and naming guidance from repo memory.
- Current image root at D:/Personal/PZM Website/GiminiImages.
- Existing iPhone outputs already used on the storefront.
- Current Merchant feed coverage after the feed fix.

## Current Recommendation

- Keep the current primary image as the main retail hero.
- Generate one additional image per offer first. Do not jump to three or four AI images unless the product is a priority SKU.
- Use a controlled secondary angle, not a radically different composition.
- Match the current visual language exactly: white background, centered object, restrained shadow, premium retail packshot, no props.

## Important AI Compliance Note

- Google allows additional AI-generated images, but their guidance says AI-generated images should retain metadata indicating they are AI-generated.
- The current optimizer at scripts/optimize_gemini_images.py converts images to WebP and does not explicitly preserve metadata, so treat this as a risk to review before scaling AI-image uploads heavily.

## Where This Is Most Worth Doing First

- Phones and tablets first.
- Then used laptops.
- Then gaming devices where the hardware shape is simple and easy to keep accurate.

Why: the current single-image gap is concentrated in phones, tablets, and used laptops, so that is where a second image will move the Merchant metric fastest.

## Visual Rules

- Pure white or near-white background only.
- One product only for the additional image.
- Bright neutral studio lighting.
- Soft grounded shadow.
- No hands, text, boxes, accessories, cables, props, or lifestyle scenes unless the accessory is included in the exact offer.
- No exaggerated reflections, concept styling, warped lens geometry, or fake finishes.
- Product should fill about 72 to 80 percent of the canvas height.
- Keep enough empty space for object-contain rendering.

## Best Secondary Angle By Product Type

### Phones

- Best secondary image: single-device rear three-quarter back-exterior angle.
- Avoid: top-down macro-looking crops as the only secondary image.

### Tablets

- Best secondary image: single-device rear three-quarter angle with slight side reveal.
- Alternative: front three-quarter with screen off if the primary image is already rear-focused.

### Laptops

- Best secondary image: open laptop at about 105 to 115 degrees, front-left three-quarter angle, black or neutral screen.
- Alternative: closed top-shell three-quarter angle for color and finish confirmation.

### Gaming Consoles

- Best secondary image: front-left or rear three-quarter hardware angle.
- Only include a controller if the exact offer includes the controller.

## Prompt Template: Brand-New Phone Secondary Angle

Use for: iPhone, Samsung, Redmi, Honor, Tecno, Nokia base product follow-up images.

```text
Create a photorealistic studio ecommerce image for the exact retail product "{PRODUCT_NAME}" for a professional electronics store. Show one device only in a rear three-quarter back-exterior view with no front display visible. Use manufacturer-accurate industrial design, accurate camera count and lens spacing, correct frame shape, correct button placement, and the exact official color finish "{COLOR}". Pure white background only. Square 1:1 composition. Center the device with generous white breathing room and a soft grounded shadow. Use bright neutral studio lighting with restrained reflections. No text, watermark, hands, props, packaging, wallpaper, cables, accessories, scratches, dust, fake concept styling, or distorted geometry. The result must look like a premium retail packshot that matches a clean ecommerce catalog.
```

## Prompt Template: Used Phone Secondary Angle

Use for: used phones where the primary image is already a front-and-back family render.

```text
Create a photorealistic studio ecommerce image for a used "{PRODUCT_NAME}" for a professional electronics store. Show one device only in a rear three-quarter back-exterior view. The product must remain manufacturer-accurate and look like a genuine used device in excellent condition: clean, fully intact, no cracks, no dents, no missing buttons, and no visible dirt. Use the exact color finish "{COLOR}" when known, otherwise use a neutral manufacturer-accurate finish. Pure white background only. Square 1:1 composition. Center the device with a soft grounded shadow and bright neutral studio lighting. No text, watermark, hands, props, packaging, wallpaper, accessories, fake cosmetic damage, dramatic reflections, or distorted camera geometry.
```

## Prompt Template: Tablet Secondary Angle

```text
Create a photorealistic studio ecommerce image for "{PRODUCT_NAME}" for a professional electronics store. Show one tablet only in a rear three-quarter angle with a slight edge reveal so the thin profile is visible. Use manufacturer-accurate proportions, camera placement, logo placement, speaker details, and the exact color finish "{COLOR}". Pure white background only. Square 1:1 composition. Center the tablet with generous white margins, a soft grounded shadow, and bright neutral studio lighting. No text, watermark, hands, keyboard cases, stylus, box, cables, wallpaper, props, scratches, or distorted geometry. The image should feel minimal, premium, and retail-ready.
```

## Prompt Template: Laptop Secondary Angle

```text
Create a photorealistic studio ecommerce image for "{PRODUCT_NAME}" for a professional electronics store. Show one laptop only, opened to about 110 degrees, in a front-left three-quarter angle. Keep the screen dark or softly neutral with no wallpaper content. Use manufacturer-accurate keyboard layout, trackpad proportions, hinge design, port placement, and the exact color finish "{COLOR}". Pure white background only. Square 1:1 composition. Center the laptop with a soft grounded shadow and bright neutral studio lighting. No text, watermark, hands, desk setup, accessories, cables, box, stickers, or exaggerated reflections. The result should match a clean premium ecommerce catalog image.
```

## Prompt Template: Gaming Console Secondary Angle

```text
Create a photorealistic studio ecommerce image for "{PRODUCT_NAME}" for a professional electronics store. Show the exact console hardware only in a clean three-quarter angle that clearly shows the shape, vents, front face, and finish. Include the controller only if the offer explicitly includes it. Use manufacturer-accurate proportions, ports, vents, panel lines, and color finish. Pure white background only. Square 1:1 composition. Center the product with a soft grounded shadow and bright neutral studio lighting. No text, watermark, hands, lifestyle scene, TV setup, cables, retail box, or dramatic reflections. The result must feel like a clean catalog packshot.
```

## Worked Examples

### Example 1: iPhone 16 Black secondary image

Suggested raw save path: D:/Personal/PZM Website/GiminiImages/phone/iphone/iphone-16-black-secondary-angle.png

```text
Create a photorealistic studio ecommerce image for the exact retail product "iPhone 16 128GB Black" for a professional electronics store. Show one device only in a rear three-quarter back-exterior view with no front display visible. Use accurate Apple base-model design language, the correct dual-camera layout, exact button placement, flat side edges, rounded corners, and the official Black finish. Pure white background only. Square 1:1 composition. Center the device with generous white breathing room and a soft grounded shadow. Use bright neutral studio lighting with restrained reflections. No text, watermark, hands, props, packaging, wallpaper, cables, accessories, dust, scratches, fake concept styling, or distorted geometry. The result must look like a premium retail packshot that matches a clean ecommerce catalog.
```

### Example 2: Samsung A17 4G secondary image

Suggested raw save path: D:/Personal/PZM Website/GiminiImages/phone/samsung/samsung-a17-4g-secondary-angle.png

```text
Create a photorealistic studio ecommerce image for the exact retail product "Samsung A17 4G 128GB / 4GB RAM" for a professional electronics store. Show one phone only in a rear three-quarter back-exterior view with no front display visible. Use Samsung-accurate proportions, camera spacing, flash placement, side-button layout, and the correct commercial finish for this model. Pure white background only. Square 1:1 composition. Center the device with generous white margins, a soft grounded shadow, and bright neutral studio lighting. No text, watermark, hands, props, packaging, wallpaper, accessories, scratches, dust, fake concept styling, or distorted geometry. The result must feel clean, premium, and catalog-ready.
```

### Example 3: Used iPad 8th Gen secondary image

Suggested raw save path: D:/Personal/PZM Website/GiminiImages/tablets/ipad/ipad-8th-gen-rose-gold-secondary-angle.png

```text
Create a photorealistic studio ecommerce image for a used "iPad 8th Gen 32GB Rose Gold" for a professional electronics store. Show one tablet only in a rear three-quarter angle with a slight side reveal. Keep the product manufacturer-accurate and in excellent used condition with no cracks, dents, dirt, or obvious heavy wear. Use the exact Rose Gold finish and accurate Apple tablet proportions, camera placement, and side-button details. Pure white background only. Square 1:1 composition. Center the tablet with generous white space, a soft grounded shadow, and bright neutral studio lighting. No text, watermark, hands, stylus, keyboard case, packaging, wallpaper, props, or distorted geometry.
```

### Example 4: Xbox One secondary image

Suggested raw save path: D:/Personal/PZM Website/GiminiImages/gaming/consoles/xbox-one-secondary-angle.png

```text
Create a photorealistic studio ecommerce image for "Xbox One" for a professional electronics store. Show the console hardware only in a front-left three-quarter angle that clearly shows the front face, side depth, and top surface. Use manufacturer-accurate panel lines, venting, port layout, finish, and proportions. Pure white background only. Square 1:1 composition. Center the console with a soft grounded shadow and bright neutral studio lighting. No text, watermark, hands, TV setup, accessories, cables, controller, retail box, or dramatic reflections. The result must look like a clean premium catalog packshot.
```

## Batch Strategy

1. Start with one extra image for the 24 strongest products and the active merchant priority SKUs.
2. Then cover phones and tablets with single-image offers.
3. Then cover used laptops.
4. Only after that spend time on cheaper low-priority used phones.

## What To Avoid

- Do not generate a very different background for image 2.
- Do not mix some products as single-device renders and others as dramatic lifestyle renders.
- Do not use macro camera-cluster crops as the only additional image.
- Do not generate front-screen wallpaper shots unless you can keep them manufacturer-accurate and neutral.
- Do not replace strong current primary images if the only benefit is “different”. Use alternate-angle images as support, not decoration.