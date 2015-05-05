/**   _     _   _     
*    | |___| |_| |__
*    | / _ \  _|    |
*    |_\___/\__|_||_|
*    @author LoTh / http://lo-th.github.io/labs/
*/

var canvas, info, debug;
var THREE, mainClick, mainDown, mainUp, mainMove, mainRay, v, shader, loader;

var V = {};
var TWEEN = TWEEN || null;
V.AR8 = typeof Uint8Array!="undefined"?Uint8Array:Array;
V.AR16 = typeof Uint16Array!="undefined"?Uint16Array:Array;
V.AR32 = typeof Float32Array!="undefined"?Float32Array:Array;

V.PI = Math.PI;
V.PI90 = V.PI*0.5;
V.PI270 = V.PI+V.PI90;
V.TwoPI = 2.0 * V.PI;
V.ToRad = V.PI / 180;
V.ToDeg = 180 / V.PI;
V.Resolution = { w:1600, h:900, d:200, z:10, f:40 };
V.sqrt = Math.sqrt;
V.abs = Math.abs;
V.max = Math.max;
V.pow = Math.pow;
V.floor = Math.floor;
V.round = Math.round;
V.lerp = function (a, b, percent) { return a + (b - a) * percent; }
V.rand = function (a, b, n) { return V.lerp(a, b, Math.random()).toFixed(n || 3)*1;}
V.randInt = function (a, b, n) { return V.lerp(a, b, Math.random()).toFixed(n || 0)*1;}
V.randColor = function () { return '#'+Math.floor(Math.random()*16777215).toString(16);}

V.MeshList = [ 'plane', 'sphere', 'skull', 'skullhigh', 'head', 'woman', 'babe'];
V.Main = null;

V.View = function(h,v,d,f, emvmap){


    this.follow = true;
    this.camPreview = true;

    this.currentCamera = 4;

    this.emvmap = emvmap || 'env0.jpg';

    this.dimentions = {w:window.innerWidth,  h:window.innerHeight, r:window.innerWidth/window.innerHeight };

	this.canvas = canvas;
    //this.canvas2 = canvas2;
    this.debug = debug;
    //this.info = info;
    this.scene = new THREE.Scene();
    
    this.cameraGroup = new THREE.Group();
    this.scene.add(this.cameraGroup);

    this.previewGroup = new THREE.Group();
    this.cameraGroup.add(this.previewGroup);


    //console.log(this.cameraGroup.up)
   
    //this.cameraGroup.up.set(0,0,1)

    

    this.clock = new THREE.Clock();

    
    this.nav = new V.Nav(this,h,v,d,f);

    

    this.environment = THREE.ImageUtils.loadTexture( 'textures/'+ this.emvmap);
    this.environment.mapping = THREE.SphericalReflectionMapping;

    this.renderer = new THREE.WebGLRenderer({ precision:"mediump", canvas:canvas, antialias:false, alpha:false });
    this.renderer.setSize( this.dimentions.w, this.dimentions.h );
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setClearColor( ('0x'+bgcolor)*1, 1 );
    this.renderer.autoClear =true;

    var look = new THREE.Vector3();
    var look2 = new THREE.Vector3();
    var baseposition = new THREE.Vector3(0,1,0);

    this.cameras = [];
    this.camerasHelper = [];
    

    var fox = 13/10;
    var foy = 13/10;

    var r = 13/5.4;



    for(var i=0; i<4; i++){
        //this.cameras[i] = new THREE.OrthographicCamera( -fox, fox, foy, -foy, 0.1, 100 );
        //this.cameras[i] =  new THREE.PerspectiveCamera( 13, this.dimentions.r, 0.1, 1000 )
       // this.cameras[i] =  new THREE.PerspectiveCamera( 26.8, this.dimentions.r, 0.1, 100 )
        this.cameras[i] =  new THREE.PerspectiveCamera( 19.525, r, 0.1, 200)

        
        //this.cameras[i].position.z = 40;
        //this.cameras[i].position.copy(baseposition);
        //this.cameras[i].rotation.y = (i*45)*V.ToRad;
        //look = this.orbit(90, i*45, 10, baseposition);
        look = this.orbit(90, (i*45)+22.5, 10);
       // look = this.orbit(90, (i*45), 10, baseposition);
        //look2 = this.orbit(90, i*45, 2, baseposition);
       
        this.cameras[i].position.set(0,0,0);
        this.cameras[i].lookAt(look);
        //this.cameras[i].position.y = 0;//viewSettings.posY;

        this.camerasHelper[i] = new THREE.CameraHelper( this.cameras[i] ); 
        

        this.cameraGroup.add(this.cameras[i]);
        this.scene.add( this.camerasHelper[i] );
       // this.cameraGroup.position.copy(baseposition);
    }

    this.cameras[4] = this.nav.camera;



    this.scene2 = new THREE.Scene();
    this.cameraTop = new THREE.PerspectiveCamera( 50, this.dimentions.r, 0.1, 20000 );
    this.cameraTop.position.y = 1000;
    this.cameraTop.lookAt(new THREE.Vector3());
    this.cameras[5] = this.cameraTop;

    /*this.renderer2 = new THREE.WebGLRenderer({ precision:"mediump", canvas:canvas2, antialias:false, alpha:false });
    this.renderer2.setSize( this.dimentions.w, this.dimentions.h );
    this.renderer2.setPixelRatio( window.devicePixelRatio );
    this.renderer2.setClearColor( ('0x'+bgcolor)*1, 1 );
    this.renderer2.autoClear = true;*/

    //var frontGeo = new THREE.PlaneGeometry( 21.6, 5.4 );
    var frontGeo = new THREE.PlaneBufferGeometry( 10.8, 5.4 );
    var sideGeo = new THREE.PlaneBufferGeometry( 13, 5.4 );


    var txtSetting = { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBFormat }
    this.texture = [];
    var resolution = {w:1000, h:600}
    this.dummyTexture = new THREE.Texture();
    this.texture[0] = new THREE.WebGLRenderTarget( resolution.w, resolution.h, txtSetting );
    this.texture[1] = new THREE.WebGLRenderTarget( resolution.w, resolution.h, txtSetting );
    this.texture[2] = new THREE.WebGLRenderTarget( resolution.w, resolution.h, txtSetting );
    this.texture[3] = new THREE.WebGLRenderTarget( resolution.w, resolution.h, txtSetting );

    this.mat = [];
    /*this.mat[0] = new THREE.MeshBasicMaterial( { map: this.texture[0] } );
    this.mat[1] = new THREE.MeshBasicMaterial( { map: this.texture[1] } );
    this.mat[2] = new THREE.MeshBasicMaterial( { map: this.texture[2] } );
    this.mat[3] = new THREE.MeshBasicMaterial( { map: this.texture[3] } );*/

    this.mat[0] = new THREE.MeshBasicMaterial( { map: this.dummyTexture } );
    this.mat[1] = new THREE.MeshBasicMaterial( { map: this.dummyTexture } );
    this.mat[2] = new THREE.MeshBasicMaterial( { map: this.dummyTexture } );
    this.mat[3] = new THREE.MeshBasicMaterial( { map: this.dummyTexture } );

    /*this.mat[0] = new THREE.MeshBasicMaterial( { color:0XFFFF00 } );
    this.mat[1] = new THREE.MeshBasicMaterial( { color:0XFF00ff } );
    this.mat[2] = new THREE.MeshBasicMaterial( { color:0X00ff00 } );
    this.mat[3] = new THREE.MeshBasicMaterial( { color:0XFF0000 } );*/


    this.previewGroup.rotation.y = V.PI;
    this.previewGroup.rotation.x = -20*V.ToRad;
    this.previewGroup.position.set(0,12,26)
    

    this.screen = [];
    this.screen[0] = new THREE.Mesh( sideGeo, this.mat[0] );
    this.screen[1] = new THREE.Mesh( frontGeo, this.mat[1] );
    this.screen[2] = new THREE.Mesh( frontGeo, this.mat[2] );
    this.screen[3] = new THREE.Mesh( sideGeo, this.mat[3] );

    var i = this.screen.length;
    while(i--){
        this.previewGroup.add( this.screen[i] );
        if(i==2)this.screen[i].position.x = 5.4;
        if(i==1)this.screen[i].position.x = -5.4;
        if(i==3){
            this.screen[i].position.x = 10.8;
            this.screen[i].position.z = 6.5;
            this.screen[i].rotation.y = -V.PI90
        }
        if(i==0){
            this.screen[i].position.x = -10.8;
            this.screen[i].position.z = 6.5;
            this.screen[i].rotation.y = V.PI90
        }
    }

    // side 1024x768
    // front  1920x768px

    //this.renderer.gammaInput = true;
    //this.renderer.gammaOutput = true;



    this.f = [0,0,0,0];

	window.onresize = function(e) {this.resize(e)}.bind(this);
}

V.View.prototype = {
    constructor: V.View,
    render:function(){

       // this.renderer.clear();

        
        if(this.currentCamera==4 && this.camPreview){
            var i = this.texture.length;
            while(i--){
                this.mat[i].map = this.dummyTexture;
                this.renderer.render( this.scene, this.cameras[i], this.texture[i], true );
                this.mat[i].map = this.texture[i];
            }
        }else{
            this.previewGroup.visible = false;
        }
        //this.renderer.clear();
        //this.renderer.setClearColor( ('0x'+bgcolor)*1, 1 );
        this.renderer.render( this.scene, this.cameras[this.currentCamera] );
        //    this.renderer.render( this.scene, this.nav.camera );
        //this.renderer.clear();
        //
        //this.renderer.render( this.scene2, this.nav.camera )

        //this.renderer2.render( this.scene2, this.camera2 );

        var f = this.f;
        f[0] = Date.now();
        if (f[0]-1000 > f[1]){ f[1] = f[0]; f[3] = f[2]; f[2] = 0; } f[2]++;

        //this.debug.innerHTML ='THREE ' + f[3];
    },
    resize:function(){
        this.dimentions.w = window.innerWidth;
        this.dimentions.h = window.innerHeight;
        this.dimentions.r = this.dimentions.w/this.dimentions.h;
        this.renderer.setSize( this.dimentions.w, this.dimentions.h );
        //this.renderer2.setSize( this.dimentions.w, this.dimentions.h );
        this.nav.camera.aspect = this.dimentions.r;
        this.nav.camera.updateProjectionMatrix();
    },
    orbit:function(v, h, d, ref){
        var p = new THREE.Vector3();
        var phi = v*V.ToRad;
        var theta = h*V.ToRad;
    
        p.x = d * Math.sin(phi) * Math.cos(theta);
        p.y = d * Math.cos(phi);
        p.z = d * Math.sin(phi) * Math.sin(theta);
        if(ref)p.add(ref);
        return p
    }
       
}


//---------------------------------------------------
//   NAVIGATION
//---------------------------------------------------

V.Nav = function(parent, h, v, d, f){
	this.isFocus = false;
    this.isRevers = false;
    this.cammode = 'normal';
    this.EPS = 0.000001;
	this.root = parent;

	this.cursor = new V.Cursor();
    this.lockView = false;

	this.camera = new THREE.PerspectiveCamera( f||40, this.root.dimentions.r, 0.1, 200 );
    //this.helper = new THREE.CameraHelper( this.camera );
    //this.root.scene.add(this.helper) 
    this.root.scene.add(this.camera)
	this.mouse3d = new THREE.Vector3();
	this.selectName = '';

	this.rayVector = new THREE.Vector3( 0, 0, 1 );
	this.raycaster = new THREE.Raycaster();
	this.target = new THREE.Vector3();
    this.position = new THREE.Vector3();
	this.cam = { horizontal:h||0, vertical:v||90, distance:d||20, automove:false, theta:0, phi:0 };
    this.mouse = { x:0, y:0, ox:0, oy:0, h:0, v:0, mx:0, my:0, px:0, py:0, pz:0, r:0, down:false, move:true, button:0 };

    this.key = { up:0, down:0, left:0, right:0, ctrl:0, action:0, space:0, shift:0 };
    //this.imput = new V.UserImput(this);

    this.moveCamera();

    
    this.root.canvas.oncontextmenu = function(e){e.preventDefault()};
    this.root.canvas.onclick = function(e) {this.onMouseClick(e)}.bind( this );
    this.root.canvas.onmousemove = function(e) {this.onMouseMove(e)}.bind( this );
    this.root.canvas.onmousedown = function(e) {this.onMouseDown(e)}.bind( this );
    this.root.canvas.onmouseout = function(e) {this.onMouseOut(e)}.bind( this );
    this.root.canvas.onmouseup = function(e) {this.onMouseUp(e)}.bind( this );
    this.root.canvas.onmousewheel = function(e) {this.onMouseWheel(e)}.bind( this );
    //this.root.canvas.onDOMMouseScroll = function(e) {this.onMouseWheel(e)}.bind( this );
    this.root.canvas.addEventListener('DOMMouseScroll', function(e){this.onMouseWheel(e)}.bind( this ), false );
}

V.Nav.prototype = {
	constructor: V.Nav,
	moveCamera:function(){
        this.orbit();
        this.camera.position.copy(this.position);
        this.camera.lookAt(this.target);

       // console.log(this.camera.up)

        if(this.root.follow){
            this.root.cameraGroup.position.copy(this.position);
            this.root.cameraGroup.lookAt(this.target);
        }
    },
    moveSmooth:function(){
        this.orbit();
        this.camera.position.lerp(this.position, 0.3);
        this.camera.lookAt(this.target);
    },
    revers:function(){
        this.isRevers = true;
        this.camera.scale.x = -1; 
    },
    orbit:function(){
        var p = this.position;
        var d = this.cam.distance;
        var phi = this.cam.vertical*V.ToRad;
        var theta = this.cam.horizontal*V.ToRad;
        phi = Math.max( this.EPS, Math.min( Math.PI - this.EPS, phi ) );
        this.cam.theta = theta;
        this.cam.phi = phi;
        p.x = d * Math.sin(phi) * Math.cos(theta);
        p.y = d * Math.cos(phi);
        p.z = d * Math.sin(phi) * Math.sin(theta);
        p.add(this.target);
    },
    mode:function(){
        if(this.cammode == 'normal'){
            this.cammode = 'fps';
            this.cam.distance = 0.1;
        }else{
            this.cammode = 'normal';
            this.cam.distance = 20;
        }
        this.moveSmooth();
    },
    move:function(v){
        this.target.copy(v);
        this.moveCamera();
    },
    moveto:function(x,y,z){
        this.target.set(x,y,z);
        this.moveCamera();
    },
    onMouseClick:function(e){
        e.preventDefault();
        if (typeof mainClick == 'function') { mainClick(); }
    },
    onMouseDown:function(e){
        this.mouse.down = true;
        this.mouse.button = e.which;
        //console.log(e.which)
        this.mouse.ox = e.clientX;
        this.mouse.oy = e.clientY;
        this.mouse.h = this.cam.horizontal;
        this.mouse.v = this.cam.vertical;
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        this.mouse.px = this.target.x;
        this.mouse.pz = this.target.z;
        this.mouse.py = this.target.y;
        
	    //this.rayTest();
        //if (typeof mainDown == 'function') { mainDown(); }
        e.preventDefault();
        e.stopPropagation();
        //document.body.contentEditable=true
        //window.top.focus();
    },
    onMouseUp:function(e){
        this.mouse.down = false;
        this.cursor.change();
        if (typeof mainUp == 'function') { mainUp(); }
        e.preventDefault();
        e.stopPropagation();
    },
    onMouseOut:function(e){
    	this.isFocus = false;
        this.mouse.down = false;
        this.cursor.change();
        if (typeof mainUp == 'function') { mainUp(); }
        e.preventDefault();
        e.stopPropagation();
    },
    onMouseMove:function(e){
    	if(!this.isFocus){
    		self.focus();
    		//window.top.main.blur();
    		this.isFocus = true;
    	}
        if (this.mouse.down && this.mouse.move && !this.lockView) {
            if(this.mouse.button==3){
                this.cursor.change('drag');
                var px = -((e.clientX - this.mouse.ox) * 0.3);
                if(this.isRevers){
                    this.target.x = -(Math.sin(this.cam.theta) * px) +  this.mouse.px;
                    this.target.z = (Math.cos(this.cam.theta) * px) +  this.mouse.pz;
                }else{
                    this.target.x = (Math.sin(this.cam.theta) * px) +  this.mouse.px;
                    this.target.z = -(Math.cos(this.cam.theta) * px) +  this.mouse.pz;
                }
                this.target.y = ((e.clientY - this.mouse.oy) * 0.3) + this.mouse.py;
            }else{
                this.cursor.change('rotate');
                if(this.isRevers) this.cam.horizontal = -((e.clientX - this.mouse.ox) * 0.3) + this.mouse.h;
                else this.cam.horizontal = ((e.clientX - this.mouse.ox) * 0.3) + this.mouse.h;
                this.cam.vertical = (-(e.clientY - this.mouse.oy) * 0.3) + this.mouse.v;
                if (this.cam.vertical < 0){ this.cam.vertical = 0; }
            }
            this.moveCamera();
        }
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
        //this.rayTest();
        //if (typeof mainMove == 'function') { mainMove(); }
        e.preventDefault();
        e.stopPropagation();
    },
    onMouseWheel:function(e){
        if(this.cammode=='fps') return;
        var delta = 0;
        if(e.wheelDeltaY){delta=e.wheelDeltaY*0.01;}
        else if(e.wheelDelta){delta=e.wheelDelta*0.05;}
        else if(e.detail){delta=-e.detail*1.0;}
        this.cam.distance -= delta;
        if(this.cam.distance<0.5)this.cam.distance = 0.5;
        this.moveCamera();
        e.preventDefault();
        e.stopPropagation();
    }
}

//---------------------------------------------------
//   CURSOR
//---------------------------------------------------

V.Cursor = function(){
	this.current = 'auto';
	this.type = {
		drag : 'move',
        rotate  : 'move',
		move : 'move',
		auto : 'auto'
	}
}

V.Cursor.prototype = {
	constructor: V.Cursor,
	change: function(name){
		name = name || 'auto';
		if(name!==this.current){
			this.current = name;
			document.body.style.cursor = this.type[this.current];
		}
	}
}