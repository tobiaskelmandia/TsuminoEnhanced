"use strict";

// ==UserScript==
// @name				Tsumino Enhanced
// @namespace			http://codingtoby.com
// @version				2.0.3.3
// @description			Adds a collection of customizable tweaks, enhancements, and new features to Tsumino.com.
// @author				Toby
// @include				http://www.tsumino.com/*
// @include				http://tsumino.com/*
// @include				https://www.tsumino.com/*
// @include				https://tsumino.com/*
// @include				https://openuserjs.org/scripts/Tobias.Kelmandia/Tsumino_Enhanced
// @exclude				http://www.tsumino.com/Forum/*
// @exclude				http://tsumino.com/Forum/*
// @exclude				https://www.tsumino.com/Forum/*
// @exclude				https://tsumino.com/Forum/*
// @require				https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @require				http://js.codingtoby.com/semantic.min.js
// @require				https://cdnjs.cloudflare.com/ajax/libs/bean/1.0.15/bean.min.js
// @require				https://cdnjs.cloudflare.com/ajax/libs/velocity/1.2.3/velocity.min.js
// @grant				GM_setValue
// @grant				GM_getValue
// @grant				GM_deleteValue
// @grant				unsafeWindow
// @grant				GM_openInTab
// @run-at				document-start
// ==/UserScript==


/*************************************************************************************
 * Open source libraries.
 *************************************************************************************/

/*************************************************************************************
 * This one adds arrayBuffer support to jQuery's ajax method.
 * -------------------------
 * jquery.binarytransport.js
 * @description. jQuery ajax transport for making binary data type requests.
 * @version 1.0
 * @author Henry Algus <henryalgus@gmail.com>
 *************************************************************************************/

// use this transport for "binary" data type
$.ajaxTransport( "+binary", function (options, originalOptions, jqXHR)
{
	if ( window.FormData &&
		 (options.dataType && options.dataType == "binary"
		  || options.data && (window.ArrayBuffer && options.data instanceof ArrayBuffer
							  || window.Blob && options.data instanceof Blob)) )
	{
		return {
			send  : function (headers, callback)
			{
				var xhr                                             = new XMLHttpRequest,
					url                                             = options.url,
					type                                            = options.type,
					async                                           = options.async || true,
					dataType = options.responseType || "blob", data = options.data || null,
					username                                        = options.username || null,
					password                                        = options.password || null;
				xhr.addEventListener( "load", function ()
				{
					var data                 = {};
					data[ options.dataType ] = xhr.response;
					callback( xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders() )
				} );
				xhr.open( type, url, async, username, password );
				for (var i in headers)
				{
					xhr.setRequestHeader( i, headers[ i ] );
				}
				xhr.responseType = dataType;
				xhr.send( data )
			},
			abort : function () {jqXHR.abort()}
		}
	}
} );


/*************************************************************************************
 * Tsumino Enhanced
 *************************************************************************************/

// Establish Tsumino Enhanced
(function (w, $)
{
	// Main object - Metadata
	var TE                = {
		name           : GM_info[ "script" ][ "name" ],
		version        : GM_info[ "script" ][ "version" ],
		status         : {},
		updateLocation : "https://openuserjs.org/scripts/Tobias.Kelmandia/Tsumino_Enhanced"
	};
	TE.status.pagesLoaded = {};

	// Tsumino Enhanced Configuration
	TE.config = {
		debug        : true,
		verboseDebug : true,
		pfRange      : 1,
		preload      : true
	};

	// User's current location.
	TE.myLocation = w.location.href;


	/*************************************************************************************
	 * User Configuration
	 *************************************************************************************/
	TE.User = {};
	(function ()
	{
		if ( GM_getValue( "TE_settings" ) )
		{
			var TE_settings = GM_getValue( "TE_settings" );
			TE.User         = JSON.parse( TE_settings );
		}
	})();

	/*************************************************************************************
	 * Detect which features the user's browser has.
	 *************************************************************************************/
	TE.ft = {};
	TE.ft.logGroups = typeof w.console.group === 'function';


	/*************************************************************************************
	 * Tsumino Site Configuration.
	 *************************************************************************************/

		// Define prefixes for all major site pages.
	TE.site = {
		account    : {
			prefix : "/Account/Home",
			regex  : "(\/Account\/Home*)"
		},
		auth       : {
			prefix : "/Read/Auth/",
			regex  : "(\/Read\/Auth\/[\\s\\S]*)"
		},
		baseURL    : {root : TE.myLocation.split( ".com" )[ 0 ] + ".com"},
		book       : {
			prefix : "/Book/Info/",
			regex  : "(\/Book\/Info\/[\\s\\S]*)"
		},
		browse     : {
			prefix : "/Browse/Index/",
			regex  : "(\/Browse\/[\\s\\S]*)||(\/*)"
		},
		error      : {
			prefix : "/Error/Index/",
			regex  : "(\/Error\/Index\/[\\s\\S]*)"
		},
		image      : {
			prefix : "/Image/Object/?data=",
			regex  : "(\/Image\/Object\/\\?data=[\\s\\S]*)"
		},
		login      : {
			prefix : "/Account/Login",
			regex  : "(\/Account\/Login[\\s\\S]*)"
		},
		manageTags : {
			prefix : "/Account/ManageTags",
			regex  : "(\/Account\/ManageTags[\\s\\S]*)"
		},
		reader     : {
			prefix : "/Read/View/",
			regex  : "(\/Read\/View\/[\\s\\S]*)"
		},
		search     : {
			prefix : "/Search",
			regex  : "(\/Search[\\s\\S]*)"
		},
		forum      : {
			prefix : "/Forum",
			regex  : "(\/Forum[\\s\\S]*)"
		}
	};

	var temp              = TE.site.baseURL.root;
	TE.site.baseURL.regex = temp.replace( /([.*+?\^=!:${}()\|\[\]\/\\])/g, "\\$1" );

	// Location Checking object.
	TE.on = {};

	// Create full URLs and do location checking.
	for (var key in TE.site)
	{
		if ( TE.site.hasOwnProperty( key ) )
		{
			var obj = TE.site[ key ];
			if ( obj.hasOwnProperty( "prefix" ) )
			{
				// Create Full URLs.
				obj[ "url" ] = TE.site.baseURL.root + obj[ "prefix" ];

				// Perform location checking.
				if ( obj[ "prefix" ] )
				{
					TE.on[ key ] = !!RegExp( "^(" + TE.site.baseURL.regex + ")" + obj[ "regex" ] + "$" ).test( TE.myLocation );
				}
			}
		}
	}

	TE.on[ "tsumino" ] = !!RegExp( "^(" + TE.site.baseURL.regex + ")([\\s\\S]*)$" ).test( TE.myLocation );

	// Prepare prefetch.
	TE.status.prefetch = {};

	/*************************************************************************************
	 * Utility Functions
	 *************************************************************************************/
	TE.fn = TE.prototype = {
		// Logging to console with Timestamps.
		log             : function ()
		{
			if ( (arguments.length > 0) && (TE.config.debug) )
			{
				var date  = new Date(), hr, min, sec, mil, timeStamp;
				hr        = date.getHours();
				min       = date.getMinutes();
				sec       = date.getSeconds();
				mil       = date.getMilliseconds();
				timeStamp = hr + ":" + min + ":" + sec + ":" + mil;
				if ( TE.ft.logGroups )
				{
					if ( arguments[ 0 ] == "gname" )
					{
						console.group( arguments[ 1 ] + " - [" + timeStamp + "]" );
						for (var i = 2 ; i < arguments.length ; ++i)
						{
							console.log( arguments[ i ] );
						}
					}
					else
					{
						console.group( timeStamp );
						for (var i = 0 ; i < arguments.length ; ++i)
						{
							console.log( arguments[ i ] );
						}
					}
					console.groupEnd();
				}
				else
				{
					if ( arguments[ 0 ] == "gname" )
					{
						console.log( "----- " + arguments[ 1 ] + " -----" );
						for (var i = 0 ; i < arguments.length ; ++i)
						{
							console.log( arguments[ i ] );
						}
					}
					else
					{
						console.log( "[" + timeStamp + "]" );
						for (var i = 0 ; i < arguments.length ; ++i)
						{
							console.log( arguments[ i ] );
						}
					}
					console.log();
				}
			}
		},
		vbLog           : function ()
		{
			if ( TE.config.verboseDebug )
			{
				if ( arguments.length > 0 )
				{
					this.log.apply( this.log, arguments );
				}
			}
		},
		errorMsg        : function (code, situation, error)
		{
			this.log( "gname", TE.name, "An error was detected while:", situation, "Error Code: " + code, error );
		},
		replaceAll      : function (str, find, replace)
		{
			// Escape regex.
			find = find.replace( /([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1" );
			return str.replace( new RegExp( find, 'g' ), replace );
		},
		load            : function (pageNumber, imageUrl)
		{
			var dfd = jQuery.Deferred(), authUrl = TE.site.baseURL.root + TE.site.auth.prefix + TE.book.id + "/" + pageNumber;

			if ( (TE.status.pagesLoaded[ pageNumber ] != "working") && (TE.status.pagesLoaded[ pageNumber ] != "done") )
			{
				TE.status.pagesLoaded[ pageNumber ] = "working";
				$( "#te_readerMessageDisplay" ).append( `
				<div id="te_loading_message" class="ui segment"><br />
				<div class="ui active dimmer"><div class="ui text loader">Loading...</div></div><br /></div>
				` );

				this.vbLog( "gname", "TE.load", "Loading Image: " + pageNumber + "...", TE.site.baseURL.root + imageUrl );
				var downloadStart = new Date();
				// Make an ajax request expecting a binary (arraybuffer) datatype.
				var loadImage = $.ajax( {
					method           : "GET",
					url              : imageUrl,
					dataType         : "binary",
					processData      : false,
					responseType     : 'arraybuffer',
					success          : $.proxy( function (data, textStatus, request)
					{
						// Put the response headers into an array.
						var rh = loadImage.getAllResponseHeaders(), rha = rh.split( "\r\n" );

						// Create a proper object from the response header array.
						var responseHeader = {};
						for (var i = 0 ; i < rha.length ; i++)
						{
							var thisRH = rha[ i ];
							thisRH     = thisRH.split( ": " );
							if ( thisRH[ 0 ] != "" )
							{
								responseHeader[ thisRH[ 0 ] ] = thisRH[ 1 ];
							}
						}

						// Local logging to examine response headers.
						//TE.vbLog("gname","TE.fn.load","Response Headers",responseHeader);

						// Content-Type is undefined if Tsumino requires us to solve a captcha.
						if ( typeof responseHeader[ "Content-Type" ] === "undefined" )
						{
							// Redirect to the auth page.
							w.location.href = authUrl;
						}
						else
						{
							var downloadComplete = new Date();
							TE.vbLog( "gname", "TE.load", "Content Type: " + responseHeader[ "Content-Type" ] );

							// If we're dealing with a JPEG image.
							// (Why is it 'images/jpeg' instead of 'image/jpeg'? Typo by Tsumino devs?)
							if ( responseHeader[ "Content-Type" ] == "images/jpeg" )
							{
								TE.vbLog( "gname", "TE.load", "Image data loaded.", "Running conversions..." );
								var startTime = new Date();

								// Use Uint8Array to view the arrayBuffer response data.
								var typedArray = new Uint8Array( data );

								// Determine number of bytes for the assembly loop.
								var numBytes     = typedArray.length;
								var binaryString = "";

								// Convert it into a useable binary string.
								for (i = 0 ; i < numBytes ; i++)
								{
									binaryString = binaryString + String.fromCharCode( typedArray[ i ] );
								}

								// And finally encode the binary string as base64.
								var encodedBS = btoa( binaryString );

								var endTime     = new Date();
								var dlTime      = downloadComplete - downloadStart;
								var runTime     = endTime - startTime;
								var dlTimeDISP  = dlTime + "ms";
								var runTimeDISP = runTime + "ms";
								if ( dlTime >= 1000 )
								{ dlTimeDISP = (dlTime / 1000) + "s"; }
								if ( runTime >= 1000 )
								{ runTimeDISP = (runTime / 1000) + "s"; }
								TE.vbLog( "gname", "TE.load", "Conversions completed.",
									"Image downloaded in: " + dlTimeDISP + ".", "Total time spent on conversion: " + runTimeDISP + "." );

								// Take the base64 string and prepend it so it can be used as a dataURI.
								var dataURI = "data:image/jpeg;base64," + encodedBS;

								// Add a hidden image to the page so the dataURI can be harvested from its source later.
								$( "body" ).append( "<img id='te_loadImage_" + pageNumber + "' src='" + dataURI + "' style='display:none;'>" );

								// And we're done.
								this.vbLog( "gname", "TE.load", "Image " + pageNumber + " loaded." );
								$( "#te_loading_message" ).remove();
								TE.status.pagesLoaded[ pageNumber ] = "done";
								dfd.resolve();
							}
						}
					}, this ), error : $.proxy( function (request, status, error)
					{
						this.log( "gname", "TE.load", "Error retrieving image.", request, status, error );
					}, this )
				} );
			}
			else if ( TE.status.pagesLoaded[ pageNumber ] == "working" )
			{
				var checkAgain = function ()
				{
					setTimeout( function ()
					{
						if ( TE.status.pagesLoaded[ pageNumber ] == "done" )
						{
							dfd.resolve();
						}
						else
						{
							checkAgain();
						}
					}, 500 );
				};

				checkAgain();
			}
			else if ( TE.status.pagesLoaded[ pageNumber ] == "done" )
			{
				dfd.resolve();
			}
			return dfd.promise();
		},
		prefetch        : {
			init : function (pageNumber)
			{
				var dfd = jQuery.Deferred();
				TE.vbLog( "gname", "Prefetch Init", "Initializing..." );
				var pfRange = TE.config.pfRange, pfStart = (pageNumber - pfRange), pfEnd = (pageNumber + pfRange);
				if ( pfStart < 1 )
				{
					pfStart = 1;
				}
				if ( pfEnd > TE.book.totalPages )
				{
					pfEnd = TE.book.totalPages;
				}
				var thisRange = pfEnd - pfStart;
				if ( thisRange == 1 )
				{
					thisRange++;
				}

				var timestamp                   = new Date().getTime();
				TE.status.prefetch[ timestamp ] = 0;

				TE.vbLog( "gname", "Prefetch Init", "Base: " + pageNumber, "Start: " + pfStart, "End: " + pfEnd );
				for (var i = pfStart ; i <= pfEnd ; i++)
				{
					if ( TE.status.prefetch[ TE.book.id ][ i ] == "" )
					{
						$.when( this.get( i ) ).then( function ()
						{
							TE.status.prefetch[ timestamp ]++;
							if ( TE.status.prefetch[ timestamp ] == thisRange )
							{
								dfd.resolve();
							}
						} );
					}
				}
				return dfd.promise();
			},
			get  : function (pageNumber)
			{
				TE.status.prefetch[ TE.book.id ][ pageNumber ] = "working";
				var dfd                                        = jQuery.Deferred();
				var url                                        = TE.site.baseURL.root + TE.site.reader.prefix + TE.book.id + "/" + pageNumber;
				TE.vbLog( "gname", "Prefetch", url );
				$.get( url ).done( function (data)
				{
					data                                           = TE.fn.scrubAjaxData( data );
					var pfImg                                      = $( data ).find( "img.reader-img" );
					var pfImgSrc                                   = $( pfImg ).attr( "data-content" );
					TE.status.prefetch[ TE.book.id ][ pageNumber ] = pfImgSrc;
					TE.vbLog( "gname", "Prefetch", "Prefetched image src for page " + pageNumber, TE.site.baseURL.root + pfImgSrc );
					if ( TE.config.preload )
					{
						$.when( TE.fn.load( pageNumber, pfImgSrc ) ).then( function ()
						{
							dfd.resolve();
						} );
						//TE.fn.load(pageNumber, pfImgSrc);
					}
					else
					{
						dfd.resolve();
					}
				} );
				return dfd.promise();
			}
		},
		camelize        : function (str)
		{
			return str.replace( /(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index)
			{
				if ( +match === 0 )
				{
					return "";
				}
				return index == 0 ? match.toLowerCase() : match.toUpperCase();
			} );
		},
		updateSettings  : function ()
		{
			GM_setValue( "TE_settings", JSON.stringify( TE.User ) );
		},
		checkForUpdates : function ()
		{
			if ( !TE.User.tsuminoEnhanced )
			{
				TE.User.tsuminoEnhanced = {};
				TE.updateSettings();
			}
			if ( !TE.User.tsuminoEnhanced.lastUpdateCheck )
			{
				TE.User.tsuminoEnhanced.lastUpdateCheck = 0;
				TE.updateSettings();
			}
			if ( !TE.User.tsuminoEnhanced.latestVersion )
			{
				TE.User.tsuminoEnhanced.latestVersion = TE.version;
				TE.User.tsuminoEnhanced.upToDate      = true;
				this.updateSettings();
			}

			if ( TE.User.tsuminoEnhanced.latestVersion != TE.version )
			{
				TE.User.tsuminoEnhanced.upToDate = false;
				this.updateSettings();
			}
			else
			{
				TE.User.tsuminoEnhanced.upToDate = true;
				this.updateSettings();
			}

			var now       = parseInt( new Date().getTime() );
			var oneMinute = 60000;
			var oneHour   = oneMinute * 60;
			var oneDay    = oneHour * 24;

			if ( typeof TE.User.tsuminoEnhanced === "undefined" )
			{
				TE.User.tsuminoEnhanced                 = {};
				TE.User.tsuminoEnhanced.lastUpdateCheck = parseInt( new Date().getTime() );
				TE.User.tsuminoEnhanced.upToDate        = true;
				this.updateSettings();
			}

			if ( now >= (parseInt( TE.User.tsuminoEnhanced.lastUpdateCheck ) + oneHour) )
			{
				$( document ).ready( function ()
				{
					$( "body" ).append( "<iframe height='0' width='0' src='" + TE.updateLocation
										+ "' id='te_updateCheckFrame' style='display:none;'></iframe>" );
				} );
			}
		},
		scrubAjaxData   : function (data)
		{
			data = TE.fn.replaceAll( data, "src=", "data-content=" );
			data = TE.fn.replaceAll( data, "script", "div" );
			data = TE.fn.replaceAll( data, "type=", "data-notype=" );
			data = TE.fn.replaceAll( data, "link", "div" );
			return data;
		}
	};


	// Alias specific commonly used utility functions to the main namespace.
	TE.log            = TE.fn.log;
	TE.vbLog          = TE.fn.vbLog;
	TE.errorMsg       = TE.fn.errorMsg;
	TE.replaceAll     = TE.fn.replaceAll;
	TE.prefetch       = TE.fn.prefetch;
	TE.load           = TE.fn.load;
	TE.updateSettings = TE.fn.updateSettings;

	/*************************************************************************************
	 * Tsumino Enhanced User Interface settings.
	 * Stylesheets, data URI, etc.
	 *************************************************************************************/
		// User Interface object.
	TE.ui = {};

	/* Tsumino Enhanced CSS.
	 ** Minified so it's easier to include in the script.
	 **
	 ** Beautify here:	http://www.cleancss.com/css-beautify/
	 ** Minify here:		http://cssminifier.com/
	 */
	TE.ui.css        = {};
	TE.ui.css.master = `
	.te_mainColor { color:#22a7f0; }
	.te_en_incompatible{background-color:rgba(255,0,0,.1);border:2px solid rgba(255,0,0,0);border-radius:5px;padding:.5em}
	@font-face { font-family: "Icons";
	src: url("https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.8/themes/default/assets/fonts/icons.eot");
	src: url("https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.8/themes/default/assets/fonts/icons.eot?#iefix")
	format("embedded-opentype"),
	url("https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.8/themes/default/assets/fonts/icons.woff2") format("woff2"),
	url("https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.8/themes/default/assets/fonts/icons.woff") format("woff"),
	url("https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.8/themes/default/assets/fonts/icons.ttf") format("truetype"),
	url("https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.1.8/themes/default/assets/fonts/icons.svg#icons") format("svg");
	font-style: normal; font-weight: normal; font-variant: normal; text-decoration: inherit; text-transform: none; }
	`;


	// Browsing Tweaks CSS.
	TE.ui.css.browsingTweaks = {};

	// Browsing tweaks - Master CSS.
	TE.ui.css.browsingTweaks.master = `
	.te_browsetweak_infobutton,.te_browsetweak_readbutton {
		position:absolute;border:3px solid #fff;bottom:10px;
		padding:10px;margin-left:5%;margin-right:5%;
		font-size:17px;color:#fff;width:42.5%;display:inline-block;
		text-decoration:none;box-sizing:border-box }
	.te_browsetweak_readbutton{right:0;box-sizing:border-box}
	.te_browsetweak_infobutton:focus,.te_browsetweak_readbutton:focus{text-decoration:none}
	.te_browsetweak_infobutton:hover,.te_browsetweak_infobutton:visited,
	.te_browsetweak_readbutton:hover,.te_browsetweak_readbutton:visited
		{background-color:#22a7f0;color:#fff;text-decoration:none}
	.te_browsetweak_infobutton{left:0}
		`;

	// More Books CSS.
	TE.ui.css.browsingTweaks.moreBooks =
		`
		@media(min-width:768px) { .overlay-title { font-size:.8em; } .col-sm-4 { width: 25% } }
		@media(min-width:992px) { .col-md-3 { width: 20% } }
		`;

	// Record Keeper CSS.
	TE.ui.css.recordKeeper = `
		.te_recordKeeper_finished:hover { border: 3px solid rgba(0,125,0,.8) !important; }
		.te_recordKeeper_started:hover { border: 3px solid rgba(190,190,90,.8) !important; }
	`;

	// Tsumino Enhanced Favicon Data URI
	TE.ui.favicon
		= `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADNQTFRFGhoaIqfwHD1QHmGFIIS7H3KgGyw1GyMnIY3JHU9rIZbWHlh4Ip/jHDVCIHuuH2qTHUZdxJ5l4gAAAcBJREFUeNrsmdFygyAQRbcCAiqY///apm2qqIBkdDFN73lkBA4O7K5IBAAAAADwssiPMxEQgAAEIHBEQDUB85h90KqmVhM+bM4RWHSeBZqgVUytsmAMCEDgz50CBCIIQAACFwkAAMDL0kSqwqoRDwL/RsDJBCYr0KW62QMLTRIROK8ggAAEIHC5wOWBCLkAAkS6idJnBVS8U3twqYePoYAABCDwpgKaV6AVUYLru8hfDBnv1JwYocdpsoEuSUYy8nemnkDb2GFOPBUF7hMLJbvlzuorCNyzr/DriX9x5ZvwwVMLHuXOdfW8B0uq4uWx2Zm+bDTPJlB4U2/5BGzJYIPmE9BDwWCK+ARIFQzWcgq4517A+QJkNn2NFCb1AhgE7GLm/ruuX2zNkXgF9FdQ84+ZfxDhSJ1OCJwWit3ayMdroVrJ6DZkCxxuASczJ4BfwK2jgqGKAtpuEoPR1QRa67dHSW7nZxHQVpndCMj6BuJlUE/VBGLfJV2ivufZA9uyxGuqKbCuzLpb8lGmUzAuo5+m2gJhYaSy91xccWBKgN7lH2SLhF3B6lkFbvfiVxRcMh68kcztQ0sAAAAAeHc+BRgAUX8aiFKipZUAAAAASUVORK5CYII=`;

	TE.ui.mainColor = "#22a7f0";

	/*************************************************************************************
	 * Classes
	 *************************************************************************************/


	/*************************************************************************************
	 * Class: Enhancement
	 *************************************************************************************/
	TE.Enhancement = {
		/*************************************************************************************
		 * Class:     Enhancement
		 * Subclass: main
		 *
		 * Master Enhancement class.
		 *
		 * name:          Name of the Enhancement. String only.
		 * description:     Description of the Enhancement.
		 *                    Can be a string or boolean false.
		 *                    False will indicate no description.
		 * options:          Should be an object collection of option subclasses, or boolean false.
		 *                    False will indicate no options.
		 *                    If no options are provided:
		 *                         - The Enhancement will not appear on the configuration page.
		 *                         - The Enhancement will be activated automatically.
		 *                    If options is not false, one option must use the "enable" key.
		 * section:          The section of the config page the Enhancement will appear in.
		 * incompatible: Array of Enhancements that this one is incompatible with.
		 * fn:               Object containing all actual Enhancement functionality.
		 *                    "init" key should be used for activation.
		 *                    "upgradeHandling" key should be used for upgrade handling.
		 *
		 * TE.Enhancement.main(name,displayName,description,options,section,incompatible,fn)
		 *************************************************************************************/
		main   : function (name, description, options, section, incompatible, fn)
		{
			try
			{
				if ( typeof name !== "string" )
				{
					throw new Error( "Enhancement name must be defined as a string." );
				}
				if ( (typeof description !== "string") && (description != false) )
				{
					throw new Error( "Enhancement description must be defined as a string." );
				}
				if ( (typeof options !== "object") && (options != false) )
				{
					throw new Error( "Enhancement options must be defined as an object." );
				}
				if ( (options != false) || (section != false) )
				{
					if ( typeof section !== "string" )
					{
						throw new Error( "Enhancement section must be defined as a string." );
					}
				}
				if ( (typeof incompatible !== "object") && (incompatible != false) )
				{
					throw new Error( "Enhancement incompatibilities must be defined as 'false', or an array." );
				}

				if ( typeof fn !== "object" )
				{
					throw new Error( "Enhancement functionality must be defined as an object." );
				}

				this.name         = name;
				this.shortName    = TE.fn.camelize( name );
				this.description  = description;
				this.options      = options;
				this.section      = section;
				this.incompatible = incompatible;
				this.fn           = fn;
			}
			catch (error)
			{
				TE.errorMsg( "CD01", "Creating an Enhancement class object.", error );
			}
		}, /*************************************************************************************
		 * Class:     Enhancment
		 * Subclass: option
		 *************************************************************************************/
		option : {
			/*************************************************************************************
			 * Master Class:     Enhancment
			 * Parent Class:     option
			 * Subclass:          main
			 *
			 * Primary Option class.
			 *
			 * type:               The type of the Option.
			 *                    Must be a string of one of the following:
			 *                    "enable" - Switch that enables the Enhancement.
			 *                         Options of this type require no further parameters.
			 *                    "toggle" - Renders a checkbox.
			 *                    "radio" - Radio buttons. Requires arguments.
			 *                    "dropdown" - Dropdown menu. Requires arguments.
			 * name:          Name of the option.
			 * description:     Description of the Option.
			 *                    Can be a string or boolean false.
			 *                    False will indicate no description.
			 * defaultValue: The default value of the option.
			 * params:     Must be an object of the "params" subclass, or boolean false.
			 *                    False indicates no params.
			 *
			 * TE.Enhancement.option.main(type,name,description,defaultValue,arguments)
			 *************************************************************************************/
			main   : function (type, name, description, defaultValue, params)
			{
				try
				{
					if ( typeof type !== "string" )
					{
						throw new Error( "Option type must be defined as a string." );
					}
					if ( type != "enable" )
					{
						if ( typeof name !== "string" )
						{
							throw new Error( "Option name must be defined as a string." );
						}
						if ( typeof description === "undefined" )
						{
							description = false;
						}

						if ( type == "toggle" )
						{
						}
						if ( (type == "dropdown") && (typeof v !== "object") )
						{
							throw new Error( "You must define params for option type dropdown." );
						}
						if ( (type == "radio") && (typeof params !== "object") )
						{
							if ( typeof params === "undefined" )
							{
								throw new Error( "You must define params for option type radio." );
							}
						}
						if ( type == "dropdown" )
						{
							if ( typeof params === "undefined" )
							{
								throw new Error( "Option params must be defined with type dropdown." );
							}
						}

						this.type         = type;
						this.name         = name;
						this.shortName    = TE.fn.camelize( name );
						this.description  = description;
						this.defaultValue = defaultValue;
						this.params       = params;
					}
					else
					{
						this.type         = type;
						this.name         = "enable";
						this.shortName    = "enable";
						this.description  = false;
						this.defaultValue = false;
						this.params       = false;
					}
				}
				catch (error)
				{
					TE.errorMsg( "CD02", "Creating an Enhancement.option.main class object.", error );
				}
			}, /*************************************************************************************
			 * Master Class:     Enhancment
			 * Parent Class:     option
			 * Subclass:          params
			 *
			 * params for radio and dropdown type options.
			 *
			 * type:               The type of the param.
			 *                    Must be a string of one of the following:
			 *                         "range" - For generating a
			 *************************************************************************************/
			params : function (type, options)
			{
				try
				{
					if ( typeof type !== "string" )
					{
						throw new Error( "Type must be defined as a string." );
					}
					if ( type == "range" )
					{
						if ( typeof options !== "object" )
						{
							throw new Error( "options must be defined as an object." );
						}
						else
						{
							if ( typeof options.rangeStart !== "number" )
							{
								throw new Error( "Range start must be defined as a number." );
							}
							if ( typeof options.rangeEnd !== "number" )
							{
								throw new Error( "Range end must be defined as a number." );
							}
						}
					}
					else
					{
						throw new Error( "Range is the only acceptable type right now." );
					}

					this.type   = type;
					this.params = params;
				}
				catch (error)
				{
					TE.log( "gname", "ERROR", "Error defining params class:", error );
					TE.errorMsg( "CD03", "Creating an Enhancement.option.params class object.", error );
				}
			}
		}
	};


	//Fix the navbar.
	TE.fixNavbar = function ()
	{
		$( "nav .tsumino-nav-items li" ).click( function ()
		{
			var thisLink = $( this ).find( "a:first" )[ 0 ];

			if ( $( thisLink ).text() == "Browse " )
			{
				$( "#te_navMenu" ).toggleClass( "tsumino-nav-visible" );
			}
			else if ( $( thisLink ).prop( "id" ) == "te_configNavLink" )
			{
				$( '#te_config_modal' )
					.modal( 'show' )
					.modal( 'refresh' );
			}
			else
			{
				window.location.href = $( thisLink ).prop( "href" );
			}
		} );
	};

	/*************************************************************************************
	 * Enhance Page - Core Functionality
	 *  + Creates IDs for important elements.
	 *  + Gathers data for storage in the TE object.
	 *************************************************************************************/
	TE.enhancePage = function ()
	{
		var dfd = jQuery.Deferred();
		TE.vbLog( "gname", "TE.enhancePage", "Started working..." );
		$( document ).ready( function ()
		{
			/*************************************************************************************
			 * All pages.
			 *************************************************************************************/

			if ( !TE.on.forum )
			{

				$( "head" )
				// Include Semantic CSS
					.prepend( "<link rel='stylesheet' href='http://js.codingtoby.com/semantic.min.css' />" )
					// Apply Tsumino Enhanced CSS.
					.append( "<style>" + TE.ui.css.master + "</style>" );


				// Prepare config modal
				$( "body" ).append( '<div id="te_config_modal" class="ui fullscreen basic modal"></div>' );
				TE.settings.render();

				// The navigation bar at the top.
				$( "nav" ).attr( "id", "te_siteNavbar" );

				// Replace favicon.
				$( "link[rel='icon']" ).attr( "href", TE.ui.favicon );


				// Add Tsumino Enhanced config link to navbar.
				var navbar = $( ".tsumino-nav-left" )[ 0 ];
				$( navbar ).attr( "id", "te_navbarMain" );
				$( "#te_navbarMain" ).append( `
					<li><a href='javascript:;' style='color:` + TE.ui.mainColor + ` !important;' id='te_configNavLink'>ENHANCED</a></li>
					` );
				$( "#te_configNavLink" ).click( function ()
				{
					$( '#te_config_modal' ).modal( 'show' );
					$( '#te_config_modal' ).modal( 'refresh' );
				} );

				// Add ID to browse button link and swap href from # to javascript:;.
				var browseButton = $( "#te_navbarMain" ).find( "a[href=#]" )[ 0 ];
				$( browseButton ).prop( "id", "te_navBrowse" );
				$( "#te_navBrowse" ).prop( "href", "javascript:;" );

				// Add ID to nav menu.
				var navMenu = $( "#te_navBrowse" ).siblings()[ 0 ];
				$( navMenu ).prop( "id", "te_navMenu" );
				TE.fixNavbar();


				if ( !TE.User.tsuminoEnhanced.upToDate )
				{
					$( "#te_configNavLink" ).append( "&nbsp;&nbsp;<i class='ui red icon upload'></i>" );
					$( "#te_configNavLink" ).parent().popup( {
						title : 'An update is available!'
					} );
					$( w ).load( function ()
					{
						$( "#te_configNavLink" ).parent().css( "background-color", "#333333" );
						setTimeout( function ()
						{
							$( "#te_configNavLink" ).parent()
													.velocity( {backgroundColor : "#2D5467"} )
													.velocity( {backgroundColor : "#333333"} )
													.velocity( {backgroundColor : "#2D5467"} )
													.velocity( {backgroundColor : "#333333"} );
						}, 1 );
					} );
				}

				// ID the primary content area.
				var pageContent = $( "div.container-fluid" )[ 0 ];
				$( pageContent ).attr( "id", "te_pageContent" );

				var footer = $( "div.nav-footer" )[ 0 ];
				$( footer ).attr( "id", "te_page_footer" );
			}

			/*************************************************************************************
			 * Book & Reader
			 *************************************************************************************/
			if ( TE.on.reader || TE.on.book )
			{
				// Create the book object.
				TE.book = {};

				// Reader only.
				if ( TE.on.reader )
				{
					// Create IDs.
					$( ".reader-page" ).attr( "id", "te_readerPageMain" );
					var imageBlock = $( "#te_readerPageMain" ).children()[ 0 ];
					$( imageBlock ).attr( "id", "te_imageBlock" );
					$( ".reader-btn" ).attr( "id", "te_readerButtonContainer" );
					$( "img.reader-img" ).attr( "id", "te_readerCurrentImage" );

					var readInfo = TE.myLocation;
					readInfo     = readInfo.replace( TE.site.reader.url, "" );
					readInfo     = readInfo.split( "/" );

					// Book ID.
					TE.book.id = parseInt( readInfo[ 0 ] );

					// Book title.
					var bookTitle = $( "title" ).text();
					TE.book.title = bookTitle.replace( "Tsumino - Free Premium Doujinshi and Hentai Manga: Read ", "" );

					// Pagination setup.
					var pagination = $( "#te_readerButtonContainer" ).find( "h1" )[ 0 ];
					$( pagination ).attr( "id", "te_readerPagination" );
					var pagesInfo = $( "#te_readerPagination" ).text();
					pagesInfo     = pagesInfo.split( " Page " )[ 1 ];
					pagesInfo     = pagesInfo.split( " of " );

					// Current Page.
					TE.book.currentPage    = parseInt( pagesInfo[ 0 ] );
					TE.book.currentPageURL = TE.site.reader.prefix + TE.book.id + "/" + TE.book.currentPage;

					$( "title" ).text( "Tsumino - " + TE.book.title + " - Page " + TE.book.currentPage );

					// Origin page.
					TE.book.originPage = TE.book.currentPage;

					// Total Pages.
					TE.book.totalPages = parseInt( pagesInfo[ 1 ] );

					// Next page.
					TE.book.nextPage = TE.book.currentPage + 1;
					if ( TE.book.nextPage > TE.book.totalPages )
					{
						TE.book.nextPage = false;
					}
					else
					{
						TE.book.nextPageURL = TE.site.reader.prefix + TE.book.id + "/" + TE.book.nextPage;
					}

					// Previous page.
					TE.book.prevPage = TE.book.currentPage - 1;
					if ( TE.book.prevPage == 0 )
					{
						TE.book.prevPage = false;
					}
					else
					{
						TE.book.prevPageURL = TE.site.reader.prefix + TE.book.id + "/" + TE.book.prevPage;
					}

					// Rewrite pagination section.
					$( "#te_readerPagination" ).before( '<div id="te_readerMessageDisplay" style="margin-bottom: 25px;"></div>' );
					$( "#te_readerPagination" ).html( "Page <span id='te_currentPage'></span> of <span id='te_totalPages'></span>" );
					$( "#te_currentPage" ).html( TE.book.currentPage );
					$( "#te_totalPages" ).html( TE.book.totalPages );

					// Rename Return button to 'book info' and give it an ID.
					var bookInfoButton = $( "a[href*='" + TE.site.book.prefix + "']:contains('RETURN')" );
					$( bookInfoButton ).attr( "id", "te_bookInfoButton" );
					$( "#te_bookInfoButton" ).text( "BOOK INFO" );

					// Add a return button that takes you to the index.
					$( "#te_bookInfoButton" ).after( `
						<a class='book-read-button button-stack' id='te_returnToIndexButton'><i class='fa fa-home'></i> BACK TO INDEX</a>
						` );
					var returnToIndexLink = sessionStorage.getItem( 'te_returnLink' );
					if ( typeof returnToIndexLink === "object" )
					{
						$( "#te_returnToIndexButton" ).attr( "href", TE.site.baseURL.root );
					}
					else
					{
						$( "#te_returnToIndexButton" ).attr( "href", returnToIndexLink );
					}


					// Enhance Previous Page button.
					if ( $( "a:contains(' PREV')" ).length )
					{
						$( "a:contains(' PREV')" ).attr( "id", "te_prevButton" );
					}
					else
					{
						$( "#jump-page" ).before( `
							<a id="te_prevButton" class="book-read-button button-stack" style="margin-right: 10px;"><i class="fa fa-arrow-left"></i> PREV</a>
							` );
						$( "#te_prevButton" ).css( "display", "none" );
					}
					$( "#te_prevButton" ).attr( "href", TE.book.prevPageURL );
					if ( TE.book.currentPage > 1 )
					{
						$( "#te_prevButton" ).css( "display", "inline" );
					}
					else
					{
						$( "#te_prevButton" ).css( "display", "none" );
					}

					// Enhance Next Page Button
					if ( $( "a:contains('NEXT ')" ).length )
					{
						$( "a:contains('NEXT ')" ).attr( "id", "te_nextButton" );
					}
					else
					{
						$( "#jump-page" ).after( `
							<a id="te_nextButton" class="book-read-button button-stack">NEXT <i class="fa fa-arrow-right"></i></a>
							` );
						$( "#te_nextButton" ).css( "display", "none" );
					}
					$( "#te_nextButton" ).attr( "href", TE.book.nextPageURL );
					if ( TE.book.currentPage < TE.book.totalPages )
					{
						$( "#te_nextButton" ).css( "display", "inline" );
					}
					else
					{
						$( "#te_nextButton" ).css( "display", "none" );
					}

					// Enhance Image link.
					var imageLink = $( "#te_readerCurrentImage" ).parent();
					$( imageLink ).attr( "id", "te_imageLink" );
					$( "#te_imageLink" ).attr( "href", TE.book.nextPageURL );

					TE.vbLog( "gname", "TE.book", TE.book );
				}
				else if ( TE.on.book )
				{
					var readInfo = TE.myLocation;
					readInfo     = readInfo.replace( TE.site.book.url, "" );
					readInfo     = readInfo.split( "/" );

					// Book ID.
					TE.book.id = parseInt( readInfo[ 0 ] );

					// Fix tag display bug causing unwanted line breaks.
					$( ".book-tag:contains(' ')" ).css( "white-space", "nowrap" );
					$( ".book-tag:contains('-')" ).css( "white-space", "nowrap" );

					// Read Online button.
					$( "a.book-read-button:contains(' READ ONLINE')" ).attr( "id", "te_readOnlineButton" );

					var indexButton = $( "a:contains(' BACK TO INDEX')" );
					$( indexButton ).attr( "id", "te_backToIndexButton" );
					var returnToIndexLink = sessionStorage.getItem( 'te_returnLink' );
					if ( typeof returnToIndexLink !== "object" )
					{
						$( "#te_backToIndexButton" ).attr( "href", returnToIndexLink );
					}
				}
			}
			if ( TE.on.browse )
			{
				sessionStorage.setItem( 'te_returnLink', TE.myLocation );

				var browsePage         = $( "div.browse-page" );
				var ctProper           = $( "div.row.push-in" );
				var bookshelfContainer = $( ctProper ).children()[ 0 ];
				$( bookshelfContainer ).attr( "id", "te_bookshelfContainer" );
				var sidebarContainer = $( ctProper ).children()[ 1 ];
				$( sidebarContainer ).attr( "id", "te_sidebarContainer" );

				var bookshelf = $( browsePage ).find( "div.row.row-no-padding" );
				$( bookshelf ).attr( "id", "te_bookshelf" );
				$( bookshelf ).children().each( function ()
				{
					var thisLinkUrl = $( this ).find( "a.overlay-button" ).attr( "href" );
					var temp        = thisLinkUrl.replace( TE.site.book.prefix, "" );
					temp            = temp.split( "/" );
					var thisBookID  = temp[ 0 ];
					$( this ).attr( "id", "te_book_" + thisBookID + "_masterContainer" );

					$( this ).find( "div.book-grid-item" ).attr( "id", "te_book_" + thisBookID + "_container" );

					var thisOverlay = $( "#te_book_" + thisBookID + "_container" ).find( "div.overlay" );
					$( thisOverlay ).attr( "id", "te_book_" + thisBookID + "_overlay" );

					var thisData = $( "#te_book_" + thisBookID + "_overlay" ).find( "div.overlay-data" );
					$( thisData ).attr( "id", "te_book_" + thisBookID + "_data" );

					var thisPages = $( "#te_book_" + thisBookID + "_data" ).find( "div.overlay-sub" );
					$( thisPages ).attr( "id", "te_book_" + thisBookID + "_pagesContainer" );

					var bottomTitle = $( this ).find( "a.title" );
					$( bottomTitle ).attr( "id", "te_book_" + thisBookID + "_bottomTitle" );
					$( "#te_book_" + thisBookID + "_bottomTitle" ).attr( "href", "javascript:;" );
				} );
				//TE.vbLog( "gname", "TE.enhancePage", bookshelf );
			}
			TE.vbLog( "gname", "TE.enhancePage", "Finished working." );
			dfd.resolve();
		} );

		return dfd.promise();
	};


	/*************************************************************************************
	 * Enhancement Code
	 * Create all Enhancements within anonymous functions.
	 *************************************************************************************/
		// Object for storing all Enhancements
	TE.Enhancements = {};

	/*******************************************************
	 * Hidden Enhancements
	 * Important functionality.
	 * Customization either not yet written or not required.
	 *******************************************************/


	/*******************************************************
	 * General Enhancements
	 *******************************************************/
	(function ()
	{
		/*******************************************************
		 * Unstickied Header - General Enhancement
		 *******************************************************/
		var name, shortName, description, options, section, incompatible, main;
		name         = "Unstickied Header";
		shortName    = TE.fn.camelize( name );
		description  = "The Tsumino navigation bar will no longer follow you as you scroll down.";
		options      = [];
		section      = "General";
		incompatible = false;
		main         = {
			init : function ()
			{
				this.run();
			},
			run  : function ()
			{
				$( "#te_siteNavbar" ).css( "position", "absolute" );
			}
		};
		//TE.Enhancement.option.main(type,name,description,defaultValue,arguments)
		var opt1 = {
			type         : "enable",
			name         : false,
			description  : false,
			defaultValue : false,
			arguments    : false
		};
		options.push( new TE.Enhancement.option.main( opt1.type, opt1.name, opt1.description, opt1.defaultValue, opt1.arguments ) );
		TE.Enhancements[ shortName ] = new TE.Enhancement.main( name, description, options, section, incompatible, main );
	})();


	(function ()
	{
		/*******************************************************
		 * Record Keeper - General Enhancement
		 *******************************************************/
		var name, shortName, description, options, section, incompatible, main;
		name         = "Record Keeper";
		shortName    = TE.fn.camelize( name );
		description  = `
		The aptly named Record Keeper Enhancement keeps a record of what Doujin you've read.<br />
		This record includes Doujin IDs, the last page you read, and whether or not you finished reading a Doujin.<br />
		While browsing, unread Doujin will retain the normal blue border.<br />
		Doujin you have started but haven't finished will have a yellow border.<br />
		Doujin you've finished reading will have a green border.<br />
		Additionally, the information overlay will now contain this information.<br />
		There will also be a 'Continue Reading' button on the book info page if you have previously read a Doujin past the first page.
		`;
		options      = [];
		section      = "General";
		incompatible = false;
		main         = {};


		main = {
			init : function ()
			{
				if ( typeof TE.User.recordKeeper.data !== "object" )
				{
					TE.User.recordKeeper.data = {};
					TE.updateSettings();
				}
				if ( TE.on.browse )
				{
					$.when( TE.status.enhancePage ).done( function ()
					{
						$( "style" ).append( TE.ui.css.recordKeeper );
						TE.log( "gname", name, "Initializining..." );
						for (var key in TE.User.recordKeeper.data)
						{
							if ( TE.User.recordKeeper.data.hasOwnProperty( key ) )
							{
								var obj = TE.User.recordKeeper.data[ key ];
								if ( obj[ "finished" ] )
								{
									$( "#te_book_" + key + "_pagesContainer" ).append( "<br />Finished!" );
									$( "#te_book_" + key + "_container" ).addClass( 'te_recordKeeper_finished' );
									$( "#te_book_" + key + "_bottomTitle" ).css( "border-top", "3px solid rgba(0,125,0,.8)" );
								}
								if ( (obj[ "lastSeen" ] > 1) && (!obj[ "finished" ]) )
								{
									$( "#te_book_" + key + "_pagesContainer" ).text( "Read " + obj[ "lastSeen" ] + " / " + obj[ "totalPages" ]
																					 + " pages." );
									$( "#te_book_" + key + "_container" ).addClass( 'te_recordKeeper_started' );
									$( "#te_book_" + key + "_bottomTitle" ).css( "border-top", "3px solid rgba(190,190,90,.8)" );
								}
							}
						}
					} );
				}
				if ( TE.on.book )
				{
					$.when( TE.status.enhancePage ).done( $.proxy( function ()
					{
						TE.log( "gname", name, "Initializining..." );
						if ( typeof TE.User.recordKeeper.data[ TE.book.id ] === "object" )
						{
							if ( TE.User.recordKeeper.data[ TE.book.id ][ "lastSeen" ] > 1 )
							{
								//TE.User.recordKeeper.data[ TE.book.id ][ "lastSeen" ];
								var oldButton       = $( "#te_readOnlineButton" ).html();
								var starOver        = oldButton.replace( " READ ONLINE", " START OVER" );
								var continueReading = oldButton.replace( " READ ONLINE", " CONTINUE READING" );
								$( "#te_readOnlineButton" ).html( starOver );
								var resumeUrl = TE.site.reader.url + TE.book.id + "/" + TE.User.recordKeeper.data[ TE.book.id ][ "lastSeen" ];
								$( "#te_readOnlineButton" ).before( `
									<a id='te_resumeButton' class='book-read-button button-stack' href='` + resumeUrl + `'></a>
								` );
								$( "#te_resumeButton" ).html( continueReading );
							}
						}
					}, this ) );
				}
				if ( TE.on.reader )
				{
					$.when( TE.status.enhancePage ).done( $.proxy( function ()
					{
						TE.log( "gname", name, "Initializining..." );
						if ( typeof TE.User[ shortName ].data !== "object" )
						{
							TE.User[ shortName ].data = {};
						}
						if ( typeof TE.User[ shortName ].data[ TE.book.id ] !== "object" )
						{
							TE.User[ shortName ].data[ TE.book.id ] = {
								totalPages : TE.book.totalPages, lastSeen : TE.book.currentPage, finished : false
							};
						}
						this.update();
					}, this ) );
				}
			},

			update : function ()
			{
				TE.User[ shortName ].data[ TE.book.id ].lastSeen = TE.book.currentPage;
				if ( !TE.User[ shortName ].data[ TE.book.id ][ "finished" ] )
				{
					if ( TE.book.totalPages == TE.book.currentPage )
					{
						TE.User[ shortName ].data[ TE.book.id ][ "finished" ] = true;
					}
				}
				TE.updateSettings();
			}
		};

		//TE.Enhancement.option.main(type,name,description,defaultValue,arguments)
		var opt1 = {
			type         : "enable",
			name         : false,
			description  : false,
			defaultValue : false,
			arguments    : false
		};
		var opt2 = {
			type         : "toggle",
			name         : "Show Messages",
			description  : "Displays loading messages while preparing images for display.",
			defaultValue : true,
			arguments    : false
		};
		options.push( new TE.Enhancement.option.main( opt1.type, opt1.name, opt1.description, opt1.defaultValue, opt1.arguments ) );
		//options.push(new TE.Enhancement.option.main(opt2.type,opt2.name,opt2.description,opt2.defaultValue,opt2.arguments));

		TE.Enhancements[ shortName ] = new TE.Enhancement.main( name, description, options, section, incompatible, main );
	})();


	(function ()
	{
		/*******************************************************
		 * Browse Tags Lite - Browsing Enhancement
		 *******************************************************/
		var name, shortName, description, options, section, incompatible, main;
		name         = "Browse Tags Lite";
		shortName    = TE.fn.camelize( name );
		description  = `Adds a new link to Tsumino's browse menu. "ALL TAGS (LITE)"<br />
						Clicking it launches the Browse Tags Lite modal window.<br />
						Tags are sorted alphabetically and categorized by the first letter.<br />
						Click a letter at the top to view tags that start with that letter.<br />
						The tag list is downloaded automatically the first time you open BTL.`;
		options      = [];
		section      = "Browsing";
		incompatible = false;
		main         = {
			init             : function ()
			{
				var firstLoad = true;
				$.when( TE.status.enhancePage ).then( $.proxy( function ()
				{
					$( "ul#te_navMenu" ).append( '<li id="te_browseTagsLite_menuLink"><a>All Tags (Lite)</a></li>' );

					var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
					alphabet     = alphabet.split( "" );

					$( "body" ).append( `
					<div id="te_browseTagsLite_modal" class="ui fullscreen long basic modal">
						<button id="te_btl_closeModal" class="ui icon button right floated"><i class="remove icon"></i></button>
						<div class="header"><h1><span class="te_mainColor">Browse Tags Lite</span></h1></div>
						<div id="te_browseTagsLite_modalBody" class="content" style="font-size: 1.4em;">
							<div id="te_btl_mainDisplay">

							</div>
						</div>
					</div>
					` );

					$( "#te_browseTagsLite_modalBody" ).prepend( '<div id="te_browseTagsLite_tabs" class="ui top attached inverted large tabular menu"></div>' );


					/*
					 $( "#te_browseTagsLite_tabs" ).prepend( `<a class="item te_btl_tabButton" data-tab="te_btl_tab_all">*</a>` );
					 $( "#te_btl_mainDisplay" ).append( `
					 <div id="te_btl_tab_all" class="ui bottom attached inverted tab segment" data-tab="te_btl_tab_all">
					 <h1>ALL</h1>
					 Tags go here
					 </div>
					 ` );
					 */


					// Populate button list
					for (var i = 0 ; i < alphabet.length ; i++)
					{
						$( "#te_browseTagsLite_tabs" ).append(
							`<a id="te_btl_btn_` + alphabet[ i ] + `" class="item te_btl_tabButton" data-tab="te_btl_tab_` + alphabet[ i ] + `">`
							+ alphabet[ i ] + `</a>` );
						$( "#te_btl_mainDisplay" ).append( `
							<div id="te_btl_tab_` + alphabet[ i ] + `" class="ui bottom attached inverted tab segment" data-tab="te_btl_tab_`
														   + alphabet[ i ] + `">
							</div>
							` );
					}
					$( "#te_browseTagsLite_tabs" ).append( `
						<a id="te_btl_btn_reload" class="icon item"><i class="icon refresh" style="color:` + TE.ui.mainColor + `"></i></a>
						` );

					// Check to see if the user has a copy of the tag list.
					if ( TE.User.tsuminoEnhanced.tagList )
					{
						this.renderTagList();
						$( "#te_btl_btn_B" ).addClass( "active" );
						$( "#te_btl_tab_B" ).addClass( "active" );
					}

					$( "#te_btl_btn_reload" ).click( $.proxy( function ()
					{
						$( "#te_btl_btn_reload" ).addClass( "disabled" );
						$( "#te_browseTagsLite_modal" ).append( `
							<div id="te_btl_downloadingTagListLoader">
								<div class="ui active dimmer">
									<div class="ui text loader">Downloading Tag List...</div>
								</div>
							</div>
						` );
						$.when( this.updateTagList() ).then( $.proxy( function ()
						{
							$( "#te_btl_downloadingTagListLoader" ).remove();
							$( "#te_btl_btn_reload" ).removeClass( "disabled" );
							this.renderTagList();
							$( "#te_btl_btn_A" ).addClass( "active" );
							$( "#te_btl_tab_A" ).addClass( "active" );
						}, this ) );
					}, this ) );


					// Initialize tabs.
					$( '.tabular.menu .item' ).tab();

					// Initialize modal.
					$( "#te_browseTagsLite_modal" ).modal(
						{
							onVisible      : function ()
							{
								if ( !TE.User.tsuminoEnhanced.tagList )
								{
									$( "#te_btl_btn_reload" ).click();
								}

								if ( firstLoad )
								{
									$( "#te_browseTagsLite_modal" ).modal( 'refresh' );
									$( "#te_btl_btn_A" ).click();
									firstLoad = false;
								}
							},
							observeChanges : true
						} );

					$( "#te_browseTagsLite_menuLink" ).click( function ()
					{
						$( "#te_browseTagsLite_modal" ).modal( 'show' );
					} );

					$( ".te_btl_tabButton" ).click( function ()
					{
						$( "#te_browseTagsLite_modal" ).modal( 'refresh' );
					} );

					// Close button
					$( "#te_btl_closeModal" ).click( function ()
					{
						$( "#te_browseTagsLite_modal" ).modal( 'hide' );
					} );


					$( "#te_btl_btn_reload" ).popup( {
						title : 'Reload the Tag List from the Server'
					} );


				}, this ) );
			}, updateTagList : function ()
			{
				var dfd                     = jQuery.Deferred();
				TE.status.tagListDownloaded = false;
				TE.status.tagListPage       = 1;
				TE.status.tagList           = [];

				bean.on( TE.status.tagList, "completed", function ()
				{
					TE.log( "gname", "Browse Tags Lite", "Tag list downloaded." );
					TE.status.tagListDownloaded     = true;
					TE.User.tsuminoEnhanced.tagList = TE.status.tagList;
					TE.updateSettings();
					dfd.resolve();
				} );

				this.loadTagPages( TE.status.tagListPage );

				TE.log( "gname", "Browse Tags Lite", "Retrieving tags..." );
				return dfd.promise();
			},
			loadTagPages     : function (pageNum)
			{
				if ( !TE.status.tagListDownloaded )
				{
					$.ajax( {
						method  : "GET",
						url     : TE.site.baseURL.root + TE.site.browseTags.prefix,
						data    : {infpage : pageNum},
						success : $.proxy( function (data)
						{
							if ( data.trim() != "" )
							{
								data = TE.fn.scrubAjaxData( data );
								$( data ).find( "a" ).each( function ()
								{
									TE.status.tagList.push( $( this ).text() );
								} );
								TE.status.tagListPage++;
								this.loadTagPages( TE.status.tagListPage );
							}
							else
							{
								bean.fire( TE.status.tagList, "completed" );
							}
						}, this ),
						error   : function () {}
					} );
				}
			},
			renderTagList    : function ()
			{
				var numTags         = 0;
				var tagCounter      = [];
				var thisTag         = "";
				var urlFormattedTag = "";
				var thisTagUrl      = "";
				var idFormattedTag  = "";
				var thisTagFL       = "";
				var alphabet        = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
				alphabet            = alphabet.split( "" );

				for (var i = 0 ; i < alphabet.length ; i++)
				{
					tagCounter[ alphabet[ i ] ] = 0;
					$( "#te_btl_tab_" + alphabet[ i ] ).html( `
						<h1>` + alphabet[ i ] + `</h1>
						<hr />` );

					$( "#te_btl_tab_" + alphabet[ i ] ).removeClass( "active" );
					$( "#te_btl_btn_" + alphabet[ i ] ).removeClass( "active" );
				}

				for (var i = 0 ; i < TE.User.tsuminoEnhanced.tagList.length ; i++)
				{
					numTags++;
					thisTag = TE.User.tsuminoEnhanced.tagList[ i ];
					thisTag = thisTag.trim();
					thisTag = thisTag.replace( /\w\S*/g, function (txt)
					{
						return txt.charAt( 0 ).toUpperCase() + txt.substr( 1 ).toLowerCase();
					} );

					urlFormattedTag = TE.fn.replaceAll( thisTag, " ", "+" );
					thisTagUrl      = TE.site.baseURL.root + "/Browse/Tag?name=" + urlFormattedTag;
					idFormattedTag  = TE.fn.replaceAll( thisTag, " ", "_" );
					thisTagFL       = thisTag.charAt( 0 );
					tagCounter[ thisTagFL ]++;
					$( "#te_btl_tab_" + thisTagFL ).append( `
						<a class="book-tag" id="te_btl_tagLink_"` + idFormattedTag + `" href="` + thisTagUrl + `">` + thisTag + `</a>
						<br />
						` );
				}

				// Remove links from empty sections and add tag counters to populated sections.
				for (i = 0 ; i < alphabet.length ; i++)
				{
					if ( tagCounter[ alphabet[ i ] ] == 0 )
					{
						$( "#te_btl_tab_" + alphabet[ i ] ).append( "<br />No tags that start with '" + alphabet[ i ] + "'.<br />" );
					}
				}
			}

		};

		//TE.Enhancement.option.main(type,name,description,defaultValue,arguments)
		var opt1 = {
			type         : "enable",
			name         : false,
			description  : false,
			defaultValue : false,
			arguments    : false
		};
		options.push( new TE.Enhancement.option.main( opt1.type, opt1.name, opt1.description, opt1.defaultValue, opt1.arguments ) );
		TE.Enhancements[ shortName ] = new TE.Enhancement.main( name, description, options, section, incompatible, main );
	})();

	(function ()
	{
		/*******************************************************
		 * Browsing Tweaks - Browsing Enhancement
		 *******************************************************/
		var name, shortName, description, options, section, incompatible, main;
		name         = 'Browsing Tweaks';
		shortName    = TE.fn.camelize( name );
		description  = "A collection of customizations to browsing.";
		options      = [];
		section      = "Browsing";
		incompatible = false;
		main         = {};

		main = {
			init : function ()
			{
				if ( TE.on.browse )
				{
					$.when( TE.status.enhancePage ).done( function ()
					{
						if ( typeof TE.User[ shortName ] !== "undefined" )
						{
							if ( TE.User[ shortName ].removeSidebar )
							{
								$( "#te_sidebarContainer" ).remove();
								$( "#te_bookshelfContainer" ).css( "width", "100%" );
							}
							if ( TE.User[ shortName ].thumbnailLinks )
							{
								$( "div.overlay" ).each( function ()
								{
									$( this ).on( "mousedown", $.proxy( function (e)
									{
										// Only fire if the div itself is clicked, ignoring children.
										if ( e.target == this )
										{
											// Left Mouse
											if ( (e.which == 1) )
											{
												TE.vbLog( "Left mouse button clicked." );
												if ( TE.User[ shortName ].skipInfo )
												{
													var thisLink = $( this ).find( "a.te_browsetweak_readbutton" ).attr( "href" );
												}
												else
												{
													var thisLink = $( this ).find( "a.overlay-button" ).attr( "href" );
												}
												thisLink = TE.site.baseURL.root + thisLink;
												if ( e.ctrlKey )
												{
													w.open( thisLink );
												}
												else
												{
													w.location.href = thisLink;
												}

											}

											// Middle Mouse
											if ( (e.which == 2) )
											{
												TE.vbLog( "Middle mouse button clicked." );
												if ( TE.User[ shortName ].skipInfo )
												{
													var thisLink = $( this ).find( "a.te_browsetweak_readbutton" ).attr( "href" );
												}
												else
												{
													var thisLink = $( this ).find( "a.overlay-button" ).attr( "href" );
												}
												thisLink = TE.site.baseURL.root + thisLink;
												w.open( thisLink );
											}
										}
										e.preventDefault();
									}, this ) );
								} );
							}
							if ( TE.User[ shortName ].moreBooks )
							{
								$( "style" ).append( "@media(min-width:768px) { .overlay-title { font-size:.8em; } .col-sm-4 { width: 25% } }" );
								$( "style" ).append( "@media(min-width:992px) { .col-md-3 { width: 20% } }" );
							}
							if ( TE.User[ shortName ].skipInfo )
							{
								// Apply new CSS.
								$( "style" ).append( TE.ui.css.browsingTweaks.master );
								$( "div.overlay" ).each( function ()
								{
									// Get Book ID
									var bookID = $( this ).attr( "id" );
									bookID     = bookID.replace( "te_book_", "" );
									bookID     = bookID.replace( "_overlay", "" );
									bookID     = parseInt( bookID );

									// Replace old class on view button.
									var viewInfoButton = $( this ).find( "a.overlay-button" );
									$( viewInfoButton ).text( "INFO" );
									var viewButtonSrc = $( viewInfoButton )[ 0 ][ 'outerHTML' ];
									$( viewInfoButton ).removeClass( "overlay-button" );
									$( viewInfoButton ).addClass( "te_browsetweak_infobutton" );

									// Add new read button.
									var readButtonSrc = viewButtonSrc.replace( "INFO", "READ" );
									readButtonSrc     = readButtonSrc.replace( "class=\"overlay-button\"", "class=\"te_browsetweak_readbutton\"" );
									$( this ).append( readButtonSrc );
									var readButton = $( this ).find( "a.te_browsetweak_readbutton" );
									var linkURL    = TE.site.reader.prefix + bookID + "/1";
									$( readButton ).attr( "href", linkURL );

									if ( TE.User.recordKeeper )
									{
										if ( TE.User.recordKeeper.data[ bookID ] )
										{
											linkURL = TE.site.reader.prefix + bookID + "/" + TE.User.recordKeeper.data[ bookID ][ 'lastSeen' ];
											$( readButton ).attr( "href", linkURL );
										}
									}
								} );
							}
							if ( TE.User[ shortName ].fitTitles )
							{
								$( "div.overlay" ).each( function ()
								{
									var thisTitle   = $( this ).find( ".overlay-title" ).text();
									var titleLength = thisTitle.split( "" );
									titleLength     = titleLength.length;
									if ( (titleLength > 40) && (titleLength < 50) )
									{
										$( this ).find( ".overlay-title" ).css( "font-size", ".75em" );
									}
									else if ( (titleLength > 50) )
									{
										$( this ).find( ".overlay-title" ).css( "font-size", ".65em" );
									}
								} );
							}
						}
					} );
				}
			}
		};

		//TE.Enhancement.option.main(type,name,description,defaultValue,arguments)
		var opt1 = {
			type         : "toggle",
			name         : "Remove Sidebar",
			description  : "Removes the &quot;random picks&quot; sidebar.",
			defaultValue : false,
			arguments    : false
		};
		var opt2 = {
			type         : "toggle",
			name         : "More Books",
			description  : "Displays one extra book per row.",
			defaultValue : false,
			arguments    : false
		};
		var opt3 = {
			type         : "toggle",
			name         : "Thumbnail Links",
			description  : "Clicking anywhere on the thumbnail image will load the Doujin.",
			defaultValue : false,
			arguments    : false
		};
		var opt4 = {
			type         : "toggle",
			name         : "Skip Info",
			description  : "Skips the book info page and takes you directly to the reader.",
			defaultValue : false,
			arguments    : false
		};
		var opt5 = {
			type         : "toggle",
			name         : "Fit Titles",
			description  : "Makes sure doujin titles fit appropriately.",
			defaultValue : false,
			arguments    : false
		};

		options.push( new TE.Enhancement.option.main( opt1.type, opt1.name, opt1.description, opt1.defaultValue, opt1.arguments ) );
		options.push( new TE.Enhancement.option.main( opt2.type, opt2.name, opt2.description, opt2.defaultValue, opt2.arguments ) );
		options.push( new TE.Enhancement.option.main( opt3.type, opt3.name, opt3.description, opt3.defaultValue, opt3.arguments ) );
		options.push( new TE.Enhancement.option.main( opt4.type, opt4.name, opt4.description, opt4.defaultValue, opt4.arguments ) );
		options.push( new TE.Enhancement.option.main( opt5.type, opt5.name, opt5.description, opt5.defaultValue, opt5.arguments ) );
		TE.Enhancements[ shortName ] = new TE.Enhancement.main( name, description, options, section, incompatible, main );
	})();


	/*******************************************************
	 * Reader Enhancements
	 *******************************************************/
	(function ()
	{
		/*******************************************************
		 * Automatic Repositioning - Reader Enhancement
		 *******************************************************/
		var name, shortName, description, options, section, incompatible, main;
		name         = "Automatic Repositioning";
		shortName    = TE.fn.camelize( name );
		description  = "Automatically scrolls you to the top of the image.";
		options      = [];
		section      = "Reader";
		incompatible = false;
		main         = {
			init   : function ()
			{
				if ( TE.on.reader )
				{
					$.when( TE.status.enhancePage ).done( $.proxy( function ()
					{
						TE.Enhancements.unstickiedHeader.fn.run();
						this.run();
					}, this ) );
				}
			}, run : function ()
			{
				var imgPos = $( "#te_imageBlock" ).offset().top;
				$( 'html, body' ).animate( {scrollTop : imgPos}, 300 );
			}
		};

		var opt1 = {
			type         : "enable",
			name         : false,
			description  : false,
			defaultValue : false,
			arguments    : false
		};
		options.push( new TE.Enhancement.option.main( opt1.type, opt1.name, opt1.description, opt1.defaultValue, opt1.arguments ) );
		TE.Enhancements[ shortName ] = new TE.Enhancement.main( name, description, options, section, incompatible, main );
	})();


	(function ()
	{
		/*******************************************************
		 * Seamless Viewing - Reader Enhancement
		 *******************************************************/
		var name, shortName, description, options, section, incompatible, main;
		name         = "Seamless Viewing";
		shortName    = TE.fn.camelize( name );
		description  = `Negates the need to load the entire Tsumino webpage again every time you flip through a Doujin.<br />
			This means faster load times, and not losing sight of the previous page until the instant the new page is loaded.<br />
			Seamless Viewing leaves the previous image in place until the new one is ready.<br />
			Once the new image is ready, you are automatically scrolled up to the top of the image.`;
		options      = [];
		section      = "Reader";
		incompatible = [ "Infinity Scrolling" ];
		main         = {};

		main = {
			replaceKeybinds : function ()
			{
				// Disable default Tsumino Reader Keybinds.
				unsafeWindow.$( document ).off( "keydown" );

				// Use Classic Seamless Viewing keybinds instead.
				$( document ).keydown( $.proxy( function (e)
				{
					var bk  = $.proxy( function ()
					{
						this.changePage( TE.book.prevPage );
					}, this );
					var fwd = $.proxy( function ()
					{
						this.changePage( TE.book.nextPage );
					}, this );
					if ( (!e.ctrlKey) && (!e.altKey) )
					{
						switch (e.which)
						{
							case 87: // w
								w.scrollBy( 0, -100 );
								break;
							case 83: // s
								w.scrollBy( 0, 100 );
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
				}, this ) );
			}, changePage   : function (pageNumber)
			{
				var dfd = jQuery.Deferred();

				function changePageCommon(pageNumber)
				{
					pageNumber = parseInt( pageNumber );
					// Update page and location variables.
					TE.book.currentPage = pageNumber;
					TE.book.prevPage    = pageNumber - 1;
					TE.book.nextPage    = pageNumber + 1;
					if ( TE.book.nextPage > TE.book.totalPages )
					{
						TE.book.nextPage = false;
					}
					if ( TE.book.prevPage <= 0 )
					{
						TE.book.prevPage = false;
					}
					TE.book.currentPageURL = TE.site.reader.prefix + TE.book.id + "/" + TE.book.currentPage;

					// Get the dataURI from the source of loader's hidden image.
					var newImageSrc = $( "#te_loadImage_" + pageNumber ).attr( "src" );
					//var newImageSrc = TE.site.image.prefix + TE.book.id + "/" + TE.book.currentPage;

					// Remove the loader's hidden image.
					$( "#te_readerCurrentImage" ).attr( "src", newImageSrc );

					// Reposition.
					TE.Enhancements.automaticRepositioning.fn.run();

					// If Record Keeper is Enabled.
					if ( TE.User.recordKeeper.enable )
					{
						TE.Enhancements.recordKeeper.fn.update();
					}

					// If Page Jumper is Enabled.
					if ( TE.User.pageJumper.enable )
					{
						$( "#te_pageJumper" ).val( pageNumber );
						$( '#te_pageJumper' ).dropdown( 'set selected', pageNumber );
					}

					// Prefetch new pages.
					TE.fn.prefetch.init( TE.book.currentPage );

					// Update title.
					$( "title" ).text( "Tsumino - " + TE.book.title + " - Page " + TE.book.currentPage );

					// Update links.
					this.updateLinks();

					// Update history and window location.
					if ( (!history.state) || (history.state && history.state.pageNumber != TE.book.currentPage) )
					{
						w.history.pushState( {pageNumber : TE.book.currentPage}, $( "title" ).text(), TE.book.currentPageURL );
						TE.log( w.history );
					}
					TE.log( "gname", name, "Image " + pageNumber + " has been placed in the reader." );
					dfd.resolve();
				}

				var cpc = changePageCommon.bind( this );
				// Make sure the page is in range first.
				if ( (pageNumber <= TE.book.totalPages) && (pageNumber > 0) )
				{
					if ( TE.status.pagesLoaded[ pageNumber ] == "done" )
					{
						cpc( pageNumber );
					}
					else
					{
						if ( (TE.status.prefetch[ TE.book.id ][ pageNumber ] != "") && (TE.status.prefetch[ TE.book.id ][ pageNumber ] != "working") )
						{
							TE.status.load = TE.load( pageNumber, TE.status.prefetch[ TE.book.id ][ pageNumber ] );
							// Once the requested page is loaded, continue.
							$.when( TE.status.load ).then( $.proxy( function ()
							{
								if ( TE.status.pagesLoaded[ pageNumber ] == "done" )
								{
									TE.log( "CPC going" );
									cpc( pageNumber );
								}
								else
								{
									TE.log( "CPC ERROR" );
								}
							}, this ) );
						}
						else
						{
							TE.log( "gname", name, "Prefetch is still initializing..." )
						}
					}
				}
				// If the user requested a page that was less than 1 or greater than the total number of pages, stop.
				else
				{
					if ( pageNumber == false )
					{
						w.location.href = TE.site.book.url + TE.book.id;
					}
					TE.log( "gname", "Seamless Viewing", "Image " + pageNumber + " is out of range and will not be loaded." );
					dfd.resolve();
				}
				return dfd.promise();
			}, updateLinks  : function ()
			{
				TE.vbLog( "gname", name, "Updating links... " );
				// Remove old click binds from links.
				$( "#te_prevButton" ).off( "click" );
				$( "#te_nextButton" ).off( "click" );
				$( "#te_imageLink" ).off( "click" );

				// Establish updated click binds.
				if ( TE.book.currentPage <= TE.book.totalPages )
				{
					$( "#te_nextButton" ).css( "display", "inline" );
					$( "#te_nextButton" ).click( $.proxy( function ()
					{
						this.changePage( TE.book.nextPage );
					}, this ) );
					$( "#te_imageLink" ).click( $.proxy( function ()
					{
						this.changePage( TE.book.nextPage );
					}, this ) );
				}
				if ( TE.book.currentPage == TE.book.totalPages )
				{
					$( "#te_nextButton" ).css( "display", "none" );
					$( "#te_imageLink" ).click( $.proxy( function ()
					{
						this.changePage( TE.book.nextPage );
					}, this ) );
				}

				if ( TE.book.currentPage > 1 )
				{
					$( "#te_prevButton" ).css( "display", "inline" );
					$( "#te_prevButton" ).click( $.proxy( function ()
					{
						this.changePage( TE.book.prevPage );
					}, this ) );

				}
				else
				{
					$( "#te_prevButton" ).css( "display", "none" );
				}

				$( "#te_currentPage" ).html( "<a href='" + TE.book.currentPageURL + "'>" + TE.book.currentPage + "</a>" );
			}, init         : function ()
			{
				if ( TE.on.reader )
				{
					$.when( TE.status.enhancePage ).done( $.proxy( function ()
					{
						w.history.replaceState( {pageNumber : TE.book.currentPage}, $( "title" ).text(), TE.book.currentPageURL );

						// Allow history navigation to work with Seamless Viewing.
						$( w ).on( "popstate", $.proxy( function ()
						{
							if ( history.state )
							{
								this.changePage( history.state.pageNumber );
							}
						}, this ) );

						TE.log( "gname", name, "Initializining..." );

						// Replace default Tsumino reader keybinds with Enhanced Seamless Viewing keybinds.
						this.replaceKeybinds();

						// Automatic Repositioning.
						TE.Enhancements.automaticRepositioning.fn.run();

						// Unstickied Header.
						TE.Enhancements.unstickiedHeader.fn.run();

						// Remove default Tsumino doujin navigation links.
						$( "#te_prevButton" ).attr( "href", "javascript:;" );
						$( "#te_nextButton" ).attr( "href", "javascript:;" );
						$( "#te_imageLink" ).attr( "href", "javascript:;" );

						// Prepare Prefetch
						TE.status.prefetch[ TE.book.id ] = {};
						for (var i = 1 ; i <= TE.book.totalPages ; i++)
						{
							TE.status.prefetch[ TE.book.id ][ i ] = "";
						}
						TE.fn.prefetch.init( TE.book.currentPage );

						// Update doujin navigation links.
						this.updateLinks();
						$( "body" ).append( "<img id='te_loadImage_" + TE.book.currentPage + "' style='display:none;'>" );

						// "Cache" the first image that loads for later.
						var originImage    = new Image();
						originImage.onload = function ()
						{
							var canvas    = document.createElement( 'canvas' );
							canvas.width  = this.naturalWidth;
							canvas.height = this.naturalHeight;
							canvas.getContext( '2d' ).drawImage( this, 0, 0 );
							var newSrc = canvas.toDataURL( 'image/jpeg' );
							$( "#te_loadImage_" + TE.book.currentPage ).attr( "src", newSrc );
						};
						originImage.src    = $( "#te_readerCurrentImage" ).attr( "src" );

					}, this ) );
				}
				else if ( TE.on.auth )
				{
					// Reserved
				}
			}
		};

		//TE.Enhancement.option.main(type,name,description,defaultValue,arguments)
		var opt1 = {
			type         : "enable",
			name         : false,
			description  : false,
			defaultValue : false,
			arguments    : false
		};
		var opt2 = {
			type         : "toggle",
			name         : "Show Messages",
			description  : "Displays loading messages while preparing images for display.",
			defaultValue : true,
			arguments    : false
		};

		options.push( new TE.Enhancement.option.main( opt1.type, opt1.name, opt1.description, opt1.defaultValue, opt1.arguments ) );
		//options.push(new TE.Enhancement.option.main(opt2.type,opt2.name,opt2.description,opt2.defaultValue,opt2.arguments));

		TE.Enhancements[ shortName ] = new TE.Enhancement.main( name, description, options, section, incompatible, main );
	})();


	(function ()
	{
		/*******************************************************
		 * Page Jumper - Reader Enhancement
		 *******************************************************/
		var name, shortName, description, options, section, incompatible, main;
		name         = "Page Jumper";
		shortName    = TE.fn.camelize( name );
		description  = "Adds a dropdown box to the Reader that lets you skip directly to a page.";
		options      = [];
		section      = "Reader";
		incompatible = false;
		main         = {};

		main = {
			init : function ()
			{
				if ( TE.on.reader )
				{
					$.when( TE.status.enhancePage ).done( $.proxy( function ()
					{
						$( "#te_readerPagination" ).after( `
							<h1 style='display:inline;'>Jump to page: </h1>
							<select class='ui compact search dropdown' id='te_pageJumper'></select><br />
							` );
						for (var i = 1 ; i <= TE.book.totalPages ; i++)
						{
							$( "#te_pageJumper" ).append( "<option value='" + i + "'>" + i + "</option>" );
						}
						$( "#te_pageJumper" ).val( TE.book.currentPage );

						$( "#te_pageJumper" ).change( $.proxy( function ()
						{
							// Seamless Viewing Compatibility
							if ( TE.User.seamlessViewing.enable )
							{
								var pageNumber = parseInt( $( "#te_pageJumper" ).val() );

								$.when( TE.fn.prefetch.init( pageNumber ) ).then( function ()
								{
									TE.Enhancements.seamlessViewing.fn.changePage( pageNumber );
								} );

							}
							// Vanilla Tsumino
							else
							{
								w.location.href = TE.site.reader.url + TE.book.id + "/" + pageNumber;
							}
						}, this ) );
						$( "#te_pageJumper" ).dropdown();
					}, this ) );
				}
			}
		};

		//TE.Enhancement.option.main(type,name,description,defaultValue,arguments)
		var opt1 = {
			type         : "enable",
			name         : false,
			description  : false,
			defaultValue : false,
			arguments    : false
		};
		options.push( new TE.Enhancement.option.main( opt1.type, opt1.name, opt1.description, opt1.defaultValue, opt1.arguments ) );

		TE.Enhancements[ shortName ] = new TE.Enhancement.main( name, description, options, section, incompatible, main );
	})();


	(function ()
	{
		/*******************************************************
		 * Infinity Scrolling - Reader Enhancement
		 *******************************************************/
		var name                  = "Infinity Scrolling",
			shortName             = TE.fn.camelize( name ),
			description           = "Scroll down to load images.",
			options = [], section = "Reader",
			incompatible          = [ "Seamless Viewing" ],
			main                  = {};

		main = {
			init : function ()
			{
				if ( TE.on.reader )
				{
					$.when( TE.status.enhancePage ).done( function ()
					{

					} );
				}
			}

		};

		//TE.Enhancement.option.main(type,name,description,defaultValue,arguments)
		var opt1 = {
			type         : "enable",
			name         : false,
			description  : false,
			defaultValue : false,
			arguments    : false
		};
		options.push( new TE.Enhancement.option.main( opt1.type, opt1.name, opt1.description, opt1.defaultValue, opt1.arguments ) );

		//TE.Enhancements[shortName] = new TE.Enhancement.main(name,description,options,section,incompatible,main);
	})();


	/*************************************************************************************
	 * Tsumino Enhanced Settings Page
	 *************************************************************************************/
	TE.settings = {
		render    : function ()
		{
			if ( !TE.User.readNews )
			{
				TE.User.readNews = {};
			}

			$( "#te_config_modal" ).html( "<div id='te_settings' style='font-size: 1.4em;'></div>" );
			$( "#te_config_modal" ).prepend( `
				<div class="header"><h1><span class="te_mainColor">Tsumino Enhanced</span>
				<span id="te_version" class="small">` + TE.version + `</span></h1></div>
				` );
			if ( !TE.User.tsuminoEnhanced.upToDate )
			{
				var installLocation = TE.updateLocation;
				installLocation     = installLocation.replace( "/scripts/", "/install/" );
				installLocation     = installLocation + ".user.js";
				//$("#te_version").append("&nbsp;&nbsp;-&nbsp;&nbsp;<a style='color:#ff0000; text-decoration:none;' href='" + installLocation + "'>Update!</a>");
				$( "#te_version" ).after( `&nbsp;&nbsp;
					<div id="te_updateButton" class="ui big labeled button" tabindex="0">
						<div class="ui red button"><i class="upload icon"></i>Update!</div><a class="ui basic red left pointing label">`
										  + TE.User.tsuminoEnhanced.latestVersion + `</a></div>` );
				//$("#te_config_modal").append("<a id='te_secretUpdateLink' style='display:none;' href='" + installLocation + "'>Update!</a>")
				$( "#te_updateButton" ).click( function ()
				{
					$( "body" ).append( `
					<div id="te_refresh_modal" class="ui basic modal"><i class="remove icon"></i>
					<div class="header" style="font-size: 3em;"><i class="upload icon"></i> Updating Tsumino Enhanced...</div>
					<div class="image content"><div class="image"><i class="refresh icon"></i></div>
					<div class="description" style="font-size: 1.5em;">
						<p>You will be prompted to install the update in just a moment.</p>
						<p>In order for the update to take effect, you must refresh this page after it has finished installing.</p>
						<p>Do you wish to refresh the page now?</p>
						</div></div>
					<div class="actions">
						<button id="te_refreshPageButton" class="massive fluid green ui button">Refresh</button>
					</div></div>` );
					$( "#te_config_modal" ).modal( 'hide' );
					$( "#te_refresh_modal" ).modal();
					$( "#te_refresh_modal" ).modal( 'show' );
					$( '#te_refresh_modal' ).modal( 'refresh' );
					setTimeout( function ()
					{
						w.location.href = installLocation;
					}, 5000 );
					$( "#te_refreshPageButton" ).click( function ()
					{
						w.location.reload();
					} );
				} );

				$( "#te_updateButton" ).popup( {
					title : 'Click here to begin the update process.'
				} );
			}

			// Settings page navigation structure.
			//$("#te_settings").prepend("<div id='te_tabContainer' class='te_configTab'><nav><ul><li id='tab_generalEnhancements'><a href='javascript:;'>General</a></li><li id='tab_browsingEnhancements'><a href='javascript:;'>Browsing</a></li><li id='tab_readerEnhancements'><a href='javascript:;'>Reader</a></li><li id='tab_teNews'><a href='javascript:;'>TE News</a></li><li id='tab_searchEnhancements'><a href='javascript:;'>Search</a></li></ul></nav></div>");

			$( "#te_settings" ).prepend( '<div id="te_settings_tabs" class="ui top attached inverted large tabular menu"></div>' );
			$( "#te_settings_tabs" ).append( '<a class="item active" data-tab="generalEnhancements">General Enhancements</a>' );
			$( "#te_settings_tabs" ).append( '<a class="item" data-tab="browsingEnhancements">Browsing Enhancements</a>' );
			$( "#te_settings_tabs" ).append( '<a class="item" data-tab="readerEnhancements">Reader Enhancements</a>' );
			$( "#te_settings_tabs" ).append( '<a class="item" data-tab="teAbout">About</a>' );

			$( "#te_settings" ).append( '<div id="te_settings_tab_generalEnhancements" class="ui bottom attached inverted tab segment active" data-tab="generalEnhancements"></div>' );
			$( "#te_settings" ).append( '<div id="te_settings_tab_browsingEnhancements" class="ui bottom attached inverted tab segment" data-tab="browsingEnhancements"></div>' );
			$( "#te_settings" ).append( '<div id="te_settings_tab_readerEnhancements" class="ui bottom attached inverted tab segment" data-tab="readerEnhancements"></div>' );
			$( "#te_settings" ).append( '<div id="te_settings_tab_teAbout" class="ui bottom attached tab segment inverted" data-tab="teAbout"></div>' );

			var tobyAvatar = "data:image/jpeg;base64,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";
			var tobyCard   = `

<div class="ui centered grid">
	<div class="seven wide column">
		<div class="ui fluid blue card">
			<div class="content">
				<h1 class="header">Tsumino Enhanced</h1>
				<div class="description">
					<table class="ui single line definition blue left aligned table">
						<tbody>
						<tr>
							<td class="left aligned">Current Version</td>
							<td>` + TE.version + `</td>
						</tr>
						<tr>
							<td class="left aligned">Latest Version</td>
							<td>` + TE.User.tsuminoEnhanced.latestVersion + `</td>
						</tr>
						<tr>
							<td>Changelog</td>
							<td><button id="te_tobyLinks_teChangelog" data-content="Check out the list of changes."
							class="ui large circular inverted blue icon button teTooltip"><i class="external icon"></i></button></td>
						</tr>
						<tr>
							<td>Requests &amp; Feedback</td>
							<td><button id="te_tobyLinks_teRaF" data-content="Influence TE's development."
							class="ui large circular inverted blue icon button teTooltip"><i class="external icon"></i></button></td>
						</tr>
						<tr class="top aligned">
							<td class="left aligned collapsing">Library Dependencies</td>
							<td>
								<ul class="ui list">
									<li class="teTooltip" data-content="General purpose library.">jQuery 2.1.14</li>
									<li class="teTooltip" data-content="Gives TE a nicer UI.">SemanticUI 2.1.8</li>
									<li class="teTooltip" data-content="Event management library.">Bean 1.0.15</li>
									<li class="teTooltip" data-content="A more versatile animation library.">Velocity 1.2.3</li>
								</ul>
							</td>
						</tr>
						<tr class="top aligned">
							<td class="left aligned">@grant Permissions</td>
							<td>
								<ul class="ui list">
									<li class="teTooltip" data-content="Used for saving your settings.">GM_setValue</li>
									<li class="teTooltip" data-content="Used for reading your settings.">GM_getValue</li>
									<li class="teTooltip" data-content="Used for cleaning up depreciated values.">GM_deleteValue</li>
									<li class="teTooltip" data-content="Used for opening links in new tabs.">GM_openInTab</li>
									<li class="teTooltip" data-content="Used for overriding Tsumino hotkeys.">unsafeWindow</li>
								</ul>
							</td>
						</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
	<div class="five wide column">
		<div class="ui purple card" style="width:280px;">
			<div class="image">
				<img src="` + tobyAvatar + `" />
			</div>
			<div class="content">
				<div class="header">Toby</div>
				<div class="meta">
					<a>Web Developer</a>
				</div>
				<div class="description">
					<p>I'm the guy that made this.</p>
				</div>
			</div>
			<div class="extra content">
				<button id="te_tobylinks_home" data-content="Visit my project blog!" class="ui large circular inverted violet icon button teTooltip">
					<i class="large home icon"></i>
				</button>
				<button id="te_tobylinks_github" data-content="Take a look at my GitHub profile!" class="ui large circular black icon button teTooltip">
					<i class="large github alternate icon"></i>
				</button>
				<button id="te_tobylinks_openuserjs" data-content="Check out my other userscripts!" class="ui large circular grey icon button teTooltip">
					<i class="large code icon"></i>
				</button>
				<button id="te_tobylinks_skype" data-content="Chat with me on Skype!" class="ui large circular inverted blue icon button teTooltip">
					<i class="large skype icon"></i>
				</button>
				<button id="te_tobylinks_tsuminopm" data-content="Send me a PM on the Tsumino Forums!" class="ui large circular inverted pink icon button teTooltip">
					<i class="large mail outline icon"></i>
				</button>
			</div>
		</div>
	</div>
</div>
			`;

			$( "#te_settings_tab_teAbout" ).append( tobyCard );

			$( "#te_tobyLinks_teChangelog" ).click( function ()
			{
				GM_openInTab( "http://codingtoby.com/category/userscripts/tsumino-enhanced/te-updates/" );
			} );
			$( "#te_tobyLinks_teRaF" ).click( function ()
			{
				GM_openInTab( "http://codingtoby.com/userscripts/tsumino-enhanced/requests-and-feedback/#comments" );
			} );
			$( "#te_tobylinks_home" ).click( function ()
			{
				GM_openInTab( "http://codingtoby.com/" );
			} );
			$( "#te_tobylinks_github" ).click( function ()
			{
				GM_openInTab( "https://github.com/tobiaskelmandia" );
			} );
			$( "#te_tobylinks_openuserjs" ).click( function ()
			{
				GM_openInTab( "https://openuserjs.org/users/Tobias.Kelmandia/scripts" );
			} );
			$( "#te_tobylinks_skype" ).click( function ()
			{
				w.location.href = "skype:tobias_kelmandia?chat";
			} );
			$( "#te_tobylinks_tsuminopm" ).click( function ()
			{
				GM_openInTab( "http://www.tsumino.com/Forum/ucp.php?i=pm&mode=compose&u=191" );
			} );

			// Initialize Tooltips
			$( ".teTooltip" ).popup();

			// Populate Sections.
			for (var key in TE.Enhancements)
			{
				if ( TE.Enhancements.hasOwnProperty( key ) )
				{
					var obj = TE.Enhancements[ key ];

					if ( obj[ "section" ] != false )
					{
						// Determine which section to append to.
						var sectionID = "";
						if ( obj[ "section" ] == "General" )
						{
							sectionID = "#te_settings_tab_generalEnhancements";
						}
						else if ( obj[ "section" ] == "Browsing" )
						{
							sectionID = "#te_settings_tab_browsingEnhancements";
						}
						else if ( obj[ "section" ] == "Reader" )
						{
							sectionID = "#te_settings_tab_readerEnhancements";
						}

						// Append the Enhancement's options group to the section.
						$( sectionID ).append( "<div id='" + obj[ "shortName" ] + "_group' class='te_optionGroup'></div>" );

						// Add the description.
						if ( obj[ "description" ] != false )
						{
							$( "#" + obj[ "shortName" ] + "_group" ).append( "<div class='te_optionDescription'>" + obj[ "description" ] + "</div>" );
						}

						// Add the primary options area.
						$( "#" + obj[ "shortName" ] + "_group" ).append( "<div id='te_options_" + obj[ "shortName" ] + "'></div>" );

						var noEnable = true;
						if ( obj[ "options" ] != false )
						{
							// Display all options.
							for (var oKey in obj[ "options" ])
							{
								if ( obj[ "options" ].hasOwnProperty( oKey ) )
								{
									var option = obj[ "options" ][ oKey ];
									// Write the Enable option.
									if ( option[ "type" ] == "enable" )
									{
										$( "#" + obj[ "shortName" ] + "_group" ).prepend( `
											<div class="ui middle aligned toggle checkbox">
												<input id="tes_` + obj[ "shortName" ] + `_enable" name="tes_` + obj[ "shortName" ] + `_enable"  type="checkbox">
												<label for="tes_` + obj[ "shortName" ] + `_enable">
													<a class="ui huge blue label">` + obj[ "name" ] + `</a>
												</label>
											 </div>` );


										$( "#enhancement_header_" + obj[ "shortName" ] ).click( {obj : obj}, function (event)
										{
											TE.log( $( "#tes_" + event.data.obj[ "shortName" ] + "_enable" ) );
											if ( $( "#tes_" + event.data.obj[ "shortName" ] + "_enable" ).prop( "checked" ) == true )
											{
												$( "#tes_" + event.data.obj[ "shortName" ] + "_enable" ).prop( "checked", false );
											}
											else
											{
												$( "#tes_" + event.data.obj[ "shortName" ] + "_enable" ).prop( "checked", true );
											}
										} );
										noEnable = false;
									}
									// Write Toggle Options.
									if ( option[ "type" ] == "toggle" )
									{
										$( "#te_options_" + obj[ "shortName" ] ).append( `<br />
											<div class="ui middle aligned toggle checkbox">
												<input id="tes_` + obj[ "shortName" ] + `_` + option[ "shortName" ] + `"
												name="tes_` + obj[ "shortName" ] + `_` + option[ "shortName" ] + `" type="checkbox" class="te_subOption" />
												<label for="tes_` + obj[ "shortName" ] + `_` + option[ "shortName" ] + `">
													<a class="ui huge blue label">` + option[ "name" ] + `</a>
												</label>
											</div>` );

										// Write the option's description.
										if ( option[ "description" ] != false )
										{
											$( "#" + obj[ "shortName" ] + "_optionContainer_" + option[ 'shortName' ] ).append( "<br />"
																																+ option[ "description" ] );
										}
									}
								}
							}
						}

						// If there was no "enable" option found:
						if ( noEnable )
						{
							// Display the title without a switch.
							$( "#" + obj[ "shortName" ] + "_group" ).prepend( "<h2 class='te_enhancementName'>" + obj[ "name" ] + "</h2>" );

							// Apply user settings.
							if ( typeof TE.User[ obj[ "shortName" ] ] !== "undefined" )
							{
								for (var oKey in obj[ "options" ])
								{
									var option = obj[ "options" ][ oKey ];
									if ( option[ "type" ] == "toggle" )
									{
										$( "#tes_" + obj[ "shortName" ] + "_" + option[ 'shortName' ] )
											.prop( "checked", TE.User[ obj[ "shortName" ] ][ option[ 'shortName' ] ] );
									}
								}
							}
						}
						else
						{
							// Apply user settings.
							if ( typeof TE.User[ obj[ "shortName" ] ] !== "undefined" )
							{
								for (var oKey in obj[ "options" ])
								{
									var option = obj[ "options" ][ oKey ];
									if ( TE.User[ obj[ "shortName" ] ][ "enable" ] == true )
									{
										if ( option[ "type" ] == "enable" )
										{
											$( "#tes_" + obj[ "shortName" ] + "_" + option[ 'shortName' ] ).prop( "checked", true );
										}
										else
										{
											if ( option[ "type" ] == "toggle" )
											{
												$( "#tes_" + obj[ "shortName" ] + "_" + option[ 'shortName' ] )
													.prop( "checked", TE.User[ obj[ "shortName" ] ][ option[ 'shortName' ] ] );
											}
										}
									}
									else
									{
										if ( option[ "type" ] != "enable" )
										{
											$( "#tes_" + obj[ "shortName" ] + "_" + option[ 'shortName' ] ).prop( "checked", false );
											$( "#tes_" + obj[ "shortName" ] + "_" + option[ 'shortName' ] ).prop( "disabled", "disabled" );
										}
									}
								}
							}
							else
							{
								for (var oKey in obj[ "options" ])
								{
									if ( obj[ "options" ].hasOwnProperty( oKey ) )
									{
										var option = obj[ "options" ][ oKey ];
										if ( option[ "type" ] != "enable" )
										{
											if ( !$( "#tes_" + obj[ "shortName" ] + "_" + option[ 'shortName' ] ).prop( "disabled" ) )
											{
												$( "#tes_" + obj[ "shortName" ] + "_" + option[ 'shortName' ] ).prop( "disabled", "disabled" );
											}
										}
									}
								}
							}

							// Apply default values to options when enabling an Enhancement.
							$( "#tes_" + obj[ "shortName" ] + "_enable" ).change( {obj : obj}, function (event)
							{
								if ( $( "#tes_" + event.data.obj[ "shortName" ] + "_enable" ).prop( "checked" ) == true )
								{
									for (var oKey in event.data.obj[ "options" ])
									{
										if ( event.data.obj[ "options" ].hasOwnProperty( oKey ) )
										{
											var option = event.data.obj[ "options" ][ oKey ];
											if ( option[ "type" ] == "toggle" )
											{
												$( "#tes_" + event.data.obj[ "shortName" ] + "_" + option[ 'shortName' ] ).removeProp( "disabled" );
												$( "#tes_" + event.data.obj[ "shortName" ] + "_"
												   + option[ 'shortName' ] ).prop( "checked", option[ 'defaultValue' ] );
											}
										}
									}
								}
								// Disable Enhancement options unless the enhancement is enabled.
								else
								{
									for (var oKey in event.data.obj[ "options" ])
									{
										if ( event.data.obj[ "options" ].hasOwnProperty( oKey ) )
										{
											var option = event.data.obj[ "options" ][ oKey ];
											if ( option[ "type" ] != "enable" )
											{
												if ( option[ "type" ] == "toggle" )
												{
													$( "#tes_" + event.data.obj[ "shortName" ] + "_"
													   + option[ 'shortName' ] ).prop( "checked", false );
												}
												$( "#tes_" + event.data.obj[ "shortName" ] + "_"
												   + option[ 'shortName' ] ).prop( "disabled", "disabled" );
											}
										}
									}
								}
							} );
						}
						// List any incompatibilities.
						if ( obj[ "incompatible" ] != false )
						{
							$( "#" + obj[ "shortName" ] + "_group" ).append( "<br /><div class='te_en_incompatible' id='" + obj[ "shortName" ]
																			 + "_incompatible'>This Enhancement is incompatible with: </div>" );
							var punct = "";
							for (var i = 0 ; i < obj[ "incompatible" ].length ; i++)
							{
								$( "#" + obj[ "shortName" ] + "_incompatible" ).append( "<span class='te_enhancementColor'>"
																						+ obj[ "incompatible" ][ i ] + "</span>" );
								if ( i + 1 == obj[ "incompatible" ].length )
								{
									punct = ".";
								}
								else
								{
									punct = ", ";
								}
								$( "#" + obj[ "shortName" ] + "_incompatible" ).append( punct );
								$( "#" + obj[ "shortName" ] + "_group" ).append( "<br /><br />" );
							}
						}
						else
						{
							$( "#" + obj[ "shortName" ] + "_group" ).append( "<br /><br />" );
						}
					}
				}
			}


			//$("#te_settingsBody").append("<div id='searchEnhancements' class='te_options'></div>");
			//$("#te_settings").append("<div id='forumEnhancements' class='te_options'></div>");

			// Create Buttons
			$( "#te_settings" ).append( "<br /><br /><div id='te_buttonContainer'></div><br /><br />" );
			$( "#te_buttonContainer" ).append( "<a id='te_saveAndCloseButton' class='book-read-button'>Save &amp; Reload</a>&nbsp;&nbsp;" );
			$( "#te_saveAndCloseButton" ).click( $.proxy( function ()
			{
				this.save();
				location.reload();
			}, this ) );
			$( "#te_buttonContainer" ).append( "<a id='te_applySettingsButton' class='book-read-button'>Apply</a>&nbsp;&nbsp;" );
			$( "#te_applySettingsButton" ).click( $.proxy( function ()
			{
				this.save();
			}, this ) );
			$( "#te_buttonContainer" ).append( "<a id='te_cancelSettingsButton' class='book-read-button'>Cancel</a>" );
			$( "#te_cancelSettingsButton" ).click( $.proxy( function ()
			{
				this.remove();
			}, this ) );


			$( '.menu .item' ).tab();
			$( '#te_config_modal' ).modal(
				{
					onVisible      : function ()
					{
						$( "#te_config_modal" ).modal( 'refresh' );
					},
					observeChanges : true
				} );

			$( '.menu .item' ).click( function ()
			{
				$( '#te_config_modal' ).modal( 'refresh' );
			} );
		}, remove : function ()
		{
			$( '#te_config_modal' ).modal( 'hide' );
		}, save   : function ()
		{
			// Find all enhancement groups within the main settings area.
			var enhancementGroups = $( "#te_settings" ).find( "div[id*='_group']" ), enhancementSettings = {};

			// Loop through the groups to get all the individual settings.
			for (var i = 0 ; i < enhancementGroups.length ; i++)
			{
				var thisEnhancement                = enhancementGroups[ i ];
				var thisEnhName                    = $( thisEnhancement ).attr( "id" );
				thisEnhName                        = thisEnhName.replace( "_group", "" );
				var thisEnhSettings                = $( thisEnhancement ).find( "*[id*='tes_" + thisEnhName + "_']" );
				enhancementSettings[ thisEnhName ] = {};
				for (var es = 0 ; es < thisEnhSettings.length ; es++)
				{
					var thisEnSetting = $( thisEnhSettings )[ es ], thisEnSettingName = $( thisEnSetting ).attr( "id" );
					thisEnSettingName = thisEnSettingName.replace( "tes_" + thisEnhName + "_", "" );
					if ( $( thisEnSetting ).prop( "tagName" ) == "INPUT" )
					{
						if ( $( thisEnSetting ).prop( "type" ) == "checkbox" )
						{
							enhancementSettings[ thisEnhName ][ thisEnSettingName ] = $( thisEnSetting ).prop( "checked" );
						}
					}
				}
			}
			$.extend( true, TE.User, enhancementSettings );
			TE.updateSettings();
		}
	};

	/*************************************************************************************
	 * Tsumino Enhanced Initialization Code
	 *************************************************************************************/
		// Initialization.
	TE.init = function ()
	{
		TE.fn.checkForUpdates();

		// Output initializating messages to the console.
		var debugState = "Disabled";
		if ( TE.config.debug )
		{
			if ( TE.config.verboseDebug )
			{
				debugState = "Verbose";
			}
			else
			{
				debugState = "Standard";
			}
		}

		// Check which Enhancements the user has enabled.
		var enabledEnhancements = [], eeLongNames = "", autoOn = [];
		for (var key in TE.User)
		{
			if ( TE.User.hasOwnProperty( key ) )
			{
				var obj = TE.User[ key ];
				for (var prop in obj)
				{
					if ( obj.hasOwnProperty( prop ) )
					{
						if ( (prop == "enable") && (obj[ prop ] == true) )
						{
							// Add enabled Enhancements to the appropriate array.
							if ( typeof TE.Enhancements[ key ] !== "undefined" )
							{
								enabledEnhancements.push( key );
								eeLongNames = eeLongNames + "[X] " + TE.Enhancements[ key ].name + "\r\n";
							}
						}
						else if ( (prop == "enable") && (obj[ prop ] == false) )
						{
							eeLongNames = eeLongNames + "[ ] " + TE.Enhancements[ key ].name + "\r\n";
						}
					}
				}
			}
		}
		// Check for automatic enhancements.
		for (var key in TE.Enhancements)
		{
			if ( TE.Enhancements.hasOwnProperty( key ) )
			{
				var obj = TE.Enhancements[ key ];
				autoOn.push( obj[ 'shortName' ] );
				for (var prop in obj)
				{
					if ( obj.hasOwnProperty( prop ) )
					{
						if ( prop == "options" )
						{
							for (var optNum in obj[ 'options' ])
							{
								for (var opt in obj[ 'options' ][ optNum ])
								{
									if ( (opt == "type") && (obj[ 'options' ][ optNum ][ opt ] == "enable") )
									{
										var thisIndex = autoOn.indexOf( obj[ 'shortName' ] );
										if ( thisIndex > -1 )
										{
											autoOn.splice( thisIndex, 1 );
										}
									}
								}
							}
						}
					}
				}
			}
		}
		// Enable automatic enhancements.
		for (i = 0 ; i < autoOn.length ; i++)
		{
			enabledEnhancements.push( autoOn[ i ] );
			eeLongNames = eeLongNames + "[X] " + TE.Enhancements[ autoOn[ i ] ].name + "\r\n";
		}

		// Output initialization messages.
		TE.log( "gname", TE.name,
			"Version:	" + TE.version,
			"Latest:		" + TE.User.tsuminoEnhanced.latestVersion,
			"Debugging:	" + debugState,
			"Enhancements:", eeLongNames );
		TE.vbLog( "gname", TE.name, "Current Settings:", TE.User );
		//TE.vbLog( "gname", "TE.site", TE.site );
		TE.vbLog( "gname", "TE.on", TE.on );
		TE.vbLog( "gname", "TE.Enhancements", TE.Enhancements );

		// Set up TE.status.enhancePage for Enhancements that require it to run.
		TE.status.enhancePage = TE.enhancePage();

		// Initialize all enabled Enhancements.
		for (var i = 0 ; i < enabledEnhancements.length ; i++)
		{
			if ( typeof TE.Enhancements[ enabledEnhancements[ i ] ] !== "undefined" )
			{
				TE.Enhancements[ enabledEnhancements[ i ] ].fn.init();
			}
		}
	};

	// Export Tsumino Enhanced to the window.
	if ( w.TE )
	{
		throw new Error( TE.name + " has already been defined" );
	}
	else
	{
		w.TE = TE;
	}

})( typeof window === "undefined" ? this : window, this.jQuery );

// Initialize Tsumino Enhanced.
if ( TE.on.tsumino )
{
	TE.init();
}
// Check for updates. (Iframe)
else if ( (window.self !== window.top) && (window.location.href == TE.updateLocation) )
{
	$( document ).ready( function ()
	{
		TE.log( "gname", TE.name, "Checking for updates..." );
		TE.User.tsuminoEnhanced.lastUpdateCheck = parseInt( new Date().getTime() );
		var latestVersion                       = $( "code" )[ 0 ];
		latestVersion                           = $( latestVersion ).text();
		TE.User.tsuminoEnhanced.latestVersion   = latestVersion;
		TE.updateSettings();
		if ( TE.User.tsuminoEnhanced.latestVersion != TE.version )
		{
			TE.log( "gname", TE.name, "An update is available!" );
		}
		else
		{
			TE.log( "gname", TE.name, TE.name + " is up to date!" );
		}
	} );
}
