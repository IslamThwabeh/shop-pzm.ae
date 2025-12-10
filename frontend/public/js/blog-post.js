// Import blog posts data
import { blogPosts } from './blog.js';

function getPostSlug() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('slug');
}

function findPostBySlug(slug) {
    return blogPosts.find(post => post.slug === slug);
}

function displayBlogPost() {
    const slug = getPostSlug();
    const post = findPostBySlug(slug);
    
    if (!post) {
        window.location.href = '/blog.html';
        return;
    }
    
    const postContent = document.getElementById('post-content');
    
    postContent.innerHTML = `
        <img src="${post.image_url}" alt="${post.title}" class="blog-post-image">
        <div class="blog-post-content">
            <span class="blog-category">${post.category}</span>
            <h1>${post.title}</h1>
            <div class="blog-meta">
                <span>${new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })}</span>
            </div>
            <div class="blog-content">
                ${post.content}
            </div>
        </div>
    `;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', displayBlogPost);