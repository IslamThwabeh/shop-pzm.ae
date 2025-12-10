document.addEventListener('DOMContentLoaded', function() {
    let currentSlide = 0;
    let isPlaying = true;
    let slideInterval;
    const slides = document.querySelectorAll('.slides img');
    const totalSlides = slides.length;
    
    // Create slide containers and descriptions
    const slidesContainer = document.querySelector('.slides');
    slidesContainer.innerHTML = '';
    
    const descriptions = [
        "Get the best value for your old iPhones. Professional evaluation and instant payment.",
        "Expert repair services for all your devices. Fast, reliable, and warranty-backed repairs.",
        "Breathe new life into your MacBook with our professional repair and upgrade services.",
        "Sell your old MacBook for the best price. Quick evaluation and same-day payment.",
        "Comprehensive tech solutions under one roof. Sales, repairs, and professional support."
    ];
    
    slides.forEach((img, index) => {
        const slide = document.createElement('div');
        slide.className = `slide ${index === 0 ? 'active' : ''}`;
        slide.innerHTML = `
            <img src="${img.src}" alt="${img.alt}" class="slide-image">
            <div class="slide-content">
                <p class="slide-description">${descriptions[index]}</p>
            </div>
        `;
        slidesContainer.appendChild(slide);
    });
    
    // Create slider controls
    const controls = document.createElement('div');
    controls.className = 'slider-controls';
    controls.innerHTML = `
        <button class="control-button prev-button" aria-label="Previous slide">
            <span>⟨</span>
        </button>
        <button class="control-button play-pause" aria-label="Play/Pause slideshow">
            <span class="play-icon">❙❙</span>
        </button>
        <button class="control-button next-button" aria-label="Next slide">
            <span>⟩</span>
        </button>
        <div class="slide-indicators">
            ${Array(totalSlides).fill().map((_, i) => 
                `<div class="indicator ${i === 0 ? 'active' : ''}" data-index="${i}"></div>`
            ).join('')}
        </div>
    `;
    document.querySelector('.slider').appendChild(controls);
    
    function showSlide(n) {
        const slides = document.querySelectorAll('.slide');
        const indicators = document.querySelectorAll('.indicator');
        
        slides.forEach(slide => slide.classList.remove('active'));
        indicators.forEach(ind => ind.classList.remove('active'));
        
        currentSlide = n >= totalSlides ? 0 : n < 0 ? totalSlides - 1 : n;
        
        slides[currentSlide].classList.add('active');
        indicators[currentSlide].classList.add('active');
    }
    
    function nextSlide() {
        showSlide(currentSlide + 1);
    }
    
    function prevSlide() {
        showSlide(currentSlide - 1);
    }
    
    function togglePlayPause() {
        const playPauseBtn = document.querySelector('.play-pause');
        isPlaying = !isPlaying;
        
        if (isPlaying) {
            playPauseBtn.innerHTML = '<span class="play-icon">❙❙</span>';
            startSlideshow();
        } else {
            playPauseBtn.innerHTML = '<span class="play-icon">▶</span>';
            stopSlideshow();
        }
    }
    
    function startSlideshow() {
        if (slideInterval) clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }
    
    function stopSlideshow() {
        if (slideInterval) {
            clearInterval(slideInterval);
            slideInterval = null;
        }
    }
    
    // Event Listeners
    document.querySelector('.prev').addEventListener('click', () => {
        prevSlide();
        if (isPlaying) {
            stopSlideshow();
            startSlideshow();
        }
    });
    
    document.querySelector('.next').addEventListener('click', () => {
        nextSlide();
        if (isPlaying) {
            stopSlideshow();
            startSlideshow();
        }
    });
    
    document.querySelector('.play-pause').addEventListener('click', togglePlayPause);
    
    document.querySelectorAll('.indicator').forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            showSlide(index);
            if (isPlaying) {
                stopSlideshow();
                startSlideshow();
            }
        });
    });
    
    // Touch support
    let touchStartX = 0;
    let touchEndX = 0;
    
    const slider = document.querySelector('.slider');
    
    slider.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    slider.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const difference = touchStartX - touchEndX;
        
        if (Math.abs(difference) > swipeThreshold) {
            if (difference > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            
            if (isPlaying) {
                stopSlideshow();
                startSlideshow();
            }
        }
    }
    
    // Start the slideshow
    startSlideshow();
});