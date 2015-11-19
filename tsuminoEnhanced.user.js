// ==UserScript==
// @name         Tsumino Enhanced
// @namespace    tobias.kelmandia@gmail.com
// @version      1.3
// @description  Adds multiple configurable enhancements, tweaks, and features to Tsumino.com
// @author       Toby
// @include		 http://www.tsumino.com/*
// @include		 http://tsumino.com/*
// @include		 https://www.tsumino.com/*
// @include		 https://tsumino.com/*
// @require		 https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant		 GM_deleteValue
// @grant 		 unsafeWindow
// @run-at		 document-start
// ==/UserScript==

/*******************************************************
* Tsumino Enhanced
*******************************************************/
// Establish base Tsumino Enhanced object.
var tsuminoEnhanced = {};

// Current Version
tsuminoEnhanced.version = "1.3";

// Create Tsumino Object
tsuminoEnhanced.tsumino = {};

// Create Reader Object
tsuminoEnhanced.reader = {};

// Create Browse Object
tsuminoEnhanced.browse = {};

// Create Search Object
tsuminoEnhanced.search = {};

/*******************************************************
* Convenience variables.
*******************************************************/
// Current Location
tsuminoEnhanced.currentLocation = window.location.href;

// Determine Tsumino Base URL
if(RegExp("http://www.tsumino.com*").exec(tsuminoEnhanced.currentLocation)) { tsuminoEnhanced.tsumino.baseURL = "http://www.tsumino.com"; }
if(RegExp("http://tsumino.com*").exec(tsuminoEnhanced.currentLocation)) { tsuminoEnhanced.tsumino.baseURL = "http://tsumino.com"; }
if(RegExp("https://www.tsumino.com*").exec(tsuminoEnhanced.currentLocation)) { tsuminoEnhanced.tsumino.baseURL = "https://www.tsumino.com"; }
if(RegExp("https://tsumino.com*").exec(tsuminoEnhanced.currentLocation)) { tsuminoEnhanced.tsumino.baseURL = "https://tsumino.com"; }

// Tsumino Enhanced configuration location.
tsuminoEnhanced.configURL = tsuminoEnhanced.tsumino.baseURL + "/Enhanced";

// Tsumino's book page URL structure
tsuminoEnhanced.tsumino.bookPrefix = "/Home/Book/";

// Tsumino's reader page URL structure
tsuminoEnhanced.tsumino.readerPrefix = "/Home/Read/";

// Tsumino's image retrieval URL structure
tsuminoEnhanced.tsumino.imgPrefix = "/Home/GetPage/";

// Tsumino's browse page URL structure
tsuminoEnhanced.tsumino.browsePrefix = "/Home/Browse";

// Tsumino's search page URL structure
tsuminoEnhanced.tsumino.searchPrefix = "/Home/Search";

// Tsumino's Tag Browsing page URL structure
tsuminoEnhanced.tsumino.browseTagsPrefix = "/Home/Tags";

// Tsumino's search tag URL structure
tsuminoEnhanced.tsumino.searchTagPrefix = "/Home/SearchTag?tag=";

// Tsumino's Index by X link prefix
tsuminoEnhanced.tsumino.indexByPrefix = "/Home/indexBy";

// Tsumino's Search Execution prefix
tsuminoEnhanced.tsumino.searchExecutionPrefix = "/Home/SearchExecution";

// Tsumino's full reader page URL
tsuminoEnhanced.tsumino.readerURL = tsuminoEnhanced.tsumino.baseURL + tsuminoEnhanced.tsumino.readerPrefix;

// Tsumino's full browse page URL
tsuminoEnhanced.tsumino.browseURL = tsuminoEnhanced.tsumino.baseURL + tsuminoEnhanced.tsumino.browsePrefix;

// Tsumino's full search page URL
tsuminoEnhanced.tsumino.searchURL = tsuminoEnhanced.tsumino.baseURL + tsuminoEnhanced.tsumino.searchPrefix;

// Tsumino's full search exeuction URL
tsuminoEnhanced.tsumino.searchExecutionURL = tsuminoEnhanced.tsumino.baseURL + tsuminoEnhanced.tsumino.searchExecutionPrefix;

// Tsumino's full single tag search URL
tsuminoEnhanced.tsumino.singleTagSearchURL = tsuminoEnhanced.tsumino.baseURL + tsuminoEnhanced.tsumino.searchTagPrefix;

// Tsumino's full book page URL
tsuminoEnhanced.tsumino.bookURL = tsuminoEnhanced.tsumino.baseURL + tsuminoEnhanced.tsumino.bookPrefix;

// Tsumino's full browse tags page URL
tsuminoEnhanced.tsumino.browseTagsURL = tsuminoEnhanced.tsumino.baseURL + tsuminoEnhanced.tsumino.browseTagsPrefix;
	
/*******************************************************
Location Detection Variables
*******************************************************/
// Is the user browsing?
tsuminoEnhanced.isBrowsing = RegExp(tsuminoEnhanced.tsumino.browseURL + "*").exec(tsuminoEnhanced.currentLocation);

// Is the user on the search page?
if (tsuminoEnhanced.currentLocation == tsuminoEnhanced.tsumino.searchURL) { tsuminoEnhanced.onSearch = true; }

// Is the user on the browse tags page?
tsuminoEnhanced.onBrowseTags = RegExp(tsuminoEnhanced.tsumino.browseTagsURL + "*").exec(tsuminoEnhanced.currentLocation);

// Is the user on the reader? If so, create the bookInfo object.
tsuminoEnhanced.onReader = RegExp(tsuminoEnhanced.tsumino.readerURL + "*").exec(tsuminoEnhanced.currentLocation);
if(tsuminoEnhanced.onReader) { tsuminoEnhanced.bookInfo = {}; }

// Is the user on the Book Info page?
tsuminoEnhanced.onBook = RegExp(tsuminoEnhanced.tsumino.bookURL + "*").exec(tsuminoEnhanced.currentLocation);

// Is the user on the Tsumino Enhanced config page?
if (tsuminoEnhanced.currentLocation == tsuminoEnhanced.configURL) { tsuminoEnhanced.onConfig = true; }

/*******************************************************
Tsumino Enhanced Utilities
*******************************************************/
tsuminoEnhanced.utility = {};

/*******************************************************
Simple "Replace All" utility function.
*******************************************************/
tsuminoEnhanced.utility.replaceAll = function(str, find, replace)
{
	function escapeRegExp(str) 
	{
		return str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
	}
	return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

/*******************************************************
* Upgrade Handling Utility
*******************************************************/
tsuminoEnhanced.utility.upgradeHandler = function()
{
	// If coming from a version that did not have upgrade handling:
	if(!GM_getValue("previousVersion"))	{ GM_setValue("previousVersion","1.2.1"); }
	
	// If this version of Tsumino Enhanced is different, proceed with upgrade handling.
	if(GM_getValue("previousVersion") != tsuminoEnhanced.version)
	{
		// If Unstickied Header was previously enabled, but no scope is set, set the scope to "Reader".
		if(GM_getValue("unstickedHeader_enabled")) 
		{ 
			if(!GM_getValue("unstickedHeader_scope")) { GM_setValue("unstickedHeader_scope","Reader"); }
		}
		
		// When upgrade handling is complete, set previous version to current version.
		GM_setValue("previousVersion",tsuminoEnhanced.version);
	}
}

/*******************************************************
Enhance the Reader.
Makes the reader more easily managed by Tsumino Enhanced.
*******************************************************/
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

/*******************************************************
* Enhance the Search Page.
*******************************************************/
tsuminoEnhanced.utility.enhanceSearch = function()
{
	// Placeholder
}

/*******************************************************
* Tag Search Links
* Enhances Tags throughout Tsumino.
* Stores tag data to create copyable links while browsing.
*******************************************************/
tsuminoEnhanced.utility.enhanceTags = function()
{
	/*******************************************************
	* Convenient internal functions.
	*******************************************************/
	// Enhance any "SearchTag" type links to store your selection.
	function enhanceSearchTagLink(searchTagLink)
	{				
		if($(searchTagLink).length > 0)
		{
			var thisLink = $(searchTagLink)[0].href;
			var thisTag = thisLink.replace(tsuminoEnhanced.tsumino.baseURL,"");
			thisTag = thisTag.replace(tsuminoEnhanced.tsumino.searchTagPrefix,"");
			thisTag = tsuminoEnhanced.utility.replaceAll(thisTag,"%20","+");
			//console.log(thisTag);
			$(searchTagLink).click(function()
			{
				GM_setValue("currentSearchedTags",thisTag);
			});
		}
	}
	
	// Enhance all search tag links that exist at the time this function is called.
	function enhanceAllSearchTagLinks()
	{
		$("a[href*='"+tsuminoEnhanced.tsumino.searchTagPrefix+"']").each(function()
		{
			enhanceSearchTagLink($(this));
		});
	}
	
	// Output a search link.
	function outputSearchLink()
	{
		var thisSearch = "";
		var searchSymbol = "";
		var displayTags = "";
		var thisTagDisp = "";
		if(GM_getValue("currentSearchedTags"))
		{
			var currentSearchedTags = GM_getValue("currentSearchedTags");
			//console.log(currentSearchedTags);
			var tagArray = currentSearchedTags.split(",")
			if(tagArray.length == 1)
			{
				thisSearch = tsuminoEnhanced.tsumino.singleTagSearchURL + tagArray[0];
				thisTagDisp = tsuminoEnhanced.utility.replaceAll(tagArray[0],"+"," ");
				displayTags = thisTagDisp;
				
			}
			else if(tagArray.length > 1)
			{
				thisSearch = tsuminoEnhanced.tsumino.searchExecutionURL;
				for(i = 0; i < tagArray.length; i++)
				{
					thisTagDisp = tsuminoEnhanced.utility.replaceAll(tagArray[i],"+"," ");
					if(i == 0) { searchSymbol = "?"; }
					else { searchSymbol = "&"; }
					thisSearch = thisSearch + searchSymbol + "TagInclude=" + tagArray[i];
					displayTags = displayTags + thisTagDisp;
					if(i < (tagArray.length - 1)) { displayTags = displayTags + ", "; }
				}
			}
			//console.log(displayTags);
			if(tsuminoEnhanced.isBrowsing)
			{
				$("div.pagination-container").prepend("<div id='tsuminoEnhanced_tagSearchContainer'><br />Latest Tag Search<br /><a id='tsuminoEnhanced_tagSearchLink' href='" + thisSearch + "'>" + displayTags + "</a></div>");
				//console.log("<a id='tsuminoEnhanced_tagSearchLink' href='" + thisSearch + "'>" + displayTags + "</a><br />");
			}
		}
	}
	
	/*******************************************************
	* Run when the DOM is ready.
	*******************************************************/
	$(document).ready(function()
	{
		/*******************************************************
		* Store tag selections.
		*******************************************************/
		// On the Browse Tags page.
		if(tsuminoEnhanced.onBrowseTags)
		{
			// Enhance "SearchTag" links that have already been loaded.
			enhanceAllSearchTagLinks();
			
			/*******************************************************
			* Support for new links added through "Unlimited Scroll"
			*******************************************************/
			// Basic Config
			var targetNodes			= $("ul.infinite-scroll");
			var MutationObserver	= window.MutationObserver || window.WebKitMutationObserver;
			var observer			= new MutationObserver (mutationHandler);
			var obsConfig			= { childList: true, characterData : true };

			// Add a target node to the observer. Can only add one node at a time.
			targetNodes.each(function()
			{
				observer.observe (this, obsConfig);
			});
			
			// Execute this when a mutation occurs.
			function mutationHandler(mutationRecords) 
			{
				mutationRecords.forEach(function(mutation)
				{
					var newNodes = $(mutation.addedNodes);
					var newLinks = $(newNodes).find($("a.overlay"));
					
					// Enhance all tag links that were just loaded.
					$(newLinks).each(function()
					{
						enhanceSearchTagLink($(this));
					});
				});
			}
		}
		
		// On the Book Info page.
		if(tsuminoEnhanced.onBook)
		{
			enhanceAllSearchTagLinks();
		}
		
		// When searching.
		if(tsuminoEnhanced.onSearch)
		{
			$("form").on("submit", function(event) 
			{
				//event.preventDefault();
				var rawFormData = $(this).serialize();
				rawFormData = rawFormData.split("&");
				var searchTags = "";
				var totalTags = 0;
				var thisTag = "";
				for(i = 0; i < rawFormData.length; i++)
				{
					if(RegExp("TagInclude=*").exec(rawFormData[i]))
					{
						thisTag = rawFormData[i];
						thisTag = thisTag.replace("TagInclude=","");
						if(totalTags == 0) { searchTags = thisTag; }
						else { searchTags = searchTags + "," + thisTag; }
						totalTags++;
					}
				}
				if(totalTags > 0) { GM_setValue("currentSearchedTags",searchTags); }
				else { GM_deleteValue("currentSearchedTags"); }
			});
		}
		
		/*******************************************************
		* Delete stored tag selections. 
		* Applies globally to all Tsumino pages.
		*******************************************************/		
		// When clicking a link that takes you to the site root.
		$("a[href='/']").click(function()
		{
			GM_deleteValue("currentSearchedTags");
		});
		
		// When using any "Index By" link.
		$("a[href*='" + tsuminoEnhanced.tsumino.indexByPrefix + "']").each(function()
		{
			console.log($(this));
			$(this).click(function()
			{
				GM_deleteValue("currentSearchedTags");
			});
		});
		
		// Test output
		outputSearchLink();
	});
}

/*******************************************************
* Tsumino Enhanced config page link behavior.
*******************************************************/
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


/*******************************************************
* Unsticky Header Enhancement
*******************************************************/
tsuminoEnhanced.unstickyHeader = function()
{
	$(".navbar-fixed-top").css("position", "absolute");
}

/*******************************************************
* Automatic Repositioning - Reader Enhancement
* Should add support for global use.
*******************************************************/
tsuminoEnhanced.automaticRepositioning = function()
{
	var imgPos = $(".reader-page").position().top;
	$('html, body').animate(
	{
		scrollTop: imgPos
	}, 1);
}

/*******************************************************
* Slideshow - Reader Enhancement
*******************************************************/
// Slideshow - Main Object
tsuminoEnhanced.slideshow = {};

// Create a display string for the timer display.
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
	// Might add other keybind options later.
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


/*******************************************************
* Seamless Reader - Reader Enhancement
*******************************************************/
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

/*******************************************************
* Preloader - Reader Enhancement
*******************************************************/
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

/*******************************************************
* Single Page View - Reader Enhancement
*******************************************************/
tsuminoEnhanced.singlePageView = function()
{
	// Coming Soon... (Pending Staff Approval)
}

/*******************************************************
* Bigger Links - Browsing Enhancement
*******************************************************/
tsuminoEnhanced.biggerBrowseLinks = function()
{
	$(".overlay").each(function()
	{
		//console.log($(this).find("a.overlay-button")[0].href);
		$(this).click(function()
		{
			$(this).find("a.overlay-button")[0].click();
		});
	});
}

/*******************************************************
* Include a link to the Tsumino Enhanced config page.
* Only if the user isn't already on the config page.
*******************************************************/
if (!tsuminoEnhanced.onConfig)
{
	$( document ).ready(function()
	{
		$("ul.nav.navbar-nav:contains('FORUM')").append("<li><a id='tsuminoEnhancedNavlink' style='color:#22a7f0 !important; cursor:pointer;'>ENHANCED</a></li>");
		$("head").append("<style>#tsuminoEnhanced_slideshowTimer{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default;position:fixed;float:right;bottom:5px;right:5px;background-color:#333;border:2px solid #DDD;border-radius:15px;background-color:rgba(51,51,51,.5);padding:5px 15px;color:#fff;display:none}</style>");
		$("#tsuminoEnhancedNavlink").click(function(){tsuminoEnhanced.utility.toConfig();});
	});
}
/*******************************************************
* Tsumino Enhanced Config Page
*******************************************************/
else
{
	// Kill the 404 page early.
	document.replaceChild 
	(
		document.importNode (document.implementation.createHTMLDocument("").documentElement, true),
		document.documentElement
	);
	
	// Apply preliminary background color for smooth rendering appearance.
	document.head.innerHTML = '<style>body{background-color:#1a1a1a;}</style>';
	
	// Once the DOM is ready, begin the actual work.
	$( document ).ready(function()
	{
		// Wipe the old head section.
		$("head").html("");
		
		// Add the Tsumino Enhanced favicon. (From DataURI)
		$("head").append("<link rel=\"icon\" type=\"image/png\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wsRDAY5sIzTWwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAEaUlEQVRYw+2XW2xVRRSGv5nZ+1x6di/QUjinLdVUArVISIoJgRcEAoEQY4LxwUB8Ml4evEQTJGhQQ/SVGI2aaAzyohiDCMREEpUol4ACRROubSkl1tKeXjhnn+uePT7s5hRigJ62hhfmbe+ZWfOv9a/1rxmxZMkSwz0ckns87gOwpsOIERKUBcaAtDB2GF33IDI9iBrqnRwAY0XQNXGswe7gW9n4lbPwEm14TYvRtc2YaBVGWmCHMSqEKLiokT58pxa/JgFA7OB72Od/RmDKA6Brm0ht+piKQzsJnz2Au34rxYeWg1TI0T7UQBem4OI1txP68weiv32OzIwAUJi/AnfDmwC467ZQc/kIePnyckDk3cBY6yp8pw5n/7vEvn8HgOhPH+Hs20747EHwCnhzFyNy6QB41Rwyj704FkaDfeUk+Lr8JBT5NFbPKfyIg7EjAIQ6j4JXIP/oU4H9aDVYIcKn9yF8DwCvYSEmNhMAu+s4sf07SnNlUSCzNwhd+pXM6pcxoVjpvxrqRVfHybeuJt+2JojSghUUW5aC1vjVcwLDvR1ED3+K8HKTrwKRTgY8btgG2sOEohinDrw8hYVrsXtOEzm5B5lOggAMpJ7+AKu3g9iBHcjM8NTKULpJRGoAvyaBut5J9PCXqIFO5I1+MAahi+Tan0QUcwHXQPWHTyC8PEIXpy5EcrQfNXiFyLHdVO1+Dqv3DH5lPcIrlA7QM5tIb3yfwoKVpdzBmEAbJjBUIpF4+7YUeDlCncdQfecRukC+bS2ZDdtACOzeDgD82rl4jYvQ8Vbs7hN4DW3klm5CGO+uInRXCoy0AlGprMezQvgzGgAotiwjenRX4EHfBUQ+jV85C3fdFkTeDajT3jRIsRB4jYvIrHoJpEJdvzwW5tT4El0ABHL0Hyq/egVxU80bgtycfBXoIvaFX3BG/kbkXfTMuWTWvwFe4VbBMgaZGkD4mkLLMorzlhP660fsax1Tb0Yi7yKyNygsWImOz79FJUt++hov3srI899gQhXI9CDW1TNTp8CLt5J+fDvGqUOkk9hdx6BpMX5NHD9ajcyOBh1QBKCcvdtQY83rTvI7YQBW3zmqP9uMiVYj04Nklz0zFhYZHA6YUAWoEHb3Caz+ixhlgxCgLAwSjAZdvG0u3P0+oGz8qtm4a17Dr6oHY1D9l0rTfmU9SInX+Aju2tfRs1rwYzMCYKEKVP9FnL1vIdxkeQB8pxZd+wC59o3oxMNUHNqJHL5GavMnIMe3iVwKtIcfrcGvaUAUs6hhNygB3wMrjIk4UA6AYuMisiteQM+eh0xexfl2K1bfOYrN7UHYw85/ylANduN8/Soo+yYvNML45eeAzAxj9ZxCDXQR+X0PKtlT4j7Q3/EyNHYElEKmrgc8T7AH3BGAGuoleuQLUDaimB1f3PMHcvga4TP7xsGmkxghsfovTu+lVPhewOHN/4xP1a5nb/FSDV3F7jxO+PR3kwIgputlNBHZ/V/fBWKS++6/jO4D+BdYdNLmP/zOiQAAAABJRU5ErkJggg==\"/>");
		
		// Set the title and include the Open Sans font.
		$("head").append("<title>Tsumino Enhanced</title><link href='https://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>");
		
		// Write the Tsumino Enhanced config page stylesheet.
		$("head").append("<style>#tsuminoEnhanced_brand,.tsuminoEnhancement,h2{color:#22a7f0}.cmn-toggle+label,select{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none}#tsuminoEnhanced_footer,#tsuminoEnhanced_header{background-color:#333;color:#FFF;padding:5px 15px;margin:0;font-weight:700}#tsuminoEnhanced_version{font-size:.5em}.cmn-toggle+label,select{cursor:pointer;outline:0}body{margin:0;background-color:#1a1a1a;font-family:'Open Sans';font-size:1em}a,a:visited{color:#23a7f0;text-decoration:none}a:hover{color:#23a7f0;text-decoration:underline}h1,h2,h3,h4,h5,h6{padding:0;margin:0;font-weight:700}#tsuminoEnhanced_header,h1{font-size:2em}h2{font-size:1.5em;margin-bottom:5px}#tsuminoEnhanced_footer{bottom:0;left:0;text-align:center;margin-top:15px}#tsuminoEnhanced_body{padding:15px;color:#fff}.options{padding-left:2em}.optionDescription{margin-top:10px}.optionGroup{margin-bottom:20px;border:2px solid #fff;border-radius:5px;background-color:#222;padding:15px}.cmn-toggle{position:absolute;margin-left:-9999px;visibility:hidden}.cmn-toggle+label{display:block;position:relative;user-select:none}input.cmn-toggle-round-flat+label{padding:2px;width:40px;height:20px;background-color:#ddd;-webkit-border-radius:20px;-moz-border-radius:20px;-ms-border-radius:20px;-o-border-radius:20px;border-radius:20px;-webkit-transition:background .4s;-moz-transition:background .4s;-o-transition:background .4s;transition:background .4s}input.cmn-toggle-round-flat+label:after,input.cmn-toggle-round-flat+label:before{display:block;position:absolute;content:''}input.cmn-toggle-round-flat+label:before{top:2px;left:2px;bottom:2px;right:2px;background-color:#1a1a1a;-webkit-border-radius:20px;-moz-border-radius:20px;-ms-border-radius:20px;-o-border-radius:20px;border-radius:20px;-webkit-transition:background .4s;-moz-transition:background .4s;-o-transition:background .4s;transition:background .4s}input.cmn-toggle-round-flat+label:after{top:4px;left:4px;bottom:4px;width:16px;background-color:#ddd;-webkit-border-radius:16px;-moz-border-radius:16px;-ms-border-radius:16px;-o-border-radius:16px;border-radius:16px;-webkit-transition:margin .4s,background .4s;-moz-transition:margin .4s,background .4s;-o-transition:margin .4s,background .4s;transition:margin .4s,background .4s}input.cmn-toggle-round-flat:checked+label{background-color:#22a7f0}input.cmn-toggle-round-flat:checked+label:after{margin-left:20px;background-color:#22a7f0}select,select option{background-color:#1a1a1a;color:#fff}.tsuminoEnhancedButton,.tsuminoEnhancedButton:hover{background-color:#23a8f0;color:#fff;text-decoration:none}select{border:2px solid #ddd;border-radius:5px;padding:5px;font-size:1.2em;user-select:none}.fauxRow{display:table-row}.fauxCell{display:table-cell;vertical-align:middle}.switchContainer{padding-right:10px}.tsuminoEnhancedButton{-moz-border-radius:28px;-webkit-border-radius:28px;border-radius:30px;border:2px solid #ddd;display:inline-block;cursor:pointer;font-size:1.2em;font-weight:700;padding:5px 15px;text-shadow:0 1px 0 #12587d;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.tsuminoEnhancedButton:active{position:relative;top:1px}#tsuminoReturnButtonContainer{margin-left:15px}input.subOption[type=checkbox]:not(old),input.subOption[type=radio]:not(old){width:2em;margin:0;padding:0;font-size:1em;opacity:0;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}input.subOption[type=checkbox]:not(old)+label,input.subOption[type=radio]:not(old)+label{display:inline-block;margin-left:-2em;line-height:1.5em;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}input.subOption[type=checkbox]:not(old)+label>span,input.subOption[type=radio]:not(old)+label>span{display:inline-block;width:.875em;height:.875em;margin:.25em .5em .25em .25em;border:.0625em solid #626262;border-radius:.25em;background-color:#626262;vertical-align:bottom;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}input.subOption[type=checkbox]:not(old):checked+label>span,input.subOption[type=radio]:not(old):checked+label>span{background-color:#1a1a1a;border:.0625em solid #1c85bf;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}input.subOption[type=checkbox]:not(old):checked+label>span:before{content:'X';display:block;width:1em;color:#23a7f0;font-size:.875em;line-height:1em;text-align:center;text-shadow:0 0 .0714em #73994d;font-weight:700;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}input.subOption[type=radio]:not(old):checked+label>span>span{display:block;width:.5em;height:.5em;margin:.125em;border:.0625em solid #1c85bf;border-radius:.125em;background-color:#23a7f0;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}</style>");
		
		// Prepare the body of the page.
		$("body").html("<div id='tsuminoEnhanced_header'>TSUMINO <span id='tsuminoEnhanced_brand'>ENHANCED</span> <span id='tsuminoEnhanced_version'>" + tsuminoEnhanced.version + "</span></div><div id='tsuminoEnhanced_body'></div>");

		/*******************************************************
		* General Enhancements
		*******************************************************/
		// Prepare the global enhancements section.
		$("#tsuminoEnhanced_body").append("<h1>General Enhancements</h1>The following Enhancements can apply globally to Tsumino, or to specific areas.<br /><br /><div id='generalEnhancements' class='options'></div>");
		
		// Unstickied Header - Options
		$("#generalEnhancements").append("<div id='unstickiedHeaderGroup' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='unstickedHeader_switch' name='unstickedHeader_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat'/><label for='unstickedHeader_switch'></label></div><div class='fauxCell'><h2>Unstickied Header</h2></div></div><div class='optionDescription'>Prevents the Tsumino header from following you as you scroll down the page.</div></div>");
		
		// Unstickied Header - Options - Scope
		$("#unstickiedHeaderGroup").append("<br/><input type='radio' id='unstickedHeaderScope_global' name='unstickedHeaderScope' value='Global' class='subOption'><label for='unstickedHeaderScope_global'><span><span></span></span>Apply Globally</label><br /><input type='radio' id='unstickedHeaderScope_reader' name='unstickedHeaderScope' value='Reader' class='subOption'><label for='unstickedHeaderScope_reader'><span><span></span></span>Apply to Reader Only</label>");
		
		// Make sure displayed Unstickied Header options match the user's settings.
		if(GM_getValue("unstickedHeader_enabled"))
		{
			$("#unstickedHeader_switch").prop("checked",true);
			if(GM_getValue("unstickedHeader_scope") == "Global") { $("#unstickedHeaderScope_global").prop("checked",true); }
			else if(GM_getValue("unstickedHeader_scope") == "Reader") { $("#unstickedHeaderScope_reader").prop("checked",true); }
		}
		
		
		// Tag Search Links - Options
		$("#generalEnhancements").append("<div id='tagSearchLinks' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='tagSearchLinks_switch' name='tagSearchLinks_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat'/><label for='tagSearchLinks_switch'></label></div><div class='fauxCell'><h2>Tag Search Links</h2></div></div><div class='optionDescription'>The next best thing to having tags in URLs.<br />This Enhancement is especially useful for creating bookmarks.<br />It adds tag search links to the bottom of the page while browsing.<br />Just right click the link and copy the link location.</div></div>");
		if(GM_getValue("tagSearchLinks_enabled")) { $("#tagSearchLinks_switch").prop("checked",true); }
		
		
		/*******************************************************
		* Browsing Enhancements
		*******************************************************/
		// Prepare the browsing enhancements section.
		$("#tsuminoEnhanced_body").append("<h1>Browsing Enhancements</h1>The following Enhancements only apply to the Tsumino Browse page.<br /><br /><div id='browsingEnhancements' class='options'></div>");
		
		// Thumbnail Links - Options
		$("#browsingEnhancements").append("<div id='containerLinks_group' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='browseThumbnailLinks_switch' name='browseThumbnailLinks_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' /><label for='browseThumbnailLinks_switch'></label></div><div class='fauxCell'><h2>Thumbnail Links</h2></div></div><div class='optionDescription'>You no longer have to specifically click View Info to load a Doujin.<br />Clicking anywhere on the thumbnail image will load the Doujin as well.</div></div>");
		if(GM_getValue("browseThumbnailLinks_enabled")) { $("#browseThumbnailLinks_switch").prop("checked",true); }
		
		
		
		/*******************************************************
		* Reader Enhancements
		*******************************************************/
		// Prepare the reader enhancements section.
		$("#tsuminoEnhanced_body").append("<h1>Reader Enhancements</h1>The following Enhancements only apply to the Tsumino Reader.<br /><br /><div id='readerEnhancements' class='options'></div>");
		
		// If the slideshow wasn't enabled, but a delay was selected, remove the delay.
		if(!GM_getValue("slideshow_enabled")) { $("#slideshow_delay").val(GM_deleteValue("slideshow_delay")); }
		
		// Slideshow - Options
		$("#readerEnhancements").append("<div id='slideshow_group' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='slideshow_switch' name='slideshow_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled='disabled' /><label for='slideshow_switch'></label></div><div class='fauxCell'><h2>Slideshow</h2></div></div><div class='optionDescription'>Adds slideshow functionality to the reader.<br/>Press SHIFT while on the reader to toggle it on and off.<br/>Select how long the slideshow will remain on a page to enable this Enhancement.</div></div>");
		
		// Slideshow - Options - Delay Selection
		$("#slideshow_group").append("<br/><select id='slideshow_delay' name='slideshow_delay'><option value='default' disabled='disabled'>Spend how many seconds per page?</option></select>");
		
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
		
		// Slideshow - Options - Show Timer?
		$("#slideshow_group").append("<br /><br /><input id='slideshow_displayTimer_switch' name='slideshow_displayTimer_switch' type='checkbox' class='subOption' disabled='disabled' /><label for='slideshow_displayTimer_switch'><span></span>Display Timer</label>");
		
		// Make sure displayed slideshow options match the user's settings.
		if(GM_getValue("slideshow_enabled"))
		{
			$("#slideshow_switch").prop("checked",true); 
			$("#slideshow_switch").prop("disabled",false);
			$("#slideshow_delay").val(GM_getValue("slideshow_delay"));
			$("#slideshow_displayTimer_switch").prop("checked",GM_getValue("slideshow_displayTimer"));
			$("#slideshow_displayTimer_switch").prop("disabled",false);
		}
			
		// Seamless Reader - Options
		$("#readerEnhancements").append("<div id='slideshow_group' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='seamlessReader_switch' name='seamlessReader_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' /><label for='seamlessReader_switch'></label></div><div class='fauxCell'><h2>Seamless Viewing</h2></div></div><div class='optionDescription'>Makes the Tsumino Reader load doujin pages without needing to reload the webpage.<br />Requires the following Enhancements:<br /><span class='tsuminoEnhancement'>Unstickied Header</span><br /><span class='tsuminoEnhancement'>Automatic Repositioning</span><br /><span class='tsuminoEnhancement'>Preloader</span></div></div>");
		if(GM_getValue("seamlessReader_enabled")){$("#seamlessReader_switch").prop("checked",true);}
		
		// Automatic Repositioning - Options
		$("#readerEnhancements").append("<div id='automaticRepositioningGroup' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='automaticRepositioning_switch' name='automaticRepositioning_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat'/><label for='automaticRepositioning_switch'></label></div><div class='fauxCell'><h2>Automatic Repositioning</h2></div></div><div class='optionDescription'>Automatically scrolls the page down to the top of the doujin image.<br/>Requires <span class='tsuminoEnhancement'>Unstickied Header</span>.<br /></div></div>");
		if(GM_getValue("automaticRepositioning_enabled")){$("#automaticRepositioning_switch").prop("checked",true);}
		
		// Preloader - Options
		$("#readerEnhancements").append("<div id='preloaderGroup' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='preloader_switch' name='preloader_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat'/><label for='preloader_switch'></label></div><div class='fauxCell'><h2>Preloader</h2></div></div><div class='optionDescription'>Automatically preloads the next image in the background.<br /></div></div>");
		if(GM_getValue("preloader_enabled")){$("#preloader_switch").prop("checked",true);}
		
		/*******************************************************
		* End of Enhancement Configuration Options
		*******************************************************/
		
		// Add the "Return to Tsumino" button.
		$("body").append("<div id='tsuminoReturnButtonContainer'><a id='tsuminoReturnButton' class='tsuminoEnhancedButton'>Return to Tsumino</a></div>");
		$("#tsuminoReturnButton").click(function(){ tsuminoEnhanced.utility.backToTsumino(); });
		
		// Add the config page footer.
		$("body").append("<div id='tsuminoEnhanced_footer'>Check out the project on <a href='https://github.com/tobiaskelmandia/TsuminoEnhanced'>Github</a>!</div>");
		
		/*******************************************************
		* Configuration Handling
		*******************************************************/
		// Function to commit options to GM_values.
		function commitOptions()
		{
			GM_setValue("unstickedHeader_enabled", $("#unstickedHeader_switch").prop("checked"));
			// Unstickied Header Scope Workaround
			if($("#unstickedHeader_switch").prop("checked"))
			{
				if($("#unstickedHeaderScope_global").prop("checked"))
				{
					//console.log("Unstickied Header Scope: Global");
					GM_setValue("unstickedHeader_scope","Global");
				}
				if($("#unstickedHeaderScope_reader").prop("checked"))
				{
					//console.log("Unstickied Header Scope: Reader");
					GM_setValue("unstickedHeader_scope","Reader");
				}
			}
			else
			{
				if(GM_getValue("unstickedHeader_scope"))
				{
					GM_deleteValue("unstickedHeader_scope");
				}
			}
			GM_setValue("tagSearchLinks_enabled", $("#tagSearchLinks_switch").prop("checked"))
			GM_setValue("slideshow_enabled", $("#slideshow_switch").prop("checked"));
			GM_setValue("slideshow_delay", $("#slideshow_delay").val());
			GM_setValue("slideshow_displayTimer", $("#slideshow_displayTimer_switch").prop("checked"));
			GM_setValue("seamlessReader_enabled", $("#seamlessReader_switch").prop("checked"));
			GM_setValue("automaticRepositioning_enabled", $("#automaticRepositioning_switch").prop("checked"));
			GM_setValue("preloader_enabled", $("#preloader_switch").prop("checked"));
			GM_setValue("browseThumbnailLinks_enabled", $("#browseThumbnailLinks_switch").prop("checked"));
		}

		/*******************************************************
		* Enforce dependencies before committing options.
		*******************************************************/
		// Unstickied Header Scope dependency enforcing workaround.
		function enforceUnstickiedHeaderScope()
		{
			if($("#unstickedHeader_switch").prop("checked"))
			{
				if((!$("#unstickedHeaderScope_global").prop("checked") && !$("#unstickedHeaderScope_reader").prop("checked")))
				{
					$("#unstickedHeaderScope_global").prop("checked",false);
					$("#unstickedHeaderScope_reader").prop("checked",true);
				}
			}
			else
			{
				$("#unstickedHeaderScope_global").prop("checked",false);
				$("#unstickedHeaderScope_reader").prop("checked",false);
			}
		}
		

		/*******************************************************
		* General Enhancements
		*******************************************************/
		// Unstickied Header		
		$("#unstickedHeader_switch").change(function()
		{
			if(!$("#unstickedHeader_switch").prop("checked"))
			{
				$("#automaticRepositioning_switch").prop("checked",false);
				$("#seamlessReader_switch").prop("checked",false);
				$("#unstickedHeaderScope_global").prop("checked",false);
				$("#unstickedHeaderScope_reader").prop("checked",false);
			}
			else
			{
				enforceUnstickiedHeaderScope();
			}
			commitOptions();
		});
		$("#unstickedHeaderScope_global").change(function()
		{
			$("#unstickedHeader_switch").prop("checked",true);
			commitOptions();
		});
		$("#unstickedHeaderScope_reader").change(function()
		{
			$("#unstickedHeader_switch").prop("checked",true);
			commitOptions();
		});
		
		// Tag Search Links
		$("#tagSearchLinks_switch").change(function()
		{
			commitOptions();
		});
		
		/*******************************************************
		* Broswing Enhancements
		*******************************************************/
		// Thumnail Links
		$("#browseThumbnailLinks_switch").change(function()
		{
			commitOptions();
		});
		
		
		/*******************************************************
		* Reader Enhancements
		*******************************************************/
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
		// Slideshow - Delay
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
		// Slideshow - Display Timer
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
				enforceUnstickiedHeaderScope();
				$("#automaticRepositioning_switch").prop("checked",true);
				$("#preloader_switch").prop("checked",true);
			}
			commitOptions();
		});
		
		// Automatic Repositioning
		$("#automaticRepositioning_switch").change(function()
		{
			if($("#automaticRepositioning_switch").prop("checked"))
			{
				$("#unstickedHeader_switch").prop("checked",true);
				enforceUnstickiedHeaderScope();
			}
			else
			{
				$("#seamlessReader_switch").prop("checked",false);
				enforceUnstickiedHeaderScope();
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



/*******************************************************
* Handle Tsumino Enhanced upgrades if necessary.
*******************************************************/
$(document).ready(function()
{
	tsuminoEnhanced.utility.upgradeHandler();
});

/*******************************************************
* Enhancement Activation
*******************************************************/
// Global Enhancements
if (!tsuminoEnhanced.onConfig)
{
	// If Tag Search Links are enabled.
	if(GM_getValue("tagSearchLinks_enabled"))
	{
		tsuminoEnhanced.utility.enhanceTags();
	}
	// If Unstickied Header is Enabled, and scope is set to Global.
	if((GM_getValue("unstickedHeader_enabled") && GM_getValue("unstickedHeader_scope") == "Global"))
	{
		$( document ).ready(function()
		{
			tsuminoEnhanced.unstickyHeader();
		});
	}
}

// Browsing Enhancements
if (tsuminoEnhanced.isBrowsing)
{
	$( document ).ready(function()
	{
		if (GM_getValue("browseThumbnailLinks_enabled")) { tsuminoEnhanced.biggerBrowseLinks(); }
	});
}

/* If the user is on the Search page */
if(tsuminoEnhanced.onSearch)
{
	tsuminoEnhanced.utility.enhanceSearch();
}

// Reader Enhancements
if (tsuminoEnhanced.onReader)
{
	// Run when DOM is ready.
	$( document ).ready(function()
	{
		tsuminoEnhanced.utility.enhanceReader();
		if((GM_getValue("unstickedHeader_enabled") && GM_getValue("unstickedHeader_scope") == "Reader")) { tsuminoEnhanced.unstickyHeader(); }
		if (GM_getValue("automaticRepositioning_enabled")) { tsuminoEnhanced.automaticRepositioning(); }
		if (GM_getValue("slideshow_enabled")) { tsuminoEnhanced.slideshow.init(); }
		if (GM_getValue("seamlessReader_enabled")) { tsuminoEnhanced.seamlessReader.init(); }
	});
	
	// Run when the page and all assets have fully completed loaded.
	$( window ).load(function()
	{
		if (GM_getValue("preloader_enabled")) { tsuminoEnhanced.preloader(); }
	});
}