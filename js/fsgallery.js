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
		marginRight : 32,
		marginLeft : 32,
		marginTop : 32,
		marginBottom: 32
	},
	initialize: function(element,options) {
		this.Gallery = null;
		this.imageContainer = null;
		this.imageIndex = -1;
		this.imageCount = -1;
		this.images = null;
		this.image = null;
		this.isLoading = false;
		this.parentElement = element;
		this.maximized = (element == null);
		this.setOptions(options);

		this.createElements( element );

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
		return this;
	},
	loadImages: function(images) {
		(function(){
			this.isLoading = true;
			Array.each(images,function(image,idx){
				(new Element('img',{
					alt : image.description,
					title : image.title,
					events : {
						load: function() {
							var gallery = this.retrieve('gallery');
							var fsImage = new FSGalleryImage();
							fsImage.url = this.get('src');
							fsImage.title = this.get('title');
							fsImage.description = this.get('alt');
							fsImage.size = this.getSize();
							if (gallery.images==null) {
								gallery.images=new Array();
							}
							gallery.images.push( fsImage );
							gallery.imageCount++;
							if (gallery.imageIndex == -1) {
								gallery.Gallery.getChildren('div').removeClass('fs_loading');
								gallery.next();
							}
							this.dispose();
						}
					}
				})).store('gallery',this).set('src',this.options.baseUrl + image.url).inject(document.id(document.body));
			},this);
			this.update();
		}).delay(0,this);
		return this;
	},
	createElements: function( element ) {
		var container = new Element('div',{
			styles: {
				position : 'fixed',
				top : 0,
				left: 0,
				right: 0,
				bottom: 0,
				width: '100%',
				height: '100%',
				'z-index': 65535
			}
		});
		container.adopt(new Element('div',{
			styles : {
				position: 'absolute',
				height: '100%',
				width: '100%',
				top: 0,
				left: 0,
				'background-color': 'black',
				opacity: 0.85
			},
			'class': 'fs_loading'
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
			'class': 'fs_titleBar'
		}).adopt(new Element('span',{text: this.options.title}));
		
		var closeBox = new Element('div',{
			styles : {
				position: 'absolute',
				right:0,
				top:0,
				bottom:0,
				width: '32px'
			},
			'class' : 'fs_closeBox'
		});
		
		closeBox.addEvent('click', this.close.bind(this) );
		titleBar.adopt( closeBox );
		
		var imgContainer = new Element('div',{
			styles : {
				position: 'absolute',
				right: this.options.marginRight,
				top: this.options.marginTop + 32,
				bottom:this.options.marginBottom,
				left: this.options.marginLeft,
				margin: '0'
			},
			tween : {duration: 'short'}
		});
		
		var image = new Element('img',{
			styles : {
				display: 'block',
				margin: 'auto'
			}
		});
		var description = new Element('p',{
			styles : {
				'text-align' : 'center',
				color : 'white',
				margin : 'auto auto'
			}
		});
		imgContainer.adopt( [ image, description ] );
		this.image = image;
		this.imageContainer = imgContainer;

		container.adopt( [ titleBar, imgContainer ] );

		this.Gallery = container;

		if (element) {
			this.Gallery.setStyle('position','relative');
			element.adopt( this.Gallery );
		} else {
			this.Gallery.addClass('maximized');
			document.id(document.body).adopt( this.Gallery );
		}
	},
	close: function(e) {
		if (this.parentElement) {
			e.stop();
			if (this.maximized) {
				this.Gallery.setStyle('position','relative').removeClass('maximized');
				this.parentElement.adopt( this.Gallery );
				this.maximized = false;
			} else {
				this.Gallery.setStyle('position','fixed').addClass('maximized');
				document.id(document.body).adopt( this.Gallery );
				this.maximized = true;
			}
			this.update();
		} else {
			if (this.Gallery) {
				this.Gallery.dispose();
			}
			if(this.options.autoResize) window.removeEvent('resize', this.update.bind(this) );
			if(this.options.keyControl) document.removeEvent('keydown', this.keyTo.bind(this) );
			this.fireEvent('close');
		}
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
	showImage: function(imgidx) {
		if (this.images[imgidx]) {
			this.imageContainer.tween('opacity',1,0);
			(function(){
				this.image.set( 'src',this.images[imgidx].url );
				this.imageContainer.getElements('p').set( 'text', this.images[imgidx].title );
				this.Gallery.getElements( 'span' ).set( 'html', (imgidx+1) + "/" + (this.imageCount + 1) + " <strong>" + this.images[imgidx].description + "</strong>");
				this.update();
				this.imageContainer.tween('opacity',0,1);
			}).delay(250,this);
		}
	},
	next: function() {
		if (this.images) {
			this.imageIndex ++;
			if (this.imageIndex > this.imageCount) this.imageIndex = 0;
			this.showImage( this.imageIndex );
		}
	},
	prev: function() {
		if (this.images) {
			this.imageIndex --;
			if (this.imageIndex < 0) this.imageIndex =  this.imageCount;
			this.showImage( this.imageIndex );
		}
	},
	update: function() {
		if (this.imageIndex>=0) {
			var gallerySize = this.imageContainer.getSize();
			var size = this.Gallery.getSize();
			size.x = size.x-(this.options.marginLeft + this.options.marginRight);
			size.y = size.y-(this.options.marginTop + this.options.marginBottom + 32);
			if ( (size.x>=this.images[this.imageIndex].size.x) && (size.y>=this.images[this.imageIndex].size.y) ) {
				size.x = this.images[this.imageIndex].size.x;
				size.y = this.images[this.imageIndex].size.y;
			} else {
				var ratio = Math.min( (size.x / this.images[this.imageIndex].size.x) , (size.y / this.images[this.imageIndex].size.y) );
				size.x = this.images[this.imageIndex].size.x * ratio;
				size.y = this.images[this.imageIndex].size.y * ratio;
			}
			this.image.setStyles({'width': size.x, 'height' : size.y, 'margin-top' : ( (gallerySize.y - size.y) / 2)});
		}
		this.isLoading = false;
	}

});