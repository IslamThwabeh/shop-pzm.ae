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
    if (!slug) {
        window.location.replace('/blog/');
        return;
    }

    const post = findPostBySlug(slug);
    if (!post) {
        window.location.replace('/blog/');
        return;
    }

    window.location.replace(`/blog/${post.slug}`);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', displayBlogPost);