require.config({

    baseUrl: 'js',

    paths: {
        three: 'vendor/three',
        stats: 'vendor/stats.min',
        tween: 'vendor/Tween'
    },

    shim: {
        'vendor/three': {
            exports: 'THREE'
        },
        'vendor/stats.min': {
            exports: 'Stats'
        },
        'vendor/Tween': {
            exports: 'TWEEN'
        }
    }

});

// Require globals before other shizzle
require( [ 'three', 'stats', 'tween' ], function( three, stats, tween ) {
    console.info( 'globals defined' );

    // Fire into the main project function
    require( ['index'] );
} );

