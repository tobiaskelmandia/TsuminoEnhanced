// ==UserScript==
// @name         Tsumino Enhanced
// @namespace    tobias.kelmandia@gmail.com
// @version      1.1.2
// @description  Adds multiple configurable enhancements, tweaks, and features to Tsumino.com
// @author       Toby
// @include      http://www.tsumino.com/Enhanced
// @include		 http://www.tsumino.com/*
// @require		 https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant		 GM_deleteValue
// @grant 		 unsafeWindow
// @run-at		 document-start
// ==/UserScript==

/* Establish tsuminoEnhanced object. */
	var tsuminoEnhanced = {};
	
	// Current Version
	tsuminoEnhanced.version = "1.1.2";
	
	// Create Tsumino Object
	tsuminoEnhanced.tsumino = {};
	
	// Create Reader Object
	tsuminoEnhanced.reader = {};
	
	/* Predefine Misc. variables. */
		tsuminoEnhanced.onConfig = false;

	/* Convenience variables. */
		// Tsumino Base URL
		tsuminoEnhanced.tsumino.baseURL = "http://www.tsumino.com";
		
		// Tsumino Enhanced configuration location.
		tsuminoEnhanced.configURL = tsuminoEnhanced.tsumino.baseURL + "/Enhanced";		
		
		// Current Location
		tsuminoEnhanced.currentLocation = window.location.href;
		
		// Tsumino's book page URL structure
		tsuminoEnhanced.tsumino.bookPrefix = "/Home/Book/";
		
		// Tsumino's reader page URL structure
		tsuminoEnhanced.tsumino.readerPrefix = "/Home/Read/";
		
		// Tsumino's image retrieval URL structure
		tsuminoEnhanced.tsumino.imgPrefix = "/Home/GetPage/";
		
		// Tsumino's full reader page URL
		tsuminoEnhanced.reader.url = tsuminoEnhanced.tsumino.baseURL + tsuminoEnhanced.tsumino.readerPrefix;
		
		// Is the user on the reader?
		tsuminoEnhanced.onReader = RegExp(tsuminoEnhanced.reader.url + "*").exec(tsuminoEnhanced.currentLocation);
			// If so, create the bookInfo object.
			if(tsuminoEnhanced.onReader) { tsuminoEnhanced.bookInfo = {}; }
		
		// Is the user on the Tsumino Enhanced config page?
		if (tsuminoEnhanced.currentLocation == tsuminoEnhanced.configURL) { tsuminoEnhanced.onConfig = true; }
	
	// Tsumino Enhanced utilities.
	tsuminoEnhanced.utility = {};
	
	// Make the reader more easily managed by Tsumino Enhanced.
	tsuminoEnhanced.utility.enhanceReader = function()
	{
		// Add an ID to the Return Button.
		$("a:contains('RETURN')").attr("id","tsuminoEnhanced_returnButton");
		
		// Determine Book ID, current page, and total number of pages in the book.
		var returnURL = $("#tsuminoEnhanced_returnButton").attr("href");
		var pageData = $("h1:contains('Page')").text();
		pageData = pageData.replace(" Page ","");
		pageData = pageData.split(" of ");
		
		tsuminoEnhanced.reader.currentBook = parseInt(returnURL.replace(tsuminoEnhanced.tsumino.bookPrefix,""));
		tsuminoEnhanced.reader.currentPage = parseInt(pageData[0]);
		tsuminoEnhanced.reader.totalPages = parseInt(pageData[1]);
		tsuminoEnhanced.reader.nextPage = tsuminoEnhanced.reader.currentPage+1;
		tsuminoEnhanced.reader.prevPage = tsuminoEnhanced.reader.currentPage-1;
		tsuminoEnhanced.reader.currentPageURL = tsuminoEnhanced.tsumino.readerPrefix + tsuminoEnhanced.reader.currentBook + "/" + tsuminoEnhanced.reader.currentPage;
		tsuminoEnhanced.reader.nextPageURL = tsuminoEnhanced.tsumino.readerPrefix + tsuminoEnhanced.reader.currentBook + "/" + tsuminoEnhanced.reader.nextPage;
		tsuminoEnhanced.reader.prevPageURL = tsuminoEnhanced.tsumino.readerPrefix + tsuminoEnhanced.reader.currentBook + "/" + tsuminoEnhanced.reader.prevPage;
		
		console.log("Current Book: " + tsuminoEnhanced.reader.currentBook);
		console.log("Current Page: " + tsuminoEnhanced.reader.currentPage);
		console.log("Total Pages: " + tsuminoEnhanced.reader.totalPages);
		
		/* Reader Page Manipulation */
		
			// Enhance pagination information section.
			$("h1:contains('Page')").attr("id","tsuminoEnhanced_pagination")
			$("#tsuminoEnhanced_pagination").html("Page <span id='tsuminoEnhanced_currentPage'>" + tsuminoEnhanced.reader.currentPage + "</span> of <span id='tsuminoEnhanced_totalPages'>" + tsuminoEnhanced.reader.totalPages + "</span>");
		
			// Enhance Previous Page button.
			if ($("a:contains(' PREV')").length)
			{
				$("a:contains(' PREV')").remove();
				$("#tsuminoEnhanced_returnButton").before("<a id=\"tsuminoEnhanced_prevButton\" class=\"book-read-button\" style=\"margin-right: 10px;\"><i class=\"fa fa-arrow-left\"></i> PREV</a>");
			}
			else
			{
				$("#tsuminoEnhanced_returnButton").before("<a id=\"tsuminoEnhanced_prevButton\" class=\"book-read-button\" style=\"margin-right: 10px;\"><i class=\"fa fa-arrow-left\"></i> PREV</a>");
				$("tsuminoEnhanced_prevButton").css("display","none");
			}
			$("#tsuminoEnhanced_prevButton").attr("href",tsuminoEnhanced.reader.prevPageURL);
			if(tsuminoEnhanced.reader.currentPage > 1)
			{
				
				$("#tsuminoEnhanced_prevButton").css("display","inline");
			}
			else
			{
				$("#tsuminoEnhanced_prevButton").css("display","none");
			}
			
			// Enhance Next Page Button
			if ($("a:contains('NEXT ')").length)
			{
				$("a:contains('NEXT ')").remove();
				$("#tsuminoEnhanced_returnButton").after(" <a id=\"tsuminoEnhanced_nextButton\" class=\"book-read-button\">NEXT <i class=\"fa fa-arrow-right\"></i></a>");
			}
			else
			{
				$("#tsuminoEnhanced_returnButton").after(" <a id=\"tsuminoEnhanced_nextButton\" class=\"book-read-button\">NEXT <i class=\"fa fa-arrow-right\"></i></a>");
				$("tsuminoEnhanced_nextButton").css("display","none");
			}
			$("#tsuminoEnhanced_nextButton").attr("href",tsuminoEnhanced.reader.nextPageURL);
			if(tsuminoEnhanced.reader.currentPage < tsuminoEnhanced.reader.totalPages)
			{
				$("#tsuminoEnhanced_nextButton").css("display","inline");
			}
			else
			{
				$("#tsuminoEnhanced_nextButton").css("display","none");
			}
			
			// Enhance reader's image link.
			var imageLink = $("a[href='"+tsuminoEnhanced.tsumino.readerPrefix+tsuminoEnhanced.reader.currentBook+"/"+tsuminoEnhanced.reader.nextPage+"']")[0];
			$(imageLink).attr("id","tsuminoEnhanced_imageLink");
			$("#tsuminoEnhanced_imageLink").attr("href",tsuminoEnhanced.reader.nextPageURL);
	}
	
	// Save current location and go to config.
	tsuminoEnhanced.utility.toConfig = function()
	{
		if(!(tsuminoEnhanced.onReader && GM_getValue("seamlessReader_enabled")))
		{
			GM_setValue("returnTo",tsuminoEnhanced.currentLocation);
		}
		window.location.href = tsuminoEnhanced.configURL;
	}
	
	// Return to saved location.
	tsuminoEnhanced.utility.backToTsumino = function()
	{
		window.location.href = GM_getValue("returnTo");
	}
	
	tsuminoEnhanced.utility.automaticRepositioning = function()
	{
		var imgPos = $(".reader-page").position().top;
		$('html, body').animate(
		{
			scrollTop: imgPos
		}, 1);
	}
	

/* Unstickied Header. */
	tsuminoEnhanced.unstickyHeader = function()
	{
		$(".navbar-fixed-top").css("position", "absolute");
	}

/* Automatic Repositioning */
	tsuminoEnhanced.automaticRepositioning = function()
	{
		$(document).ready(function()
		{
			tsuminoEnhanced.utility.automaticRepositioning();
		});
	}

/* Slideshow */
	// Slideshow - Main Object
	tsuminoEnhanced.slideshow = {};
	
	if(GM_getValue("slideshow_delay"))
	{
		tsuminoEnhanced.slideshow.delayStr = GM_getValue("slideshow_delay").toString();
		if (tsuminoEnhanced.slideshow.delayStr.length == 1) { tsuminoEnhanced.slideshow.delayStr = "0" + tsuminoEnhanced.slideshow.delayStr; }
	}
	
	// Slideshow - Initialization
	tsuminoEnhanced.slideshow.init = function()
	{
		// Create Display Bubble.
		$("body").append("<div id='tsuminoEnhanced_slideshowTimer'></div>");
		$("#tsuminoEnhanced_slideshowTimer").text(tsuminoEnhanced.slideshow.delayStr);
		
		// If on the first page of a doujin, set the slideshow to inactive.
		if (tsuminoEnhanced.reader.currentPage == 1)
		{
			GM_setValue("slideshow_active", false);
		}
		
		// If the Slideshow is enabled and active, run it.
		if (GM_getValue("slideshow_active"))
		{
			console.log("Slideshow is active.");
			if(GM_getValue("slideshow_displayTimer")) { $("#tsuminoEnhanced_slideshowTimer").css("display","block"); }
			console.log(GM_getValue("slideshow_delay") + " seconds until next page.");
			tsuminoEnhanced.slideshow.run();
		}
		else
		{
			console.log("Slideshow is currently inactive.");
			if (GM_getValue("slideshow_delay"))
			{
				console.log("Stored delay between pages is set at: " + GM_getValue("slideshow_delay") + " seconds.");
			}
		}
		
		// Establish Slideshow Toggle keybind.
		$(document).keydown(function(data)
		{
			var keyCode = $(data)[0].keyCode;
			if (keyCode == 16) // SHIFT
			{
				console.log("SHIFT KEY PRESSED.");
				tsuminoEnhanced.slideshow.toggle();
			}
		});
	}
	
	// Slideshow - Toggle Active State
	tsuminoEnhanced.slideshow.toggle = function()
	{
		if (GM_getValue("slideshow_active"))
		{
			console.log("Stopping slideshow.");
			tsuminoEnhanced.slideshow.clearTimeouts();
			$("#tsuminoEnhanced_slideshowTimer").css("display","none");
			GM_setValue("slideshow_active", false);
		}
		else
		{
			GM_setValue("slideshow_active", true);
			tsuminoEnhanced.slideshow.run(true);
			if(GM_getValue("slideshow_displayTimer")) { $("#tsuminoEnhanced_slideshowTimer").css("display","block"); }
		}
	}
	
	// Slideshow - Clear all timeouts.
	tsuminoEnhanced.slideshow.clearTimeouts = function()
	{
		if (tsuminoEnhanced.slideshow.timer)
		{
			clearTimeout(tsuminoEnhanced.slideshow.timer);
		}
		if (tsuminoEnhanced.slideshow.ticker)
		{
			clearTimeout(tsuminoEnhanced.slideshow.ticker);
		}
		console.log("Slideshow timeouts cleared.");
	}
	
	
	// Slideshow - Countdown. (For displaying time left until the next page loads.)
	tsuminoEnhanced.slideshow.countdown = function(timeRemaining)
	{
		timeRemaining--;
		if (timeRemaining.toString().length == 1) { trString = "0" + timeRemaining;	}
		else { trString = timeRemaining; }
		tsuminoEnhanced.slideshow.ticker = setTimeout(function()
		{
			$("#tsuminoEnhanced_slideshowTimer").text(trString);
			tsuminoEnhanced.slideshow.countdown(timeRemaining);
		}, 1000);
	}
	
	// Slideshow - Run
	tsuminoEnhanced.slideshow.run = function(startNow)
	{
		startNow || false;
		var waitFor = parseInt(GM_getValue("slideshow_delay")) * 1000;
		if (startNow)
		{
			if (tsuminoEnhanced.reader.currentPage < tsuminoEnhanced.reader.totalPages)
			{
				// If Seamless Reader is also enabled:
				if(GM_getValue("seamlessReader_enabled"))
				{
					console.log("Loading next page...");
					tsuminoEnhanced.seamlessReader.changePage(tsuminoEnhanced.reader.nextPage);
				}
				else
				{
					console.log("Moving to next page...");
					$("#tsuminoEnhanced_nextButton")[0].click();
				}
			}
			else
			{
				$("#tsuminoEnhanced_slideshowTimer").css("display","none");
				console.log("No more pages to load.");
				tsuminoEnhanced.slideshow.clearTimeouts();
			}
		}
		else
		{
			tsuminoEnhanced.slideshow.countdown(parseInt(GM_getValue("slideshow_delay")));
			tsuminoEnhanced.slideshow.timer = setTimeout(tsuminoEnhanced.slideshow.run, waitFor, true);
		}
	}
	
/* Seamless Reader */
	// Seamless Reader Object
	tsuminoEnhanced.seamlessReader = {};
	
	// Seamless Reader - Initialization
	tsuminoEnhanced.seamlessReader.init = function()
	{		
		// Replace default Tsumino reader keybinds with Enhanced Seamless Reader keybinds.
		tsuminoEnhanced.seamlessReader.replaceKeybinds();
		
		// Remove default Tsumino doujin navigation links.
		$("#tsuminoEnhanced_prevButton").attr("href","javascript:;");
		$("#tsuminoEnhanced_nextButton").attr("href","javascript:;");
		$("#tsuminoEnhanced_imageLink").attr("href","javascript:;");
		
		// Update doujin navigation links.
		tsuminoEnhanced.seamlessReader.updateLinks();
	}
	
	// Seamless Reader - Replace Keybinds.
	tsuminoEnhanced.seamlessReader.replaceKeybinds = function()
	{
		// Disable default Tsumino Reader Keybinds.
		unsafeWindow.$(document).off("keydown");
		
		// Use Enhanced Seamless Reader keybinds instead.
		$(document).keydown(function(e)
		{
			var bk = function()
			{
				tsuminoEnhanced.seamlessReader.changePage(tsuminoEnhanced.reader.prevPage);
			}
			var fwd = function()
			{
				tsuminoEnhanced.seamlessReader.changePage(tsuminoEnhanced.reader.nextPage);
			}
			switch (e.which)
			{
				case 87: // w
					window.scrollBy(0, -100);
					break;
				case 83: // s
					window.scrollBy(0, 100);
					break;
				case 8: //back
				case 37: //left
				case 65: //a
					bk();
					break;
				case 32: //space
				case 13: //enter
				case 39: //right
				case 68: //d
					fwd();
					break;
				default:
					return;
			}
			e.preventDefault();
		});
	}
	
	// Seamless Reader - Load Image.
	tsuminoEnhanced.seamlessReader.loadImage = function(pageNumber)
	{
		var dfd = jQuery.Deferred();
		var newImageSrc = tsuminoEnhanced.tsumino.imgPrefix + tsuminoEnhanced.reader.currentBook + "/" + pageNumber;
		console.log("Loading Image: " + pageNumber + "...");
		$("body").append("<img id='tsuminoEnhanced_imagePreload_"+pageNumber+"' style='display:none;'>");
		$("#tsuminoEnhanced_imagePreload_"+pageNumber).attr("src",newImageSrc);
		$( "#tsuminoEnhanced_imagePreload_"+pageNumber).load(function() {
			console.log("Image "+pageNumber+" loaded.");
			$(".reader-img").attr("src",newImageSrc);
			$("#tsuminoEnhanced_imagePreload_"+pageNumber).remove();
			dfd.resolve();
		});
		return dfd.promise();
	}
	
	// Seamless Reader - Update Links
	tsuminoEnhanced.seamlessReader.updateLinks = function()
	{
		// Remove old click binds from links.
		$("#tsuminoEnhanced_prevButton").off("click");
		$("#tsuminoEnhanced_nextButton").off("click");
		$("#tsuminoEnhanced_imageLink").off("click");
		
		// Establish updated click binds.
		if(tsuminoEnhanced.reader.currentPage < tsuminoEnhanced.reader.totalPages)
		{
			$("#tsuminoEnhanced_nextButton").css("display","inline");
			$("#tsuminoEnhanced_nextButton").click(function(){ tsuminoEnhanced.seamlessReader.changePage(tsuminoEnhanced.reader.nextPage); });
			$("#tsuminoEnhanced_imageLink").click(function(){ tsuminoEnhanced.seamlessReader.changePage(tsuminoEnhanced.reader.nextPage); });
		}
		else
		{
			$("#tsuminoEnhanced_nextButton").css("display","none");
		}
		if(tsuminoEnhanced.reader.currentPage > 1)
		{
			
			$("#tsuminoEnhanced_prevButton").css("display","inline");
			$("#tsuminoEnhanced_prevButton").click(function(){ tsuminoEnhanced.seamlessReader.changePage(tsuminoEnhanced.reader.prevPage); });
		}
		else
		{
			$("#tsuminoEnhanced_prevButton").css("display","none");
		}
	}
	
	// Seamless Reader - Change Page
	tsuminoEnhanced.seamlessReader.changePage = function(pageNumber)
	{
		var dfd = jQuery.Deferred();
		$.when(tsuminoEnhanced.seamlessReader.loadImage(pageNumber)).then(function()
		{
			tsuminoEnhanced.utility.automaticRepositioning();
			tsuminoEnhanced.reader.prevPage = pageNumber-1;
			tsuminoEnhanced.reader.currentPage = pageNumber;
			tsuminoEnhanced.reader.nextPage = pageNumber+1;
			tsuminoEnhanced.seamlessReader.updateLinks();
			tsuminoEnhanced.reader.currentPageURL = tsuminoEnhanced.tsumino.readerPrefix + tsuminoEnhanced.reader.currentBook + "/" + tsuminoEnhanced.reader.currentPage;
			GM_setValue("returnTo",tsuminoEnhanced.reader.currentPageURL);
			$("#tsuminoEnhanced_currentPage").html("<a href='"+tsuminoEnhanced.reader.currentPageURL+"'>"+tsuminoEnhanced.reader.currentPage+"</a>");
			// If also using Slideshow:
			if (GM_getValue("slideshow_enabled")) 
			{
				// And if the slideshow is active:
				if (GM_getValue("slideshow_active"))
				{
					// Reset existing timeouts.
					tsuminoEnhanced.slideshow.clearTimeouts();
					$("#tsuminoEnhanced_slideshowTimer").text(tsuminoEnhanced.slideshow.delayStr);
					tsuminoEnhanced.slideshow.run();
				}
			}
			// If also using the preloader enhancement:
			if (GM_getValue("preloader_enabled")) { tsuminoEnhanced.preloader(); }
			dfd.resolve();
		});
		return dfd.promise();
	}

/* Preloader */
	tsuminoEnhanced.preloader = function()
	{
		if(tsuminoEnhanced.reader.currentPage < tsuminoEnhanced.reader.totalPages)
		{
			var newImageSrc = tsuminoEnhanced.tsumino.imgPrefix + tsuminoEnhanced.reader.currentBook + "/" + tsuminoEnhanced.reader.nextPage;
			console.log("Preloading Image: " + tsuminoEnhanced.reader.nextPage + "...");
			$("body").append("<img id='tsuminoEnhanced_imagePreload_"+tsuminoEnhanced.reader.nextPage+"' style='display:none;'>");
			$("#tsuminoEnhanced_imagePreload_"+tsuminoEnhanced.reader.nextPage).attr("src",newImageSrc);
			$( "#tsuminoEnhanced_imagePreload_"+tsuminoEnhanced.reader.nextPage).load(function() {
				console.log("Image "+tsuminoEnhanced.reader.nextPage+" preloaded.");
				$("#tsuminoEnhanced_imagePreload_"+tsuminoEnhanced.reader.nextPage).remove();
			});
		}
	}

/* Single Page View Reader */
	tsuminoEnhanced.singlePageView = function()
	{
		// Coming Soon... (Pending Staff Approval)
	}

/* Page Modifications */
	// If the user isn't already on the config page, include a link to it in Tsumino's navigation.
	if (!tsuminoEnhanced.onConfig)
	{
		$( document ).ready(function()
		{
			$("ul.nav.navbar-nav:contains('FORUM')").append("<li><a id='tsuminoEnhancedNavlink' style='color:#22a7f0 !important; cursor:pointer;'>ENHANCED</a></li>");
			$("head").append("<style>#tsuminoEnhanced_slideshowTimer{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default;position:fixed;float:right;bottom:5px;right:5px;background-color:#333;border:2px solid #DDD;border-radius:15px;background-color:rgba(51,51,51,.5);padding:5px 15px;color:#fff;display:none}</style>");
			$("#tsuminoEnhancedNavlink").click(function(){tsuminoEnhanced.utility.toConfig();});
		});
	}
	// If the user is on the config page, write it.
	else
	{
		// Kill the 404 page early.
		document.replaceChild 
		(
			document.importNode (document.implementation.createHTMLDocument("").documentElement, true),
			document.documentElement
		);
		// Apply preliminary background color for smooth appearance.
		document.head.innerHTML = '<style>body{background-color:#1a1a1a;}</style>';
		// Create the actual Tsumino Enhanced template once the DOM is ready.
		$( document ).ready(function()
		{
			$("head").html("");
			$("head").append("<link rel=\"icon\" type=\"image/png\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wsRDAY5sIzTWwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAEaUlEQVRYw+2XW2xVRRSGv5nZ+1x6di/QUjinLdVUArVISIoJgRcEAoEQY4LxwUB8Ml4evEQTJGhQQ/SVGI2aaAzyohiDCMREEpUol4ACRROubSkl1tKeXjhnn+uePT7s5hRigJ62hhfmbe+ZWfOv9a/1rxmxZMkSwz0ckns87gOwpsOIERKUBcaAtDB2GF33IDI9iBrqnRwAY0XQNXGswe7gW9n4lbPwEm14TYvRtc2YaBVGWmCHMSqEKLiokT58pxa/JgFA7OB72Od/RmDKA6Brm0ht+piKQzsJnz2Au34rxYeWg1TI0T7UQBem4OI1txP68weiv32OzIwAUJi/AnfDmwC467ZQc/kIePnyckDk3cBY6yp8pw5n/7vEvn8HgOhPH+Hs20747EHwCnhzFyNy6QB41Rwyj704FkaDfeUk+Lr8JBT5NFbPKfyIg7EjAIQ6j4JXIP/oU4H9aDVYIcKn9yF8DwCvYSEmNhMAu+s4sf07SnNlUSCzNwhd+pXM6pcxoVjpvxrqRVfHybeuJt+2JojSghUUW5aC1vjVcwLDvR1ED3+K8HKTrwKRTgY8btgG2sOEohinDrw8hYVrsXtOEzm5B5lOggAMpJ7+AKu3g9iBHcjM8NTKULpJRGoAvyaBut5J9PCXqIFO5I1+MAahi+Tan0QUcwHXQPWHTyC8PEIXpy5EcrQfNXiFyLHdVO1+Dqv3DH5lPcIrlA7QM5tIb3yfwoKVpdzBmEAbJjBUIpF4+7YUeDlCncdQfecRukC+bS2ZDdtACOzeDgD82rl4jYvQ8Vbs7hN4DW3klm5CGO+uInRXCoy0AlGprMezQvgzGgAotiwjenRX4EHfBUQ+jV85C3fdFkTeDajT3jRIsRB4jYvIrHoJpEJdvzwW5tT4El0ABHL0Hyq/egVxU80bgtycfBXoIvaFX3BG/kbkXfTMuWTWvwFe4VbBMgaZGkD4mkLLMorzlhP660fsax1Tb0Yi7yKyNygsWImOz79FJUt++hov3srI899gQhXI9CDW1TNTp8CLt5J+fDvGqUOkk9hdx6BpMX5NHD9ajcyOBh1QBKCcvdtQY83rTvI7YQBW3zmqP9uMiVYj04Nklz0zFhYZHA6YUAWoEHb3Caz+ixhlgxCgLAwSjAZdvG0u3P0+oGz8qtm4a17Dr6oHY1D9l0rTfmU9SInX+Aju2tfRs1rwYzMCYKEKVP9FnL1vIdxkeQB8pxZd+wC59o3oxMNUHNqJHL5GavMnIMe3iVwKtIcfrcGvaUAUs6hhNygB3wMrjIk4UA6AYuMisiteQM+eh0xexfl2K1bfOYrN7UHYw85/ylANduN8/Soo+yYvNML45eeAzAxj9ZxCDXQR+X0PKtlT4j7Q3/EyNHYElEKmrgc8T7AH3BGAGuoleuQLUDaimB1f3PMHcvga4TP7xsGmkxghsfovTu+lVPhewOHN/4xP1a5nb/FSDV3F7jxO+PR3kwIgputlNBHZ/V/fBWKS++6/jO4D+BdYdNLmP/zOiQAAAABJRU5ErkJggg==\"/>");
			$("head").append("<title>Tsumino Enhanced</title><link href='https://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>");
			$("body").html("<div id='tsuminoEnhanced_header'>TSUMINO <span id='tsuminoEnhanced_brand'>ENHANCED</span> <span id='tsuminoEnhanced_version'>" + tsuminoEnhanced.version + "</span></div><div id='tsuminoEnhanced_body'></div>");
			
			// Tsumino Enhanced Stylesheet.
			$("head").append("<style>#tsuminoEnhanced_brand,.tsuminoEnhancement,h2{color:#22a7f0}.cmn-toggle+label,select{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none}#tsuminoEnhanced_footer,#tsuminoEnhanced_header{background-color:#333;color:#FFF;padding:5px 15px;margin:0;font-weight:700}#tsuminoEnhanced_version{font-size:.5em}.cmn-toggle+label,select{cursor:pointer;outline:0}body{margin:0;background-color:#1a1a1a;font-family:'Open Sans';font-size:1em}a,a:visited{color:#23a7f0;text-decoration:none}a:hover{color:#23a7f0;text-decoration:underline}h1,h2,h3,h4,h5,h6{padding:0;margin:0;font-weight:700}#tsuminoEnhanced_header,h1{font-size:2em}h2{font-size:1.5em;margin-bottom:5px}#tsuminoEnhanced_footer{bottom:0;left:0;text-align:center;margin-top:15px}#tsuminoEnhanced_body{padding:15px;color:#fff}.options{padding-left:2em}.optionDescription{margin-top:10px}.optionGroup{margin-bottom:20px;border:2px solid #fff;border-radius:5px;background-color:#222;padding:15px}.cmn-toggle{position:absolute;margin-left:-9999px;visibility:hidden}.cmn-toggle+label{display:block;position:relative;user-select:none}input.cmn-toggle-round-flat+label{padding:2px;width:40px;height:20px;background-color:#ddd;-webkit-border-radius:20px;-moz-border-radius:20px;-ms-border-radius:20px;-o-border-radius:20px;border-radius:20px;-webkit-transition:background .4s;-moz-transition:background .4s;-o-transition:background .4s;transition:background .4s}input.cmn-toggle-round-flat+label:after,input.cmn-toggle-round-flat+label:before{display:block;position:absolute;content:''}input.cmn-toggle-round-flat+label:before{top:2px;left:2px;bottom:2px;right:2px;background-color:#1a1a1a;-webkit-border-radius:20px;-moz-border-radius:20px;-ms-border-radius:20px;-o-border-radius:20px;border-radius:20px;-webkit-transition:background .4s;-moz-transition:background .4s;-o-transition:background .4s;transition:background .4s}input.cmn-toggle-round-flat+label:after{top:4px;left:4px;bottom:4px;width:16px;background-color:#ddd;-webkit-border-radius:16px;-moz-border-radius:16px;-ms-border-radius:16px;-o-border-radius:16px;border-radius:16px;-webkit-transition:margin .4s,background .4s;-moz-transition:margin .4s,background .4s;-o-transition:margin .4s,background .4s;transition:margin .4s,background .4s}input.cmn-toggle-round-flat:checked+label{background-color:#22a7f0}input.cmn-toggle-round-flat:checked+label:after{margin-left:20px;background-color:#22a7f0}select,select option{background-color:#1a1a1a;color:#fff}.tsuminoEnhancedButton,.tsuminoEnhancedButton:hover{background-color:#23a8f0;color:#fff;text-decoration:none}select{border:2px solid #ddd;border-radius:5px;padding:5px;font-size:1.2em;user-select:none}.fauxRow{display:table-row}.fauxCell{display:table-cell;vertical-align:middle}.switchContainer{padding-right:10px}.tsuminoEnhancedButton{-moz-border-radius:28px;-webkit-border-radius:28px;border-radius:30px;border:2px solid #ddd;display:inline-block;cursor:pointer;font-size:1.2em;font-weight:700;padding:5px 15px;text-shadow:0 1px 0 #12587d;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.tsuminoEnhancedButton:active{position:relative;top:1px}#tsuminoReturnButtonContainer{margin-left:15px}</style>");
			
			// Tsumino Reader Options header.
			$("#tsuminoEnhanced_body").append("<h1>Reader Enhancements</h1>The following Enhancements only apply to the Tsumino Reader.<br /><br /><div id='readerOptions' class='options'></div>");

			// If the slideshow wasn't enabled, but a delay was selected, remove the delay.
			if(!GM_getValue("slideshow_enabled")) { $("#slideshow_delay").val(GM_deleteValue("slideshow_delay")); }
			
			// Slideshow Options.
			$("#readerOptions").append("<div id='slideshow_group' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='slideshow_switch' name='slideshow_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled='disabled' /><label for='slideshow_switch'></label></div><div class='fauxCell'><h2>Slideshow</h2></div></div><div class='optionDescription'>Adds slideshow functionality to the reader.<br/>Press SHIFT while on the reader to toggle it on and off.<br/>Select how long the slideshow will remain on a page to enable this Enhancement.<br/><br/><select id='slideshow_delay' name='slideshow_delay'><option value='default' disabled='disabled'>Spend how many seconds per page?</option></select></div></div>");
			$("#slideshow_group").append("<br /><div class='fauxRow'><div class='fauxCell switchContainer'><input id='slideshow_displayTimer_switch' name='slideshow_displayTimer_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled='disabled' /><label for='slideshow_displayTimer_switch'></label></div><div class='fauxCell'>Display Timer</div></div>");
			
			
				// Populate slideshow delay select box.
				var pluralize = "";
				var iDisp = "";
				for (var i = 1; i < 61; i++)
				{
					if(i != 1) { pluralize = "s"; }
					iDisp = i.toString();
					if(iDisp.length==1){iDisp = "0"+i}
					$("#slideshow_delay").append("<option value='" + i + "'>" + iDisp + " Second"+pluralize+"</option>");
				}
				if(GM_getValue("slideshow_enabled"))
				{
					$("#slideshow_switch").prop("checked",true); 
					$("#slideshow_switch").prop("disabled",false);
					$("#slideshow_delay").val(GM_getValue("slideshow_delay"));
					$("#slideshow_displayTimer_switch").prop("checked",GM_getValue("slideshow_displayTimer"));
					$("#slideshow_displayTimer_switch").prop("disabled",false);
				}
			
			// Seamless Reader Options.
			$("#readerOptions").append("<div id='slideshow_group' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='seamlessReader_switch' name='seamlessReader_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' /><label for='seamlessReader_switch'></label></div><div class='fauxCell'><h2>Seamless Viewing</h2></div></div><div class='optionDescription'>Makes the Tsumino Reader load doujin pages without needing to reload the webpage.<br />Requires the following Enhancements:<br /><span class='tsuminoEnhancement'>Unstickied Header</span><br /><span class='tsuminoEnhancement'>Automatic Repositioning</span><br /><span class='tsuminoEnhancement'>Preloader</span></div></div>");
			if(GM_getValue("seamlessReader_enabled")){$("#seamlessReader_switch").prop("checked",true);}
			
			// Unstickied Header Options.
			$("#readerOptions").append("<div id='unstickiedHeaderGroup' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='unstickedHeader_switch' name='unstickedHeader_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat'/><label for='unstickedHeader_switch'></label></div><div class='fauxCell'><h2>Unstickied Header</h2></div></div><div class='optionDescription'>Prevents the Tsumino header from following you as you scroll down the page.<br/></div></div>");
			if(GM_getValue("unstickedHeader_enabled")){$("#unstickedHeader_switch").prop("checked",true);}
			
			// Automatic Repositioning Options.
			$("#readerOptions").append("<div id='automaticRepositioningGroup' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='automaticRepositioning_switch' name='automaticRepositioning_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat'/><label for='automaticRepositioning_switch'></label></div><div class='fauxCell'><h2>Automatic Repositioning</h2></div></div><div class='optionDescription'>Automatically scrolls the page down to the top of the doujin image.<br/>Requires <span class='tsuminoEnhancement'>Unstickied Header</span>.<br /></div></div>");
			if(GM_getValue("automaticRepositioning_enabled")){$("#automaticRepositioning_switch").prop("checked",true);}
			
			// Preloader Options.
			$("#readerOptions").append("<div id='preloaderGroup' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='preloader_switch' name='preloader_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat'/><label for='preloader_switch'></label></div><div class='fauxCell'><h2>Preloader</h2></div></div><div class='optionDescription'>Automatically preloads the next image in the background.<br /></div></div>");
			if(GM_getValue("preloader_enabled")){$("#preloader_switch").prop("checked",true);}
			
			// Return to Tsumino
			$("body").append("<div id='tsuminoReturnButtonContainer'><a id='tsuminoReturnButton' class='tsuminoEnhancedButton'>Return to Tsumino</a></div>");
			$("#tsuminoReturnButton").click(function(){ tsuminoEnhanced.utility.backToTsumino(); });
			
			// Tsumino Enhanced Footer.
			$("body").append("<div id='tsuminoEnhanced_footer'>Check out the project on <a href='https://github.com/tobiaskelmandia/TsuminoEnhanced'>Github</a>!</div>");
			
			
		/* Commit options to GM_values. */
		function commitOptions()
		{
			GM_setValue("slideshow_enabled", $("#slideshow_switch").prop("checked"));
			GM_setValue("slideshow_delay", $("#slideshow_delay").val());
			GM_setValue("slideshow_displayTimer", $("#slideshow_displayTimer_switch").prop("checked"));
			GM_setValue("seamlessReader_enabled", $("#seamlessReader_switch").prop("checked"));
			GM_setValue("unstickedHeader_enabled", $("#unstickedHeader_switch").prop("checked"));
			GM_setValue("automaticRepositioning_enabled", $("#automaticRepositioning_switch").prop("checked"));
			GM_setValue("preloader_enabled", $("#preloader_switch").prop("checked"));
		}
		
			// Unstickied Header		
			$("#unstickedHeader_switch").change(function()
			{
				if(!$("#unstickedHeader_switch").prop("checked"))
				{
					$("#automaticRepositioning_switch").prop("checked",false);
					$("#seamlessReader_switch").prop("checked",false);
				}
				commitOptions();
			});
			
			// Scroll to Image
			$("#automaticRepositioning_switch").change(function()
			{
				if($("#automaticRepositioning_switch").prop("checked"))
				{
					$("#unstickedHeader_switch").prop("checked",true);
				}
				else
				{
					$("#seamlessReader_switch").prop("checked",false);
				}
				commitOptions();
			});
			
			// Slideshow
			$("#slideshow_switch").change(function()
			{
				if(!$("#slideshow_switch").prop("checked"))
				{
					$("#slideshow_delay").val( 'default' );
					$("#slideshow_switch").prop("disabled",true);
					GM_deleteValue("slideshow_delay");
					GM_deleteValue("slideshow_displayTimer");
				}
				commitOptions();
			});
				// Slideshow Delay
				$("#slideshow_delay").change(function()
				{
					if($("#slideshow_delay").val() != "default")
					{
						$("#slideshow_switch").removeProp("disabled");
						$("#slideshow_switch").prop("checked",true);
						$("#slideshow_displayTimer_switch").removeProp("disabled");
						$("#slideshow_displayTimer_switch").prop("checked",true);
					}
					commitOptions();
				});
				// Slideshow Display Timer
				$("#slideshow_displayTimer_switch").change(function()
				{
					commitOptions();
				});
				
			// Seamless Reader
			$("#seamlessReader_switch").change(function()
			{
				if($("#seamlessReader_switch").prop("checked"))
				{
					$("#unstickedHeader_switch").prop("checked",true);
					$("#automaticRepositioning_switch").prop("checked",true);
					$("#preloader_switch").prop("checked",true);
				}
				commitOptions();
			});
			
			// Preloader
			$("#preloader_switch").change(function()
			{
				if(!$("#preloader_switch").prop("checked"))
				{
					$("#seamlessReader_switch").prop("checked",false)
				}
				commitOptions();
			});
		});
	}

/* If the user is on the Reader, apply any enabled Reader Options */
	if (tsuminoEnhanced.onReader)
	{
		// Run when DOM is ready.
		$( document ).ready(function()
		{
			tsuminoEnhanced.utility.enhanceReader();
			if (GM_getValue("unstickedHeader_enabled")) { tsuminoEnhanced.unstickyHeader(); }
			if (GM_getValue("automaticRepositioning_enabled")) { tsuminoEnhanced.automaticRepositioning(); }
			if (GM_getValue("slideshow_enabled")) { tsuminoEnhanced.slideshow.init(); }
			if (GM_getValue("seamlessReader_enabled")) { tsuminoEnhanced.seamlessReader.init(); }
		});
		// Run when the page and all assets are full loaded.
		$( window ).load(function()
		{
			if (GM_getValue("preloader_enabled")) { tsuminoEnhanced.preloader(); }
		});
	}