var DEMO = {
	ms_Canvas: null,
	ms_Renderer: null,
	ms_Camera: null, 
	ms_Scene: null, 
	ms_Controls: null,
	ms_Water: null,
	ms_FilesDND: null,
	ms_Raycaster: null,
	ms_Clickable: [],
	ms_Earth: null,
	ms_Clouds: null,
	ms_Rand: (min,max) => min + Math.random()*(max-min),
	ms_MAX: 100,
	ms_Particles: null,

    enable: (function enable() {
        try {
            var aCanvas = document.createElement('canvas');
            return !! window.WebGLRenderingContext && (aCanvas.getContext('webgl') || aCanvas.getContext('experimental-webgl'));
        }
        catch(e) {
            return false;
        }
    })(),
	
	initialize: function initialize(inIdCanvas, inParameters) {
		this.ms_Canvas = $('#'+inIdCanvas);
		
		// Initialize Renderer, Camera, Projector and Scene
		this.ms_Renderer = this.enable? new THREE.WebGLRenderer() : new THREE.CanvasRenderer();
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.ms_Scene = new THREE.Scene();
		
		this.ms_Camera = new THREE.PerspectiveCamera(55.0, WINDOW.ms_Width / WINDOW.ms_Height, 0.5, 3000000);
		this.ms_Camera.position.set(0, Math.max(inParameters.width * 1.5, inParameters.height) / 8, -inParameters.height);
		this.ms_Camera.lookAt(new THREE.Vector3(0, -2000, 0));

		this.ms_Raycaster = new THREE.Raycaster();
		
		// Initialize Orbit control	
		/*	
		this.ms_Controls = new THREE.OrbitControls(this.ms_Camera, this.ms_Renderer.domElement);
		this.ms_Controls.userPan = false;
		this.ms_Controls.userPanSpeed = 0.0;
		this.ms_Controls.maxDistance = 5000.0;
		this.ms_Controls.maxPolarAngle = Math.PI * 0.495; */
	
		// Add light
		var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(-567800000, -1056780000, 1267000);
		this.ms_Scene.add(directionalLight);

		//this.ms_Scene.add(new THREE.DirectionalLightHelper(directionalLight, 600))
		
		// Create terrain
		this.loadTerrain(inParameters);
		
		// Load textures		
		var waterNormals = new THREE.ImageUtils.loadTexture('/assets/img/waternormals.jpg');
		waterNormals.wrapS = waterNormals.wrapT = THREE.RepeatWrapping; 
		
		// Load filesdnd texture
		/*new Konami(function() {
			if(DEMO.ms_FilesDND == null)
			{
				var aTextureFDND = THREE.ImageUtils.loadTexture("assets/img/filesdnd_ad.png");
				aTextureFDND.minFilter = THREE.LinearFilter;
				DEMO.ms_FilesDND = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000), new THREE.MeshBasicMaterial({ map : aTextureFDND, transparent: true, side : THREE.DoubleSide }));

				// Mesh callback
				DEMO.ms_FilesDND.callback = function() { window.open("http://www.filesdnd.com"); }
				DEMO.ms_Clickable.push(DEMO.ms_FilesDND);
				
				DEMO.ms_FilesDND.position.y = 1200;
				DEMO.ms_Scene.add(DEMO.ms_FilesDND);
			}
		});*/
		
		// Create the water effect
		this.ms_Water = new THREE.Water(this.ms_Renderer, this.ms_Camera, this.ms_Scene, {
			textureWidth: 512, 
			textureHeight: 512,
			waterNormals: waterNormals,
			alpha: 	1.0,
			sunDirection: directionalLight.position.normalize(),
			sunColor: 0xffffff,
			waterColor: 0x001d36,
			distortionScale: 50.0
		});
		var aMeshMirror = new THREE.Mesh(
			new THREE.PlaneBufferGeometry(inParameters.width * 500, inParameters.height * 500, 10, 10), 
			this.ms_Water.material
		);
		aMeshMirror.add(this.ms_Water);
		aMeshMirror.rotation.x = - Math.PI * 0.5;
		this.ms_Scene.add(aMeshMirror);
	
		/*
		// Setup particles
		this.ms_Particles = []
		const partGeo = new THREE.Geometry()
		for (let i=0; i<this.ms_MAX; i++) {
			const particle = {
				position: new THREE.Vector3(
					this.ms_Rand(-1, 1),
					this.ms_Rand(-1, 1),
					this.ms_Rand(-1, -3)
				),
				velocity: new THREE.Vector3(
					this.ms_Rand(-0.01, 0.01),
					0.06,
					this.ms_Rand(-0.01, 0.01)
				),
				acceleration: new THREE.Vector3(0, -0.001, 0),
			}
			this.ms_Particles.push(particle)
			partGeo.vertices.push(particle.position)
		}
		const partMat = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 0.1
		})
		partMesh = new THREE.Points(partGeo, partMat)
		partMesh.position.z = -4
		this.ms_Scene.add(partMesh)*/

		this.loadSkyBox();
	},
	
	loadSkyBox: function loadSkyBox() {
		var aCubeMap = THREE.ImageUtils.loadTextureCube([
		  'assets/img/skybox_0.png',
		  'assets/img/skybox_1.png',
		  'assets/img/skybox_2.png',
		  'assets/img/skybox_3.png',
		  'assets/img/skybox_4.png',
		  'assets/img/skybox_5.png'
		]);
		aCubeMap.format = THREE.RGBFormat;

		var aShader = THREE.ShaderLib['cube'];
		aShader.uniforms['tCube'].value = aCubeMap;

		var aSkyBoxMaterial = new THREE.ShaderMaterial({
		  fragmentShader: aShader.fragmentShader,
		  vertexShader: aShader.vertexShader,
		  uniforms: aShader.uniforms,
		  depthWrite: false,
		  side: THREE.BackSide
		});

		var aSkybox = new THREE.Mesh(
		  new THREE.BoxGeometry(1000000, 1000000, 1000000),
		  aSkyBoxMaterial
		);
		
		this.ms_Scene.add(aSkybox);
	},
	
	loadTerrain: function loadTerrain(inParameters) {
		//var terrainGeo = TERRAINGEN.Get(inParameters);
		//var terrainMaterial = new THREE.MeshPhongMaterial({ vertexColors: THREE.VertexColors, shading: THREE.FlatShading, side: THREE.DoubleSide });

		//var terrain = new THREE.Mesh(terrainGeo, terrainMaterial);
		//terrain.position.y = - inParameters.depth * 0.4;
		//terrain.material.opacity = 0;
		//terrain.material.transparent = true;
		
		/*
		var terrainGeo = new THREE.BoxGeometry(2, 2, 2);
		var terrainMat = new THREE.MeshBasicMaterial();
		var terrain = new THREE.Mesh(terrainGeo, terrainMat);

		var earthGeo = new THREE.SphereGeometry(512, 32, 32);
		var earthMat = new THREE.MeshPhongMaterial();
		this.ms_Earth = new THREE.Mesh(earthGeo, earthMat);

		earthMat.map = THREE.ImageUtils.loadTexture('assets/img/earthmap1k.jpg')
		earthMat.bumpMap = THREE.ImageUtils.loadTexture('assets/img/earthbumpmap1k.jpg')
		earthMat.bumpScale = 0.05
		earthMat.specularMap = THREE.ImageUtils.loadTexture('assets/img/earthspec1k.jpg')
		earthMat.specular = new THREE.Color('grey')
		
		var canvasCloud = THREE.ImageUtils.loadTexture('assets/img/earthcloudmap1k.jpg')
		var cloudGeo = new THREE.SphereGeometry(512/2, 32, 32)
		var cloudMat = new THREE.MeshPhongMaterial({
			map: new THREE.Texture(canvasCloud),
			side: THREE.DoubleSide,
			opacity: 0.8,
			transparent: true,
			depthWrite: false,
		});
		this.ms_Clouds = new THREE.Mesh(cloudGeo, cloudMat)
		this.ms_Earth.add(this.ms_Clouds)
		
		this.ms_Earth.position.y = 532
		this.ms_Scene.add(terrain, this.ms_Earth);
		animate6()
		*/

		fogColor = new THREE.Color(0xffffff);

		this.ms_Scene.background = fogColor
		this.ms_Scene.fog = new THREE.Fog(fogColor, 1, 20);


	},
	
	display: function display() {
		this.ms_Water.render();
		this.ms_Renderer.render(this.ms_Scene, this.ms_Camera);
	},
	
	update: function update() {
		if (this.ms_FilesDND != null) {
			this.ms_FilesDND.rotation.y += 0.01;
		}
		this.ms_Water.material.uniforms.time.value += 1.0 / 60.0;
		//this.ms_Controls.update();

		this.display();
	},
	
	resize: function resize(inWidth, inHeight) {
		this.ms_Camera.aspect =  inWidth / inHeight;
		this.ms_Camera.updateProjectionMatrix();
		this.ms_Renderer.setSize(inWidth, inHeight);
		this.ms_Canvas.html(this.ms_Renderer.domElement);
		this.display();
	}
};

function animate6() {
	requestAnimationFrame(animate6);

	//DEMO.ms_Earth.rotation.y += 0.003;
	//DEMO.ms_Clouds.rotation.y += 0.001;

	

	DEMO.ms_Renderer.render(DEMO.ms_Scene, DEMO.ms_Camera);
}
