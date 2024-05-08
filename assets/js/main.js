function mainLoop() {
	requestAnimationFrame(mainLoop);
	DEMO.update();
}

function onDocumentMouseDown(event) {
    event.preventDefault();
    
    var mouse = new THREE.Vector2(
        ( event.clientX / window.innerWidth ) * 2 - 1, 
        - ( event.clientY / window.innerHeight ) * 2 + 1 );

    DEMO.ms_Raycaster.setFromCamera( mouse, DEMO.ms_Camera );
    var intersects = DEMO.ms_Raycaster.intersectObjects( DEMO.ms_Clickable );    

    if (intersects.length > 0) {  
        intersects[0].object.callback();
    }                
}

$(function() {
	WINDOW.initialize();

	document.addEventListener('click', onDocumentMouseDown, false);
	
	var parameters = {
		alea: RAND_MT,
		generator: PN_GENERATOR,
		width: 2000,
		height: 2000,
		widthSegments: 250,
		heightSegments: 250,
		depth: 1500,
		param: 4,
		filterparam: 1,
		filter: [ CIRCLE_FILTER ],
		postgen: [ MOUNTAINS_COLORS ],
		effect: [ DESTRUCTURE_EFFECT ]
	};
	
	DEMO.initialize('canvas-3d', parameters);
	
	WINDOW.resizeCallback = function(inWidth, inHeight) { DEMO.resize(inWidth, inHeight); };
	DEMO.resize(WINDOW.ms_Width, WINDOW.ms_Height);
	
	mainLoop();
});

var quotes = [
	"If I were to tell you that this isn't the end—that we will meet again—would you believe me?",
	"We are the stories we tell ourselves. The brave hero, the tortured soul, the altruist, the pragmatist. They will tell you who they see, but you and you alone know who you are.",
	"To ignore the plight of those one might conceivably save is not wisdom-- it is indolence. We must all protect that which we most hold dear in the manner of our own choosing.",
	"If you had the strength to take another step, could you do it?",
	"Believe in something. Even if it means sacrificing everything.",
	"May you ever walk in the light of the crystal.",
	"Courage is not the absence of fear, it is the triumph over it.",
	"It's true. I have no authority whatsoever. But what I lack in authority, I make up for in friends.",
	"When the prophecy is fulfilled, all in thrall to darkness shall know peace.",
	"I do not fear death. What I fear is doing nothing and losing everything.",
	"My life is nothing. Giving the future to those who want to see it...is everything.",
	"My love will be with you forever, my dearest children.",
]
var randomNumber = Math.floor(Math.random()*quotes.length)

document.getElementById('quote').innerHTML = `<p>"${quotes[randomNumber]}"</p>`
