/**
 * @fileOverview Carousel
 *
 * @author nerdery
 */
$(function() {

    /**
     * Timing variables used in this view
     * @property TIMING
     * @type {Object}
     * @final
     */
    var TIMING = {
        INTERVAL: 4000
    };

    /**
     * An object of classes used in this view
     * @default null
     * @property CLASSES
     * @type {Object}
     * @final
     */
    var CLASSES = {
        ACTIVE_SLIDE_CLASS: 'carousel-item_isActive',
        INACTIVE_SLIDE_CLASS: 'carousel-item_isInactive'
    };

    /**
     * An object of selectors used in this view
     * @default null
     * @property SELECTORS
     * @type {Object}
     * @final
     */
    var SELECTORS = {
        CAROUSEL_ID: '#js-carousel'
    };

    /**
     * Basic carousel view
     *
     * @class Carousel
     * @constructor
     */
    var Carousel = function() {

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
     * Runs createChildren, setupHandlers, enable, and startSlideshow
     *
     * @method init
     * @public
     * @chainable
     */
    Carousel.prototype.init = function() {
        this.createChildren()
            .setupHandlers()
            .enable()
            .startSlideshow();

        return this;
    };

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
        this.$carousel = $(SELECTORS.CAROUSEL_ID);
        this.$slides = this.$carousel.children();
        this.$currentSlide = this.$slides.eq(this.currentIndex);

        // Count the slides
        this.numSlides = this.$slides.length;

        // Make first slide active
        this.$currentSlide.addClass(CLASSES.ACTIVE_SLIDE_CLASS);

        // Make all slides but the first inactive
        this.$slides.not(this.$currentSlide).addClass(CLASSES.INACTIVE_SLIDE_CLASS);

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
        }, TIMING.INTERVAL);

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

        this.$currentSlide
            .removeClass(CLASSES.ACTIVE_SLIDE_CLASS)
            .addClass(CLASSES.INACTIVE_SLIDE_CLASS);

        this.$currentSlide = this.$slides.eq(index);

        this.$currentSlide
            .removeClass(CLASSES.INACTIVE_SLIDE_CLASS)
            .addClass(CLASSES.ACTIVE_SLIDE_CLASS);

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

    return new Carousel();

});