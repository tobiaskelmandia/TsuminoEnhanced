// ==UserScript==
// @name         Tsumino Enhanced
// @namespace    tobias.kelmandia@gmail.com
// @version      1.4.1.0
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
tsuminoEnhanced.version = "1.4.1.0";

// Is Debug mode on?
tsuminoEnhanced.debugging = true;

// Tsumino Enhanced loaded at
tsuminoEnhanced.startedAt = new Date();

// Create Tsumino Object
tsuminoEnhanced.tsumino = {};

// Create Book Object
tsuminoEnhanced.book = {};

// Create Reader Object
tsuminoEnhanced.reader = {};

// Create Browse Object
tsuminoEnhanced.browse = {};

// Create Search Object
tsuminoEnhanced.search = {};

// Create Record Keeper Object
tsuminoEnhanced.recordKeeper = {};

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

/*******************************************************
* Tsumino Enhanced - Config Page Variables
*******************************************************/
// Tsumino Enhanced configuration location.
tsuminoEnhanced.configURL = tsuminoEnhanced.tsumino.baseURL + "/Enhanced";

// Is the user on the Tsumino Enhanced config page?
if (tsuminoEnhanced.currentLocation == tsuminoEnhanced.configURL) { tsuminoEnhanced.onConfig = true; }

/*******************************************************
* Book Info Variables
*******************************************************/
// Tsumino's book page URL structure
tsuminoEnhanced.tsumino.bookPrefix = "/Home/Book/";

// Tsumino's full book page URL
tsuminoEnhanced.tsumino.bookURL = tsuminoEnhanced.tsumino.baseURL + tsuminoEnhanced.tsumino.bookPrefix;

// Is the user on the Book Info page?
tsuminoEnhanced.onBook = RegExp(tsuminoEnhanced.tsumino.bookURL + "*").exec(tsuminoEnhanced.currentLocation);

/*******************************************************
* Reader & Auth Variables
*******************************************************/
// Tsumino's reader page URL structure
tsuminoEnhanced.tsumino.readerPrefix = "/Home/Read/";

// Tsumino's full reader page URL
tsuminoEnhanced.tsumino.readerURL = tsuminoEnhanced.tsumino.baseURL + tsuminoEnhanced.tsumino.readerPrefix;

// Is the user on the reader?
tsuminoEnhanced.onReader = RegExp(tsuminoEnhanced.tsumino.readerURL + "*").exec(tsuminoEnhanced.currentLocation);

// Is the user on the initial page?
tsuminoEnhanced.onReaderInitialPage = false;
if(tsuminoEnhanced.onReader)
{
	var temp = tsuminoEnhanced.tsumino.readerURL;
	noPageNumLength = temp.split("/").length;
	var temp2 = tsuminoEnhanced.currentLocation;
	var currentSplits = temp2.split("/").length;
	if(currentSplits == noPageNumLength) { tsuminoEnhanced.onReaderInitialPage = true; }
}


// Tsumino's Authpage url prefix
tsuminoEnhanced.tsumino.authPrefix = "/Home/Auth/";

// Tsumino's full auth page url
tsuminoEnhanced.tsumino.authURL = tsuminoEnhanced.tsumino.baseURL + tsuminoEnhanced.tsumino.authPrefix;

// Is the user on the auth page?
tsuminoEnhanced.onAuth = RegExp(tsuminoEnhanced.tsumino.authURL + "*").exec(tsuminoEnhanced.currentLocation);

/*******************************************************
* Browsing Variables
*******************************************************/

// Tsumino's browse page URL structure
tsuminoEnhanced.tsumino.browsePrefix = "/Home/Browse";

// Tsumino's full browse page URL
tsuminoEnhanced.tsumino.browseURL = tsuminoEnhanced.tsumino.baseURL + tsuminoEnhanced.tsumino.browsePrefix;

// Is the user browsing?
tsuminoEnhanced.isBrowsing = RegExp(tsuminoEnhanced.tsumino.browseURL + "*").exec(tsuminoEnhanced.currentLocation);

/*******************************************************
* Search Variables
*******************************************************/
// Tsumino's search page URL structure
tsuminoEnhanced.tsumino.searchPrefix = "/Home/Search";

// Tsumino's full search page URL
tsuminoEnhanced.tsumino.searchURL = tsuminoEnhanced.tsumino.baseURL + tsuminoEnhanced.tsumino.searchPrefix;

// Is the user on the search page?
if (tsuminoEnhanced.currentLocation == tsuminoEnhanced.tsumino.searchURL) { tsuminoEnhanced.onSearch = true; }

// Tsumino's Search Execution prefix
tsuminoEnhanced.tsumino.searchExecutionPrefix = "/Home/SearchExecution";

// Tsumino's full search exeuction URL
tsuminoEnhanced.tsumino.searchExecutionURL = tsuminoEnhanced.tsumino.baseURL + tsuminoEnhanced.tsumino.searchExecutionPrefix;

// Tsumino's single tag search URL structure
tsuminoEnhanced.tsumino.searchTagPrefix = "/Home/SearchTag?tag=";

// Tsumino's full single tag search URL
tsuminoEnhanced.tsumino.singleTagSearchURL = tsuminoEnhanced.tsumino.baseURL + tsuminoEnhanced.tsumino.searchTagPrefix;

/*******************************************************
* Browse Tag Variables
*******************************************************/
// Tsumino's Tag Browsing page URL structure
tsuminoEnhanced.tsumino.browseTagsPrefix = "/Home/Tags";

// Tsumino's full browse tags page URL
tsuminoEnhanced.tsumino.browseTagsURL = tsuminoEnhanced.tsumino.baseURL + tsuminoEnhanced.tsumino.browseTagsPrefix;

// Is the user on the browse tags page?
tsuminoEnhanced.onBrowseTags = RegExp(tsuminoEnhanced.tsumino.browseTagsURL + "*").exec(tsuminoEnhanced.currentLocation);

/*******************************************************
* Image Variables
*******************************************************/
// Tsumino's image retrieval URL structure
tsuminoEnhanced.tsumino.imgPrefix = "/Home/GetPage/";

/*******************************************************
* Misc Page Variables
*******************************************************/
// Tsumino's Index by X link prefix
tsuminoEnhanced.tsumino.indexByPrefix = "/Home/indexBy";




/*******************************************************
* Tsumino Enhanced Utilities
*******************************************************/
tsuminoEnhanced.utility = {};


/*******************************************************
* Page killing utility. Should always be run ASAP.
*******************************************************/
tsuminoEnhanced.utility.killPage = function()
{
	// Kill the page early.
	document.replaceChild 
	(
		document.importNode (document.implementation.createHTMLDocument("").documentElement, true),
		document.documentElement
	);
	
	// Apply preliminary background color for smooth rendering appearance.
	document.head.innerHTML = '<style>body{background-color:#1a1a1a;}</style>';
}

/*******************************************************
* Simple "Replace All" utility function.
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
* Tsumino Enhanced logging utility.
* Only log to console if debug mode is enabled.
*******************************************************/
tsuminoEnhanced.utility.log = function(logData)
{
	// Only log if we're debugging.
	if(tsuminoEnhanced.debugging)
	{
		if(typeof logData == "string")
		{
			var ct = new Date();
			var dt = ct - tsuminoEnhanced.startedAt;
			console.log(dt + ": " + logData);
		}
		else
		{
			console.log(logData);
		}
	}
}
tsuminoEnhanced.utility.log("Tsumino Enhanced has started.");


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
		tsuminoEnhanced.utility.log("Upgrade handler is working...");
		
		// If Unstickied Header was previously enabled, but no scope is set, set the scope to "Reader".
		if(GM_getValue("unstickedHeader_enabled")) 
		{ 
			if(!GM_getValue("unstickedHeader_scope")) { GM_setValue("unstickedHeader_scope","Reader"); }
		}
		
		// Update Seamless Viewing to Seamless Viewing.
		if(GM_getValue("seamlessReader_enabled")) 
		{ 
			GM_setValue("seamlessViewing_enabled",true);
			GM_deleteValue("seamlessReader_enabled");
		}
		
		// If Seamless Viewing was previously enabled, set style to Classic.
		if((GM_getValue("seamlessViewing_enabled")) && (!GM_getValue("seamlessViewing_style")))
		{
			GM_setValue("seamlessViewing_style","Classic");
		}
		
		// When upgrade handling is complete, set previous version to current version.
		GM_setValue("previousVersion",tsuminoEnhanced.version);
		tsuminoEnhanced.utility.log("Upgrade handler has finished working.");
	}	
}


/*******************************************************
* Enhance the Reader.
* Makes the reader more easily managed by Tsumino Enhanced.
*******************************************************/
tsuminoEnhanced.utility.enhanceReader = function()
{
	tsuminoEnhanced.utility.log("Performing reader enhancements...");
	
	// Add an ID to the Return Button.
	$("a:contains('RETURN')").attr("id","tsuminoEnhanced_returnButton");
	
	// Determine Book ID, current page, and total number of pages in the book.
	var returnURL = $("#tsuminoEnhanced_returnButton").attr("href");
	var pageData = $("h1:contains('Page')").text();
	pageData = pageData.replace(" Page ","");
	pageData = pageData.split(" of ");
	
	tsuminoEnhanced.reader.currentBook = parseInt(returnURL.replace(tsuminoEnhanced.tsumino.bookPrefix,""));
	tsuminoEnhanced.reader.currentPage = parseInt(pageData[0]);
	tsuminoEnhanced.reader.originPage = tsuminoEnhanced.reader.currentPage;
	tsuminoEnhanced.reader.totalPages = parseInt(pageData[1]);
	tsuminoEnhanced.reader.nextPage = tsuminoEnhanced.reader.currentPage+1;
	tsuminoEnhanced.reader.prevPage = tsuminoEnhanced.reader.currentPage-1;
	tsuminoEnhanced.reader.currentPageURL = tsuminoEnhanced.tsumino.readerPrefix + tsuminoEnhanced.reader.currentBook + "/" + tsuminoEnhanced.reader.currentPage;
	tsuminoEnhanced.reader.nextPageURL = tsuminoEnhanced.tsumino.readerPrefix + tsuminoEnhanced.reader.currentBook + "/" + tsuminoEnhanced.reader.nextPage;
	tsuminoEnhanced.reader.prevPageURL = tsuminoEnhanced.tsumino.readerPrefix + tsuminoEnhanced.reader.currentBook + "/" + tsuminoEnhanced.reader.prevPage;
	
	tsuminoEnhanced.utility.log("Current Book: " + tsuminoEnhanced.reader.currentBook);
	tsuminoEnhanced.utility.log("Current Page: " + tsuminoEnhanced.reader.currentPage);
	tsuminoEnhanced.utility.log("Total Pages: " + tsuminoEnhanced.reader.totalPages);
	
	/*******************************************************
	* Reader Page Manipulation
	*******************************************************/
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
	tsuminoEnhanced.utility.log("Reader enhancements have been applied.");
	
	// Add ID to default reader image.
	$(".reader-img").attr("id","tsumino_readerImg");
	
	var pageBlock = $(".reader-page").children()[0];
	$(pageBlock).attr("id","tsumino_readerPageBlock");
	
	// Enhance the return button block.
	var buttonBlock = $(".reader-page").children()[1];
	$(buttonBlock).attr("id","tsuminoEnhanced_returnButtonBlock");
	$("#tsuminoEnhanced_returnButtonBlock").append("<br />");
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
	tsuminoEnhanced.utility.log("Tag Search Links enhancement is running.");
	
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
			//tsuminoEnhanced.utility.log(thisTag);
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
			//tsuminoEnhanced.utility.log(currentSearchedTags);
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
					if(i === 0) { searchSymbol = "?"; }
					else { searchSymbol = "&"; }
					thisSearch = thisSearch + searchSymbol + "TagInclude=" + tagArray[i];
					displayTags = displayTags + thisTagDisp;
					if(i < (tagArray.length - 1)) { displayTags = displayTags + ", "; }
				}
			}
			//tsuminoEnhanced.utility.log(displayTags);
			if(tsuminoEnhanced.isBrowsing)
			{
				$("div.pagination-container").prepend("<div id='tsuminoEnhanced_tagSearchContainer'><br />Latest Tag Search<br /><a id='tsuminoEnhanced_tagSearchLink' href='" + thisSearch + "'>" + displayTags + "</a></div>");
				//tsuminoEnhanced.utility.log("<a id='tsuminoEnhanced_tagSearchLink' href='" + thisSearch + "'>" + displayTags + "</a><br />");
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
						if(totalTags === 0) { searchTags = thisTag; }
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
			tsuminoEnhanced.utility.log($(this));
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
	if(!(tsuminoEnhanced.onReader && GM_getValue("seamlessViewing_enabled")))
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
* Image Loader - Utility Function
* Dynamic image loading.
*******************************************************/
tsuminoEnhanced.utility.loader = {};
tsuminoEnhanced.utility.loader.init = function(pageNumber)
{
	var dfd = jQuery.Deferred();
	var newImageSrc = tsuminoEnhanced.tsumino.imgPrefix + tsuminoEnhanced.reader.currentBook + "/";
	
	// Make sure the page exists first.
	if((pageNumber <= tsuminoEnhanced.reader.totalPages) && (pageNumber > 0))
	{
		var newImageSrc = newImageSrc + pageNumber;
		tsuminoEnhanced.utility.log("Preparing Image: " + pageNumber + "...");
		$("body").append("<img id='tsuminoEnhanced_imageLoader_"+pageNumber+"' style='display:none;'>");
		$("#tsuminoEnhanced_imageLoader_"+pageNumber).attr("src",newImageSrc);
		$( "#tsuminoEnhanced_imageLoader_"+pageNumber).load(function() 
		{
			tsuminoEnhanced.utility.log("Image "+pageNumber+" is ready.");
			$("#tsuminoEnhanced_imageLoader_"+pageNumber).remove();
			dfd.resolve();
		});
	}
	else
	{
		dfd.resolve();
	}
	return dfd.promise();
}



/*******************************************************
* Unstickied Header - General Enhancement
*******************************************************/
tsuminoEnhanced.unstickyHeader = function()
{
	$(".navbar-fixed-top").css("position", "absolute");
}



/*******************************************************
* Record Keeper - General Enhancement
* Tracks what Doujin you've finished, and where you left off.
*******************************************************/
tsuminoEnhanced.recordKeeper.init = function()
{
	var recordKeeper_data = {};
	var jsonString = "";
	
	// If the record keeper's data object doesn't exist, create it.
	if(!GM_getValue("recordKeeper_data"))
	{
		GM_setValue("recordKeeper_data",JSON.stringify(recordKeeper_data));
	}
	
	// Import data from JSON string.
	recordKeeper_data = JSON.parse(GM_getValue("recordKeeper_data"));
	
	$(document).ready(function()
	{
		// Browsing functionality.
		if(tsuminoEnhanced.isBrowsing)
		{
			$("a.overlay-button").each(function()
			{
				var thisLink = $(this).attr("href");
				var thisBook = thisLink.replace(tsuminoEnhanced.tsumino.bookPrefix,"");
				thisBook = parseInt(thisBook);
				if(recordKeeper_data[thisBook])
				{
					if(recordKeeper_data[thisBook]['finished'])
					{
						$(this).parent().css("border","3px solid rgba(0,125,0,.8)");
						$(this).siblings(".overlay-data").children(".overlay-sub").append("<br />You have finished this Doujin.");
						$(this).siblings(".overlay-data").children(".overlay-sub").append("<br />(You left off on page: "+recordKeeper_data[thisBook]['lastSeen']+")");
					}
					if((!recordKeeper_data[thisBook]['finished']) && (recordKeeper_data[thisBook]['lastSeen'] > 1))
					{
						$(this).parent().css("border","3px solid rgba(190,190,90,.8)");
						$(this).siblings(".overlay-data").children(".overlay-sub").append("<br />You left off on page: "+recordKeeper_data[thisBook]['lastSeen']);
					}
				}
			});
		}
		
		// Book Functionality
		if(tsuminoEnhanced.onBook)
		{
			var bookID = tsuminoEnhanced.currentLocation.replace(tsuminoEnhanced.tsumino.bookURL,"");
			
			// If data doesn't exist for this book, create it.
			if(!recordKeeper_data[bookID])
			{
				recordKeeper_data[bookID] = {};
				recordKeeper_data[bookID]["totalPages"] = tsuminoEnhanced.reader.totalPages;
				recordKeeper_data[bookID]["lastSeen"] = 1;
				recordKeeper_data[bookID]["finished"] = false;
				jsonString = JSON.stringify(recordKeeper_data);
				GM_setValue("recordKeeper_data",jsonString);
			}
			
			// If the user previously started reading this book, let them continue.
			if(recordKeeper_data[bookID]['lastSeen'] > 1)
			{
				var continueURL = tsuminoEnhanced.tsumino.readerURL + bookID + "/" + recordKeeper_data[bookID]['lastSeen'];
				$("a:contains('READ ONLINE')").before("<a class='book-read-button' href='"+continueURL+"'>CONTINUE READING</a> ");
				$("a:contains('READ ONLINE')").text("START OVER");
			}
		}
		
		// Reader functionality.
		if(tsuminoEnhanced.onReader)
		{
			setTimeout(function()
			{
				var thisBook = tsuminoEnhanced.reader.currentBook;
				if(thisBook)
				{					
					// If data doesn't exist for this book, create it.
					if(!recordKeeper_data[thisBook])
					{
						recordKeeper_data[thisBook] = {};
						recordKeeper_data[thisBook]["totalPages"] = tsuminoEnhanced.reader.totalPages;
						recordKeeper_data[thisBook]["lastSeen"] = tsuminoEnhanced.reader.currentPage;
						recordKeeper_data[thisBook]["finished"] = false;
						jsonString = JSON.stringify(recordKeeper_data);
						GM_setValue("recordKeeper_data",jsonString);
						tsuminoEnhanced.recordKeeper.update();
					}
					// If it does exist, update it.
					else
					{
						tsuminoEnhanced.recordKeeper.update();
					}
				}
			},100);
		}
	});
}

// Update record keeper's data.
tsuminoEnhanced.recordKeeper.update = function()
{
	// Import data from JSON string.
	var recordKeeper_data = JSON.parse(GM_getValue("recordKeeper_data"));

	// Update tracking data for the current book.
	var bookID = tsuminoEnhanced.reader.currentBook;
	recordKeeper_data[bookID]["lastSeen"] = tsuminoEnhanced.reader.currentPage;
	if(!recordKeeper_data[bookID]["finished"])
	{
		if(tsuminoEnhanced.reader.totalPages == tsuminoEnhanced.reader.currentPage)
		{
			recordKeeper_data[bookID]["finished"] = true;
		}
	}
	
	// Finished working. Convert object to JSON string.
	var jsonString = JSON.stringify(recordKeeper_data);
	GM_setValue("recordKeeper_data",jsonString);
	//tsuminoEnhanced.utility.log(recordKeeper_data);
}


/*******************************************************
* Style Tweaks - General Enhancement
*******************************************************/
tsuminoEnhanced.styleTweaks = {};

// Initialize any enabled style tweaks.
tsuminoEnhanced.styleTweaks.init = function()
{
	if(GM_getValue("styleTweaks_blackBackground"))
	{
		tsuminoEnhanced.styleTweaks.blackBackground();
	}
}

// Black background.
tsuminoEnhanced.styleTweaks.blackBackground = function()
{
	$("body").css("background-color", "#000000");
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
	$("body").append("<div class='tsuminoEnhanced_bubbleDisplay' id='tsuminoEnhanced_slideshowTimer'></div>");
	$("#tsuminoEnhanced_slideshowTimer").text(tsuminoEnhanced.slideshow.delayStr);
	
	// If on the first page of a doujin, set the slideshow to inactive.
	if (tsuminoEnhanced.reader.currentPage == 1)
	{
		GM_setValue("slideshow_active", false);
	}
	
	// If the Slideshow is enabled and active, run it.
	if (GM_getValue("slideshow_active"))
	{
		tsuminoEnhanced.utility.log("Slideshow is active.");
		if(GM_getValue("slideshow_displayTimer")) { $("#tsuminoEnhanced_slideshowTimer").css("display","block"); }
		tsuminoEnhanced.utility.log(GM_getValue("slideshow_delay") + " seconds until next page.");
		tsuminoEnhanced.slideshow.run();
	}
	else
	{
		tsuminoEnhanced.utility.log("Slideshow is currently inactive.");
		if (GM_getValue("slideshow_delay"))
		{
			tsuminoEnhanced.utility.log("Stored delay between pages is set at: " + GM_getValue("slideshow_delay") + " seconds.");
		}
	}
	
	// Establish Slideshow Toggle keybind.
	// Might add other keybind options later.
	$(document).keydown(function(data)
	{
		var keyCode = $(data)[0].keyCode;
		if (keyCode == 16) // SHIFT
		{
			tsuminoEnhanced.slideshow.toggle();
		}
	});
}

// Slideshow - Toggle Active State
tsuminoEnhanced.slideshow.toggle = function()
{
	if (GM_getValue("slideshow_active"))
	{
		tsuminoEnhanced.utility.log("Stopping slideshow.");
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
	startNow = startNow || false;
	var waitFor = parseInt(GM_getValue("slideshow_delay")) * 1000;
	if (startNow)
	{
		if (tsuminoEnhanced.reader.currentPage < tsuminoEnhanced.reader.totalPages)
		{
			// If Seamless Viewing is also enabled:
			if(GM_getValue("seamlessViewing_enabled"))
			{
				tsuminoEnhanced.utility.log("Loading next page...");
				tsuminoEnhanced.seamlessViewing.classic.changePage(tsuminoEnhanced.reader.nextPage);
			}
			else
			{
				tsuminoEnhanced.utility.log("Moving to next page...");
				$("#tsuminoEnhanced_nextButton")[0].click();
			}
		}
		else
		{
			$("#tsuminoEnhanced_slideshowTimer").css("display","none");
			tsuminoEnhanced.utility.log("No more pages to load.");
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
* Seamless Viewing - Reader Enhancement
* Style: Any
*******************************************************/
tsuminoEnhanced.seamlessViewing = {};

// Seamless Viewing - Replace Keybinds.
tsuminoEnhanced.seamlessViewing.replaceKeybinds = function()
{
	// Disable default Tsumino Reader Keybinds.
	unsafeWindow.$(document).off("keydown");
	
	if(GM_getValue("seamlessViewing_style") == "Classic")
	{
		// Use Classic Seamless Viewing keybinds instead.
		$(document).keydown(function(e)
		{
			var bk = function()
			{
				tsuminoEnhanced.seamlessViewing.classic.changePage(tsuminoEnhanced.reader.prevPage);
			}
			var fwd = function()
			{
				tsuminoEnhanced.seamlessViewing.classic.changePage(tsuminoEnhanced.reader.nextPage);
			}
			if((!e.ctrlKey) && (!e.altKey))
			{
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
			}
		});
	}
	else if(GM_getValue("seamlessViewing_style") == "InfinityScroll")
	{
		// Use Infinity Scroll Seamless Viewing keybinds instead.
		$(document).keydown(function(e)
		{
			var bk = function()
			{
				//
			}
			var fwd = function()
			{
				//
			}
			if((!e.ctrlKey) && (!e.altKey))
			{
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
			}
		});
	}
}

// Seamless Viewing - Redirection
tsuminoEnhanced.seamlessViewing.redirection = function()
{
	var temp = tsuminoEnhanced.currentLocation;
	splitLocation = temp.split("#");
	// If there is a # in the URL. (Used to identify the actual page number.)
	if(splitLocation.length > 1)
	{
		// Determine book and page information.
		newPage = splitLocation[1];
		oldPage = splitLocation[0];
		var urlSplit = oldPage.split("/");
		var bookID = urlSplit[5];
		
		// If on the reader, kill the page and redirect ASAP.
		if(tsuminoEnhanced.onReader)
		{
			tsuminoEnhanced.utility.log("Seamless Viewing is redirecting you...");
			// Kill the page before it can load.
			tsuminoEnhanced.utility.killPage();
			var newLocation = tsuminoEnhanced.tsumino.readerURL + bookID + "/" + newPage;
			window.location.href = newLocation;
		}
		// If on the auth page, wait for DOM and update form info to redirect to the appropriate page.
		if(tsuminoEnhanced.onAuth)
		{
			$(document).ready(function()
			{
				$("input#Page").val(newPage);
			});
		}
	}
}

/*******************************************************
* Seamless Viewing - Reader Enhancement
* Style: Classic
*******************************************************/
tsuminoEnhanced.seamlessViewing.classic = {};

// Seamless Viewing - Classic - Initialization
tsuminoEnhanced.seamlessViewing.classic.init = function()
{		
	// Replace default Tsumino reader keybinds with Enhanced Seamless Viewing keybinds.
	tsuminoEnhanced.seamlessViewing.replaceKeybinds();
	
	// Remove default Tsumino doujin navigation links.
	$("#tsuminoEnhanced_prevButton").attr("href","javascript:;");
	$("#tsuminoEnhanced_nextButton").attr("href","javascript:;");
	$("#tsuminoEnhanced_imageLink").attr("href","javascript:;");
	
	// Update doujin navigation links.
	tsuminoEnhanced.seamlessViewing.classic.updateLinks();
	
	// Add the loading indicator.
	$("#tsumino_readerImg").parent().parent().append("<div id='tsuminoEnhanced_messageContainer' style='width:inherit; position:absolute; float:right; bottom:5px;'></div>");
	$("#tsuminoEnhanced_messageContainer").append("<div class='tsuminoEnhanced_bubbleDisplay' id='tsuminoEnhanced_loaderMessage'>Loading...</div>");
}



// Seamless Viewing - Classic - Update Links
tsuminoEnhanced.seamlessViewing.classic.updateLinks = function()
{
	tsuminoEnhanced.utility.log("Updating links... ");
	
	// Remove old click binds from links.
	$("#tsuminoEnhanced_prevButton").off("click");
	$("#tsuminoEnhanced_nextButton").off("click");
	$("#tsuminoEnhanced_imageLink").off("click");
	
	// Establish updated click binds.
	if(tsuminoEnhanced.reader.currentPage < tsuminoEnhanced.reader.totalPages)
	{
		$("#tsuminoEnhanced_nextButton").css("display","inline");
		$("#tsuminoEnhanced_nextButton").click(function(){ tsuminoEnhanced.seamlessViewing.classic.changePage(tsuminoEnhanced.reader.nextPage); });
		
		$("#tsuminoEnhanced_imageLink").css("cursor","pointer");
		$("#tsuminoEnhanced_imageLink").click(function(){ tsuminoEnhanced.seamlessViewing.classic.changePage(tsuminoEnhanced.reader.nextPage); });
	}
	else
	{
		$("#tsuminoEnhanced_nextButton").css("display","none");
		
		$("#tsuminoEnhanced_imageLink").css("cursor","context-menu");
		$("#tsuminoEnhanced_imageLink").attr("href","javascript:;");
	}
	if(tsuminoEnhanced.reader.currentPage > 1)
	{
		
		$("#tsuminoEnhanced_prevButton").css("display","inline");
		$("#tsuminoEnhanced_prevButton").click(function(){ tsuminoEnhanced.seamlessViewing.classic.changePage(tsuminoEnhanced.reader.prevPage); });
	}
	else
	{
		$("#tsuminoEnhanced_prevButton").css("display","none");
	}
	
	$("#tsuminoEnhanced_currentPage").html("<a href='"+tsuminoEnhanced.reader.currentPageURL+"'>"+tsuminoEnhanced.reader.currentPage+"</a>");
}

// Seamless Viewing - Classic - Change Page
tsuminoEnhanced.seamlessViewing.classic.changePage = function(pageNumber)
{
	var dfd = jQuery.Deferred();
	
	function changePageCommon(pageNumber)
	{		
		pageNumber = parseInt(pageNumber);
		// Update page and location variables.
		tsuminoEnhanced.reader.currentPage = pageNumber;
		tsuminoEnhanced.reader.prevPage = pageNumber-1;
		tsuminoEnhanced.reader.nextPage = pageNumber+1;
		tsuminoEnhanced.reader.currentPageURL = tsuminoEnhanced.tsumino.readerPrefix + tsuminoEnhanced.reader.currentBook + "/" + tsuminoEnhanced.reader.currentPage;
		GM_setValue("returnTo",tsuminoEnhanced.reader.currentPageURL);
		
		// Trigger Automatic Repositioning.
		tsuminoEnhanced.automaticRepositioning();
		
		// Update links.
		tsuminoEnhanced.seamlessViewing.classic.updateLinks();
		
		// If record keeper is enabled, update the data.
		if(GM_getValue("recordKeeper_enabled")) { tsuminoEnhanced.recordKeeper.update(); }
		
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
		$("#tsuminoEnhanced_loaderMessage").css("display","none");
		var newImageSrc = tsuminoEnhanced.tsumino.imgPrefix + tsuminoEnhanced.reader.currentBook + "/" + pageNumber;
		$("#tsumino_readerImg").attr("src",newImageSrc);
		window.location.href = tsuminoEnhanced.currentLocation + "#" + pageNumber;
	}
	
	// Make sure the page is in range first.
	if((pageNumber <= tsuminoEnhanced.reader.totalPages) && (pageNumber > 0))
	{
		// Display the loading message.
		$("#tsuminoEnhanced_loaderMessage").css("display","block");
		
		// Load the requested page into the cache. Once ready, replace the previous image.
		tsuminoEnhanced.utility.loader.active = tsuminoEnhanced.utility.loader.init(pageNumber);
		// Once the requested page is prepared, continue.
		$.when(tsuminoEnhanced.utility.loader.active).then(function()
		{
			changePageCommon(pageNumber);
			tsuminoEnhanced.utility.log("Image " + pageNumber + " has been placed in the reader.");
			dfd.resolve();
		});

		if (GM_getValue("pageJumping_enabled"))
		{
			$("#tsuminoEnhanced_pageJumper").val(pageNumber);
		}
	}
	// If the user requested a page that was less than 1 or greater than the total number of pages, stop.
	else
	{
		tsuminoEnhanced.utility.log("Image " + pageNumber + " is out of range and will not be loaded.");
		dfd.resolve();
	}
	return dfd.promise();
}




/*******************************************************
* Seamless Viewing - Reader Enhancement
* Style: Infinity Scrolling
*******************************************************/
// Infinity Scroll Object
tsuminoEnhanced.seamlessViewing.infinityScroll = {};

// Seamless Viewing - Infinity Scrolling - Initialization
tsuminoEnhanced.seamlessViewing.infinityScroll.init = function()
{
	// Replace default Tsumino reader keybinds with Enhanced Seamless Viewing keybinds.
	tsuminoEnhanced.seamlessViewing.replaceKeybinds();
	
	// Remove default Tsumino doujin navigation links.
	$("#tsuminoEnhanced_prevButton").remove();
	$("#tsuminoEnhanced_nextButton").remove();
	var temp = $("#tsuminoEnhanced_imageLink").children()[0];
	$("#tsuminoEnhanced_imageLink").before(temp);
	$("#tsuminoEnhanced_imageLink").remove();
	
	// Remove enhanced pagination.
	$("#tsuminoEnhanced_pagination").remove();
	
	// Create a template for page blocks.
	var readerImageBlock = $(".reader-page").children()[0];
	$(readerImageBlock).css("marginBottom","1em");
	$(readerImageBlock).attr("id","tsumino_infiniscroll_pageBlock_" + tsuminoEnhanced.reader.currentPage);
	var templateHtml = $(readerImageBlock).html();
	var srcString = "";

	if((tsuminoEnhanced.onReaderInitialPage) || (tsuminoEnhanced.reader.currentPage == 1))
	{
		srcString = "src=\"/Home/GetPage/" + tsuminoEnhanced.reader.currentBook + "\"";
	}
	else
	{
		srcString = "src=\"/Home/GetPage/" + tsuminoEnhanced.reader.currentBook + "/" + tsuminoEnhanced.reader.currentPage + "\"";
	}

	
	var newSrcString = "src=\"/Home/GetPage/" + tsuminoEnhanced.reader.currentBook + "/TSUMINOENHANCEDNEWPAGENUM\"";
	templateHtml = templateHtml.replace("<div ","<div style='margin-bottom:1em;' id=\"tsumino_infiniscroll_pageBlock_TSUMINOENHANCEDNEWPAGENUM\" ");
	templateHtml = templateHtml.replace("id=\"tsumino_readerImg\"","id=\"tsumino_infiniscroll_page_TSUMINOENHANCEDNEWPAGENUM\"");
	templateHtml = templateHtml.replace(srcString,newSrcString);

	tsuminoEnhanced.seamlessViewing.infinityScroll.pageTemplate = templateHtml;
	
	// Create a template for the return button block.
	var returnButtonTemplate = $("#tsuminoEnhanced_returnButtonBlock").html();
	returnButtonTemplate = returnButtonTemplate + "<br />";
	tsuminoEnhanced.seamlessViewing.infinityScroll.returnButtonTemplate = returnButtonTemplate;
	
	// If Page Jumping is also enabled:
	if (GM_getValue("pageJumping_enabled"))
	{
		// Write the special menu.
		$("body").append("<div id='tsuminoEnhanced_specialMenu' class='tsuminoEnhanced_bubbleDisplay' style='float:left;position:fixed;bottom:5px;right:5px;display:block;'></div>");
		
		// Establish keybind for menu toggling.
		$(document).keydown(function(data)
		{
			var keyCode = $(data)[0].keyCode;
			if (keyCode == 16) // SHIFT
			{
				tsuminoEnhanced.seamlessViewing.infinityScroll.toggleMenu();
			}
		});
	}
	
	// When everything is fully loaded begin scroll detection.
	$(window).load(function()
	{	
		tsuminoEnhanced.seamlessViewing.infinityScroll.ready = true;
		$(window).scroll(function() 
		{
			clearTimeout(tsuminoEnhanced.seamlessViewing.infinityScroll.timer);
			tsuminoEnhanced.seamlessViewing.infinityScroll.timer = setTimeout(function() 
			{
				tsuminoEnhanced.seamlessViewing.infinityScroll.checkScroll();
			}, 250);
		});
	});
}

// Seamless Viewing - Infinity Scrolling - Toggle Menu
tsuminoEnhanced.seamlessViewing.infinityScroll.toggleMenu = function()
{
	if($("#tsuminoEnhanced_specialMenu").is(":visible"))
	{
		$("#tsuminoEnhanced_specialMenu").css("display","none");
	}
	else
	{
		$("#tsuminoEnhanced_specialMenu").css("display","block");
	}
}

// Seamless Viewing - Infinity Scrolling - Scroll Detection
tsuminoEnhanced.seamlessViewing.infinityScroll.checkScroll = function()
{
	// Check if the user has reached the bottom of the document.
	if(tsuminoEnhanced.seamlessViewing.infinityScroll.ready)
	{
		if(($(window).scrollTop() + $(window).height()) == $(document).height())
		{
			tsuminoEnhanced.seamlessViewing.infinityScroll.ready = false;
			$.when(tsuminoEnhanced.seamlessViewing.infinityScroll.writePage(tsuminoEnhanced.reader.nextPage)).then(function()
			{
				tsuminoEnhanced.seamlessViewing.infinityScroll.ready = true;
			});
			tsuminoEnhanced.utility.log("Page at bottom.");
		}
	}
}

// Seamless Viewing - Infinity Scrolling - Write a new doujin page.
tsuminoEnhanced.seamlessViewing.infinityScroll.writePage = function(pageNumber)
{
	var dfd = jQuery.Deferred();
	
	// Common functionality.
	function writePageCommon(pageNumber)
	{
		var newPage = "";
		var newDate = new Date();
		var uid = "" + pageNumber + "_" + newDate;
		newPage = tsuminoEnhanced.utility.replaceAll(tsuminoEnhanced.seamlessViewing.infinityScroll.pageTemplate,"TSUMINOENHANCEDNEWPAGENUM",pageNumber);

		//tsuminoEnhanced.utility.log(newPage);
		
		// Inject the new page block above the return button.
		$("#tsuminoEnhanced_returnButtonBlock").before(newPage);
		
		// Update page and location variables.
		tsuminoEnhanced.reader.currentPage = pageNumber;
		tsuminoEnhanced.reader.prevPage = pageNumber-1;
		tsuminoEnhanced.reader.nextPage = pageNumber+1;
		tsuminoEnhanced.reader.currentPageURL = tsuminoEnhanced.tsumino.readerPrefix + tsuminoEnhanced.reader.currentBook + "/" + tsuminoEnhanced.reader.currentPage;
		GM_setValue("returnTo",tsuminoEnhanced.reader.currentPageURL);
		window.location.href = tsuminoEnhanced.currentLocation + "#" + pageNumber;
		
		// If record keeper is enabled, update the data.
		if(GM_getValue("recordKeeper_enabled")) { tsuminoEnhanced.recordKeeper.update(); }
		
		// If Page Jumping is also enabled, update it.
		if (GM_getValue("pageJumping_enabled")) { $("#tsuminoEnhanced_pageJumper").val(pageNumber); }
	}
	
	// Preliminary check to see if there would be anything to load.
	if((pageNumber <= tsuminoEnhanced.reader.totalPages) && (pageNumber > 0))
	{
		// Infinity Scrolling is ready to work. Prevent further load requests.
		tsuminoEnhanced.utility.loader.active = tsuminoEnhanced.utility.loader.init(pageNumber);
		// Once the requested page is preloaded, continue.
		$.when(tsuminoEnhanced.utility.loader.active).then(function()
		{
			writePageCommon(pageNumber);
			tsuminoEnhanced.utility.log("Page " + pageNumber + " has been placed in the reader.");
			dfd.resolve();
		});
	}
	// If the user requested a page that was less than 1 or greater than the total number of pages, stop.
	else
	{
		tsuminoEnhanced.utility.log("Image " + pageNumber + " is out of range and will not be loaded.");
		dfd.resolve();
	}
	
	return dfd.promise();
}


/*******************************************************
* Page Jumping - Reader Enhancement
*******************************************************/
tsuminoEnhanced.pageJumping = function()
{
	if(GM_getValue("seamlessViewing_style") == "InfinityScroll")
	{
		$("#tsuminoEnhanced_specialMenu").append("<div id='tsuminoEnhanced_pageJumperContainer'><span style='display:inline;'>Page: </span><select id='tsuminoEnhanced_pageJumper' style='font-size:1em; padding:0px;'></select><br /></div>");
	}
	else
	{
		$("#tsuminoEnhanced_pagination").after("<h1 style='display:inline;'>Jump to page: </h1><select id='tsuminoEnhanced_pageJumper'></select><br />");
	}
	
	for(i = 1; i <= tsuminoEnhanced.reader.totalPages; i++)
	{
		$("#tsuminoEnhanced_pageJumper").append("<option value='"+i+"'>"+i+"</option>");
	}
	$("#tsuminoEnhanced_pageJumper").val(tsuminoEnhanced.reader.currentPage);
	$("#tsuminoEnhanced_pageJumper").change(function()
	{
		// Seamless Viewing Compatibility
		if(GM_getValue("seamlessViewing_enabled"))
		{
			// Classic Style
			if(GM_getValue("seamlessViewing_style") == "Classic")
			{
				tsuminoEnhanced.seamlessViewing.classic.changePage($("#tsuminoEnhanced_pageJumper").val());
			}
			// Infinity Scrolling Style
			else if(GM_getValue("seamlessViewing_style") == "InfinityScroll")
			{
				tsuminoEnhanced.seamlessViewing.infinityScroll.ready = false;
				var isJumpDest = parseInt($("#tsuminoEnhanced_pageJumper").val());
				$(".reader-page").children().each(function()
				{
					if(($(this).is("div")) && (($(this).attr("id") != "tsuminoEnhanced_returnButtonBlock")))
					{
						$(this).addClass("tsuminoEnhanced_removalClass");
					}
				});

				$.when(tsuminoEnhanced.seamlessViewing.infinityScroll.writePage(isJumpDest)).then(function()
				{
					tsuminoEnhanced.automaticRepositioning();
					$(".reader-page").children().each(function()
					{
						if(($(this).is("div")) && ($(this).hasClass("tsuminoEnhanced_removalClass")))
						{
							$(this).remove();
						}
					});
					$("#tsuminoEnhanced_pageJumper").val(isJumpDest);
					tsuminoEnhanced.seamlessViewing.infinityScroll.ready = true;
				});
			}
		}
		// Vanilla Tsumino
		else
		{
			window.location.href = tsuminoEnhanced.tsumino.readerURL + tsuminoEnhanced.reader.currentBook + "/" + $("#tsuminoEnhanced_pageJumper").val();
		}
	});
}



/*******************************************************
* Thumbnail Links - Browsing Enhancement
*******************************************************/
tsuminoEnhanced.browseThumbnailLinks = function()
{
	tsuminoEnhanced.utility.log("Thumbnail Links Enhancement is running.");
	$(".overlay").each(function()
	{
		//tsuminoEnhanced.utility.log($(this).find("a.overlay-button")[0].href);
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
		// Add link to Tsumino Enhanced config page.
		$("ul.nav.navbar-nav:contains('FORUM')").append("<li><a id='tsuminoEnhancedNavlink' style='color:#22a7f0 !important; cursor:pointer;'>ENHANCED</a></li>");
		$("#tsuminoEnhancedNavlink").click(function(){tsuminoEnhanced.utility.toConfig();});
		
		// Add Tsumino Enhanced styles.
		$("head").append("<style>.tsuminoEnhanced_bubbleDisplay{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:default;background-color:#333;border:2px solid #DDD;border-radius:15px;background-color:rgba(51,51,51,.5);padding:5px 15px;color:#fff;display:none}#tsuminoEnhanced_slideshowTimer{position:fixed;float:right;bottom:5px;right:5px}#tsuminoEnhanced_loaderMessage{margin-left:auto;margin-right:auto; width:8em; text-align:center;}select,select option{background-color:#1a1a1a;color:#fff}select{cursor: pointer;border:2px solid #ddd;border-radius:5px;padding:5px;font-size:1.2em;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;outline: 0;}</style>");
	});
}
/*******************************************************
* Tsumino Enhanced Config Page
*******************************************************/
else
{
	// Kill the page before it can load.
	tsuminoEnhanced.utility.killPage();
	
	// Once the DOM is ready, begin the actual work.
	$( document ).ready(function()
	{
		tsuminoEnhanced.utility.log("Rendering config page...");
		
		// Wipe the old head section.
		$("head").html("");
		
		// Add the Tsumino Enhanced favicon. (From DataURI)
		$("head").append("<link rel=\"icon\" type=\"image/png\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wsRDAY5sIzTWwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAEaUlEQVRYw+2XW2xVRRSGv5nZ+1x6di/QUjinLdVUArVISIoJgRcEAoEQY4LxwUB8Ml4evEQTJGhQQ/SVGI2aaAzyohiDCMREEpUol4ACRROubSkl1tKeXjhnn+uePT7s5hRigJ62hhfmbe+ZWfOv9a/1rxmxZMkSwz0ckns87gOwpsOIERKUBcaAtDB2GF33IDI9iBrqnRwAY0XQNXGswe7gW9n4lbPwEm14TYvRtc2YaBVGWmCHMSqEKLiokT58pxa/JgFA7OB72Od/RmDKA6Brm0ht+piKQzsJnz2Au34rxYeWg1TI0T7UQBem4OI1txP68weiv32OzIwAUJi/AnfDmwC467ZQc/kIePnyckDk3cBY6yp8pw5n/7vEvn8HgOhPH+Hs20747EHwCnhzFyNy6QB41Rwyj704FkaDfeUk+Lr8JBT5NFbPKfyIg7EjAIQ6j4JXIP/oU4H9aDVYIcKn9yF8DwCvYSEmNhMAu+s4sf07SnNlUSCzNwhd+pXM6pcxoVjpvxrqRVfHybeuJt+2JojSghUUW5aC1vjVcwLDvR1ED3+K8HKTrwKRTgY8btgG2sOEohinDrw8hYVrsXtOEzm5B5lOggAMpJ7+AKu3g9iBHcjM8NTKULpJRGoAvyaBut5J9PCXqIFO5I1+MAahi+Tan0QUcwHXQPWHTyC8PEIXpy5EcrQfNXiFyLHdVO1+Dqv3DH5lPcIrlA7QM5tIb3yfwoKVpdzBmEAbJjBUIpF4+7YUeDlCncdQfecRukC+bS2ZDdtACOzeDgD82rl4jYvQ8Vbs7hN4DW3klm5CGO+uInRXCoy0AlGprMezQvgzGgAotiwjenRX4EHfBUQ+jV85C3fdFkTeDajT3jRIsRB4jYvIrHoJpEJdvzwW5tT4El0ABHL0Hyq/egVxU80bgtycfBXoIvaFX3BG/kbkXfTMuWTWvwFe4VbBMgaZGkD4mkLLMorzlhP660fsax1Tb0Yi7yKyNygsWImOz79FJUt++hov3srI899gQhXI9CDW1TNTp8CLt5J+fDvGqUOkk9hdx6BpMX5NHD9ajcyOBh1QBKCcvdtQY83rTvI7YQBW3zmqP9uMiVYj04Nklz0zFhYZHA6YUAWoEHb3Caz+ixhlgxCgLAwSjAZdvG0u3P0+oGz8qtm4a17Dr6oHY1D9l0rTfmU9SInX+Aju2tfRs1rwYzMCYKEKVP9FnL1vIdxkeQB8pxZd+wC59o3oxMNUHNqJHL5GavMnIMe3iVwKtIcfrcGvaUAUs6hhNygB3wMrjIk4UA6AYuMisiteQM+eh0xexfl2K1bfOYrN7UHYw85/ylANduN8/Soo+yYvNML45eeAzAxj9ZxCDXQR+X0PKtlT4j7Q3/EyNHYElEKmrgc8T7AH3BGAGuoleuQLUDaimB1f3PMHcvga4TP7xsGmkxghsfovTu+lVPhewOHN/4xP1a5nb/FSDV3F7jxO+PR3kwIgputlNBHZ/V/fBWKS++6/jO4D+BdYdNLmP/zOiQAAAABJRU5ErkJggg==\"/>");
		
		// Set the title and include the Open Sans font.
		$("head").append("<title>Tsumino Enhanced</title><link href='https://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'><style></style>");
		
		// Write the Tsumino Enhanced config page stylesheet.
		$("style").append("body{width:100%;max-width:100%;height:100%;min-height:100%;overflow-y:scroll}#tsuminoEnhanced_tsuminoLink,#tsuminoEnhanced_tsuminoLink:hover{color:#FFFFFF;text-decoration:none}#tsuminoEnhanced_header{background-color:#333;color:#FFF;padding:5px 15px;margin:0;font-weight:700}#tsuminoEnhanced_brand{color:#22a7f0}.tsuminoEnhancement{color:#22a7f0}#tsuminoEnhanced_version{font-size:.5em}.cmn-toggle+label,select{cursor:pointer;outline:0}body{margin:0;background-color:#1a1a1a;font-family:'Open Sans';font-size:1em}a,a:visited{color:#23a7f0;text-decoration:none}a:hover{color:#23a7f0;text-decoration:underline}h1,h2,h3,h4,h5,h6{padding:0;margin:0;font-weight:700}#tsuminoEnhanced_header,h1{font-size:2em}h2{font-size:1.5em;margin-bottom:5px;color:#22a7f0}#tsuminoEnhanced_footer{bottom:0px;text-align:center;margin-top:15px;float:left;display:block;position:fixed;width:100%}#tsuminoEnhanced_body{color:#fff;padding-right:2em}.options{padding-left:1em}.optionDescription{margin-top:10px}.optionGroup{margin-bottom:20px;border:2px solid #fff;border-radius:5px;background-color:#222;padding:15px;margin-left:1em}.cmn-toggle{position:absolute;margin-left:-9999px;visibility:hidden}.cmn-toggle+label{display:block;position:relative;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}input.cmn-toggle-round-flat+label{padding:2px;width:40px;height:20px;background-color:#ddd;-webkit-border-radius:20px;-moz-border-radius:20px;-ms-border-radius:20px;-o-border-radius:20px;border-radius:20px;-webkit-transition:background .4s;-moz-transition:background .4s;-o-transition:background .4s;transition:background .4s}input.cmn-toggle-round-flat+label:after,input.cmn-toggle-round-flat+label:before{display:block;position:absolute;content:''}input.cmn-toggle-round-flat+label:before{top:2px;left:2px;bottom:2px;right:2px;background-color:#1a1a1a;-webkit-border-radius:20px;-moz-border-radius:20px;-ms-border-radius:20px;-o-border-radius:20px;border-radius:20px;-webkit-transition:background .4s;-moz-transition:background .4s;-o-transition:background .4s;transition:background .4s}input.cmn-toggle-round-flat+label:after{top:4px;left:4px;bottom:4px;width:16px;background-color:#ddd;-webkit-border-radius:16px;-moz-border-radius:16px;-ms-border-radius:16px;-o-border-radius:16px;border-radius:16px;-webkit-transition:margin .4s, background .4s;-moz-transition:margin .4s, background .4s;-o-transition:margin .4s, background .4s;transition:margin .4s, background .4s}input.cmn-toggle-round-flat:checked+label{background-color:#22a7f0}input.cmn-toggle-round-flat:checked+label:after{margin-left:20px;background-color:#22a7f0}select,select option{background-color:#1a1a1a;color:#fff}select{border:2px solid #ddd;border-radius:5px;padding:5px;font-size:1.2em;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.fauxRow{display:table-row}.fauxCell{display:table-cell;vertical-align:middle}.switchContainer{padding-right:10px}.tsuminoEnhancedButton{background-color:#23a8f0;-moz-border-radius:28px;-webkit-border-radius:28px;border-radius:30px;border:2px solid #dddddd;display:inline-block;cursor:pointer;color:#ffffff;font-size:1.2em;font-weight:bold;padding:5px 15px;text-decoration:none;text-shadow:0px 1px 0px #12587d;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.tsuminoEnhancedButton:hover{background-color:#23a8f0;color:#fff;text-decoration:none}.tsuminoEnhancedButton:active{position:relative;top:1px}#tsuminoReturnButtonContainer{margin-left:15px}input.subOption[type=checkbox]:not(old),input.subOption[type=radio]:not(old){width:2em;margin:0;padding:0;font-size:1em;opacity:0;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}input.subOption[type=checkbox]:not(old) + label,input.subOption[type=radio]:not(old) + label{display:inline-block;margin-left:-2em;line-height:1.5em;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}input.subOption[type=checkbox]:not(old) + label > span,input.subOption[type=radio]:not(old) + label > span{display:inline-block;width:0.875em;height:0.875em;margin:0.25em 0.5em 0.25em 0.25em;border:0.0625em solid #626262;border-radius:0.25em;background-color:#626262;vertical-align:bottom;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}input.subOption[type=checkbox]:not(old):checked + label > span,input.subOption[type=radio]:not(old):checked + label > span{background-color:#1a1a1a;border:0.0625em solid #1c85bf;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}input.subOption[type=checkbox]:not(old):checked + label > span:before{content:'X';display:block;width:1em;color:#23a7f0;font-size:0.875em;line-height:1em;text-align:center;text-shadow:0 0 0.0714em rgb(115, 153, 77);font-weight:bold;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}input.subOption[type=radio]:not(old):checked + label > span > span{display:block;width:0.5em;height:0.5em;margin:0.125em;border:0.0625em solid #1c85bf;border-radius:0.125em;background-color:#23a7f0;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}#tabContainer{padding-bottom:1em}.configTab,.configTab nav ul{position:relative;margin:0 auto}.configTab nav,.configTab nav ul li{text-align:center}.configTab{overflow:hidden;width:100%;font-weight:300;font-size:2em}.configTab nav ul{display:-ms-flexbox;display:-webkit-flex;display:-moz-flex;display:-ms-flex;display:flex;padding:0;max-width:1200px;list-style:none;-ms-box-orient:horizontal;-ms-box-pack:center;-webkit-flex-flow:row wrap;-moz-flex-flow:row wrap;-ms-flex-flow:row wrap;flex-flow:row wrap;-webkit-justify-content:center;-moz-justify-content:center;-ms-justify-content:center;justify-content:center}.configTab nav a,.configTab nav ul li{display:block;position:relative}.configTab nav ul li{z-index:1;margin:0;-webkit-flex:1;-moz-flex:1;-ms-flex:1;flex:1}.configTab nav a{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;line-height:2.5}.configTab nav a{vertical-align:middle;font-size:.75em}.configTab nav li.tab-current a{color:#74777b}.configTab nav a:focus{outline:0}.configTab nav a:hover{text-decoration:none}.no-flexbox nav ul li{min-width:15%;display:inline-block}.configTab nav li:last-child::before{position:absolute;bottom:0;left:0;width:100%;height:4px;background:#22a7f0;content:'';-webkit-transition:-webkit-transform .3s;transition:transform .3s}.configTab nav li:first-child.tab-current~li:last-child::before{-webkit-transform:translate3d(-400%, 0, 0);transform:translate3d(-400%, 0, 0)}.configTab nav li:nth-child(2).tab-current~li:last-child::before{-webkit-transform:translate3d(-300%, 0, 0);transform:translate3d(-300%, 0, 0)}.configTab nav li:nth-child(3).tab-current~li:last-child::before{-webkit-transform:translate3d(-200%, 0, 0);transform:translate3d(-200%, 0, 0)}.configTab nav li:nth-child(4).tab-current~li:last-child::before{-webkit-transform:translate3d(-100%, 0, 0);transform:translate3d(-100%, 0, 0)}.configTab nav a{padding:.5em;color:#74777b;line-height:1;-webkit-transition:color .3s, -webkit-transform .3s;transition:color .3s, transform .3s}.configTab nav li.tab-current a{color:#22a7f0}.configTab nav a{font-weight:700}.currentTabContent{display:block}.hiddenTabContent{display:none}");
		
		// Prepare the body of the page.
		$("body").html("<div id='tsuminoEnhanced_header'><a href='javascript:;' id='tsuminoEnhanced_tsuminoLink'>TSUMINO</a> <span id='tsuminoEnhanced_brand'>ENHANCED</span> <span id='tsuminoEnhanced_version'>" + tsuminoEnhanced.version + "</span></div><div id='tsuminoEnhanced_body'></div>");
		
		$("#tsuminoEnhanced_tsuminoLink").click(function(){ tsuminoEnhanced.utility.backToTsumino(); });
		
		/*******************************************************
		* General Enhancements
		*******************************************************/
		// Prepare the global enhancements section.
		$("#tsuminoEnhanced_body").append("<div id='generalEnhancements' class='options'>The following Enhancements can apply to multiple areas of Tsumino.<br /><br /></div>");
		
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
		
		
		// Record Keeper - Options
		$("#generalEnhancements").append("<div id='recordKeeper' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='recordKeeper_switch' name='recordKeeper_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat'/><label for='recordKeeper_switch'></label></div><div class='fauxCell'><h2>Record Keeper</h2></div></div><div class='optionDescription'>This Enhancement keeps a record of what Doujin you've read.<br />While browsing, unread Doujin will retain the normal blue border.<br />Doujin you have started but haven't finished will have a yellow border.<br />Doujin you've finished reading will have a green border.<br />There will be a 'Continue Reading' button on the book info page if you have previously read a Doujin.</div></div>");
		if(GM_getValue("recordKeeper_enabled")) { $("#recordKeeper_switch").prop("checked",true); }
		
		// Style Tweaks - Options
		$("#generalEnhancements").append("<div id='styleTweaksGroup' class='optionGroup'><h2>Style Tweaks</h2><div class='optionDescription'>Apply minor style tweaks to Tsumino.</div></div>");
		
		$("#styleTweaksGroup").append("<br /><input id='styleTweaks_blackBackground' name='styleTweaks_blackBackground' type='checkbox' class='subOption' /><label for='styleTweaks_blackBackground' class='tsuminoEnhancement'><span></span>Black Background</label><br />Changes the background color of Tsumino from light black to dark black.");
		if(GM_getValue("styleTweaks_blackBackground")) { $("#styleTweaks_blackBackground").prop("checked",true); }
		
		/*******************************************************
		* Browsing Enhancements
		*******************************************************/
		// Prepare the browsing enhancements section.
		$("#tsuminoEnhanced_body").append("<div id='browsingEnhancements' class='options'>The following Enhancements only apply to the Tsumino Browse page.<br /><br /></div>");
		
		// Thumbnail Links - Options
		$("#browsingEnhancements").append("<div id='containerLinks_group' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='browseThumbnailLinks_switch' name='browseThumbnailLinks_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' /><label for='browseThumbnailLinks_switch'></label></div><div class='fauxCell'><h2>Thumbnail Links</h2></div></div><div class='optionDescription'>You no longer have to specifically click View Info to load a Doujin.<br />Clicking anywhere on the thumbnail image will load the Doujin as well.</div></div>");
		if(GM_getValue("browseThumbnailLinks_enabled")) { $("#browseThumbnailLinks_switch").prop("checked",true); }
		
		
		
		/*******************************************************
		* Reader Enhancements
		*******************************************************/
		// Prepare the reader enhancements section.
		$("#tsuminoEnhanced_body").append("<div id='readerEnhancements' class='options'>The following Enhancements only apply to the Tsumino Reader.<br /><br /></div>");
		
		// If the slideshow wasn't enabled, but a delay was selected, remove the delay.
		if(!GM_getValue("slideshow_enabled")) { $("#slideshow_delay").val(GM_deleteValue("slideshow_delay")); }
		
		// Slideshow - Options
		$("#readerEnhancements").append("<div id='slideshow_group' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='slideshow_switch' name='slideshow_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled='disabled' /><label for='slideshow_switch'></label></div><div class='fauxCell'><h2>Slideshow</h2></div></div><div class='optionDescription'>Adds slideshow functionality to the reader.<br/>Press SHIFT while on the reader to toggle it on and off.<br/>Select how long the slideshow will remain on a page to enable this Enhancement.</div></div>");
		
		// Slideshow - Options - Delay Selection
		$("#slideshow_group").append("<br/><select id='slideshow_delay' name='slideshow_delay'><option value='default' disabled='disabled'>Spend how many seconds per page?</option></select>");
		
		// Populate slideshow delay select box.		
		(function () 
		{
			var pluralize = "";
			var iDisp = "";
			for (var i = 1; i < 61; i++)
			{
				if(i != 1) { pluralize = "s"; }
				iDisp = i.toString();
				if(iDisp.length==1){iDisp = "0"+i}
				$("#slideshow_delay").append("<option value='" + i + "'>" + iDisp + " Second"+pluralize+"</option>");
			}
		})();
		
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
			
		// Seamless Viewing - Options
		$("#readerEnhancements").append("<div id='seamlessViewing_group' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='seamlessViewing_switch' name='seamlessViewing_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' /><label for='seamlessViewing_switch'></label></div><div class='fauxCell'><h2>Seamless Viewing</h2></div></div><div class='optionDescription'>Makes the Tsumino Reader load doujin pages without needing to reload the webpage.</div></div>");
		
		$("#seamlessViewing_group").append("Select which style of Seamless Viewing to use:<br /><br />");
		$("#seamlessViewing_group").append("<input type='radio' id='seamlessViewing_style_classic' name='seamlessViewing_style' value='Classic' class='subOption'><label for='seamlessViewing_style_classic' class='tsuminoEnhancement'><span><span></span></span>Classic</label><br />Retains the single page per screen style of display.<br /><br /><input type='radio' id='seamlessViewing_style_infinityScroll' name='seamlessViewing_style' value='InfinityScroll' class='subOption'><label for='seamlessViewing_style_infinityScroll' class='tsuminoEnhancement'><span><span></span></span>Infinity Scrolling</label><br />Allows you to scroll down to load new pages.<br />If you are also using <span class='tsuminoEnhancement'>Page Jumping</span>, press SHIFT to toggle the menu.<br /><span style='color:#ff0000;'>Incompatible with Slideshow.</span>");
		
		$("#seamlessViewing_group").append("<br /><br /><strong>Requires the following Enhancements:</strong><br /><span class='tsuminoEnhancement'>Unstickied Header</span><br /><span class='tsuminoEnhancement'>Automatic Repositioning</span>");
		
		if(GM_getValue("seamlessViewing_enabled"))
		{
			$("#seamlessViewing_switch").prop("checked",true);
			if(GM_getValue("seamlessViewing_style") == "Classic") { $("#seamlessViewing_style_classic").prop("checked",true); }
			else if(GM_getValue("seamlessViewing_style") == "InfinityScroll") { $("#seamlessViewing_style_infinityScroll").prop("checked",true); }
		}
		
		
		// Automatic Repositioning - Options
		$("#readerEnhancements").append("<div id='automaticRepositioningGroup' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='automaticRepositioning_switch' name='automaticRepositioning_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat'/><label for='automaticRepositioning_switch'></label></div><div class='fauxCell'><h2>Automatic Repositioning</h2></div></div><div class='optionDescription'>Automatically scrolls the page down to the top of the doujin image.<br/>Requires <span class='tsuminoEnhancement'>Unstickied Header</span>.<br /></div></div>");
		if(GM_getValue("automaticRepositioning_enabled")){$("#automaticRepositioning_switch").prop("checked",true);}
		
		// Page Jumping - Options
		$("#readerEnhancements").append("<div id='pageJumpingGroup' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='pageJumping_switch' name='pageJumping_switch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat'/><label for='pageJumping_switch'></label></div><div class='fauxCell'><h2>Page Jumping</h2></div></div><div class='optionDescription'>Adds a dropdown box for skipping directly to specific pages.<br /></div></div>");
		if(GM_getValue("pageJumping_enabled")){$("#pageJumping_switch").prop("checked",true);}
		
		
		/*******************************************************
		* Search Enhancements
		*******************************************************/
		$("#tsuminoEnhanced_body").append("<div id='searchEnhancements' class='options'>The following Enhancements only apply to the Tsumino Search Page.<br /><br /></div>");
		
		/*******************************************************
		* Forum Enhancements
		*******************************************************/
		$("#tsuminoEnhanced_body").append("<div id='forumEnhancements' class='options'>The following Enhancements only apply to the Tsumino Forum.<br /><br /></div>");
		
		
		
		
		/*******************************************************
		* Config Tabs
		*******************************************************/
		$("#tsuminoEnhanced_body").before("<div id='tabContainer' class='configTab'><nav><ul><li id='tab_generalEnhancements'><a href='javascript:;'>General</a></li><li id='tab_browsingEnhancements'><a href='javascript:;'>Browsing</a></li><li id='tab_readerEnhancements'><a href='javascript:;'>Reader</a></li><li id='tab_searchEnhancements'><a href='javascript:;'>Search</a></li><li id='tab_forumEnhancements'><a href='javascript:;'>Forum</a></li></ul></nav></div>");
		(function () 
		{
			var newActiveTab = "";
			$("#tabContainer").find("a").click(function()
			{
				$(this).parent().siblings().removeClass("tab-current");
				$(this).parent().addClass("tab-current");
				newActiveTab = "#" + $(this).parent().attr("id").replace("tab_","");
				$(newActiveTab).siblings().removeClass("currentTabContent");
				$(newActiveTab).siblings().addClass("hiddenTabContent");
				$(newActiveTab).removeClass("hiddenTabContent");
				$(newActiveTab).addClass("currentTabContent");
			});
			
			// Temporarily deactivate Search and Forum tabs.
			$("#tabContainer").find("a").each(function()
			{
				if(($(this).text() == "Search") || ($(this).text() == "Forum"))
				{
					$(this).off("click");
					$(this).css("display","none");
				}
			});
			
			$(".options").addClass("hiddenTabContent");
			$("#generalEnhancements").removeClass("hiddenTabContent");
			$("#tab_generalEnhancements").addClass("tab-current");
		})();
		
		/*******************************************************
		* End of Enhancement Configuration Options
		*******************************************************/
		// Add the "Return to Tsumino" button.
		$("body").append("<div id='tsuminoReturnButtonContainer'><a id='tsuminoReturnButton' class='tsuminoEnhancedButton'>Return to Tsumino</a><br /><br /></div>");
		$("#tsuminoReturnButton").click(function(){ tsuminoEnhanced.utility.backToTsumino(); });
		
		
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
					//tsuminoEnhanced.utility.log("Unstickied Header Scope: Global");
					GM_setValue("unstickedHeader_scope","Global");
				}
				if($("#unstickedHeaderScope_reader").prop("checked"))
				{
					//tsuminoEnhanced.utility.log("Unstickied Header Scope: Reader");
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
			GM_setValue("tagSearchLinks_enabled", $("#tagSearchLinks_switch").prop("checked"));
			GM_setValue("styleTweaks_blackBackground", $("#styleTweaks_blackBackground").prop("checked"));
			GM_setValue("slideshow_enabled", $("#slideshow_switch").prop("checked"));
			GM_setValue("slideshow_delay", $("#slideshow_delay").val());
			GM_setValue("slideshow_displayTimer", $("#slideshow_displayTimer_switch").prop("checked"));
			
			GM_setValue("seamlessViewing_enabled", $("#seamlessViewing_switch").prop("checked"));
			if($("#seamlessViewing_switch").prop("checked"))
			{
				if($("#seamlessViewing_style_classic").prop("checked"))
				{
					GM_setValue("seamlessViewing_style","Classic");
				}
				else if($("#seamlessViewing_style_infinityScroll").prop("checked"))
				{
					GM_setValue("seamlessViewing_style","InfinityScroll");
				}
			}
			else
			{
				GM_deleteValue("seamlessViewing_style");
			}
			
			GM_setValue("automaticRepositioning_enabled", $("#automaticRepositioning_switch").prop("checked"));
			GM_setValue("browseThumbnailLinks_enabled", $("#browseThumbnailLinks_switch").prop("checked"));
			GM_setValue("recordKeeper_enabled", $("#recordKeeper_switch").prop("checked"));
			GM_setValue("pageJumping_enabled",$("#pageJumping_switch").prop("checked"));
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
				$("#seamlessViewing_switch").prop("checked",false);
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
		
		// Record Keeper
		$("#recordKeeper_switch").change(function()
		{
			commitOptions();
		});
				
		// Style Tweaks - Black Background
		$("#styleTweaks_blackBackground").change(function()
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
				$("#seamlessViewing_style_classic").prop("checked",true);
			}
			commitOptions();
		});
		// Slideshow - Display Timer
		$("#slideshow_displayTimer_switch").change(function()
		{
			commitOptions();
		});
		
		
		// Seamless Viewing
		$("#seamlessViewing_switch").change(function()
		{
			if($("#seamlessViewing_switch").prop("checked"))
			{
				$("#unstickedHeader_switch").prop("checked",true);
				enforceUnstickiedHeaderScope();
				$("#automaticRepositioning_switch").prop("checked",true);
				$("#seamlessViewing_style_classic").prop("checked",true);
			}
			else
			{
				$("#seamlessViewing_style_classic").prop("checked",false);
				$("#seamlessViewing_style_infinityScroll").prop("checked",false);
			}
			commitOptions();
		});
		// Seamless Viewing - Classic
		$("#seamlessViewing_style_classic").change(function()
		{
			$("#seamlessViewing_switch").prop("checked",true);
			commitOptions();
		});
		
		// Seamless Viewing - Infinity Scrolling
		$("#seamlessViewing_style_infinityScroll").change(function()
		{
			$("#seamlessViewing_switch").prop("checked",true);
			$("#slideshow_switch").prop("checked",false);
			$("#slideshow_switch").prop("disabled",true);
			$("#slideshow_delay").val('default');
			$("#slideshow_displayTimer_switch").prop("checked",false);
			$("#slideshow_displayTimer_switch").prop("disabled",true);
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
				$("#seamlessViewing_switch").prop("checked",false);
				enforceUnstickiedHeaderScope();
			}
			commitOptions();
		});
		
		// Page Jumping
		$("#pageJumping_switch").change(function()
		{
			commitOptions();
		});
	});
}





/*******************************************************
* Check if a redirect is needed first.
*******************************************************/
if((GM_getValue("seamlessViewing_enabled")))
{
	if(tsuminoEnhanced.onReader || tsuminoEnhanced.onAuth)
	{
		tsuminoEnhanced.seamlessViewing.redirection();
	}
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
	
	// Record Keeper
	if(GM_getValue("recordKeeper_enabled"))
	{
		tsuminoEnhanced.utility.log("Starting Record Keeper Enhancement...");
		tsuminoEnhanced.recordKeeper.init();
	}
	
	// Style Tweaks
	$( document ).ready(function()
	{
		tsuminoEnhanced.styleTweaks.init();
	});
}

// Browsing Enhancements
if (tsuminoEnhanced.isBrowsing)
{
	$( document ).ready(function()
	{
		if (GM_getValue("browseThumbnailLinks_enabled")) { tsuminoEnhanced.browseThumbnailLinks(); }
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
		if((GM_getValue("unstickedHeader_enabled") && GM_getValue("unstickedHeader_scope") == "Reader")) 
		{ 
			tsuminoEnhanced.utility.log("Starting Unstickied Header Enhancement...");
			tsuminoEnhanced.unstickyHeader(); 
		}
		if (GM_getValue("automaticRepositioning_enabled")) 
		{ 
			tsuminoEnhanced.utility.log("Starting Automatic Repositioning Enhancement...");
			tsuminoEnhanced.automaticRepositioning(); 
		}
		if (GM_getValue("slideshow_enabled")) 
		{ 
			tsuminoEnhanced.utility.log("Starting Slideshow Enhancement...");
			tsuminoEnhanced.slideshow.init(); 
		}
		if (GM_getValue("seamlessViewing_enabled")) 
		{ 
			tsuminoEnhanced.utility.log("Starting Seamless Viewing Enhancement...");
			if(GM_getValue("seamlessViewing_style") == "Classic")
			{
				tsuminoEnhanced.seamlessViewing.classic.init();
			}
			else if(GM_getValue("seamlessViewing_style") == "InfinityScroll")
			{
				tsuminoEnhanced.seamlessViewing.infinityScroll.init();
			}
		}
		if (GM_getValue("pageJumping_enabled"))
		{
			tsuminoEnhanced.utility.log("Starting Page Jumping Enhancement...");
			tsuminoEnhanced.pageJumping();
		}
	});
	
	// Run when the page and all assets have fully completed loaded.
	$( window ).load(function()
	{

	});
}