/*
---
script: wizard.js
name: Wizard
version : 1.0
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
		height:300,
		controls:{
			'height':24,
			'next':'nextSlide',
			'prev':'prevSlide'
		},
		labels : {
			'prev':false,
			'next':false,
			'pages':false
		},
		className:'moonify'
	},
	initialize:function(container,options){
		this.setOptions(options);
		this.container = new Element('div',{'class':'wizardContainer '+this.options.className}).injectBefore(container);

		container.setStyles({
			'width':this.options.width,
			'height':this.options.height,
			'overflow':'hidden',
			'position':'relative',
			'display':'block'
		})
		.injectInside(this.container);
		
		this.controls = new Element('div',{'class':'controls'}).setStyles({
			'width':this.options.width,
			'height':this.options.controls.height,
			'display':'block',
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
						
		this.pageContainer = new Element('div',{'class':'pageContainer'})
								.injectInside(this.controls)
								;
		var slides = container.getChildren();
		slides.each(function(slide,index){
			slide.setStyles({
				'width':this.options.width,
				'height':this.options.height,
				'display':'block',
				'position':'absolute',
				'left':this.options.width*index
			});
			var page = new Element('span',{'class':'control'}).injectInside(this.pageContainer).store('slide',slide)
			page.addEvent('click',function(){
							this.toPage(page);
						}.bind(this)).store('index',index);
			if (this.options.labels.pages) page.set('html',index+1);
			if (!$defined(this.currentPage)) {
				this.currentPage = page;	
				this.prev.store('index',index);
			}
			if (index==slides.length-1) {
				this.next.store('index',index);
			}
		}.bind(this),this);
		this.totalPages = slides.length-1;
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
	},
	trackControls:function(){
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
		
		this.currentPage.addClass('active');
	},
	toPage:function(page){
		if (page==this.currentPage) return;
		
		var slide = page.retrieve('slide');
		if (!$defined(slide)) return;
		
		this.fireEvent('select',slide);
		this.scroller.toElement(slide);
		this.currentPage.removeClass('active');
		this.currentPage = page;
	},
	toPrev:function(){
		var prev = this.currentPage.getPrevious();
		if ($defined(prev)) {
			this.toPage(prev);
		}
	},
	toNext:function(){
		var next = this.currentPage.getNext();
		if ($defined(next)) {
			this.toPage(next);
		}
	},
	getIndex:function(){
		return this.currentPage.retrieve('index');
	},
	getSlide:function(){
		return this.currentPage.retrieve('slide');
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
		className:'basic'
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
})

