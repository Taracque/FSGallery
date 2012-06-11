/**
 * MooTools 1.4 FullScreen Gallery
 * (c) 2012 Taracque, GNU GENERAL PUBLIC LICENSE v2 or later
 */

var FSGalleryImage = new Class({
	url : '',
	title : '',
	size : {
		width : 0,
		height : 0
	}
})
var FSGallery = new Class({
	Implements: [Events, Options],
	options: {
		autoResize: true,
		mouseWheel: true,
		keyControl: true,
		title: ''
	},
	initialize: function(images,options) {
		this.Gallery = null;
		this.imageContainer = null;
		this.imageIndex = -1;
		this.imageCount = -1;
		this.images = null;

		this.setOptions(options);

		this.createElements();
		this.loadImages(images);

		if(this.options.mouseWheel || this.options.useSlider) this.Gallery.addEvent('mousewheel', this.wheelTo.bind(this));
		if(this.options.autoResize) window.addEvent('resize', this.update.bind(this) );
		if(this.options.keyControl) document.addEvent('keydown', this.keyTo.bind(this) );
		
		this.Gallery.addEvent('click',this.next.bind(this));
	},
	loadImages: function(images) {
		(function(){
			var fakeContainer = new Element('div',{
				styles : {
					position : 'absolute',
					top	: 0,
					left: 0,
					width: 0,
					height: 0,
					overflow: 'hidden',
					display: 'none'
				}
			});
			document.body.adopt(fakeContainer);
			Array.each(images,function(image,idx){
				var fakeImg = new Element('img');
				fakeContainer.adopt(fakeImg);
				fakeImg.addEvent('load',(function() {
					document.body.adopt(fakeImg);
					var fsImage = new FSGalleryImage();
					fsImage.url = fakeImg.src;
					fsImage.title = 'Kép';
					fsImage.size = fakeImg.getSize();
					if (this.images==null) {
						this.images=new Array();
					}
					this.images.push( fsImage );
					this.imageCount++;
					if (this.imageIndex == -1) {
						this.Gallery.removeClass('fs_loading');
						this.next();
					}
					fakeImg.dispose();
				}).bind(this));
				fakeImg.set('src',image);
			},this);
			fakeContainer.dispose();
		}).delay(0,this);
	},
	createElements: function() {
		var container = new Element('div',{
			styles: {
				position : 'fixed',
				top : 0,
				left: 0,
				right: 0,
				bottom: 0
			},
			class: 'fs_loading'
		});
		container.set('id','fs-gallery-container');
		var titleBar = new Element('div',{
			styles : {
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				height: '32px',
				opacity: 0.7
			},
			class: 'fs_titleBar'
		}).adopt(new Element('h1',{text: this.options.title}));
		
		var closeBox = new Element('div',{
			styles : {
				position: 'absolute',
				right:0,
				top:0,
				bottom:0,
				width: '32px'
			},
			class : 'fs_closeBox'
		});
		closeBox.addEvent('click', this.close.bind(this) );
		titleBar.adopt( closeBox );
		
		var imgContainer = new Element('img',{
			styles : {
				position: 'absolute',
				right: '32px',
				top:'64px',
				bottom:'32px',
				left: '32px',
				margin: 'auto auto'
			},
			tween : {duration: 'short'}
		});

		container.adopt( titleBar );
		
		this.imageContainer = imgContainer;

		container.adopt( imgContainer );

		this.Gallery = container;
		
		document.body.adopt( this.Gallery );
	},
	close: function() {
		if (this.Gallery) {
			this.Gallery.dispose();
		}
		if(this.options.autoResize) window.removeEvent('resize', this.update.bind(this) );
		if(this.options.keyControl) document.removeEvent('keydown', this.keyTo.bind(this) );
	},
	wheelTo: function(e) {
		if(e.wheel > 0) this.prev();
		if(e.wheel < 0) this.next();
		e.stop().preventDefault();
	},
	keyTo: function(e) {
		if(e.key == "space" || e.key == "left" || e.key =="down") {
			this.next();
		}
		if(e.key == "backspace" || e.key == "right" || e.key =="up") {
			this.prev();
		}
		if(e.key == "esc") {
			this.close();
		}
		e.stop();
	},
	next: function() {
		this.imageIndex ++;
		if (this.imageIndex > this.imageCount) this.imageIndex = 0;
		this.imageContainer.tween('opacity',1,0);
		this.imageContainer.set( 'src',this.images[this.imageIndex].url );
		this.imageContainer.tween('opacity',0,1);
		this.update();
	},
	prev: function() {
		this.imageIndex --;
		this.imageContainer.tween('opacity',1,0);
		if (this.imageIndex < 0) this.imageIndex =  this.imageCount;
		this.imageContainer.set( 'src',this.images[this.imageIndex].url );
		this.imageContainer.tween('opacity',0,1);
		this.update();
	},
	update: function() {
		var size = this.Gallery.getSize();
		size.x = size.x-64;
		size.y = size.y-96;
		if ( (size.x>=this.images[this.imageIndex].size.x) && (size.y>=this.images[this.imageIndex].size.y) ) {
			size.x = this.images[this.imageIndex].size.x;
			size.y = this.images[this.imageIndex].size.y;
		} else {
			var ratio = Math.min( (size.x / this.images[this.imageIndex].size.x) , (size.y / this.images[this.imageIndex].size.y) );
			size.x = this.images[this.imageIndex].size.x * ratio;
			size.y = this.images[this.imageIndex].size.y * ratio;
		}
		this.imageContainer.setStyle('width', size.x );
		this.imageContainer.setStyle('height', size.y );
	}

});