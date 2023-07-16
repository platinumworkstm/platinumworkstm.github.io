// index.js
//
// main entry point
// creates a particle system and makes it go
define( function( require ) {

    var Emitter = require( 'particles/emitter' ),
        Particle = require( 'particles/particle' ),
        CopyShader = require( 'vendor/CopyShader' ),
        HBlurShader = require( 'vendor/HorizontalBlurShader' ),
        VBlurShader = require( 'vendor/VerticalBlurShader' ),
        DotScreenShader = require( 'vendor/DotScreenShader' ),
        MaskPass = require( 'vendor/MaskPass' ),
        ShaderPass = require( 'vendor/ShaderPass' ),
        RenderPass = require( 'vendor/RenderPass' ),
        Composer = require( 'vendor/EffectComposer' );

    // Add Stats
    var stats = new Stats();
    stats.setMode( 0 );
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild( stats.domElement );

    // constants
    var NUM_PARTICLES = 20,
        CAM_MAX_SPEED = 10,
        CAM_ACCEL = 2,
        CAM_INERTIA = 0.1;

    // stuff - kind of global
    var camera, scene, renderer, composer;
    var ps;

    // Fire into it
    init();
    render();

    // Set stuff up, innit?
    function init() {

        camera = window.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 10, 1000 );
        camera.position.z = 100;
        camera.velocity = new THREE.Vector3( 0,0,0 );

        scene = window.scene = new THREE.Scene();

        // particle extension functions
        var pExt = window.pExt = {
            initialExtensions: {
                age: function() {
                    this.maxLife = 200;
                },
                alpha: function() {
                    this.alpha = 1;
                }
            },
            updateExtensions: {
                position: function() {
                    this.position.add( this.velocity );
                },
                scale: function() {
//                    this.scale *= 0.99;
                },
                color: function() {
                    this.color.r = this.age;
                    this.color.g = 1;
                    this.color.b = 0;
                },
                alpha: function() {
//                    this.alpha = 1 - this.age;
                }
            },
            resetExtensions: {
                position: function() {
                    this.position.x = Math.random() * 150 - 75;
                    this.position.y = Math.random() * 150 - 75;
                    this.position.z = 0;
                },
                velocity: function() {
                    this.velocity.x = 0;
                    this.velocity.y = 0;
                    this.velocity.z = 0;
                },
                scale: function() {
                    this.scale = Math.random() * 50 + 100;
                },
                color: function() {
                    this.color.r = 0;
                    this.color.g = 1;
                    this.color.b = 0;
                },
                alpha: function() {
                    this.alpha = 1;
                }
            }
        };

        // create the particle emitter and add it to the scene
        ps = window.ps = new Emitter( {
            position: new THREE.Vector3( 0, 0, 0 ),
            forces: new THREE.Vector3( 0, 0, 0 ),
            maxParticles: NUM_PARTICLES,
            particle: Particle,
            extendParticle: pExt
        } );
        scene.add( ps.system );

        // Create renderer
        renderer = window.renderer = new THREE.WebGLRenderer( {
            alpha: true
        } );
        renderer.setSize( window.innerWidth, window.innerHeight );
        renderer.setClearColor( 0x000000, 0 );

        // Add effects composer for post processing
        composer = new THREE.EffectComposer( renderer );
        composer.addPass( new THREE.RenderPass( scene, camera ) );

        var hblur = new THREE.ShaderPass( THREE.HorizontalBlurShader );
        var vblur = new THREE.ShaderPass( THREE.VerticalBlurShader);
        hblur.uniforms.h.value =  1 / window.innerWidth;
		vblur.uniforms.v.value =  1 / window.innerHeight;
		composer.addPass( hblur );
		composer.addPass( vblur );

        var dotScreenEffect = new THREE.ShaderPass( THREE.DotScreenShader );
        dotScreenEffect.uniforms.scale.value = 4;
//        composer.addPass( dotScreenEffect );

        var copy = new THREE.ShaderPass( THREE.CopyShader );
        copy.renderToScreen = true;
        composer.addPass( copy );

        document.body.appendChild( renderer.domElement );

        registerEvents();
    }

    // The render loop where most of the action happens
    function render() {

        // render particle system
        if ( ps ) {
            ps.render();
        }


        // update camera
        camera.position.add( camera.velocity );
        if ( camera.velocity.z > 0 ) {
            camera.velocity.z -= CAM_INERTIA;
        } else if ( camera.velocity.z < 0 ) {
            camera.velocity.z += CAM_INERTIA;
        }

        // render the scene using the camera
//        renderer.render(scene, camera);
        composer.render();

        // note: three.js includes requestAnimationFrame shim
        requestAnimationFrame( render );

        stats.update();
    }


    // Catch events and respond
    function registerEvents() {

        document.addEventListener( 'keydown', function( event ) {
            // Up arrow
            if ( event.keyCode === 32 ) {
                console.log( 'hit space' );
                var p;
                for ( var i = 0; i < 50; i++ ) {
//                    ps.particles[i].position.x = 0;
//                    ps.particles[i].position.y = 0;
                    p = new ps.particle();
                    ps.particles.push( p);
                    ps.geometry.vertices.push( p.position );
                    ps.attributes.alpha.value.push( 1 );
                    ps.attributes.size.value.push( 200 );
                    ps.attributes.pcolor.value.push( new THREE.Color( 1, 0, 1 ) );
                }
            }

            // Down
            if ( event.keyCode === 40 ) {
            }

            // space
//            if ( event.keyCode === 32 ) {
//                scene.remove( ps.system );
//                ps = window.ps = new Emitter( {
//                    position: new THREE.Vector3( Math.random() * 300 - 150, Math.random() * 300 - 150, 0 ),
//                    forces: new THREE.Vector3( Math.random() * 0.2 - 0.1, Math.random() * 0.2 - 0.1, 0 ),
//                    maxParticles: NUM_PARTICLES,
//                    particle: Particle,
//                    extendParticle: window.pExt
//                } );
//                scene.add( ps.system );
//            }
        }, true );

    }
});