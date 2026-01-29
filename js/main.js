'use strict';

// ===== Slide Navigation =====
let currentSlide = 0;
let slides;
let totalSlides;
let slideshowContainer;
let isRTL;

/**
 * Display a specific slide
 * @param {number} n - Slide index to display
 */
function showSlide(n) {
    slides[currentSlide].classList.remove('active');
    currentSlide = (n + totalSlides) % totalSlides;
    slides[currentSlide].classList.add('active');

    document.getElementById('current-slide').textContent = currentSlide + 1;

    // Automatic scroll to top of slide
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    // Update navigation buttons
    document.getElementById('prev-btn').disabled = currentSlide === 0;
    document.getElementById('next-btn').disabled = currentSlide === totalSlides - 1;
}

/**
 * Navigate to the next slide
 */
function nextSlide() {
    if (currentSlide < totalSlides - 1) {
        showSlide(currentSlide + 1);
    }
}

/**
 * Navigate to the previous slide
 */
function previousSlide() {
    if (currentSlide > 0) {
        showSlide(currentSlide - 1);
    }
}

/**
 * Navigate to a specific slide number
 * @param {number} slideNumber - Slide number (1-indexed)
 */
function goToSlide(slideNumber) {
    // slideNumber is 1-indexed (as displayed to user), convert to 0-indexed
    const slideIndex = slideNumber - 1;
    if (slideIndex >= 0 && slideIndex < totalSlides) {
        showSlide(slideIndex);
    }
}

// ===== Touch Events for Mobile =====
let touchStartX = 0;
let touchEndX = 0;
let touchStartY = 0;
let touchEndY = 0;

document.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
});

document.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
});

/**
 * Handle swipe gesture for navigation
 */
function handleSwipe() {
    const horizontalDiff = touchEndX - touchStartX;
    const verticalDiff = touchEndY - touchStartY;
    const minSwipeDistance = 80; // Increased from 50 to reduce sensitivity
    
    // Check if horizontal swipe is more significant than vertical
    if (Math.abs(horizontalDiff) > Math.abs(verticalDiff) && Math.abs(horizontalDiff) > minSwipeDistance) {
        // RTL mode: swipe right = next, swipe left = previous
        if (isRTL) {
            if (horizontalDiff > 0) {
                nextSlide(); // Swipe right = next in RTL
            } else {
                previousSlide(); // Swipe left = previous in RTL
            }
        } else {
            // LTR mode: swipe left = next, swipe right = previous
            if (horizontalDiff < 0) {
                nextSlide(); // Swipe left = next in LTR
            } else {
                previousSlide(); // Swipe right = previous in LTR
            }
        }
    }
}

// ===== Keyboard Navigation =====
document.addEventListener('keydown', function (e) {
    if (!slides) return; // Guard against early execution
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') nextSlide();
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') previousSlide();
    if (e.key === 'Home') showSlide(0);
    if (e.key === 'End') showSlide(totalSlides - 1);
    if (e.key === ' ') {
        e.preventDefault();
        nextSlide();
    }
});

// ===== Click Navigation =====
document.addEventListener('click', function (e) {
    if (!slides || !slideshowContainer) return; // Guard against early execution
    // Check if click is on button, link, or other interactive element
    if (e.target.closest('button, a, .slide-link-span, input, select, textarea')) {
        return;
    }

    const slideContent = e.target.closest('.slide');
    if (slideContent && !e.target.closest('.navigation-controls')) {
        // Calculate click position relative to slideshow container
        const containerRect = slideshowContainer.getBoundingClientRect();
        const clickX = e.clientX - containerRect.left; // Position relative to container
        const containerWidth = containerRect.width;

        const margin = containerWidth * 0.15;  // 15% from each side

        // Dynamic calculation according to text direction
        if (isRTL) {
            // In RTL: left = next, right = previous
            if (clickX < margin) {
                nextSlide();
            } else if (clickX > containerWidth - margin) {
                previousSlide();
            }
        } else {
            // In LTR: left = previous, right = next
            if (clickX < margin) {
                previousSlide();
            } else if (clickX > containerWidth - margin) {
                nextSlide();
            }
        }
    }
});

// ===== Mouse Move for Visual Indication =====
document.addEventListener('mousemove', function (e) {
    if (!slides || !slideshowContainer) return; // Guard against early execution
    const slideContent = e.target.closest('.slide');
    if (slideContent) {
        const containerRect = slideshowContainer.getBoundingClientRect();
        const mouseX = e.clientX - containerRect.left;
        const containerWidth = containerRect.width;

        const margin = containerWidth * 0.15;

        // Remove all classes
        document.body.classList.remove('show-nav-prev', 'show-nav-next');

        // The arrow should appear on the same side where the mouse is!
        if (isRTL) {
            // In RTL: left = next (physical right), right = prev (physical left)
            // When mouse is on left - show arrow on left (next)
            if (mouseX < margin && currentSlide < totalSlides - 1) {
                document.body.classList.add('show-nav-next'); // Next arrow is on the left
            }
            // When mouse is on right - show arrow on right (prev)
            else if (mouseX > containerWidth - margin && currentSlide > 0) {
                document.body.classList.add('show-nav-prev'); // Prev arrow is on the right
            }
        } else {
            // In LTR: left = prev, right = next
            // When mouse is on left - show arrow on left (prev)
            if (mouseX < margin && currentSlide > 0) {
                document.body.classList.add('show-nav-prev'); // Prev arrow is on the left
            }
            // When mouse is on right - show arrow on right (next)
            else if (mouseX > containerWidth - margin && currentSlide < totalSlides - 1) {
                document.body.classList.add('show-nav-next'); // Next arrow is on the right
            }
        }
    }
});

// ===== Initialization =====
function initializeApp() {
    // Initialize variables
    slides = document.querySelectorAll('.slide');
    totalSlides = slides.length;
    slideshowContainer = document.getElementById('slideshow-container');
    isRTL = document.documentElement.classList.contains('rtl-mode');

    // Remove navigation indication when mouse leaves
    if (slideshowContainer) {
        slideshowContainer.addEventListener('mouseleave', function () {
            document.body.classList.remove('show-nav-prev', 'show-nav-next');
        });
    }

    // Set total slides count
    document.getElementById('total-slides').textContent = totalSlides;

    // Load saved preferences
    const savedTheme = localStorage.getItem('theme') || 'blue';
    const savedMode = localStorage.getItem('mode') || 'light';

    document.documentElement.setAttribute('data-theme', savedTheme);
    document.documentElement.setAttribute('data-mode', savedMode);

    // Update active selectors
    document.getElementById('theme-select').value = savedTheme;
    document.querySelector(`.mode-btn[data-mode="${savedMode}"]`)?.classList.add('active');

    // Initialize quiz functionality and show first slide
    showSlide(0);

    // Initialize navigation visibility
    handleNavigationVisibility();
}

// Run initialization when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// ===== Quiz Functionality =====

/**
 * Toggle answer visibility for quiz questions
 * @param {HTMLElement} button - The button element that was clicked
 * @param {Event} event - The click event
 */
function toggleAnswer(button, event) {
    event.stopPropagation();
    const answerBox = button.nextElementSibling;
    const question = button.closest('.question');
    const options = question.querySelectorAll('.option');

    if (answerBox.classList.contains('show')) {
        // Hide answer - reset question
        answerBox.classList.remove('show');
        button.textContent = 'הצג תשובה';

        // Remove all colors from options
        options.forEach(option => {
            option.classList.remove('correct');
            option.classList.remove('incorrect');
        });
    } else {
        // Show answer
        answerBox.classList.add('show');
        button.textContent = 'הסתר תשובה';
    }
}

// ===== Table of Contents Links =====
// Add click handlers to slide references in table of contents
document.addEventListener('DOMContentLoaded', function () {
    if (!slides) return; // Guard against early execution
    // Find the table of contents slide (slide 2)
    const tocSlide = slides[1]; // index 1 = slide 2

    if (tocSlide) {
        // Get the entire HTML content
        let html = tocSlide.innerHTML;

        // Replace all "(שקף X)" with a clickable span
        html = html.replace(/\(שקף (\d+)\)/g, function (match, slideNum) {
            return '<span class="slide-link-span" data-slide="' + slideNum + '">' + match + '</span>';
        });

        // Update the slide HTML
        tocSlide.innerHTML = html;

        // Add event listeners to all the new spans
        const slideLinks = tocSlide.querySelectorAll('.slide-link-span');
        slideLinks.forEach(link => {
            const slideNum = parseInt(link.getAttribute('data-slide'));

            link.addEventListener('click', function (e) {
                e.stopPropagation();
                goToSlide(slideNum);
            });
        });
    }

    // Add click listener for quiz options
    document.querySelectorAll('.question').forEach(question => {
        const answerBox = question.querySelector('.answer-box');
        const options = question.querySelectorAll('.option');
        const showAnswerBtn = question.querySelector('.show-answer-btn');

        // Extract the correct letter from the answer box
        let correctAnswer = '';
        if (answerBox) {
            const answerText = answerBox.innerHTML;
            const match = answerText.match(/תשובה נכונה:\s*([א-ת])/);
            if (match) {
                correctAnswer = match[1];
            }
        }

        // Add listener for each option
        options.forEach(option => {
            const optionLetter = option.querySelector('.option-letter').textContent.trim();

            option.addEventListener('click', function (e) {
                e.stopPropagation(); // Prevent navigation in slide

                // If answer already selected, do nothing
                if (option.classList.contains('correct') || option.classList.contains('incorrect')) {
                    return;
                }

                // Check if answer is correct
                if (optionLetter === correctAnswer) {
                    // Correct answer - color green
                    option.classList.add('correct');
                } else {
                    // Wrong answer - color red and open correct answer
                    option.classList.add('incorrect');

                    // Show correct answer
                    if (answerBox) {
                        answerBox.classList.add('show');
                        if (showAnswerBtn) {
                            showAnswerBtn.textContent = 'הסתר תשובה';
                        }
                    }

                    // Mark correct answer in green
                    options.forEach(opt => {
                        const letter = opt.querySelector('.option-letter').textContent.trim();
                        if (letter === correctAnswer) {
                            opt.classList.add('correct');
                        }
                    });
                }
            });
        });
    });
});

// ===== Theme and Mode Management =====

// Load saved preferences
// (Now handled in initializeApp function)

/**
 * Change the color theme
 * @param {string} theme - Theme name (blue, gray, cyan, etc.)
 */
function changeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

/**
 * Change the display mode (light/dark)
 * @param {string} mode - Mode name (light or dark)
 */
function changeMode(mode) {
    document.documentElement.setAttribute('data-mode', mode);
    localStorage.setItem('mode', mode);

    // Update buttons
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`.mode-btn[data-mode="${mode}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
        activeBtn.setAttribute('aria-checked', 'true');
    }

    // Update aria-checked for other buttons
    document.querySelectorAll(`.mode-btn:not([data-mode="${mode}"])`).forEach(btn => {
        btn.setAttribute('aria-checked', 'false');
    });
}

/**
 * Show/hide navigation controls based on mouse/touch position
 * Works on both desktop and mobile devices
 */
function handleNavigationVisibility() {
    const navControls = document.querySelector('.navigation-controls');
    const threshold = 150; // Distance from bottom in pixels to trigger visibility
    let hideTimer = null;
    let isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    function showNavigation() {
        if (navControls) {
            navControls.classList.add('visible');
        }
        // Clear any existing hide timer
        if (hideTimer) {
            clearTimeout(hideTimer);
            hideTimer = null;
        }
    }

    function hideNavigation() {
        // Set a timer to hide after mouse/touch leaves the area
        hideTimer = setTimeout(() => {
            if (navControls) {
                navControls.classList.remove('visible');
            }
        }, isTouchDevice ? 3000 : 500); // Longer delay on touch devices
    }

    // Track mouse movement (desktop)
    document.addEventListener('mousemove', (e) => {
        if (isTouchDevice) return; // Skip on touch devices
        const distanceFromBottom = window.innerHeight - e.clientY;

        if (distanceFromBottom <= threshold) {
            showNavigation();
        } else if (distanceFromBottom > threshold + 100) {
            // Only hide if mouse is well away from the threshold
            hideNavigation();
        }
    });

    // Touch handling for mobile devices
    if (isTouchDevice) {
        // Show navigation on any tap on the bottom 20% of the screen
        document.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const distanceFromBottom = window.innerHeight - touch.clientY;

            if (distanceFromBottom <= window.innerHeight * 0.2) {
                showNavigation();
                hideNavigation(); // Auto-hide after delay
            }
        });

        // Also show on any tap on the navigation itself, but hide after interaction
        if (navControls) {
            navControls.addEventListener('touchstart', (e) => {
                e.stopPropagation();
                showNavigation();
            });
            
            // Hide navigation after button click on mobile
            navControls.querySelectorAll('button, select').forEach(element => {
                element.addEventListener('click', () => {
                    setTimeout(() => hideNavigation(), 500);
                });
            });
        }
    }

    // Keep navigation visible when mouse is over it (desktop)
    if (navControls && !isTouchDevice) {
        navControls.addEventListener('mouseenter', () => {
            if (hideTimer) {
                clearTimeout(hideTimer);
                hideTimer = null;
            }
            showNavigation();
        });

        navControls.addEventListener('mouseleave', () => {
            hideNavigation();
        });
    }

    // Show navigation briefly on page load
    showNavigation();
    setTimeout(hideNavigation, isTouchDevice ? 2000 : 2000);
}
