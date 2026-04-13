# Merchant Reference-Image Angle Prompts

Purpose: use an existing approved product image as Gemini reference input, then generate two additional angles that stay visually consistent with the current storefront style.

## Short Answer

Yes, you can give Gemini the current image and ask it to generate new angles.

That is the right workflow for this catalog, with two constraints:

- Generate one new angle per prompt, not two images in one single output.
- Keep the new images in the same visual language as the current approved image.

## Recommended Image Strategy

For most products:

1. Image 1: existing approved primary image
2. Image 2: rear three-quarter alternate angle
3. Image 3: front three-quarter or side-reveal angle

For priority flagship SKUs only:

4. Image 4: box contents, port-side reveal, hinge detail, or included accessory view only if it is accurate to the exact offer

## Best Practical Recommendation

- Two extra images is a strong target.
- Three total images per offer is a very good operational standard.
- Four total images is better only when you can keep accuracy and consistency high.

For this store, the best rollout is:

- Get high-priority products to 3 total images first.
- Use 4 total images only for best-selling iPhones, iPads, Samsung models, and selected laptops.

## When Not To Use AI Alternate Angles

- Avoid AI alternate angles for visibly worn used devices when the real device has scratches, dents, or battery-health screens you should show honestly.
- Avoid AI-generated accessory images unless the accessory is actually included in the exact offer.
- Avoid lifestyle scenes for Merchant additional images.

## Reference-Input Workflow

For each product:

1. Attach the current approved image to Gemini as the only reference image.
2. Tell Gemini to preserve the exact product identity, finish, proportions, and retail style from the reference.
3. Ask for one new angle only.
4. Save the raw output immediately into the correct D:/Personal/PZM Website/GiminiImages folder with the exact filename already planned.
5. Repeat for the second additional angle.

## Prompt Writing Rule

Always say:

- use the attached reference image as the visual source of truth
- preserve the same device identity and finish
- keep the same clean ecommerce style
- change only the camera angle

## Master Prompt Template: Image 2

Use this for the first alternate image.

```text
Use the attached reference image as the visual source of truth for the exact product identity, finish, proportions, and retail style. Create one new photorealistic ecommerce image of the same product in a rear three-quarter alternate angle. Preserve the same device model, same color finish, same camera layout, same frame shape, and same premium clean studio look as the reference image. Keep the background pure white, the composition centered, the shadow soft and grounded, and the lighting bright and neutral. Show one product only. Do not add text, watermark, hands, props, packaging, wallpaper, accessories, cables, dust, scratches, fake reflections, extra lenses, warped geometry, or any design changes. The goal is to create a second catalog image that clearly looks like the same product from a different angle, not a different render style.
```

## Master Prompt Template: Image 3

Use this for the second alternate image.

```text
Use the attached reference image as the visual source of truth for the exact product identity, finish, proportions, and retail style. Create one new photorealistic ecommerce image of the same product in a front three-quarter or side-reveal alternate angle, while keeping the same product color, same hardware shape, same camera accuracy, and same premium studio style as the reference image. Keep the background pure white, the product centered, the lighting bright and neutral, and the shadow soft and subtle. Show one product only. Do not add text, watermark, hands, props, packaging, accessories, wallpaper, cables, dramatic reflections, fake wear, or any changes to the device design. The goal is to create a third catalog image that still feels like part of the same product image set.
```

## Category-Specific Angle Rules

### Phones

- Image 2: rear three-quarter back angle
- Image 3: front three-quarter screen-off angle or side-reveal angle
- Optional image 4: camera-side detail angle only if the camera geometry stays accurate

### Tablets

- Image 2: rear three-quarter tablet angle
- Image 3: front three-quarter screen-off angle
- Optional image 4: thin side profile angle

### Laptops

- Image 2: open front-left three-quarter angle
- Image 3: closed top-shell three-quarter angle
- Optional image 4: port-side reveal or keyboard deck angle

### Gaming Consoles

- Image 2: front-left three-quarter hardware angle
- Image 3: rear or side vent reveal angle
- Optional image 4: included controller image only if the controller is included in the exact offer

## Worked Example: iPhone 16 Black

Current approved reference image path:

```text
D:/Personal/PZM Website/GiminiImages/phone/iphone/iphone-16-black.webp
```

Generate image 2 and save raw output here:

```text
D:/Personal/PZM Website/GiminiImages/phone/iphone/iphone-16-black-angle-2.png
```

Prompt for image 2:

```text
Use the attached reference image at D:/Personal/PZM Website/GiminiImages/phone/iphone/iphone-16-black.webp as the visual source of truth for the exact Apple iPhone 16 in Black. Create one new photorealistic ecommerce image of the same phone in a rear three-quarter alternate angle. Preserve the exact Apple base-model design language, the same Black finish, the same dual-camera layout, the same flat side edges, the same centered rear logo position, and the same premium minimal studio style as the reference image. Keep the background pure white, the composition centered, the lighting bright and neutral, and the shadow soft and grounded. Show one phone only. Do not add text, watermark, hands, props, packaging, wallpaper, accessories, cables, fake reflections, extra camera elements, or distorted geometry. The result must feel like image 2 of the same approved product set.
```

Generate image 3 and save raw output here:

```text
D:/Personal/PZM Website/GiminiImages/phone/iphone/iphone-16-black-angle-3.png
```

Prompt for image 3:

```text
Use the attached reference image at D:/Personal/PZM Website/GiminiImages/phone/iphone/iphone-16-black.webp as the visual source of truth for the exact Apple iPhone 16 in Black. Create one new photorealistic ecommerce image of the same phone in a front three-quarter screen-off angle with a slight side reveal. Preserve the exact Black finish, the same Apple hardware proportions, the same button placement, the same slim premium silhouette, and the same clean retail studio style as the reference image. Keep the background pure white, the composition centered, the lighting bright and neutral, and the shadow soft and subtle. Show one phone only. Do not add wallpaper, text, watermark, hands, props, packaging, cables, accessories, reflections that overpower the device, or any geometry changes. The result must clearly belong to the same image family as the reference image.
```

## Worked Example: Used iPad 8th Gen Rose Gold

Current approved reference image path:

```text
D:/Personal/PZM Website/GiminiImages/tablets/ipad/ipad-8th-gen-rose-gold.webp
```

Generate image 2 and save raw output here:

```text
D:/Personal/PZM Website/GiminiImages/tablets/ipad/ipad-8th-gen-rose-gold-angle-2.png
```

Prompt for image 2:

```text
Use the attached reference image at D:/Personal/PZM Website/GiminiImages/tablets/ipad/ipad-8th-gen-rose-gold.webp as the visual source of truth for the exact used iPad 8th Gen Rose Gold. Create one new photorealistic ecommerce image of the same tablet in a rear three-quarter alternate angle. Preserve the exact tablet identity, same Rose Gold finish, same Apple proportions, same camera placement, and the same premium clean white-background retail style as the reference image. Keep the tablet looking like a real used device in excellent condition, with no cracks, dents, dirt, or fake cosmetic damage. Show one tablet only. Pure white background, centered composition, bright neutral studio lighting, and soft grounded shadow. No text, watermark, hands, stylus, keyboard case, box, cables, wallpaper, props, or distorted geometry.
```

Generate image 3 and save raw output here:

```text
D:/Personal/PZM Website/GiminiImages/tablets/ipad/ipad-8th-gen-rose-gold-angle-3.png
```

Prompt for image 3:

```text
Use the attached reference image at D:/Personal/PZM Website/GiminiImages/tablets/ipad/ipad-8th-gen-rose-gold.webp as the visual source of truth for the exact used iPad 8th Gen Rose Gold. Create one new photorealistic ecommerce image of the same tablet in a front three-quarter screen-off angle. Preserve the same tablet proportions, same finish, same clean premium retail style, and same restrained studio lighting as the reference image. Keep the background pure white, the device centered, and the shadow soft and realistic. Show one tablet only. Do not add wallpaper, text, watermark, hands, keyboard cases, stylus, packaging, accessories, or any non-accurate hardware details.
```

## Worked Example: Laptop

Current approved reference image path:

```text
D:/Personal/PZM Website/GiminiImages/laptops/apple/{FILE_NAME}.webp
```

Generate image 2 and save raw output here:

```text
D:/Personal/PZM Website/GiminiImages/laptops/apple/{FILE_STEM}-angle-2.png
```

Prompt for image 2:

```text
Use the attached reference image as the visual source of truth for the exact laptop identity, finish, and retail style. Create one new photorealistic ecommerce image of the same laptop opened to about 110 degrees in a front-left three-quarter angle. Preserve the exact laptop model identity, same aluminum finish, same keyboard layout, same trackpad proportions, same hinge style, and same premium white-background studio look as the reference image. Keep the screen dark or neutral with no wallpaper content. Show one laptop only. Pure white background, centered composition, bright neutral studio lighting, and soft grounded shadow. Do not add text, watermark, hands, desk scene, cables, accessories, stickers, packaging, or geometry changes.
```

Generate image 3 and save raw output here:

```text
D:/Personal/PZM Website/GiminiImages/laptops/apple/{FILE_STEM}-angle-3.png
```

Prompt for image 3:

```text
Use the attached reference image as the visual source of truth for the exact laptop identity, finish, and retail style. Create one new photorealistic ecommerce image of the same laptop in a closed top-shell three-quarter angle. Preserve the same finish, same lid shape, same edge proportions, and the same premium clean studio style as the reference image. Keep the background pure white, the product centered, the lighting bright and neutral, and the shadow soft and subtle. Show one laptop only. Do not add text, watermark, desk props, cables, packaging, accessories, or any design changes.
```

## Naming Rule

Use this naming pattern for new angle images:

- {file-stem}-angle-2.png
- {file-stem}-angle-3.png
- final optimized files become:
  - {file-stem}-angle-2.webp
  - {file-stem}-angle-3.webp

## My Recommendation For Future Coverage

- Standard products: 3 total images per offer
- Priority products: 4 total images per offer
- Do not try to push all products to 4 images immediately

The right order is:

1. Get every priority SKU from 1 image to 3 total images
2. Then expand selected hero SKUs to 4 total images
3. Then backfill the long tail

That gives you the best Merchant-quality gain for the least image-generation effort.