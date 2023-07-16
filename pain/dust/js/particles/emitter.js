
define( function( require, exports, module ) {
    'use strict';

    var Particle = require( 'particles/particle' ),
        doubleLL = require( 'utils/linked-list' ).doubleLL;

    // Creates a simple gradient circle
    function generateSprite() {
        var canvas = document.createElement( 'canvas' );
        canvas.width = 128;
        canvas.height = 128;

        var context = canvas.getContext( '2d' );

        context.beginPath();
        context.arc( canvas.width / 2, canvas.height / 2, 60, 0, Math.PI * 2, false) ;

        context.lineWidth = 0.05; //0.05
        context.stroke();
        context.restore();

        var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );

        gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
        gradient.addColorStop( 0.2, 'rgba(255,255,255,0.6)' );
        gradient.addColorStop( 0.4, 'rgba(200,200,200,0.2)' );
        gradient.addColorStop( 0.8, 'rgba(0,0,0,0)' );
        gradient.addColorStop( 1, 'rgba(0,0,0,0)' );

        context.fillStyle = gradient;

        context.fill();

        return canvas;
    }

    // Constructor function
    var ParticleEmitter = function( extend ) {

        // Specify the extension object
        extend = extend || {};

        // Privates
        this.position = extend.position || new THREE.Vector3( 0, 0, 0 );
        this.forces = extend.forces || new THREE.Vector3( 0, 0, 0);
        this.maxParticles = extend.maxParticles || 10;
        this.activeParticles = extend.activeParticles || this.maxParticles;
        this.particle = extend.particle || Particle;
        this.extendParticle = extend.extendParticle || null;

        this.system = null;     // Having the actual THREE particle system as a prop is pretty annoying as this object should BE a THREE particle system

        this.particles = doubleLL;
        this.geometry = new THREE.Geometry();
        this.attributes = null;
        this.uniforms = null;

        // Set this up
        this.init();
    };

    // Initialises the system
    ParticleEmitter.prototype.init = function() {
        var p;

        var material = this.createMaterial();

        var valueSize = this.attributes.size.value;
        var valueColor = this.attributes.pcolor.value;
        var valueAlpha = this.attributes.alpha.value;

        var extension = this.extendParticle;

        // Populate the particle buffer
        for( var i = 0; i < this.maxParticles; i++ ) {
            // If we've reached the active limit then create the particles inactive
            if ( i >= this.activeParticles ) {
                extension.active = false;
            }

            p = new this.particle( extension );
            p.id = i;
            this.particles.push( p );
            this.geometry
                    .vertices
                    .push( p.position );

            valueSize[ i ] = p.scale || 10;
            valueColor[ i ] = p.color || new THREE.Color( 0xFFFFFF);
            valueAlpha[ i ] = p.alpha || 1.0;
        }

        this.system = new THREE.ParticleSystem( this.geometry, material );
        this.system.position = this.position;
//        this.system.sortParticles = true;
    };

    // Create material for shader
    ParticleEmitter.prototype.createMaterial = function() {
        var texture = new THREE.Texture( generateSprite() );
        texture.needsUpdate = true;

        this.attributes = {
            size:  { type: 'f', value: [] },
            pcolor: { type: 'c', value: [] },
            alpha: { type: 'f', value: [] }
        };

        this.uniforms = {
            texture:   { type: 't', value: texture }
        };

        var shaderMaterial = new THREE.ShaderMaterial( {
            uniforms: this.uniforms,
            attributes: this.attributes,

            vertexShader: document.getElementById( 'vertexshader' ).textContent,
            fragmentShader: document.getElementById( 'fragmentshader' ).textContent,

            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true
        });

        return shaderMaterial;
    };

    // Renders all those particles
    ParticleEmitter.prototype.render = function() {
        var self = this;

        this.particles.forEach( function( particle, i ) {
            particle.update();
            particle.applyForces( self.forces );

            self.attributes.size.value[ particle.id ] = particle.scale;
            self.attributes.alpha.value[ particle.id ] = particle.alpha;
            self.attributes.pcolor.value[ particle.id ] = particle.color;      // This isnt actually necessary
        });

        this.system.geometry.verticesNeedUpdate = true;
        this.attributes.size.needsUpdate = true;
        this.attributes.pcolor.needsUpdate = true;
    };

    // Expose the module
    module.exports = ParticleEmitter;

});