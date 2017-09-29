var renderer, HUDrenderer;
var camera, HUDcamera;
var spotLight;
var scene;

var player;

var prevTime = performance.now();

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
    '     W-WW WWWWWWWW WW-W     ',
    'WWWWWW-WW WWWWWWWW WW-WWWWWW',
    'WWWWWW-   WWWWWWWW   -WWWWWW',
    'WWWWWW-WW WWWWWWWW WW-WWWWWW',
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

var getPellet, getPower;
var win;
var lose;
function loadSounds()
{
    getPellet = new Audio("sounds/getPellet.mp3");
    getPellet.volume = .4;
    getPower = new Audio("sounds/getPower.mp3");
    getPower.volume = .4;

    win = new Audio("sounds/win.mp3");
    win.volume = .4;
    lose = new Audio("sounds/lose.mp3");
    lose.volume = .4;
}


function init()
{
    scene = new THREE.Scene();

    loadSounds();

    addRenderers();
    addCameras();
    addSpotlight();

    createPelletArray();
    createPowerArray();

    addGroundplane();
    createMap();

    addPlayer();
    addEnemy1();
    addEnemy2();
    addEnemy3();
    addEnemy4();

    var container = document.getElementById("MainView");
    container.appendChild(renderer.domElement);

    var HUDcontainer = document.getElementById("HUDView");
    HUDcontainer.appendChild(HUDrenderer.domElement);


    new THREE.OrbitControls(camera, renderer.domElement);

    render();
}

function render()
{
    maintainSpotlight();

    maintainPlayerMovement();
    maintainCameraMovement();

    maintainEnemy1Movement();
    maintainEnemy2Movement();
    maintainEnemy3Movement();
    maintainEnemy4Movement();


    checkPlayerPosition();
    checkPellet();
    checkPower();

    handleReset();

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

function handleReset()
{
    if(Key.isDown(Key.R)){
        reset();
    }
}

function reset()
{
    scene.remove(player);
    scene.remove(Enemy1);
    scene.remove(Enemy2);
    scene.remove(Enemy3);
    scene.remove(Enemy4);

    for (var i = 0; i < hold.length; i++) {
        scene.remove(hold[i]);
    }

    hold = [];
    PelletArray = new Array(31);
    PowerArray = new Array(31);

    createPelletArray();
    createPowerArray();

    camera.position.set(0, -(maplength / 3.85) + cameradist, cameraheight);

    createMap();

    addPlayer();
    addEnemy1();
    addEnemy2();
    addEnemy3();
    addEnemy4();

    direction1 = Math.round(Math.random() * 10) % 4;
    direction2 = Math.round(Math.random() * 10) % 4;
    direction3 = Math.round(Math.random() * 10) % 4;
    direction4 = Math.round(Math.random() * 10) % 4;
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
    camera.position.set(0, -(maplength/3.85) + cameradist, cameraheight);
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

var switchSpotlight = true;
function maintainSpotlight()
{
    if(switchSpotlight){
        setTimeout(function() {
            spotLight.intensity = 1.5;
            switchSpotlight = false; 
        }, 1500);
    }
    else{
        setTimeout(function() {
            spotLight.intensity = .95;
            switchSpotlight = true; 
        }, 1500);
    }
}

function addPlayer()
{
    var playerGeometry = new THREE.CylinderGeometry(.1, 3, 6, 32);
    var playerMaterial = new THREE.MeshLambertMaterial({color:'white'});
    
    player = new THREE.Mesh(playerGeometry, playerMaterial);
    player.position.set(0, -(maplength/3.85), 0);
    scene.add(player);
}

var playerX, playerY;
function checkPlayerPosition()
{
    playerX = Math.round((player.position.x + mapwidth/2)/(mapwidth/28) - mapwidth/56 ) + 5;
    playerY = -(Math.round((player.position.y - maplength/2 + 2)/(maplength/31) + maplength/62) - 5);
}


function maintainPlayerMovement()
{
    var time = performance.now();
    var dtime = time - prevTime;
    if(dtime > 500) {
        prevTime = time;
        dtime = 0;
    }
    var perframe = dtime / 1000 * 60;

    if(Key.isDown(Key.A))
    {
       // player.rotation.z += perframe * 0.05;
       
       if(level[playerY].charAt(playerX - 1) === 'W'){
            player.rotation.z = Math.PI/2;
            player.position.x += 0;
       }
       else {
            player.rotation.z = Math.PI/2;
            player.position.x -= perframe * 0.4;
       }

    }

    else if(Key.isDown(Key.D))
    {
       // player.rotation.z -= perframe * 0.05;

       if(level[playerY].charAt(playerX) == 'W'){
           player.rotation.z = -Math.PI/2;
           player.position.x += 0;

           console.log("playerX:" + (playerX));
           console.log("playerY:" + playerY);
       }
       else {
           player.rotation.z = -Math.PI/2;
           player.position.x += perframe * 0.4;
       }
    }

    else if(Key.isDown(Key.W))
    {
        // var deltaX = perframe * Math.sin(player.rotation.z)*.3;
        // var deltaY =perframe *  Math.cos(player.rotation.z)*.3;
        // player.position.x -= deltaX;
        // player.position.y += deltaY;

        if(level[playerY - 1].charAt(playerX) == 'W'){
            player.rotation.z = 0;
            player.position.y += 0;            
        }
        else{
            player.rotation.z = 0;
            player.position.y += perframe * 0.4;
        }
    }

    else if(Key.isDown(Key.S))
    {
        // var deltaX = perframe * Math.sin(player.rotation.z)*.3;
        // var deltaY = perframe * Math.cos(player.rotation.z)*.3;
        // player.position.x += deltaX;
        // player.position.y -= deltaY;

        if(level[playerY].charAt(playerX) == 'W'){
            player.rotation.z = -Math.PI;
            player.position.y += 0;
        }
        else{
            player.rotation.z = -Math.PI;
            player.position.y -= perframe * 0.4;
        }
    }

    prevTime = time;
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
    for(var row = 0; row < level.length; row++){
        for(var column = 0; column < level[row].length; column++){
            var char = level[row].charAt(column)
            switch(char){
                case 'W':
                    addWall(column*(mapwidth/28) + (mapwidth/56), -row*(maplength/31) - (maplength/62), 1);
                    break;
                case '-':
                    addPellet(column, row, .5);
                    break;
                case '=':
                    addPower(column, row, 1);
                    break;
            }
        }
    }
}

var hold = [];
function addWall(x, y, z)
{
    var wallGeometry = new THREE.BoxGeometry(mapwidth/28, maplength/31, 6);
    var wallMaterial = new THREE.MeshLambertMaterial({color: 'blue'});

    var Wall = new THREE.Mesh(wallGeometry, wallMaterial);
    //Wall.receiveShadow = true;
    //Wall.castShadow = true;

    hold.push(Wall);

    Wall.position.set(x, y, z);
    Wall.position.x -= mapwidth/2;
    Wall.position.y += maplength/2 - 2;
    scene.add(Wall);

    var r = Math.floor( Math.random() * 255 );
    var g = Math.floor( Math.random() * 255 );
    var b = Math.floor( Math.random() * 255 );
    var color = r * 65536 + g * 256 + b;

    var topWallGeometry = new THREE.BoxGeometry(mapwidth/56, maplength/62, 9);
    var topWallMaterial = new THREE.MeshLambertMaterial({color: color});

    var topWall = new THREE.Mesh(topWallGeometry, topWallMaterial);

    hold.push(topWall);

    topWall.position.set(x, y, z + 1);
    topWall.position.x -= mapwidth/2;
    topWall.position.y += maplength/2 - 2;
    scene.add(topWall);
}

var PelletArray = new Array(31);
function createPelletArray()
{
    for(var i = 0; i < PelletArray.length; i++){
        PelletArray[i] = new Array(28);
    }
}

function addPellet(x, y, z)
{
    var pelletGeometry = new THREE.SphereGeometry(1, 32, 32);
    var pelletMaterial = new THREE.MeshPhongMaterial({color: 'red'});

    var pellet = new THREE.Mesh(pelletGeometry, pelletMaterial);
    //pellet.receiveShadow = true;
    //pellet.castShadow = true;

    PelletArray[y][x] = pellet;
    hold.push(pellet);

    pellet.position.set(x*(mapwidth/28) + (mapwidth/56), -y*(maplength/31) - (maplength/62), z);
    pellet.position.x -= mapwidth/2;
    pellet.position.y += maplength/2 - 2;
    scene.add(pellet);
}

function checkPellet()
{
    if(PelletArray[playerY][playerX]){
        getPellet.play();
        scene.remove(PelletArray[playerY][playerX]);
        PelletArray[playerY][playerX] = null;
    }
}

var PowerArray = new Array(31);
function createPowerArray()
{
    for(var i = 0; i < PowerArray.length; i++){
        PowerArray[i] = new Array(28);
    }
}

function addPower(x, y, z)
{
    var powerGeometry = new THREE.SphereGeometry(1.75, 32, 32);
    var powerMaterial = new THREE.MeshPhongMaterial({color: 'yellow'});

    var power = new THREE.Mesh(powerGeometry, powerMaterial);

    PowerArray[y][x] = power;
    hold.push(power);

    power.position.set(x*(mapwidth/28) + (mapwidth/56), -y*(maplength/31) - (maplength/62), z);
    power.position.x -= mapwidth/2;
    power.position.y += maplength/2 - 2;
    scene.add(power);
}

function checkPower()
{
    if(PowerArray[playerY][playerX]){
        getPower.play();
        scene.remove(PowerArray[playerY][playerX]);
        PowerArray[playerY][playerX] = null;
    }
}

var Enemy1, Enemy2, Enemy3, Enemy4;
function addEnemy1()
{
    var EnemyGeometry = new THREE.SphereGeometry(3, 32, 32);
    var EnemyMaterial = new THREE.MeshLambertMaterial({color: 'pink'});

    Enemy1 = new THREE.Mesh(EnemyGeometry, EnemyMaterial);

    Enemy1.position.set(-98, 139.5, 1);

    scene.add(Enemy1);
}

function addEnemy2()
{
    var EnemyGeometry = new THREE.SphereGeometry(3, 32, 32);
    var EnemyMaterial = new THREE.MeshLambertMaterial({color: 'pink'});

    Enemy2 = new THREE.Mesh(EnemyGeometry, EnemyMaterial);

    Enemy2.position.set(98, 139.5, 1);

    scene.add(Enemy2);
}

function addEnemy3()
{
    var EnemyGeometry = new THREE.SphereGeometry(3, 32, 32);
    var EnemyMaterial = new THREE.MeshLambertMaterial({color: 'pink'});

    Enemy3 = new THREE.Mesh(EnemyGeometry, EnemyMaterial);

    Enemy3.position.set(-98, -139.5, 1);

    scene.add(Enemy3);
}

function addEnemy4()
{
    var EnemyGeometry = new THREE.SphereGeometry(3, 32, 32);
    var EnemyMaterial = new THREE.MeshLambertMaterial({color: 'pink'});

    Enemy4 = new THREE.Mesh(EnemyGeometry, EnemyMaterial);

    Enemy4.position.set(98, -139.5, 1);

    scene.add(Enemy4);
}

var direction1 = Math.round(Math.random()*10) % 4;
function maintainEnemy1Movement()
{
    var EnemyX = Math.round((Enemy1.position.x + mapwidth/2)/(mapwidth/28) - mapwidth/56 ) + 5;
    var EnemyY = -(Math.round((Enemy1.position.y - maplength/2 + 2)/(maplength/31) + maplength/62) - 5);

    if(direction1 == 0)
    {  
       if(level[EnemyY].charAt(EnemyX - 1) === 'W'){
            direction1 = Math.round(Math.random()*10) % 4;
       }
       else {
            Enemy1.position.x -= 0.8;
       }

    }

    else if(direction1 == 1)
    {
       if(level[EnemyY].charAt(EnemyX) == 'W'){
           direction1 = Math.round(Math.random()*10) % 4;
       }
       else {
           Enemy1.position.x += 0.8;
       }
    }

    else if(direction1 == 2)
    {
        if(level[EnemyY - 1].charAt(EnemyX) == 'W'){
            direction1 = Math.round(Math.random()*10) % 4;        
        }
        else{
            Enemy1.position.y += 0.8;
        }
    }

    else if(direction1 == 3)
    {
        if(level[EnemyY].charAt(EnemyX) == 'W'){
            direction1 = Math.round(Math.random()*10) % 4;
        }
        else{
            Enemy1.position.y -= 0.8;
        }
    }


    if(EnemyY == playerY && EnemyX == playerX){
        direction1 = 4;
        lose.play();
        reset();
    }
}

var direction2 = Math.round(Math.random()*10) % 4;
function maintainEnemy2Movement()
{
    var EnemyX = Math.round((Enemy2.position.x + mapwidth/2)/(mapwidth/28) - mapwidth/56 ) + 5;
    var EnemyY = -(Math.round((Enemy2.position.y - maplength/2 + 2)/(maplength/31) + maplength/62) - 5);

    if(direction2 == 0)
    {  
       if(level[EnemyY].charAt(EnemyX - 1) === 'W'){
            direction2 = Math.round(Math.random()*10) % 4;
       }
       else {
            Enemy2.position.x -= 0.9;
       }

    }

    else if(direction2 == 1)
    {
       if(level[EnemyY].charAt(EnemyX) == 'W'){
           direction2 = Math.round(Math.random()*10) % 4;
       }
       else {
           Enemy2.position.x += 0.9;
       }
    }

    else if(direction2 == 2)
    {
        if(level[EnemyY - 1].charAt(EnemyX) == 'W'){
            direction2 = Math.round(Math.random()*10) % 4;        
        }
        else{
            Enemy2.position.y += 0.9;
        }
    }

    else if(direction2 == 3)
    {
        if(level[EnemyY].charAt(EnemyX) == 'W'){
            direction2 = Math.round(Math.random()*10) % 4;
        }
        else{
            Enemy2.position.y -= 0.9;
        }
    }


    if(EnemyY == playerY && EnemyX == playerX){
        direction2 = 4;
        lose.play();
        reset();
    }
}

var direction3 = Math.round(Math.random()*10) % 4;
function maintainEnemy3Movement()
{
    var EnemyX = Math.round((Enemy3.position.x + mapwidth/2)/(mapwidth/28) - mapwidth/56 ) + 5;
    var EnemyY = -(Math.round((Enemy3.position.y - maplength/2 + 2)/(maplength/31) + maplength/62) - 5);

    if(direction3 == 0)
    {  
       if(level[EnemyY].charAt(EnemyX - 1) === 'W'){
            direction3 = Math.round(Math.random()*10) % 4;
       }
       else {
            Enemy3.position.x -= 0.8;
       }

    }

    else if(direction3 == 1)
    {
       if(level[EnemyY].charAt(EnemyX) == 'W'){
           direction3 = Math.round(Math.random()*10) % 4;
       }
       else {
           Enemy3.position.x += 0.8;
       }
    }

    else if(direction3 == 2)
    {
        if(level[EnemyY - 1].charAt(EnemyX) == 'W'){
            direction3 = Math.round(Math.random()*10) % 4;        
        }
        else{
            Enemy3.position.y += 0.8;
        }
    }

    else if(direction3 == 3)
    {
        if(level[EnemyY].charAt(EnemyX) == 'W'){
            direction3 = Math.round(Math.random()*10) % 4;
        }
        else{
            Enemy3.position.y -= 0.8;
        }
    }


    if(EnemyY == playerY && EnemyX == playerX){
        direction3 = 4;
        lose.play();
        reset();
    }
}

var direction4 = Math.round(Math.random()*10) % 4;
function maintainEnemy4Movement()
{
    var EnemyX = Math.round((Enemy4.position.x + mapwidth/2)/(mapwidth/28) - mapwidth/56 ) + 5;
    var EnemyY = -(Math.round((Enemy4.position.y - maplength/2 + 2)/(maplength/31) + maplength/62) - 5);

    if(direction4 == 0)
    {  
       if(level[EnemyY].charAt(EnemyX - 1) === 'W'){
            direction4 = Math.round(Math.random()*10) % 4;
       }
       else {
            Enemy4.position.x -= 0.6;
       }

    }

    else if(direction4 == 1)
    {
       if(level[EnemyY].charAt(EnemyX) == 'W'){
           direction4 = Math.round(Math.random()*10) % 4;
       }
       else {
           Enemy4.position.x += 0.6
       }
    }

    else if(direction4 == 2)
    {
        if(level[EnemyY - 1].charAt(EnemyX) == 'W'){
            direction4 = Math.round(Math.random()*10) % 4;        
        }
        else{
            Enemy4.position.y += 0.6;
        }
    }

    else if(direction4 == 3)
    {
        if(level[EnemyY].charAt(EnemyX) == 'W'){
            direction4 = Math.round(Math.random()*10) % 4;
        }
        else{
            Enemy4.position.y -= 0.6;
        }
    }


    if(EnemyY == playerY && EnemyX == playerX){
        direction4 = 4;
        lose.play();
        reset();
    }
}

window.onload = init;