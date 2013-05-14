/*
---
script: wizard.js
name: Wizard
version : 1.1
description: Stransforms a unordered list into a wizard slide-style display 
requires:
  - Core/MooTools 1.2.5
  - More/Mootools Scroll 1.2.5

...
*/

var Wizard = new Class({
	Implements:[Events,Options],
	options:{
		width:800,
		height:400,
		style:'slide',
		loop:true,
		autoPlay:true,
		delay:3000,
		autoHeight:true,
		controls:{
			'height':24,
			'next':'nextSlide',
			'prev':'prevSlide',
			'display':'block'
		},
		labels : {
			'prev':false,
			'next':false,
			'pages':false
		},
		className:'moonify'
	},
	maxHeight:0,
	initialize:function(container,options){
		this.setOptions(options);
		this.container = new Element('div',{'class':'wizardContainer '+this.options.className}).injectBefore(container);
		
		container.setStyles({
			'width':this.options.width,
			'height':this.options.height,
			'overflow':'hidden',
			'position':'relative',
			'display':'block'
		}).injectInside(this.container)
		.set('tween',{
			onComplete:function(){
				this.fireEvent('onChangeHeight',this);
			}.bind(this)
		});
		this.container.store('container',container);
		this.controls = new Element('div',{'class':'controls'}).setStyles({
			'width':this.options.width,
			'height':this.options.controls.height,
			'display':this.options.controls.display,
			'position':'relative'
		}).injectInside(this.container);
		
		this.prev = new Element('div',{'class':'prevControl control'})
						.injectInside(this.controls)
						.setStyles({'height':this.options.controls.height})
						.addEvent('click',function(){this.toPrev();}.bind(this))
						;
		if (this.options.labels.prev) this.prev.set('html','Previous');
		
						
		this.next = new Element('div',{'class':'nextControl control'})
						.injectInside(this.controls)
						.setStyles({'height':this.options.controls.height})
						.addEvent('click',function(){this.toNext();}.bind(this))
						;
		if (this.options.labels.next) this.next.set('html','Next');
		
		if (this.options.loop) {
			this.prev.addClass('active');
			this.next.addClass('active');
		}
						
		this.pageContainer = new Element('div',{'class':'pageContainer'})
								.injectInside(this.controls)
								;
		this.indices = new Hash();
		var targetTags = 'a,input,button,textarea,select'.split(',');
		var slides = container.getChildren();
		slides.each(function(slide,index){
			var scoords = slide.getCoordinates();
			slide.setStyles({
				'width':this.options.width,
				'height':this.options.autoHeight?scoords.height:this.options.height,
				'display':this.options.style=='slide'?'block':'none',
				'position':'absolute',
				'left':this.options.style=='slide'?this.options.width*index:0
			}).store('height',scoords.height);
			if (scoords.height.toInt()>this.maxHeight) {
				this.maxHeight = scoords.height.toInt();
			}
			var page = new Element('span',{'class':'control'}).injectInside(this.pageContainer).store('slide',slide)
			page.addEvent('click',function(){
							this.toPage(page);
						}.bind(this)).store('index',index);
			if (this.options.labels.pages) page.set('html',index+1);
			if (!$defined(this.currentPage)) {
				this.currentPage = page;	
				this.prev.store('index',index);
				slide.setStyle('display','block');
			}
			if (index==slides.length-1) {
				this.next.store('index',index);
			}
			
			var els = new Array();
			targetTags.each(function(tag){
				els.combine(slide.getElements(tag));
			});
			if (els.length) {
				els.each(function(el){
					el.addEvent('focus',function(){ this.toPage(page); }.bind(this));
				}.bind(this),this);
			}
			
			this.indices.set(index,page);
		}.bind(this),this);
		this.container.retrieve('container').setStyle('height',this.maxHeight);
		this.totalPages = slides.length-1;
		if (this.options.style=='slide') {
			this.scroller = new Fx.Scroll(container,{
				'link':'cancel',
				onStart:function(){
					this.fireEvent('start',this);
				}.bind(this),
				onComplete:function(){ 
					this.fireEvent('load',this);
					this.trackControls(); 
				}.bind(this)
			});
		}		
		
		this.trackControls();
		
		var prevControls = container.getElements('.'+this.options.controls.prev);
		if (prevControls.length) {
			prevControls.each(function(control){
				control.addEvent('click',function(e){
					new Event(e).stop();
					this.toPrev();
				}.bind(this));
			}.bind(this),this);
		}
		
		var nextControls = container.getElements('.'+this.options.controls.next);
		if (nextControls.length) {
			nextControls.each(function(control){
				control.addEvent('click',function(e){
					new Event(e).stop();
					this.toNext();
				}.bind(this));
			}.bind(this),this);
		}
		this.container.retrieve('container').tween('height',this.getCurrentHeight());
	},
	trackControls:function(){
		if (!this.options.loop) {
			if (this.getIndex()==this.prev.retrieve('index')) {
				this.prev.removeClass('active');
			} else {
				this.prev.addClass('active');
			}
			if (this.getIndex()==this.next.retrieve('index')) {
				this.next.removeClass('active');
			} else {
				this.next.addClass('active');
			}
		} 
		
		this.currentPage.addClass('active');
		
		if (this.options.loop && this.options.autoPlay) {
			this.toNext.delay(this.options.delay,this);
		}
	},
	toIndex:function(index){
		if (!this.indices.has(index)) return;
		var page = this.indices.get(index);
		if ($defined(page)) {
			this.toPage(page);
		}
	},
	toPage:function(page){
		if (page==this.currentPage) return;
		
		var slide = page.retrieve('slide');
		if (!$defined(slide)) return;
		
		this.fireEvent('select',slide);
		if (this.options.style=='slide') {
			this.scroller.toElement(slide);
			if (this.options.autoHeight) {
				this.container.retrieve('container').tween('height',page.retrieve('slide').retrieve('height'));
			}
			this.fireEvent('onChange',this);
		} else {
			slide.setStyles({'display':'block','opacity':0});
			var currentSlide = this.currentPage.retrieve('slide');
			//currentSlide.injectAfter(slide);
			new Fx.Morph(currentSlide,{
				'link':'cancel',
				onStart:function(){
					this.fireEvent('start',this);
				}.bind(this),
				onComplete:function(){ 
					this.fireEvent('load',this);
					this.trackControls(); 
					currentSlide.setStyles({'display':'none','opacity':1});
					if (this.options.autoHeight) {
						this.container.retrieve('container').tween('height',page.retrieve('slide').retrieve('height'));
					}
					this.fireEvent('onChange',this);
				}.bind(this)
			}).start({'opacity':[1,0]});
			new Fx.Morph(slide,{'link':'cancel'}).start({'opacity':[0,1]});
		}
			
		this.currentPage.removeClass('active');
		this.lastPage = this.currentPage;
		this.currentPage = page;
	},
	toPrev:function(){
		var prev = this.currentPage.getPrevious();
		if ($defined(prev)) {
			this.toPage(prev);
		} else if (this.options.loop){
			this.toIndex(this.next.retrieve('index'));
		}
	},
	toNext:function(){
		var next = this.currentPage.getNext();
		if ($defined(next)) {
			this.toPage(next);
		} else if (this.options.loop){
			this.toIndex(this.prev.retrieve('index'));
		}
	},
	getIndex:function(){
		return this.currentPage.retrieve('index');
	},
	getSlide:function(){
		return this.currentPage.retrieve('slide');
	},
	getCurrentHeight:function(){
		return this.getSlide().retrieve('height');
	}
});

/*
---
script: wizard.js
name: Wizard.Steps
version : 1.0
description: Functions as support for wizard script to display stages using an unordered list 
requires:
  - Core/MooTools 1.2.5
  - More/Mootools Scroll 1.2.5
  - Wizard 1.0
...
*/

Wizard.Steps = new Class({
	Implements:[Events,Options],
	options:{
		className:'basic',
		trigger:true,
		triggerClass:'.trigger'
	},
	initialize:function(el,wizard,options){
		this.setOptions(options);
		this.el = el.addClass(this.options.className);
		this.wizard = wizard;
		this.wizard.addEvent('load',function(){
			this.setStep();
		}.bind(this));
		var steps = this.el.getChildren();
		if ($pick(steps.length,0)){
			steps.each(function(step,index){
				if (index==this.wizard.prev.retrieve('index')) {
					step.addClass('first');
				} else if (index==this.wizard.next.retrieve('index')) {
					step.addClass('last');
				}
				if (this.options.trigger) {
					var trigger = step.getElement('.'+this.options.triggerClass);
					if ($defined(trigger)) {
						trigger.addEvent('click',function(e){
							new Event(e).stop();
							this.wizard.toIndex(index);
						}.bind(this));
					}
				}
			}.bind(this),this);
		}
		this.setStep();		
	},
	setStep:function(){
		var steps = this.el.getChildren();
		if ($pick(steps.length,0)){
			steps.each(function(step,index){
				if (index==this.wizard.getIndex()) {
					step.addClass('active');
				} else {
					step.removeClass('active');
				}
			}.bind(this),this);
		}
	}
});
