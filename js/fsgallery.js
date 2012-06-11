/**
 * MooTools 1.4 FullScreen Gallery
 * (c) 2012 Taracque, GNU GENERAL PUBLIC LICENSE v2 or later
 */

var FSGalleryImage = new Class({
	url : '',
	title : '',
	description : '',
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
		title: '',
		baseUrl: '',
	},
	initialize: function(images,options) {
		this.Gallery = null;
		this.imageContainer = null;
		this.imageIndex = -1;
		this.imageCount = -1;
		this.images = null;
		this.image = null;
		this.isLoading = false;

		this.setOptions(options);

		this.createElements();
		this.loadImages(images);

		if(this.options.mouseWheel || this.options.useSlider) this.Gallery.addEvent('mousewheel', this.wheelTo.bind(this));
		if(this.options.autoResize) window.addEvent('resize', this.update.bind(this) );
		if(this.options.keyControl) document.addEvent('keydown', this.keyTo.bind(this) );
		
		this.Gallery.addEvent('click',this.next.bind(this));
	},
	loadJSON: function(url) {
		if(!url || this.isLoading) return;
		new Request.JSON({
			url : url,
			onSuccess: function(data){
				if(data){
					this.loadImages(data);
				}
			}.bind(this)
		}, this).get();
	},
	loadImages: function(images) {
		(function(){
			this.isLoading = true;

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
					fsImage.url = fakeImg.get('src');
					fsImage.title = fakeImg.get('title');
					fsImage.description = fakeImg.get('alt');
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
				fakeImg.set('src',this.options.baseUrl + image.url).set('title',image.title).set('alt',image.description);
			},this);
			fakeContainer.dispose();
			this.update();
		}).delay(0,this);
	},
	createElements: function() {
		var container = new Element('div',{
			styles: {
				position : 'fixed',
				top : 0,
				left: 0,
				right: 0,
				bottom: 0,
				'z-index': 65535
			},
			class: 'fs_loading'
		});
		container.set('id','fs-gallery-container').adopt(new Element('div',{
			styles : {
				position: 'relative',
				top: 0,
				left: 0,
				height: '100%',
				width: '100%',
				'background-color': 'black',
				opacity: 0.7
			}
		}));
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
		
		var imgContainer = new Element('div',{
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
		
		var image = new Element('img');
		var description = new Element('p',{
			styles : {
				'text-align' : 'center',
				color : 'white'
			}
		});
		imgContainer.adopt( [ image , description ] );
		this.image = image;
		this.imageContainer = imgContainer;

		container.adopt( titleBar );
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
			e.stop();
			this.next();
		}
		if(e.key == "backspace" || e.key == "right" || e.key =="up") {
			e.stop();
			this.prev();
		}
		if(e.key == "esc") {
			e.stop();
			this.close();
		}
	},
	next: function() {
		if (this.images) {
			this.imageIndex ++;
			if (this.imageIndex > this.imageCount) this.imageIndex = 0;
			this.imageContainer.tween('opacity',1,0);
			(function(){
				this.image.set( 'src',this.images[this.imageIndex].url );
				this.imageContainer.getElements('p').set( 'text', this.images[this.imageIndex].title );
				this.Gallery.getElements( 'h1' ).set( 'text', this.images[this.imageIndex].description );
				this.update();
				this.imageContainer.tween('opacity',0,1);
			}).delay(250,this);
		}
	},
	prev: function() {
		if (this.images) {
			this.imageIndex --;
			this.imageContainer.tween('opacity',1,0);
			if (this.imageIndex < 0) this.imageIndex =  this.imageCount;
			(function(){
				this.image.set( 'src',this.images[this.imageIndex].url );
				this.imageContainer.getElements('p').set( 'text', this.images[this.imageIndex].title );
				this.Gallery.getElements( 'h1' ).set( 'text', this.images[this.imageIndex].description );
				this.update();
				this.imageContainer.tween('opacity',0,1);
			}).delay(250,this);
		}
	},
	update: function() {
		if (this.imageIndex>=0) {
			var size = this.Gallery.getSize();
			size.x = size.x-64;
			size.y = size.y-128;
			if ( (size.x>=this.images[this.imageIndex].size.x) && (size.y>=this.images[this.imageIndex].size.y) ) {
				size.x = this.images[this.imageIndex].size.x;
				size.y = this.images[this.imageIndex].size.y;
			} else {
				var ratio = Math.min( (size.x / this.images[this.imageIndex].size.x) , (size.y / this.images[this.imageIndex].size.y) );
				size.x = this.images[this.imageIndex].size.x * ratio;
				size.y = this.images[this.imageIndex].size.y * ratio;
			}
			this.imageContainer.setStyles({'width': size.x, 'height' : size.y});
			this.image.setStyles({'width': size.x, 'height' : size.y});
		}
		this.isLoading = false;
	}

});