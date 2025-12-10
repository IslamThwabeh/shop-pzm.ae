// Blog posts data
const blogPosts = [
  {
    title: "How to Choose the Perfect Gaming PC Build",
    slug: "how-to-choose-perfect-gaming-pc-build",
    content: `Building a gaming PC can be an exciting but challenging endeavor. With countless components and configurations available, it's essential to make informed decisions to create a system that meets your needs and budget.

    When selecting your CPU, consider both your gaming requirements and future-proofing. The latest AMD Ryzen and Intel Core processors offer excellent gaming performance, with options like the Ryzen 7 7800X3D and Intel Core i7-14700K providing exceptional value for high-end gaming. Remember that gaming performance isn't just about core count – single-core performance and cache size play crucial roles.

    Your graphics card choice will significantly impact gaming performance. The NVIDIA RTX 4070 and AMD RX 7800 XT represent excellent mid-range to high-end options, offering features like ray tracing and DLSS/FSR upscaling. Consider your target resolution and refresh rate when selecting a GPU – 1440p gaming has become the sweet spot for many enthusiasts.

    Memory and storage decisions are equally important. For modern gaming, 32GB of DDR5 RAM provides headroom for multitasking and future games. Storage should combine a fast NVMe SSD for your operating system and frequently played games with a larger HDD or SATA SSD for your game library.

    Power supply selection often gets overlooked, but it's crucial for system stability. Choose a high-quality PSU with at least 80+ Gold certification and sufficient wattage for your components plus future upgrades. Cable management features and modular designs can make building easier.

    Finally, don't forget about cooling and airflow. Whether you choose air cooling or liquid cooling, ensure your case has adequate airflow with strategically placed fans. Modern cases with mesh fronts and multiple fan mounts can significantly improve thermal performance.`,
    excerpt: "A comprehensive guide to building your dream gaming PC with the right components, from CPU and GPU selection to cooling solutions.",
    image_url: "images/blog/gaming-pc-build.jpg",
    category: "Gaming"
  },
  {
    title: "Top 5 iPhone Repair Tips Everyone Should Know",
    slug: "top-5-iphone-repair-tips",
    content: `Maintaining your iPhone in optimal condition requires both preventive care and knowing how to address common issues. Here's a detailed guide to keeping your device running smoothly and extending its lifespan.

    Regular software maintenance is crucial for iPhone performance. Keep your iOS version updated to benefit from the latest security patches and performance improvements. However, before updating, always back up your device using iCloud or iTunes. Apple's backup systems have become increasingly sophisticated, ensuring your data remains safe during updates or in case of device failure.

    Battery health management is another critical aspect of iPhone maintenance. Modern iPhones include advanced battery health features that help prevent premature aging. Enable "Optimized Battery Charging" to reduce battery wear, and avoid extreme temperatures which can permanently damage your battery. If your battery health falls below 80%, consider a professional replacement to maintain optimal performance.

    Screen protection goes beyond just applying a screen protector. Choose tempered glass protectors with oleophobic coatings to prevent fingerprints and maintain touch sensitivity. If you notice minor scratches, some can be minimized using specialized polishing compounds, but deep scratches require professional repair to prevent further damage.

    Proper charging habits significantly impact device longevity. Use certified Apple chargers or MFi-certified alternatives to prevent damage to your charging port and battery. Wireless charging, while convenient, generates more heat and may affect battery longevity if used exclusively. Mix charging methods and avoid wireless charging in warm environments.

    Regular maintenance should include cleaning your device properly. Use compressed air to clear debris from ports, and isopropyl alcohol with microfiber cloths for external cleaning. For persistent issues like slow performance, try clearing cache and background apps before considering a factory reset.`,
    excerpt: "Essential tips to maintain and repair your iPhone for optimal performance, from software updates to physical maintenance.",
    image_url: "https://images.pexels.com/photos/4195325/pexels-photo-4195325.jpeg",
    category: "Repair"
  },
  {
    title: "The Ultimate Guide to Buying Used Laptops",
    slug: "ultimate-guide-buying-used-laptops",
    content: "Looking to save money on a laptop? Here's what to check when buying used: 1. Battery health, 2. Hardware specifications, 3. Physical condition, 4. Warranty options, 5. Seller reputation...",
    excerpt: "Everything you need to know about safely purchasing a pre-owned laptop.",
    image_url: "https://images.pexels.com/photos/18105/pexels-photo.jpg",
    category: "Used"
  },
  {
    title: "Essential PC Maintenance Tips",
    slug: "essential-pc-maintenance-tips",
    content: "Keep your PC running like new with these maintenance tips: 1. Regular cleaning, 2. Software updates, 3. Disk optimization, 4. Temperature monitoring, 5. Component upgrades...",
    excerpt: "Learn how to maintain your PC for optimal performance and longer lifespan.",
    image_url: "https://images.pexels.com/photos/2582937/pexels-photo-2582937.jpeg",
    category: "PC"
  },
  {
    title: "Latest Mobile Accessories You Need in 2025",
    slug: "latest-mobile-accessories-2025",
    content: "Enhance your mobile experience with these must-have accessories: 1. MagSafe chargers, 2. Advanced screen protectors, 3. Professional camera lenses, 4. Battery packs, 5. Premium cases...",
    excerpt: "Discover the newest and most innovative mobile accessories for 2025.",
    image_url: "https://images.pexels.com/photos/47261/pexels-photo-47261.jpeg",
    category: "Accessories"
  },
  {
    title: "Understanding Smartphone Battery Life",
    slug: "understanding-smartphone-battery-life",
    content: "Maximize your smartphone's battery life with these expert tips: 1. Understand battery cycles, 2. Optimal charging practices, 3. Background app management, 4. Screen brightness optimization...",
    excerpt: "Learn how to extend your smartphone's battery life and maintain its health.",
    image_url: "https://images.pexels.com/photos/4526407/pexels-photo-4526407.jpeg",
    category: "Mobile"
  }
];

function getTodaysPosts() {
  // Get days since epoch to ensure consistent rotation
  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  
  // Calculate starting index for today's posts (2 posts per day)
  const startIndex = (daysSinceEpoch * 2) % blogPosts.length;
  
  // Get two posts, wrapping around to the beginning if needed
  return [
    blogPosts[startIndex],
    blogPosts[(startIndex + 1) % blogPosts.length]
  ];
}

function displayBlogPosts() {
  const blogGrid = document.querySelector('.blog-grid');
  if (!blogGrid) return;
  
  // Clear existing content
  blogGrid.innerHTML = '';
  
  // Get today's posts
  const todaysPosts = getTodaysPosts();
  
  // Display today's posts
  todaysPosts.forEach(post => {
    const article = document.createElement('article');
    article.className = 'blog-card';
    
    article.innerHTML = `
      <img src="${post.image_url}" alt="${post.title}" class="blog-image" loading="lazy">
      <div class="blog-content">
        <span class="blog-category">${post.category}</span>
        <h2>${post.title}</h2>
        <p>${post.excerpt}</p>
        <a href="blog-post.html?slug=${post.slug}" class="read-more">Read More</a>
        <div class="blog-meta">
          <span>${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
      </div>
    `;
    
    blogGrid.appendChild(article);
  });
}

// Initialize blog posts when DOM is ready
document.addEventListener('DOMContentLoaded', displayBlogPosts);

export { blogPosts }
