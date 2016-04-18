/**
 * @fileOverview Carousel
 *
 * @author nerdery
 */

/**
 * Basic carousel view
 *
 * @class Carousel
 * @constructor
 * @param {Object} SELECTORS - An object of selectors used in this view
 * @see Carousel.SELECTORS_DEFAULT
 * @param {Number} TIMING - The number of miliseconds between each slide rotation
 */
function Carousel(SELECTORS, TIMING) {
    
    /**
     * The CSS selectors that target different components of the carousel
     *
     * @default {}
     * @property selectors
     * @type {Object}
     * @public
     */
    this.selectors = (SELECTORS || {});
    
    /**
     * The number of miliseconds between each slide rotation
     *
     * @default 4000
     * @property timing
     * @type {Number}
     * @public
     */
    this.timing = (TIMING || 4000);

    /**
     * A reference to the carousel
     *
     * @default null
     * @property $carousel
     * @type {jQuery}
     * @public
     */
    this.$carousel = null;

    /**
     * A reference to the carousel slides
     *
     * @default null
     * @property $slides
     * @type {jQuery}
     * @public
     */
    this.$slides = null;
    
    /**
     * A reference to the container of the navigation triggers
     *
     * @default null
     * @property $nav_wrap
     * @type {jQuery}
     * @public
     */
    this.$nav_wrap = null;
    
    /**
     * A reference to the navigation triggers
     *
     * @default null
     * @property $nav_items
     * @type {jQuery}
     * @public
     */
    this.$nav_items = null;

    /**
     * A reference to the current carousel slide
     *
     * @default null
     * @property $currentSlide
     * @type {jQuery}
     * @public
     */
    this.$currentSlide = null;

    /**
     * The current index of the active slide
     *
     * @default 0
     * @property currentIndex
     * @type {Number}
     * @public
     */
    this.currentIndex = 0;

    /**
     * The number of slides that exist in the carousel
     *
     * @default 0
     * @property numSlides
     * @type {Number}
     * @public
     */
    this.numSlides = 0;

    /**
     * The number of slides that exist in the carousel
     *
     * @default null
     * @property timer
     * @type {Function}
     * @public
     */
    this.timer = null;

    /**
     * Tracks whether component is enabled
     *
     * @default false
     * @property isEnabled
     * @type {Boolean}
     * @public
     */
    this.isEnabled = false;

    this.init();
};

/**
 * Initializes the UI Component View
 * Runs setSelectors, createChildren, setupHandlers, enable, and startSlideshow
 *
 * @method init
 * @public
 * @chainable
 */
Carousel.prototype.init = function() {
    this.setSelectors()
        .createChildren()
        .setupHandlers()
        .enable()
        .startSlideshow();

    return this;
};

/**
 * Default CSS selectors for the carousel's components
 * @namespace SELECTORS_DEFAULT
 * @prop {string} CAROUSEL - The wrapper for all components of this carousel instance
 * @prop {string} SLIDES_WRAP - The wrapper for the slides of this carousel
 * @prop {string} TRIGGER_NEXT - The element that on click makes the carousel rotate to the next slide
 * @prop {string} TRIGGER_PREV - The element that on click makes the carousel rotate to the previous slide
 * @prop {string} NAV_WRAP - The wrapper for the carousel's navigation triggers
 * @prop {string} ACTIVE_SLIDE_CLASS - The class applied to active slides
 * @prop {string} INACTIVE_SLIDE_CLASS - The class applied to inactive slides
 * @prop {string} ACTIVE_NAV_CLASS - The class applied to active navigation triggers
 */
Carousel.SELECTORS_DEFAULT = {
    CAROUSEL:               '.carousel',
    SLIDES_WRAP:            '.carousel-slides',
    TRIGGER_NEXT:           '.carousel-next',
    TRIGGER_PREV:           '.carousel-prev',
    NAV_WRAP:               '.carousel-nav',
    ACTIVE_SLIDE_CLASS:     'carousel-item_isActive',
    INACTIVE_SLIDE_CLASS:   'carousel-item_isInactive',
    ACTIVE_NAV_CLASS:       'carousel-nav-item-active'
}

/**
 * Sets the CSS selectors for the components of the carousel
 * If a selector is not provided, uses one of the default selectors provided
 *
 * @method setSelectors
 * @see Carousel.SELECTORS_DEFAULT
 * @public
 * @chainable
 */
Carousel.prototype.setSelectors = function(){
    var self = this;
    $.each(Carousel.SELECTORS_DEFAULT, function(selector){
        if(!self.selectors[selector]){
            self.selectors[selector] = Carousel.SELECTORS_DEFAULT[selector];
        }
    });
    
    return this;
}

/**
 * Binds the scope of any handler functions
 * Should only be run on initialization of the view
 *
 * @method setupHandlers
 * @public
 * @chainable
 */
Carousel.prototype.setupHandlers = function() {
    this.handleCarouselMouseEnter = $.proxy(this.onCarouselMouseEnter, this);
    this.handleCarouselMouseLeave = $.proxy(this.onCarouselMouseLeave, this);

    return this;
};

/**
 * Create any child objects or references to DOM elements
 * Should only be run on initialization of the view
 *
 * @method createChildren
 * @public
 * @chainable
 */
Carousel.prototype.createChildren = function() {
    var self = this;
    
    this.$carousel = $(this.selectors.CAROUSEL);
    this.$slides = this.$carousel.find(this.selectors.SLIDES_WRAP).children();
    this.$nav_wrap = this.$carousel.find(this.selectors.NAV_WRAP);

    // Count the slides
    this.numSlides = this.$slides.length;

    // Make all slides but the first inactive
    this.$slides.not(this.$currentSlide).addClass(this.selectors.INACTIVE_SLIDE_CLASS);
    
    // Add navigation triggers
    $.each(Array(this.numSlides), function(index){
        var nav_item = $('<a></a>');
        nav_item.on('click', $.proxy(self.goToSlide, self, index));
        self.$nav_wrap.append(nav_item);
    });
    
    // Cache the individual navigation triggers
    this.$nav_items = this.$nav_wrap.children();
    
    // Go to first slide
    this.goToSlide(this.currentIndex);

    return this;
};

/**
 * Enables the component
 * Performs any event binding to handlers
 *
 * @method enable
 * @public
 * @chainable
 */
Carousel.prototype.enable = function() {
    if (this.isEnabled) {
        return this;
    }

    this.$carousel.on('mouseenter', this.handleCarouselMouseEnter);
    this.$carousel.on('mouseleave', this.handleCarouselMouseLeave);
    this.$carousel
        .find(this.selectors.TRIGGER_NEXT)
        .on('click', $.proxy(this.goToNextSlide, this));
    this.$carousel
        .find(this.selectors.TRIGGER_PREV)
        .on('click', $.proxy(this.goToPreviousSlide, this));

    this.isEnabled = true;

    return this;
};

/**
 * Disables the component
 * Tears down any event binding to handlers
 *
 * @method disable
 * @public
 * @chainable
 */
Carousel.prototype.disable = function() {
    if (!this.isEnabled) {
        return this;
    }

    this.$carousel.off('mouseenter', this.handleCarouselMouseEnter);
    this.$carousel.off('mouseleave', this.handleCarouselMouseLeave);

    this.isEnabled = false;

    return this;
};

/**
 * Start the carousel auto rotation
 *
 * @method startSlideshow
 * @public
 * @chainable
 */
Carousel.prototype.startSlideshow = function() {
    var self = this;

    this.timer = setInterval(function() {
        self.goToNextSlide();
    }, this.timing);

    return this;
};

/**
 * Stop the carousel auto rotation
 *
 * @method stopSlideshow
 * @public
 * @chainable
 */
Carousel.prototype.stopSlideshow = function() {
    clearInterval(this.timer);

    return this;
};

/**
 * Go forward to the next slide
 *
 * @method gotoNextSlide
 * @public
 * @chainable
 */
Carousel.prototype.goToNextSlide = function() {
    this.goToSlide(this.currentIndex + 1);

    return this;
};

/**
 * Go back to the previous slide
 *
 * @method gotoNextSlide
 * @public
 * @chainable
 */
Carousel.prototype.goToPreviousSlide = function() {
    this.goToSlide(this.currentIndex - 1);

    return this;
};

/**
 * Go to a specific slide
 *
 * @method goToSlide
 * @public
 * @param {Number} index of the target slide
 * @chainable
 */
Carousel.prototype.goToSlide = function(index) {
    if (index >= this.numSlides) {
        index = 0;
    } else if (index < 0) {
        index = this.numSlides - 1;
    }

    if(this.$currentSlide){
        this.$currentSlide
            .removeClass(this.selectors.ACTIVE_SLIDE_CLASS)
            .addClass(this.selectors.INACTIVE_SLIDE_CLASS);
    }
        
    this.$nav_wrap
        .find('.' + this.selectors.ACTIVE_NAV_CLASS)
        .removeClass(this.selectors.ACTIVE_NAV_CLASS);

    this.$currentSlide = this.$slides.eq(index);

    this.$currentSlide
        .removeClass(this.selectors.INACTIVE_SLIDE_CLASS)
        .addClass(this.selectors.ACTIVE_SLIDE_CLASS);

    this.$nav_items.eq(index)
        .addClass(this.selectors.ACTIVE_NAV_CLASS);

    this.currentIndex = index;

    return this;
};

//////////////////////////////////////////////////////////
// EVENT HANDLERS
//////////////////////////////////////////////////////////

/**
 * Stop slideshow on mouse enter
 * @method onCarouselMouseEnter
 * @public
 * @param {Object} event The event object
 */
Carousel.prototype.onCarouselMouseEnter = function(e) {
    this.stopSlideshow();
};

/**
 * Start slideshow on mouse leave
 * @method onCarouselMouseLeave
 * @public
 * @param {Object} event The event object
 */
Carousel.prototype.onCarouselMouseLeave = function(e) {
    this.startSlideshow();
};