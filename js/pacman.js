var renderer, HUDrenderer;
var camera, HUDcamera;
var spotLight;
var scene;

var player;

var rw = 300, rh = 375;
var ca = 100, ar = 1;

var cameradist = -40, cameraheight = 50;

var level = [
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW',
    'W------------WW------------W',
    'W-WWWW-WWWWW-WW-WWWWW-WWWW-W',
    'W=W  W-W   W-WW-W   W-W  W=W',
    'W-WWWW-WWWWW-WW-WWWWW-WWWW-W',
    'W--------------------------W',
    'W-WWWW-WW-WWWWWWWW-WW-WWWW-W',
    'W-WWWW-WW-WWWWWWWW-WW-WWWW-W',
    'W------WW----WW----WW------W',
    'WWWWWW-WWWWW WW WWWWW-WWWWWW',
    '     W-WWWWW WW WWWWW-W     ',
    '     W-WW          WW-W     ',
    '     W-WW WWWGGWWW WW-W     ',
    'WWWWWW-WW WGGGGGGW WW-WWWWWW',
    '      -   WGGGGGGW   -      ',
    'WWWWWW-WW WGGGGGGW WW-WWWWWW',
    '     W-WW WWWWWWWW WW-W     ',
    '     W-WW          WW-W     ',
    '     W-WW WWWWWWWW WW-W     ',
    'WWWWWW-WW WWWWWWWW WW-WWWWWW',
    'W------------WW------------W',
    'W-WWWW-WWWWW-WW-WWWWW-WWWW-W',
    'W-WWWW-WWWWW-WW-WWWWW-WWWW-W',
    'W=--WW-------  -------WW--=W',
    'WWW-WW-WW-WWWWWWWW-WW-WW-WWW',
    'WWW-WW-WW-WWWWWWWW-WW-WW-WWW',
    'W------WW----WW----WW------W',
    'W-WWWWWWWWWW-WW-WWWWWWWWWW-W',
    'W-WWWWWWWWWW-WW-WWWWWWWWWW-W',
    'W--------------------------W',
    'WWWWWWWWWWWWWWWWWWWWWWWWWWWW'
];



function init()
{
    scene = new THREE.Scene();

    addRenderers();
    addCameras();
    addSpotlight();

    addGroundplane();
    createMap();

    addPlayer();

    var container = document.getElementById("MainView");
    container.appendChild(renderer.domElement);

    var HUDcontainer = document.getElementById("HUDView");
    HUDcontainer.appendChild(HUDrenderer.domElement);


    new THREE.OrbitControls(camera, renderer.domElement);

    render();
}

function render()
{
    maintainPlayerMovement();
    maintainCameraMovement();



    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

    HUDrenderer.setScissorTest(true);
    HUDrenderer.setViewport(0, 0, rw, rh);
    HUDrenderer.setScissor(0, 0, rw, rh);
    HUDrenderer.render(scene, HUDcamera);

    //Request animation frame
    requestAnimationFrame(render);
}

function addRenderers()
{
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 0);
    renderer.setSize( window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;

    HUDrenderer = new THREE.WebGLRenderer();
    HUDrenderer.setClearColor(0x000000, 0);
    HUDrenderer.setSize(rw, rh);
    HUDrenderer.shadowMap.enabled = true;
    HUDrenderer.shadowMapSoft = true;
}

function addCameras()
{
    camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 1000);
    camera.position.set(0, cameradist, cameraheight);
    //camera.position.set(0, 0, 500)
    camera.lookAt(scene.position);


    HUDcamera = new THREE.PerspectiveCamera(ca, ar, 0.1, 4000);
    HUDcamera.position.z = 175;
    HUDcamera.lookAt(new THREE.Vector3(0, 0, 0));

    scene.add(new THREE.CameraHelper(HUDcamera));
}

function addSpotlight()
{
    spotLight = new THREE.SpotLight( 0xffffff, 1.75);
    spotLight.position.set(0, 30, 500);
    spotLight.angle = 1.05;
    spotLight.distance = 1000;
    spotLight.penumbra = 0;
    spotLight.decay = 0.5;
    spotLight.shadow.camera.visible = true;
    spotLight.shadow.camera.near = 10;
    spotLight.shadow.camera.far = 1000;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    spotLight.shadow.camera.right = 10;
    spotLight.shadow.camera.left = -10;
    spotLight.shadow.camera.top = 5;
    spotLight.shadow.camera.bottom = -5;

    spotLight.castShadow = true;
    scene.add(spotLight);
    
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);
}

function addPlayer()
{
    var playerGeometry = new THREE.CylinderGeometry(.1, 3, 6, 32);
    var playerMaterial = new THREE.MeshLambertMaterial({color:'white'});
    
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, 0, 0);
    scene.add(player);
}

function maintainPlayerMovement()
{
    if(Key.isDown(Key.A))
    {
        player.rotation.z += 0.2;
    }

    if(Key.isDown(Key.D))
    {
        player.rotation.z -= 0.2;
    }

    if(Key.isDown(Key.W))
    {
        var deltaX = Math.sin(player.rotation.z)*.4;
        var deltaY = Math.cos(player.rotation.z)*.4;
        player.position.x -= deltaX;
        player.position.y += deltaY;
    }

    if(Key.isDown(Key.S))
    {
        var deltaX = Math.sin(player.rotation.z)*.4;
        var deltaY = Math.cos(player.rotation.z)*.4;
        player.position.x += deltaX;
        player.position.y -= deltaY;
    }
}

function maintainCameraMovement()
{
    camera.position.x = player.position.x;
    camera.position.y = player.position.y + cameradist;
    camera.position.z = player.position.z + cameraheight;

    camera.lookAt(player.position);
}

var groundPlane;
var mapwidth = 280, maplength = 310;
function addGroundplane()
{
    var loader = new THREE.TextureLoader();
    loader.load('images/floor.jpg', function (texture) {
        
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.offset.set(0,0);
        texture.repeat.set(5,5);

        var planeGeometry = new THREE.PlaneGeometry(mapwidth, maplength);
        var planeMaterial = new THREE.MeshLambertMaterial({map: texture});

        groundPlane = new THREE.Mesh(planeGeometry, planeMaterial);

        groundPlane.receiveShadow = true;
        groundPlane.position.set(0, 0, -3);

        scene.add(groundPlane);
    });
}

function createMap()
{
    for(var column = 0; column < level.length; column++){
        for(var row = 0; row < level[column].length; row++){
            var char = level[column].charAt(row)
            switch(char){
                case 'W':
                    addWall(row*(mapwidth/28) + (mapwidth/56), -column*(maplength/31) - (maplength/62), 2);
                    break;
                case '-':
                    addPellet(row*(mapwidth/28) + (mapwidth/56), -column*(maplength/31) - (maplength/62), 1);
            }
        }
    }
}

function addWall(x, y, z)
{
    var wallGeometry = new THREE.BoxGeometry(mapwidth/28, maplength/31, 6);
    var wallMaterial = new THREE.MeshLambertMaterial({color: 'blue'});

    var Wall = new THREE.Mesh(wallGeometry, wallMaterial);
    //Wall.receiveShadow = true;
    //Wall.castShadow = true;

    Wall.position.set(x, y, z);
    Wall.position.x -= mapwidth/2;
    Wall.position.y += maplength/2 - 2;
    scene.add(Wall);
}

function addPellet(x, y, z)
{
    var pelletGeometry = new THREE.SphereGeometry(1, 32, 32);
    var pelletMaterial = new THREE.MeshPhongMaterial({color: 'yellow'});

    var pellet = new THREE.Mesh(pelletGeometry, pelletMaterial);
    //pellet.receiveShadow = true;
    //pellet.castShadow = true;

    pellet.position.set(x, y, z);
    pellet.position.x -= mapwidth/2;
    pellet.position.y += maplength/2 -2;
    scene.add(pellet);
}



window.onload = init;