// ==UserScript==
// @name         Tsumino Enhanced
// @namespace    tobias.kelmandia@gmail.com
// @version      1.0.1
// @description  Adds multiple configurable enhancements, tweaks, and features to Tsumino.com
// @author       Toby
// @include      http://www.tsumino.com/Enhanced
// @include		 http://www.tsumino.com/*
// @require		 https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @grant        GM_setValue
// @grant        GM_getValue
// @grant		 GM_deleteValue
// ==/UserScript==

/* Predefine Misc. variables. */
	var onConfig = false;

/* Convenience variables. */
	// Easier to type current location.
	var currentLocation = window.location.href;
	// Tsumino Enhanced configuration location.
	var tsuminoEnhancedURL = "http://www.tsumino.com/Enhanced";

/* Location Checking */
	// Is the user on the reader?
	var tsuminoReader = new RegExp("http://www.tsumino.com/Home/Read/*");
	var onReader = tsuminoReader.exec(currentLocation);

	// Is the user on the Tsumino Enhanced config page?
	if (currentLocation == tsuminoEnhancedURL)
	{
		onConfig = true;
	}
	

/* Establish tsuminoEnhanced object. */
	var tsuminoEnhanced = {};
	
	// Tsumino Enhanced internal use utilities.
	tsuminoEnhanced.utilities = {};
	// Save current location and go to config.
	tsuminoEnhanced.utilities.toConfig = function()
	{
		GM_setValue("returnTo",currentLocation);
		window.location.href = tsuminoEnhancedURL;
	}
	// Return to saved location.
	tsuminoEnhanced.utilities.backToTsumino = function()
	{
		window.location.href = GM_getValue("returnTo");
	}
	

/* Unstickied Header. */
	tsuminoEnhanced.unstickyHeader = function()
	{
		$(".navbar-fixed-top").css("position", "absolute");
	}

/* Scroll to Image. */
	tsuminoEnhanced.scrollToImage = function()
	{
		$(document).ready(function()
		{
			var imgPos = $(".reader-page").position().top;
			$('html, body').animate(
			{
				scrollTop: imgPos
			}, 1);
		});
	}

/* Slideshow */
	// Need to add slideshow time remaining ticker back.
	tsuminoEnhanced.slideshow = function()
	{
		$("body").focus();
		var slideshowStatus = "";
		var slideshowTimer = 0;
		var trString = "";
		var temp = currentLocation.split("/Read")[1];
		var slideshowActive = "";
		temp = temp.split("/");
		if (temp.length == 2)
		{
			GM_setValue("slideshowActive", false);
		}
		if (GM_getValue("slideshowActive"))
		{
			slideshowActive = true;
			slideshowStatus = "Active";
			console.log("slideshow is active.");
			console.log(GM_getValue("slideshowDelay") + " seconds until next page.");
			slideshowRunSlideshow();
		}
		else
		{
			slideshowActive = false;
			slideshowStatus = "Inactive";
			console.log("slideshow is currently inactive.");
			if (GM_getValue("slideshowDelay"))
			{
				console.log("Stored delay between pages is set at: " + GM_getValue("slideshowDelay") + " seconds.");
			}
		}
		$(document).keydown(function(data)
		{
			var keyCode = $(data)[0].keyCode;
			if (keyCode == 16)
			{
				console.log("SHIFT KEY PRESSED.");
				slideshowToggle();
			}
		});

		function slideshowToggle()
		{
			if (slideshowActive)
			{
				console.log("Stopping slideshow.");
				if (slideshowTimer)
				{
					clearTimeout(slideshowTimer);
				}
				if (slideshowTTtimeout)
				{
					clearTimeout(slideshowTTtimeout);
					$("#slideshowCounter").html("");
				}
				GM_setValue("slideshowActive", false);
				slideshowActive = false;
				slideshowStatus = "Inactive";
				//$("#slideshowStatus").html(slideshowStatus);
			}
			else
			{
				if (!GM_getValue("slideshowDelay"))
				{
					alert("You must specify an amount of time to spend per page.");
				}
				else
				{
					GM_setValue("slideshowActive", true);
					slideshowActive = true;
					slideshowStatus = "Active";
					//$("#slideshowStatus").html(slideshowStatus);
					slideshowRunSlideshow(true);
				}
			}
		}

		function slideshowTimerTicker(timeRemaining)
		{
			if (timeRemaining.toString().length == 1)
			{
				trString = "0" + timeRemaining;
			}
			else
			{
				trString = timeRemaining;
			}
			$("#slideshowCounter").html(" (" + trString + ")");
			slideshowTTtimeout = setTimeout(function()
			{
				timeRemaining--;
				slideshowTimerTicker(timeRemaining);
			}, 1000);
		}

		function slideshowRunSlideshow(startNow)
		{
			startNow || false;
			var waitFor = parseInt(GM_getValue("slideshowDelay")) * 1000;
			if (startNow)
			{
				if ($("a:contains('NEXT ')").length)
				{
					console.log("Loading next page...");
					$("a:contains('NEXT')")[0].click();
				}
				else
				{
					console.log("No more pages to load.");
				}
			}
			else
			{
				slideshowTimerTicker(parseInt(GM_getValue("slideshowDelay")));
				slideshowTimer = setTimeout(slideshowRunSlideshow, waitFor, true);
			}
		}
	}
	
/* Seamless Reader */
	tsuminoEnhanced.seamlessReader = function()
	{
		// Coming Soon...
	}

/* Single Page View Reader */
	tsuminoEnhanced.singlePageView = function()
	{
		// Coming Soon... (Pending Staff Approval)
	}

/* Page Modifications */
	// If the user isn't already on the config page, include a link to it in Tsumino's navigation.
	if (!onConfig)
	{
		$("ul.nav.navbar-nav:contains('FORUM')").append("<li><a id='tsuminoEnhancedNavlink' style='color:#22a7f0 !important; cursor:pointer;'>ENHANCED</a></li>");
		$("#tsuminoEnhancedNavlink").click(function(){tsuminoEnhanced.utilities.toConfig();});
	}
	// If the user is on the config page, write it.
	else
	{
		// Replace 404 page with Tsumino Enhanced Template.
		$("head").html("");
		$("head").append("<title>Tsumino Enhanced</title><link href='https://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>");
		$("body").html("<div id='tsuminoEnhanced_header'>TSUMINO <span id='tsuminoEnhanced_brand'>ENHANCED</span></div><div id='tsuminoEnhanced_body'></div>");
		
		// Tsumino Enhanced Stylesheet.
		$("head").append("<style>.cmn-toggle+label,select{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none}#tsuminoEnhanced_footer,#tsuminoEnhanced_header{background-color:#333;color:#FFF;padding:5px 15px;margin:0;font-weight:700}#tsuminoEnhanced_brand,h1{color:#22a7f0}.cmn-toggle+label,select{cursor:pointer;outline:0}body{margin:0;background-color:#1a1a1a;font-family:'Open Sans';font-size:1em}a,a:visited{color:#23a7f0;text-decoration:none}a:hover{color:#23a7f0;text-decoration:underline}h1,h2,h3,h4,h5,h6{padding:0;margin:0;font-weight:700}#tsuminoEnhanced_header,h1{font-size:2em}h2{font-size:1.5em;margin-bottom:5px}#tsuminoEnhanced_footer{bottom:0;left:0;text-align:center;margin-top:15px}#tsuminoEnhanced_body{padding:15px;color:#fff}.options{padding-left:2em}.optionDescription{margin-top:10px}.optionGroup{margin-bottom:20px;border:2px solid #fff;border-radius:5px;background-color:#222;padding:15px}.cmn-toggle{position:absolute;margin-left:-9999px;visibility:hidden}.cmn-toggle+label{display:block;position:relative;user-select:none}input.cmn-toggle-round-flat+label{padding:2px;width:40px;height:20px;background-color:#ddd;-webkit-border-radius:20px;-moz-border-radius:20px;-ms-border-radius:20px;-o-border-radius:20px;border-radius:20px;-webkit-transition:background .4s;-moz-transition:background .4s;-o-transition:background .4s;transition:background .4s}input.cmn-toggle-round-flat+label:after,input.cmn-toggle-round-flat+label:before{display:block;position:absolute;content:''}input.cmn-toggle-round-flat+label:before{top:2px;left:2px;bottom:2px;right:2px;background-color:#1a1a1a;-webkit-border-radius:20px;-moz-border-radius:20px;-ms-border-radius:20px;-o-border-radius:20px;border-radius:20px;-webkit-transition:background .4s;-moz-transition:background .4s;-o-transition:background .4s;transition:background .4s}input.cmn-toggle-round-flat+label:after{top:4px;left:4px;bottom:4px;width:16px;background-color:#ddd;-webkit-border-radius:16px;-moz-border-radius:16px;-ms-border-radius:16px;-o-border-radius:16px;border-radius:16px;-webkit-transition:margin .4s,background .4s;-moz-transition:margin .4s,background .4s;-o-transition:margin .4s,background .4s;transition:margin .4s,background .4s}input.cmn-toggle-round-flat:checked+label{background-color:#22a7f0}input.cmn-toggle-round-flat:checked+label:after{margin-left:20px;background-color:#22a7f0}select,select option{background-color:#1a1a1a;color:#fff}.tsuminoEnhancedButton,.tsuminoEnhancedButton:hover{background-color:#23a8f0;color:#fff;text-decoration:none}select{border:2px solid #ddd;border-radius:5px;padding:5px;font-size:1.2em;user-select:none}.fauxRow{display:table-row}.fauxCell{display:table-cell;vertical-align:middle}.switchContainer{padding-right:10px}.tsuminoEnhancedButton{-moz-border-radius:28px;-webkit-border-radius:28px;border-radius:30px;border:2px solid #ddd;display:inline-block;cursor:pointer;font-size:1.2em;font-weight:700;padding:5px 15px;text-shadow:0 1px 0 #12587d;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.tsuminoEnhancedButton:active{position:relative;top:1px}#tsuminoReturnButtonContainer{margin-left:15px}</style>");
		
		// Tsumino Reader Options header.
		$("#tsuminoEnhanced_body").append("<h1>Tsumino Reader</h1>The following options only apply to the Tsumino Reader.<br /><br /><div id='readerOptions' class='options'></div>");
		
		// Unstickied Header Options.
		$("#readerOptions").append("<div id='unstickiedHeaderGroup' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='unstickedHeaderSwitch' name='unstickedHeaderSwitch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat'/><label for='unstickedHeaderSwitch'></label></div><div class='fauxCell'><h2>Unstickied Header</h2></div></div><div class='optionDescription'>Prevents the Tsumino header from following you as you scroll down the page.<br/></div></div>");
		if(GM_getValue("unstickedHeaderEnabled")){$("#unstickedHeaderSwitch").prop("checked",true);}
		
		// Scroll to Image Options.
		$("#readerOptions").append("<div id='scrollToImageGroup' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='scrollToImageSwitch' name='scrollToImageSwitch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat'/><label for='scrollToImageSwitch'></label></div><div class='fauxCell'><h2>Scroll To Image</h2></div></div><div class='optionDescription'>Automatically scrolls the page down to the top of the doujin image.<br/>Works best in conjunction with the Unstickied Header feature.<br /></div></div>");
		if(GM_getValue("scrollToImageEnabled")){$("#scrollToImageSwitch").prop("checked",true);}
		
		// If the slideshow wasn't enabled, but a delay was selected, remove the delay.
		if(!GM_getValue("slideshowEnabled")) { $("#slideshowDelay").val(GM_deleteValue("slideshowDelay")); }
		
		// Slideshow Options.
		$("#readerOptions").append("<div id='slideshowGroup' class='optionGroup'><div class='fauxRow'><div class='fauxCell switchContainer'><input id='slideshowSwitch' name='slideshowSwitch' type='checkbox' class='cmn-toggle cmn-toggle-round-flat' disabled='disabled' /><label for='slideshowSwitch'></label></div><div class='fauxCell'><h2>Slideshow</h2></div></div><div class='optionDescription'>Adds slideshow functionality to the reader.<br/>Press SHIFT while on the reader to toggle it on and off.<br/>Once you select how long the slideshow will remain on a page, you can enable this feature.<br/><br/><select id='slideshowDelay' name='slideshowDelay'><option value='default' disabled='disabled'>Spend how many seconds per page?</option></select></div></div>");
		
			// Populate slideshow delay select box.
			var pluralize = "";
			var iDisp = "";
			for (var i = 1; i < 61; i++)
			{
				if(i != 1) { pluralize = "s"; }
				iDisp = i.toString();
				if(iDisp.length==1){iDisp = "0"+i}
				$("#slideshowDelay").append("<option value='" + i + "'>" + iDisp + " Second"+pluralize+"</option>");
			}
			if(GM_getValue("slideshowEnabled"))
			{
				$("#slideshowSwitch").prop("checked",true); 
				$("#slideshowSwitch").prop("disabled",false);
				$("#slideshowDelay").val(GM_getValue("slideshowDelay"));
			}
		
		
		// Return to Tsumino
		$("body").append("<div id='tsuminoReturnButtonContainer'><a id='tsuminoReturnButton' class='tsuminoEnhancedButton'>Return to Tsumino</a></div>");
		$("#tsuminoReturnButton").click(function(){ tsuminoEnhanced.utilities.backToTsumino(); });
		
		// Tsumino Enhanced Footer.
		$("body").append("<div id='tsuminoEnhanced_footer'>Check out the project on <a href='https://github.com/tobiaskelmandia/TsuminoEnhanced'>Github</a>!</div>");
		
		
	/* Commit options to GM_values. */
		$("#unstickedHeaderSwitch").change(function()
		{
			GM_setValue("unstickedHeaderEnabled", $("#unstickedHeaderSwitch").prop("checked"));
		});
		$("#scrollToImageSwitch").change(function()
		{
			GM_setValue("scrollToImageEnabled", $("#scrollToImageSwitch").prop("checked"));
		});
		$("#slideshowSwitch").change(function()
		{
			GM_setValue("slideshowEnabled", $("#slideshowSwitch").prop("checked"));
			if(!$("#slideshowSwitch").prop("checked"))
			{
				$("#slideshowDelay").val( 'default' );
				$("#slideshowSwitch").prop("disabled",true);
				GM_deleteValue("slideshowDelay");
			}
		});
		$("#slideshowDelay").change(function()
		{
			GM_setValue("slideshowDelay", $("#slideshowDelay").val());
			$("#slideshowSwitch").removeProp("disabled");
		});
	}

/* If the user is on the Reader, apply any enabled Reader Options */
	if (onReader)
	{
		if (GM_getValue("unstickedHeaderEnabled")) { tsuminoEnhanced.unstickyHeader(); }
		if (GM_getValue("scrollToImageEnabled")) { tsuminoEnhanced.scrollToImage(); }
		if (GM_getValue("slideshowEnabled")) { tsuminoEnhanced.slideshow(); }
	}