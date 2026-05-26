window.HELP_IMPROVE_VIDEOJS = false;

// More Works Dropdown Functionality
function toggleMoreWorks() {
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    } else {
        dropdown.classList.add('show');
        button.classList.add('active');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.more-works-container');
    const dropdown = document.getElementById('moreWorksDropdown');
    const button = document.querySelector('.more-works-btn');
    
    if (container && !container.contains(event.target)) {
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Close dropdown on escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const dropdown = document.getElementById('moreWorksDropdown');
        const button = document.querySelector('.more-works-btn');
        dropdown.classList.remove('show');
        button.classList.remove('active');
    }
});

// Copy BibTeX to clipboard
function copyBibTeX() {
    const bibtexElement = document.getElementById('bibtex-code');
    const button = document.querySelector('.copy-bibtex-btn');
    const copyText = button.querySelector('.copy-text');
    
    if (bibtexElement) {
        navigator.clipboard.writeText(bibtexElement.textContent).then(function() {
            // Success feedback
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        }).catch(function(err) {
            console.error('Failed to copy: ', err);
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = bibtexElement.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            button.classList.add('copied');
            copyText.textContent = 'Cop';
            setTimeout(function() {
                button.classList.remove('copied');
                copyText.textContent = 'Copy';
            }, 2000);
        });
    }
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Show/hide scroll to top button
window.addEventListener('scroll', function() {
    const scrollButton = document.querySelector('.scroll-to-top');
    if (window.pageYOffset > 300) {
        scrollButton.classList.add('visible');
    } else {
        scrollButton.classList.remove('visible');
    }
});

// Video carousel autoplay when in view
function setupVideoCarouselAutoplay() {
    const carouselVideos = document.querySelectorAll('.results-carousel:not(#teaser-carousel) video');
    
    if (carouselVideos.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            if (entry.isIntersecting) {
                // Video is in view, play it
                video.play().catch(e => {
                    // Autoplay failed, probably due to browser policy
                    console.log('Autoplay prevented:', e);
                });
            } else {
                // Video is out of view, pause it
                video.pause();
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the video is visible
    });
    
    carouselVideos.forEach(video => {
        observer.observe(video);
    });
}

function setupShowcaseVideoCarousel(carousel) {
    const carouselElement = document.getElementById('teaser-carousel');
    if (!carousel || !carouselElement) return;

    const videos = Array.from(carouselElement.querySelectorAll('video'));
    if (videos.length === 0) return;

    let isInView = false;

    function normalizeIndex(index) {
        const length = carousel.state.length || videos.length;
        return ((index % length) + length) % length;
    }

    function getActiveVideo() {
        const nextIndex = Number(carousel.state.next);
        const index = Number.isFinite(nextIndex) ? nextIndex : Number(carousel.state.index);
        return videos[normalizeIndex(index)];
    }

    function pauseInactiveVideos(activeVideo) {
        videos.forEach(video => {
            if (video !== activeVideo) {
                video.pause();
                video.currentTime = 0;
            }
        });
    }

    function playActiveVideo(resetVideo) {
        const activeVideo = getActiveVideo();
        if (!activeVideo) return;

        pauseInactiveVideos(activeVideo);

        if (resetVideo) {
            activeVideo.currentTime = 0;
        }

        if (isInView) {
            activeVideo.play().catch(e => {
                console.log('Autoplay prevented:', e);
            });
        }
    }

    videos.forEach(video => {
        video.addEventListener('ended', function() {
            if (video === getActiveVideo()) {
                carousel.next();
            }
        });

        video.addEventListener('play', function() {
            pauseInactiveVideos(video);
        });
    });

    carousel.on('show', function() {
        window.setTimeout(function() {
            playActiveVideo(true);
        }, carousel.options.duration || 300);
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isInView = entry.isIntersecting;

            if (isInView) {
                playActiveVideo(false);
            } else {
                videos.forEach(video => video.pause());
            }
        });
    }, {
        threshold: 0.5
    });

    observer.observe(carouselElement);
}

function setupResultsImageLightbox() {
    const lightbox = document.getElementById('results-image-lightbox');
    if (!lightbox) return;

    const lightboxImage = lightbox.querySelector('.image-lightbox__image');
    const closeButtons = lightbox.querySelectorAll('.image-lightbox__close, .image-lightbox__backdrop');
    const zoomableImages = document.querySelectorAll('.results-image-table img, .motivation-img.clickable-image');
    let activeTrigger = null;

    function openLightbox(image) {
        activeTrigger = image;
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        lightbox.classList.add('is-active');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        lightbox.querySelector('.image-lightbox__close').focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('is-active');
        lightbox.setAttribute('aria-hidden', 'true');
        lightboxImage.src = '';
        document.body.style.overflow = '';

        if (activeTrigger) {
            activeTrigger.focus();
            activeTrigger = null;
        }
    }

    zoomableImages.forEach(image => {
        image.setAttribute('tabindex', '0');
        image.setAttribute('role', 'button');
        image.setAttribute('aria-label', 'Open zoomed image: ' + image.alt);

        image.addEventListener('click', function() {
            openLightbox(image);
        });

        image.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                openLightbox(image);
            }
        });
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && lightbox.classList.contains('is-active')) {
            closeLightbox();
        }
    });
}

$(document).ready(function() {
    // Check for click events on the navbar burger icon

    var options = {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: true,
		autoplay: true,
		autoplaySpeed: 5000,
    }

    var teaserCarousels = bulmaCarousel.attach('#teaser-carousel', {
		slidesToScroll: 1,
		slidesToShow: 1,
		loop: true,
		infinite: false,
		autoplay: false,
    });

	// Initialize non-video-driven carousels with fixed autoplay
    var carousels = bulmaCarousel.attach('.carousel:not(#teaser-carousel)', options);
	
    bulmaSlider.attach();
    
    // Setup video autoplay for carousel
    setupShowcaseVideoCarousel(teaserCarousels[0]);
    setupVideoCarouselAutoplay();
    setupResultsImageLightbox();

})
