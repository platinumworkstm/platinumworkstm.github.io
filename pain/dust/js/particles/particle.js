
define( function( require, exports, module ) {
    'use strict';

    // ### function Extension( extensions )
    // ####  @extensions {Object} an object containing the extension functions
    // Basic particle behaviour can be extended by any number of additional functions that are passed in, this utility function
    // collates those functions and exposes methods for working with them.
    var Extension = function( extensions ) {
        var _ext = [];

        if ( typeof extensions === 'object' ) {
            for( var prop in extensions ) {
                if ( typeof extensions[ prop ] === 'function' ) {
                    _ext.push( extensions[ prop ] );
                }
            }
        }

        return {
            // ### apply
            // #### @context {Object} the context within which to run the functions
            // Runs each of the functions with the supplied context
            apply: function( context ) {
                _ext.forEach( function( fn ) {
                    fn.apply( context );
                } );
            },

            // ### get
            // Returns the private extension array.
            // Should only be used for debugging and will likely be removed for production builds in the future.
            get: function() {
                return _ext;
            }
        };
    };

    // ### __constructor function__ Particle( extend )
    // #### @extend {Object} _optional_ The extension properties
    // The base particle object used by the particle systems.
    // Particles are responsible for creating themselves, resetting themselves and updating themselves.
    // The base particle does very little and should be extended either by supplying extension functions
    // or by extending the prototype.
    var Particle = function( extend ) {

        // Ensure the extension object exists.
        extend = extend || {};

        // __{Vector3}__ The position, relative to the position of the emitter.
        this.position = new THREE.Vector3( 0, 0, 0 );

        // __{Vector3}__ The velocity of the particle.  Setting the position manually is possible but movement is often
        // better achieved by manipulating the velocity of the particle.
        this.velocity = new THREE.Vector3( 0, 0, 0 );

        // __{float}__ Scale is used to determine the size of the particle.
        this.scale = 10.0;

        // __{Color}__ The color of the particle
        this.color = new THREE.Color( 0xFFFFFF );

        // __{float}__ __0...1__ The transparency of the particle.
        this.alpha = 1.0;

        // Extension objects.  _Creation, update, reset_.
        this.initialExtensions = new Extension( extend.initialExtensions );
        this.updateExtensions = new Extension( extend.updateExtensions );
        this.resetExtensions = new Extension( extend.resetExtensions );

        // __{int}__ Current life references the actual life of the particle.
        this.currentLife = 0;

        // __{int}__ The maximum life span of the particle.
        this.maxLife = 50;

        // __{float}__ __0...1__ The age of the particle, clamped to 0...1
        this.age = 0;

        // __{Boolean}__ Is the particle currently active.
        this.active = typeof extend.active === 'undefined' || ( extend.active && true );

        // __{int}__ The particle id, used to reference its position in the particle buffer, it is allocated by the emitter and immutable.
        this.id = 0;

        this.init();
    };

    // ### function init()
    // Fires any extension functions that should happen only once and then fires a reset.
    Particle.prototype.init = function() {
        this.initialExtensions.apply( this );
        this.position.x = this.position.y = this.position.z = Number.POSITIVE_INFINITY;

        if ( this.active ) {
            this.reset();
        }
    };

    // ### function reset()
    // When a particle reaches the end of its life it fires the reset.
    Particle.prototype.reset = function() {
        this.resetExtensions.apply( this );
    };

    // ### function update()
    // Usually called every frame and is responsible for executing any particle logic.
    Particle.prototype.update = function() {
        // Bail if inactive
        if ( !this.active ) {
            return;
        }

        // Get age
        this.age = this.currentLife / this.maxLife;

        // Fire extension functions
        this.updateExtensions.apply( this );

        // Update age and reset if too old
        this.currentLife += 1;
        if ( this.currentLife >= this.maxLife ) {
            this.currentLife = 0;
            this.reset();
        }
    };

    // ### function applyForces( forces )
    // #### @forces {Vector3} A force vector
    // Exposes an external way to influence the movement of the particles.  Only additive.
    Particle.prototype.applyForces = function( forces ) {
        this.velocity.add( forces );
    };

    module.exports = Particle;

});