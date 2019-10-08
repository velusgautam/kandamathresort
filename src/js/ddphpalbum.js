/* PHP Photo Album script v2.11
* This notice must stay intact for usage 
* Author: Dynamic Drive at http://www.dynamicdrive.com/
* Visit http://www.dynamicdrive.com/ for full source code
*/

//** v2.11 (Aug 10th, 09'):
//1) Fade animation now a function of time (default=500 milliseconds)
//2) Fixed sort by "desc" not working in IE


function phpimagealbum(setting){
	this.albumvar=setting.albumvar
	this.albumvar.images.pop() //remove last "dummy" array element
	for (var i=0; i<this.albumvar.images.length; i++){
		if (this.albumvar.desc[i]) //if a manual desc exists for this image
			this.albumvar.images[i][3]=this.albumvar.desc[i] //extend image array with desc
	}
	this.albumdivid='phpphotoalbum'+(++phpimagealbum.routines.albumcount)
	this.dimensions=setting.dimensions || [3,3]
	this.sortby=setting.sortby || ["file", "asc"],
	this.autodesc=setting.autodesc
	this.showsourceorder=setting.showsourceorder
	this.onphotoclick=setting.onphotoclick || function(){}
	this.photodivs=[] //array referencing each DIV that contains a slide
	this.navlinks=null //HTML collection
	if (setting.sortby[0]=="file") //sort by filename (asc)
		this.albumvar.images.sort(function(a,b){return a[1].localeCompare(b[1])})
	else //sort by date (asc)
		this.albumvar.images.sort(function(a,b){return new Date(a[2])-new Date(b[2])})
	if (setting.sortby[1]=="desc"){
		this.albumvar.images.reverse()
	}
	this.buildgallery()
	this.buildnav()
}

phpimagealbum.prototype={

	buildgallery:function(){
		var thisalbum=this
		var curimage=0
		document.write('<div id="'+this.albumdivid+'">')
		for (var rows=0; rows<this.dimensions[1]; rows++){
			for (var cols=0; cols<this.dimensions[0]; cols++){
				if (curimage<this.albumvar.images.length)
					document.write('<div class="photodiv">' + phpimagealbum.routines.buildimage(this.albumvar, curimage, this.autodesc, this.showsourceorder) + '</div>')
				curimage++
			} //end cols loop
			document.write('<br style="clear: left" />')
		} //end rows loop
		document.write('</div>')
		var albumdiv=document.getElementById(this.albumdivid)
		var alldivs=albumdiv.getElementsByTagName('div')
		for (var i=0; i<alldivs.length; i++){
			if (alldivs[i].className=="photodiv")
				this.photodivs.push(alldivs[i])
		}
		phpimagealbum.routines.addEvent(albumdiv, function(e){
			var e=window.event || e
			var target=e.srcElement || e.target
			if (target.tagName=="IMG" && target.getAttribute('data-index')){
				thisalbum.onphotoclick(target, thisalbum.albumvar.images[parseInt(target.getAttribute('data-index'))][0], thisalbum.albumvar.images[parseInt(target.getAttribute('data-index'))][1])
			}
		}, "click")
	},

	buildnav:function(){
		var thisalbum=this
		var navid=this.albumdivid + '_paginate'
		document.write('<div id="' + navid +'" class="albumnavlinks">')
		for (var i=1; i<Math.ceil(this.albumvar.images.length/this.photodivs.length)+1; i++){
			document.write('<a href="#Page' + i+ '" rel="'+i+'">Page'+i+'</a> ')
		}
		document.write('</div>')
		var navdiv=document.getElementById(navid)
		phpimagealbum.routines.addEvent(navdiv, function(e){
			var e=window.event || e
			var target=e.srcElement || e.target
			if (target.tagName=="A"){
				thisalbum.gotopage(target.getAttribute('rel'))
				if (e.preventDefault)
					e.preventDefault()
				else
					return false
			}
		}, "click")
		this.navlinks=navdiv.getElementsByTagName('a')
		this.navlinks[0].className="current"
	},

	gotopage:function(p){
		var startpoint=(p-1)*this.photodivs.length
		var y=1;
		for (var i=0; i<this.photodivs.length; i++){
			this.photodivs[i].innerHTML=null
			this.photodivs[i].innerHTML=(typeof this.albumvar.images[startpoint+i]!="undefined")? phpimagealbum.routines.buildimage(this.albumvar, startpoint+i, this.autodesc, this.showsourceorder) : ""
		}
		for (var i=0; i<this.navlinks.length; i++)
			this.navlinks[i].className=''
		this.navlinks[p-1].className="current"
	}

}

phpimagealbum.routines={

	albumcount: 0,

	buildimage:function(albumvar, i, desc, showorder){
		var desc=(desc && desc!="")? '<br />' + desc.replace(/(%i)|(%d)|(%s)/g, function(m){
				return (m=="%i")? i+1 : (m=="%d")? albumvar.images[i][2] : ""
			}) : ''
		return (showorder? '<b style="color:red">Source Order: '+albumvar.images[i][0]+'</b><br />' : '') + '<img src="' + albumvar.baseurl + albumvar.images[i][1] + '" data-index="' + i +'" />' + (albumvar.images[i][3]? '<br />'+albumvar.images[i][3] : (desc)? desc : '')
	},

	addEvent:function(target, functionref, tasktype){
		if (target.addEventListener)
			target.addEventListener(tasktype, functionref, false);
		else if (target.attachEvent)
			target.attachEvent('on'+tasktype, function(){return functionref.call(target, window.event)});
	}

}

/////////Following is thumbnailviewer(), a plugin to PHP Photo Album for enlarging thumbnail images/////////////////

var thumbnailviewer={
enableAnimation: true, //Enable fading animation?
fadeDuration: 500, //duration of fade animation in milliseconds
definefooter: '<div class="footerbar">CLOSE X</div>', //Define HTML for footer interface
defineLoading: '<img src="loading.gif" /> Loading Image...', //Define HTML for "loading" div

/////////////No need to edit beyond here/////////////////////////

opacitystring: 'filter:progid:DXImageTransform.Microsoft.alpha(opacity=10); -moz-opacity: 0.1; opacity: 0.1',
animateobj: {curdegree:0, starttime:null, opacitytimer:null},

createthumbBox:function(){
	//write out HTML for Image Thumbnail Viewer plus loading div
	document.write('<div id="thumbBox" onClick="thumbnailviewer.closeit()"><div id="thumbImage"></div>'+this.definefooter+'</div>')
	document.write('<div id="thumbLoading">'+this.defineLoading+'</div>')
	this.thumbBox=document.getElementById("thumbBox")
	this.thumbImage=document.getElementById("thumbImage") //Reference div that holds the shown image
	this.thumbLoading=document.getElementById("thumbLoading") //Reference "loading" div that will be shown while image is fetched
	this.sbody=(document.compatMode=="CSS1Compat")? document.documentElement : document.body //create reference to common "body" across doctypes
},


centerDiv:function(divobj){ //Centers a div element on the page
	var winattrs={x:window.pageXOffset || this.sbody.scrollLeft, y:window.pageYOffset || this.sbody.scrollTop, w:window.innerWidth || this.sbody.clientWidth, h:window.innerHeight || this.sbody.clientHeight}
	this.winattrs=winattrs
	var divattrs={w:divobj.offsetWidth, h:divobj.offsetHeight}
	divobj.style.left=winattrs.x + winattrs.w/2 - divattrs.w/2 + "px"
	divobj.style.top=winattrs.y + (winattrs.h>divattrs.h? winattrs.h/2 - divattrs.h/2 : 10) + "px"
	divobj.style.visibility="visible"
},

showthumbBox:function(fit2screen){ //Show ThumbBox div
	if (fit2screen && parseInt(this.featureImage.offsetWidth)>(this.winattrs.w-70)){
		this.featureImage.style.width=this.winattrs.w-70+"px"
	}
	thumbnailviewer.thumbLoading.style.visibility="hidden" //Hide "loading" div
	if (this.enableAnimation) //if animation enabled, hide image first before applying opacity
		this.featureImage.style.visibility="hidden"
	this.centerDiv(this.thumbBox)
	if (this.enableAnimation){ //If fading animation enabled
		this.animateobj.curdegree=0
		this.featureImage.style.visibility="visible"
		this.animateobj.starttime=new Date().getTime() //get time just before animation is run
		this.animateobj.opacitytimer=setInterval("thumbnailviewer.opacityanimation()", 10)
	}
},


loadimage:function(imgsrc, imgw, imgh){ //Load image function that gets attached to each link on the page with rel="thumbnail"
	if (this.thumbBox.style.visibility=="visible") //if thumbox is visible on the page already
		this.closeit() //Hide it first (not doing so causes triggers some positioning bug in Firefox
	var styled=(this.enableAnimation? this.opacitystring+';' : '') +(imgw && imgh? 'width:'+parseInt(imgw)+'px; height:'+parseInt(imgh)+'px;' : '')
	var imageHTML='<img src="'+imgsrc+'" style="'+styled+'" />' //Construct HTML for shown image
	this.centerDiv(this.thumbLoading, imgw, imgh) //Center and display "loading" div while we set up the image to be shown
	this.thumbImage.innerHTML=imageHTML //Populate thumbImage div with shown image's HTML (while still hidden)
	this.featureImage=this.thumbImage.getElementsByTagName("img")[0] //Reference shown image itself
	if (this.featureImage.complete)
		thumbnailviewer.showthumbBox(imgw=="fit2screen"? true : false)
	else{
		this.featureImage.onload=function(){ //When target image has completely loaded
			thumbnailviewer.showthumbBox(imgw=="fit2screen"? true : false) //Display "thumbbox" div to the world!
		}
	}
	if (document.all && !window.createPopup) //Target IE5.0 browsers only. Address IE image cache not firing onload bug: panoramio.com/blog/onload-event/
		this.featureImage.src=imgsrc
	this.featureImage.onerror=function(){ //If an error has occurred while loading the image to show
		thumbnailviewer.thumbLoading.style.visibility="hidden" //Hide "loading" div, game over
	}
},

setopacity:function(el, value){
	el.style.opacity=value
	if (typeof el.style.opacity!="string"){ //if it's not a string (ie: number instead), it means property not supported
		el.style.MozOpacity=value
		if (el.filters){
			el.style.filter="progid:DXImageTransform.Microsoft.alpha(opacity="+ value*100 +")"
		}
	}
},


opacityanimation:function(){ //Gradually increase opacity function
var elapsed=new Date().getTime()-this.animateobj.starttime //get time animation has run
	if (elapsed<this.fadeDuration){
		this.setopacity(this.featureImage, this.animateobj.curdegree)
	}
	else{
		clearInterval(this.animateobj.opacitytimer)
		this.setopacity(this.featureImage, 1)
	}
	this.animateobj.curdegree=(1-Math.cos((elapsed/this.fadeDuration)*Math.PI)) / 2

},

closeit:function(){ //Close "thumbbox" div function
	if (typeof this.animateobj.opacitytimer!="undefined")
		clearInterval(this.animateobj.opacitytimer)
	this.thumbBox.style.left="-4000px"
	this.thumbBox.style.top="-4000px"
	this.thumbBox.style.visibility="hidden"
	this.thumbImage.innerHTML=""
}

}

thumbnailviewer.createthumbBox() //Output HTML for the image thumbnail viewer
window.onresize=function(){
	if (thumbnailviewer && thumbnailviewer.thumbBox.style.visibility=="visible")
		thumbnailviewer.centerDiv(thumbnailviewer.thumbBox)
}
