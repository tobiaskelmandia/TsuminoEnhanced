// ==UserScript==
// @name			Tsumino Enhanced
// @namespace		tobias.kelmandia@gmail.com
// @version			2.0.0.4
// @description		Adds a selection of configurable new features to Tsumino.com
// @author			Toby
// @include			http://www.tsumino.com/*
// @include			http://tsumino.com/*
// @include			https://www.tsumino.com/*
// @include			https://tsumino.com/*
// @require			https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js
// @grant			GM_setValue
// @grant			GM_getValue
// @grant			GM_deleteValue
// @grant			unsafeWindow
// @run-at			document-start
// ==/UserScript==

/*************************************************************************************
* Tsumino Enhanced
*************************************************************************************/
// Establish Tsumino Enhanced
(function(global)
{
	// Main object - Metadata
	var TE =
	{
		name			: GM_info["script"]["name"],
		version			: GM_info["script"]["version"],
		status			: {},
	};
	
	// Tsumino Enhanced Configuration
	TE.config =
	{
		debug : true,
		verboseDebug : false,
	};
	
	// User's current location.
	TE.myLocation = global.location.href;
	
	/*************************************************************************************
	* Detect which features the user's browser has.
	*************************************************************************************/
	TE.ft = {};
	if (typeof global.console.group === 'function') { TE.ft.logGroups = true; } else { TE.ft.logGroups = false; }
	
	
	/*************************************************************************************
	* Tsumino Site Configuration.
	*************************************************************************************/
	
	// Define prefixes for all major site pages.
	TE.site =
	{
		account			: { prefix : "/Account/Home" },
		auth			: { prefix : "/Read/Auth/" },
		baseURL			: TE.myLocation.split(".com")[0] + ".com",
		book			: { prefix : "/Book/Info/" },
		browse			: { prefix : "/Browse/Index/" },
		browseTags		: { prefix : "/Browse/Tags" },
		error			: { prefix : "/Error/Index/" },
		image			: { prefix : "/Image/Page/" },
		login			: { prefix : "/Account/Login" },
		manageTags		: { prefix : "/Account/ManageTags" },
		query			: { prefix : "/Browse/Query" },
		reader			: { prefix : "/Read/View/" },
		search			: { prefix : "/Search" },
	};
	
	// Location Checking object.
	TE.on = {};
	
	// Create full URLs and do location checking.
	for (var key in TE.site)
	{
		if (TE.site.hasOwnProperty(key))
		{
			var obj = TE.site[key];
			for (var prop in obj)
			{
				if (obj.hasOwnProperty(prop))
				{
					// Create Full URLs.
					obj["url"] = TE.site.baseURL + obj[prop];
					
					// Perform location checking.
					if(obj["prefix"])
					{

						if(RegExp(TE.site.baseURL + obj["prefix"] + "*").exec(TE.myLocation))
						{
							TE.on[key] = true;
						}
						else
						{
							TE.on[key] = false;
						}
					}
				}
			}
		}
	}
	// Location Checking Exceptions
	// User should be counted as browsing if:
	// * On the homepage.
	// * Using sorting on the homepage.
	// * Looking at search results
	var onBrowse = RegExp(TE.site.baseURL + obj["prefix"] + "*").exec(TE.myLocation), onHome = false;
	if((TE.site.baseURL == TE.myLocation) || 
		(TE.site.baseURL + "/" == TE.myLocation) ||
		(RegExp(TE.site.baseURL + "/\\?sort=*").exec(TE.myLocation))) { onHome = true; }
	if((onBrowse) || (onHome) || (TE.on.query)) { TE.on.browse = true; }
	else { TE.on.browse = false; }
	
	/*************************************************************************************
	* Utility Functions
	*************************************************************************************/
	TE.fn = TE.prototype =
	{
		// Logging to console with Timestamps.
		log : function()
		{
			if((arguments.length > 0) && (TE.config.debug))
			{
				var date = new Date(), hr,min,sec,mil,timeStamp;
				hr = date.getHours();
				min = date.getMinutes();
				sec = date.getSeconds();
				mil = date.getMilliseconds();
				timeStamp = hr + ":" + min + ":" + sec + ":" + mil;
				if(TE.ft.logGroups)
				{
					if(arguments[0] == "gname")
					{
						console.group(arguments[1] + " - [" + timeStamp + "]");
						for (var i = 2; i < arguments.length; ++i)
						{
							console.log(arguments[i]);
						}
					}
					else
					{
						console.group(timeStamp);
						for (var i = 0; i < arguments.length; ++i)
						{
							console.log(arguments[i]);
						}
					}
					console.groupEnd();
				}
				else
				{
					if(arguments[0] == "gname")
					{
						console.log("----- " + arguments[1] + " -----");
						for (var i = 0; i < arguments.length; ++i)
						{
							console.log(arguments[i]);
						}
					}
					else
					{
						console.log("[" + timeStamp + "]");
						for (var i = 0; i < arguments.length; ++i)
						{
							console.log(arguments[i]);
						}
					}
					console.log();
				}
			}
		},
		vbLog : function ()
		{
			if(TE.config.verboseDebug)
			{
				if(arguments.length > 0) { this.log.apply(this.log,arguments); }
			}
		},
		errorMsg : function(code,situation,error)
		{
			this.log("gname",TE.name,"An error was detected while:",situation,"Error Code: "+code, error);
		},
		replaceAll : function(str, find, replace)
		{
			// Escape regex.
			find = find.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
			return str.replace(new RegExp(find, 'g'), replace);
		},
		killPage : function()
		{
			// Kill the page early.
			document.replaceChild
			(
				document.importNode (document.implementation.createHTMLDocument("").documentElement, true),
				document.documentElement
			);
			
			// Apply preliminary background color for smooth rendering appearance.
			document.head.innerHTML = '<style>body{background-color:#1a1a1a;}</style>';
			window.stop();
		},
		load : function(pageNumber)
		{
			var dfd = jQuery.Deferred();
			var newImageSrc = TE.site.image.prefix + TE.book.id + "/";
			// If no page number was defined, try to load the next page.
			pageNumber = pageNumber || TE.book.nextPage;
			
			// Make sure the page exists first.
			if((pageNumber <= TE.book.totalPages) && (pageNumber > 0))
			{
				//TE.book.nextPage
				newImageSrc = newImageSrc + pageNumber;
				this.vbLog("gname","TE.load","Loading Image: " + pageNumber + "...");
				$("body").append("<img id='te_loadImage"+pageNumber+"' style='display:none;'>");
				$("#te_loadImage"+pageNumber).attr("src",newImageSrc);
				$("#te_loadImage"+pageNumber).load($.proxy(function()
				{
					this.vbLog("gname","TE.load","Image "+pageNumber+" loaded.");
					$("#te_loadImage"+pageNumber).remove();
					dfd.resolve();
				},this));
			}
			else
			{
				dfd.resolve();
			}
			return dfd.promise();
		},
		camelize : function(str)
		{			
			return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index)
			{
				if (+match === 0)
				{
					return "";
				}
			return index == 0 ? match.toLowerCase() : match.toUpperCase();
			});
		},
		updateSettings : function()
		{
			GM_setValue("TE_settings",JSON.stringify(TE.User));
		},
	};
	
	// Alias specific commonly used utility functions to the main namespace.
	TE.log = TE.fn.log;
	TE.vbLog = TE.fn.vbLog;
	TE.errorMsg = TE.fn.errorMsg;
	TE.replaceAll = TE.fn.replaceAll;
	TE.load = TE.fn.load;
	TE.updateSettings = TE.fn.updateSettings;
	
	/*************************************************************************************
	* Tsumino Enhanced User Interface settings.
	* Stylesheets, data URI, etc.
	*************************************************************************************/
	// User Interface object.
	TE.ui = {};
	
	/* Tsumino Enhanced CSS.
	** Beautify here:	http://www.cleancss.com/css-beautify/
	** Minify here:		http://cssminifier.com/
	*/
	TE.ui.css = ".te_switch+label,select{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none}body{width:100%;max-width:100%;height:100%;min-height:100%;overflow-y:scroll}#te_brand,.te_enhancementColor{color:#22a7f0}#te_version{font-size:.5em}.te_en_incompatible{background-color:rgba(255,0,0,.1);border:2px solid rgba(255,0,0,0);border-radius:5px;padding:.5em}.te_switch+label,select.te_switch{cursor:pointer;outline:0}a.te_link,a.te_link:visited{color:#23a7f0;text-decoration:none}a.te_link:hover{color:#23a7f0;text-decoration:underline}.te_Button,.te_configTab nav a:hover{text-decoration:none}.te_options{padding-left:1em}.te_optionDescription{margin-top:10px}.te_optionGroup{margin-bottom:20px;border:2px solid #fff;border-radius:5px;background-color:#222;padding:15px;margin-left:1em}.te_enhancementName{color:#22a7f0;font-size:2em;margin:0;padding:0 0 5px}.te_switch{position:absolute;margin-left:-9999px;visibility:hidden}.te_switch+label{display:block;position:relative;user-select:none}input.te_switch-style+label{padding:2px;width:40px;height:20px;background-color:#ddd;-webkit-border-radius:20px;-moz-border-radius:20px;-ms-border-radius:20px;-o-border-radius:20px;border-radius:20px;-webkit-transition:background .4s;-moz-transition:background .4s;-o-transition:background .4s;transition:background .4s}input.te_switch-style+label:after,input.te_switch-style+label:before{display:block;position:absolute;content:''}input.te_switch-style+label:before{top:2px;left:2px;bottom:2px;right:2px;background-color:#1a1a1a;-webkit-border-radius:20px;-moz-border-radius:20px;-ms-border-radius:20px;-o-border-radius:20px;border-radius:20px;-webkit-transition:background .4s;-moz-transition:background .4s;-o-transition:background .4s;transition:background .4s}input.te_switch-style+label:after{top:4px;left:4px;bottom:4px;width:16px;background-color:#ddd;-webkit-border-radius:16px;-moz-border-radius:16px;-ms-border-radius:16px;-o-border-radius:16px;border-radius:16px;-webkit-transition:margin .4s,background .4s;-moz-transition:margin .4s,background .4s;-o-transition:margin .4s,background .4s;transition:margin .4s,background .4s}input.te_switch-style:checked+label{background-color:#22a7f0}input.te_switch-style:checked+label:after{margin-left:16px;background-color:#22a7f0}select,select option{background-color:#1a1a1a;color:#fff}select{border:2px solid #ddd;border-radius:5px;padding:5px;font-size:1.2em;user-select:none}.te_fauxRow{display:table-row}.te_fauxCell{display:table-cell;vertical-align:middle}.te_switchContainer{padding-right:10px}.te_Button{background-color:#23a8f0;-moz-border-radius:28px;-webkit-border-radius:28px;border-radius:30px;border:2px solid #ddd;display:inline-block;cursor:pointer;color:#fff;font-size:1.2em;font-weight:700;padding:5px 15px;text-shadow:0 1px 0 #12587d;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}input.te_subOption[type=checkbox]:not(old),input.te_subOption[type=radio]:not(old){width:2em;margin:0;padding:0;font-size:1em;opacity:0;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}input.te_subOption[type=checkbox]:not(old)+label,input.te_subOption[type=radio]:not(old)+label{display:inline-block;margin-left:-2em;line-height:1.5em;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}input.te_subOption[type=checkbox]:not(old)+label>span,input.te_subOption[type=radio]:not(old)+label>span{display:inline-block;width:1em;height:1em;padding:.2em;margin:.25em .5em .25em .25em;border:1px solid #FFF;border-radius:5px;background-color:#000;vertical-align:bottom;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}input.te_subOption[type=checkbox]:not(old):checked+label>span,input.te_subOption[type=radio]:not(old):checked+label>span{background-color:#000;border:1px solid #23a7f0;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}input.te_subOption[type=checkbox]:not(old):checked+label>span:before{content:'x';display:block;color:#23a7f0;font-size:1em;line-height:1em;margin-top:-.35em;text-align:center;font-weight:700;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}input.te_subOption[type=radio]:not(old):checked+label>span>span{display:block;width:.5em;height:.5em;margin:.125em;border:.0625em solid #626262;border-radius:.125em;background-color:#626262;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer}#te_tabContainer{padding-bottom:1em}.te_configTab,.te_configTab nav ul{position:relative;margin:0 auto}.te_configTab nav,.te_configTab nav ul li{text-align:center}.te_configTab{overflow:hidden;width:100%;font-weight:300;font-size:2em}.te_configTab nav ul{display:-ms-flexbox;display:-webkit-flex;display:-moz-flex;display:-ms-flex;display:flex;padding:0;max-width:1200px;list-style:none;-ms-box-orient:horizontal;-ms-box-pack:center;-webkit-flex-flow:row wrap;-moz-flex-flow:row wrap;-ms-flex-flow:row wrap;flex-flow:row wrap;-webkit-justify-content:center;-moz-justify-content:center;-ms-justify-content:center;justify-content:center}.te_configTab nav a,.te_configTab nav ul li{display:block;position:relative;text-decoration:none}.te_configTab nav ul li{z-index:1;margin:0;-webkit-flex:1;-moz-flex:1;-ms-flex:1;flex:1}.te_configTab nav a:focus{outline:0}.no-flexbox nav ul li{min-width:15%;display:inline-block}.te_configTab nav li:last-child::before{position:absolute;bottom:0;left:0;width:100%;height:4px;background:#22a7f0;content:'';-webkit-transition:-webkit-transform .3s;transition:transform .3s}.te_configTab nav li:first-child.te_tab-current~li:last-child::before{-webkit-transform:translate3d(-400%,0,0);transform:translate3d(-400%,0,0)}.te_configTab nav li:nth-child(2).te_tab-current~li:last-child::before{-webkit-transform:translate3d(-300%,0,0);transform:translate3d(-300%,0,0)}.te_configTab nav li:nth-child(3).te_tab-current~li:last-child::before{-webkit-transform:translate3d(-200%,0,0);transform:translate3d(-200%,0,0)}.te_configTab nav li:nth-child(4).te_tab-current~li:last-child::before{-webkit-transform:translate3d(-100%,0,0);transform:translate3d(-100%,0,0)}.te_configTab nav a{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;vertical-align:middle;font-size:.75em;padding:.5em;color:#74777b;line-height:1;-webkit-transition:color .3s,-webkit-transform .3s;transition:color .3s,transform .3s;font-weight:700}.te_configTab nav li.te_tab-current a{color:#22a7f0}.te_currentTabContent{display:block}.te_hiddenTabContent{display:none}.te_recordKeeper_browseData{font-size:.5em}.te_browsetweak_readbutton{position:absolute;float:right;right:0;}";
	
	// Tsumino Enhanced Favicon Data URI
	TE.ui.favicon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3wsRDAY5sIzTWwAAAB1pVFh0Q29tbWVudAAAAAAAQ3JlYXRlZCB3aXRoIEdJTVBkLmUHAAAEaUlEQVRYw+2XW2xVRRSGv5nZ+1x6di/QUjinLdVUArVISIoJgRcEAoEQY4LxwUB8Ml4evEQTJGhQQ/SVGI2aaAzyohiDCMREEpUol4ACRROubSkl1tKeXjhnn+uePT7s5hRigJ62hhfmbe+ZWfOv9a/1rxmxZMkSwz0ckns87gOwpsOIERKUBcaAtDB2GF33IDI9iBrqnRwAY0XQNXGswe7gW9n4lbPwEm14TYvRtc2YaBVGWmCHMSqEKLiokT58pxa/JgFA7OB72Od/RmDKA6Brm0ht+piKQzsJnz2Au34rxYeWg1TI0T7UQBem4OI1txP68weiv32OzIwAUJi/AnfDmwC467ZQc/kIePnyckDk3cBY6yp8pw5n/7vEvn8HgOhPH+Hs20747EHwCnhzFyNy6QB41Rwyj704FkaDfeUk+Lr8JBT5NFbPKfyIg7EjAIQ6j4JXIP/oU4H9aDVYIcKn9yF8DwCvYSEmNhMAu+s4sf07SnNlUSCzNwhd+pXM6pcxoVjpvxrqRVfHybeuJt+2JojSghUUW5aC1vjVcwLDvR1ED3+K8HKTrwKRTgY8btgG2sOEohinDrw8hYVrsXtOEzm5B5lOggAMpJ7+AKu3g9iBHcjM8NTKULpJRGoAvyaBut5J9PCXqIFO5I1+MAahi+Tan0QUcwHXQPWHTyC8PEIXpy5EcrQfNXiFyLHdVO1+Dqv3DH5lPcIrlA7QM5tIb3yfwoKVpdzBmEAbJjBUIpF4+7YUeDlCncdQfecRukC+bS2ZDdtACOzeDgD82rl4jYvQ8Vbs7hN4DW3klm5CGO+uInRXCoy0AlGprMezQvgzGgAotiwjenRX4EHfBUQ+jV85C3fdFkTeDajT3jRIsRB4jYvIrHoJpEJdvzwW5tT4El0ABHL0Hyq/egVxU80bgtycfBXoIvaFX3BG/kbkXfTMuWTWvwFe4VbBMgaZGkD4mkLLMorzlhP660fsax1Tb0Yi7yKyNygsWImOz79FJUt++hov3srI899gQhXI9CDW1TNTp8CLt5J+fDvGqUOkk9hdx6BpMX5NHD9ajcyOBh1QBKCcvdtQY83rTvI7YQBW3zmqP9uMiVYj04Nklz0zFhYZHA6YUAWoEHb3Caz+ixhlgxCgLAwSjAZdvG0u3P0+oGz8qtm4a17Dr6oHY1D9l0rTfmU9SInX+Aju2tfRs1rwYzMCYKEKVP9FnL1vIdxkeQB8pxZd+wC59o3oxMNUHNqJHL5GavMnIMe3iVwKtIcfrcGvaUAUs6hhNygB3wMrjIk4UA6AYuMisiteQM+eh0xexfl2K1bfOYrN7UHYw85/ylANduN8/Soo+yYvNML45eeAzAxj9ZxCDXQR+X0PKtlT4j7Q3/EyNHYElEKmrgc8T7AH3BGAGuoleuQLUDaimB1f3PMHcvga4TP7xsGmkxghsfovTu+lVPhewOHN/4xP1a5nb/FSDV3F7jxO+PR3kwIgputlNBHZ/V/fBWKS++6/jO4D+BdYdNLmP/zOiQAAAABJRU5ErkJggg==";
	
	TE.ui.mainColor = "#22a7f0";
	
	/*************************************************************************************
	* Classes
	*************************************************************************************/

	
	/*************************************************************************************
	* Class: Enhancement
	*************************************************************************************/
	TE.Enhancement =
	{
		/*************************************************************************************
		* Class: 	Enhancement
		* Subclass: main
		*
		* Master Enhancement class.
		*
		* name: 		Name of the Enhancement. String only.
		* description:	Description of the Enhancement.
		*				Can be a string or boolean false.
		* 				False will indicate no description.
		* options:		Should be an object collection of option subclasses, or boolean false.
		*				False will indicate no options.
		* 				If no options are provided:
		*					- The Enhancement will not appear on the configuration page.
		*					- The Enhancement will be activated automatically.
		*				If options is not false, one option must use the "enable" key.
		* section:		The section of the config page the Enhancement will appear in.
		* incompatible: Array of Enhancements that this one is incompatible with.
		* fn:			Object containing all actual Enhancement functionality.
		*				"init" key should be used for activation.
		*				"upgradeHandling" key should be used for upgrade handling.
		*
		* TE.Enhancement.main(name,displayName,description,options,section,incompatible,fn)
		*************************************************************************************/
		main: function(name,description,options,section,incompatible,fn)
		{
			try
			{
				if (typeof name !== "string") { throw new Error("Enhancement name must be defined as a string."); }
				if ((typeof description !== "string") && (description != false))
				{
					throw new Error("Enhancement description must be defined as a string.");
				}
				if ((typeof options !== "object") && (options != false))
				{
					throw new Error("Enhancement options must be defined as an object.");
				}
				if((options != false) || (section != false))
				{
					if (typeof section !== "string") { throw new Error("Enhancement section must be defined as a string."); }
				}
				if ((typeof incompatible !== "object") && (incompatible != false))
				{
					throw new Error("Enhancement incompatibilities must be defined as 'false', or an array.");
				}
				
				if (typeof fn !== "object") { throw new Error("Enhancement functionality must be defined as an object."); }
				
				this.name = name;
				this.shortName = TE.fn.camelize(name);
				this.description = description;
				this.options = options;
				this.section = section;
				this.incompatible = incompatible;
				this.fn = fn;
			}
			catch(error)
			{
				TE.errorMsg("CD01","Creating an Enhancement class object.",error);
			}
		},
		/*************************************************************************************
		* Class: 	Enhancment
		* Subclass: option
		*************************************************************************************/
		option :
		{
			/*************************************************************************************
			* Master Class: 	Enhancment
			* Parent Class: 	option
			* Subclass: 		main
			*
			* Primary Option class.
			*
			* type:			The type of the Option.
			* 				Must be a string of one of the following:
			*				"enable" - Switch that enables the Enhancement.
			*					Options of this type require no further parameters.
			*				"toggle" - Renders a checkbox.
			*				"radio" - Radio buttons. Requires arguments.
			*				"dropdown" - Dropdown menu. Requires arguments.
			* name: 		Name of the option.
			* description:	Description of the Option.
			*				Can be a string or boolean false.
			* 				False will indicate no description.
			* defaultValue: The default value of the option.
			* arguments:	Must be an object of the "arguments" subclass, or boolean false.
			*				False indicates no arguments.
			*
			* TE.Enhancement.option.main(type,name,description,defaultValue,arguments)
			*************************************************************************************/
			main : function(type,name,description,defaultValue,arguments)
			{
				try
				{
					if (typeof type !== "string") { throw new Error("Option type must be defined as a string."); }
					if (type != "enable")
					{
						if (typeof name !== "string") { throw new Error("Option name must be defined as a string."); }
						if (typeof description === "undefined") { description = false; }
						
						if(type == "toggle") {}
						if ((type == "dropdown") && (typeof arguments !== "object"))
						{
							throw new Error("You must define arguments for option type dropdown.");
						}
						if ((type == "radio") && (typeof arguments !== "object"))
						{
							if (typeof arguments === "undefined") { throw new Error("You must define arguments for option type radio."); }
						}
						if(type == "dropdown")
						{
							if (typeof arguments === "undefined") { throw new Error("Option arguments must be defined with type dropdown."); }
						}
						
						this.type = type;
						this.name = name;
						this.shortName = TE.fn.camelize(name);
						this.description = description;
						this.defaultValue = defaultValue;
						this.arguments = arguments;
					}
					else
					{
						this.type = type;
						this.name = "enable";
						this.shortName = "enable";
						this.description = false;
						this.defaultValue = false;
						this.arguments = false;
					}

				}
				catch(error)
				{
					TE.errorMsg("CD02","Creating an Enhancement.option.main class object.",error);
				}
			},
			/*************************************************************************************
			* Master Class: 	Enhancment
			* Parent Class: 	option
			* Subclass: 		arguments
			*
			* Arguments for radio and dropdown type options.
			*
			* type:			The type of the Argument.
			* 				Must be a string of one of the following:
			*					"range" - For generating a
			*************************************************************************************/
			arguments : function(type,parameters)
			{
				try
				{
					if (typeof type !== "string") { throw new Error("Type must be defined as a string."); }
					if (type == "range")
					{
						if (typeof parameters !== "object") { throw new Error("Parameters must be defined as an object."); }
						else
						{
							if (typeof parameters.rangeStart !== "number") { throw new Error("Range start must be defined as a number."); }
							if (typeof parameters.rangeEnd !== "number") { throw new Error("Range end must be defined as a number."); }
						}
					}
					else
					{
						throw new Error("Range is the only acceptable type right now.");
					}
					
					this.type = type;
					this.arguments = arguments;
				}
				catch(error)
				{
					TE.log("gname","ERROR","Error defining arugments class:",error);
					TE.errorMsg("CD03","Creating an Enhancement.option.arugment class object.",error);
				}
			},
		},
	};
	
	
	/*************************************************************************************
	* User Configuration
	*************************************************************************************/
	TE.User = {};
	(function()
	{
		if(GM_getValue("TE_settings"))
		{
			var TE_settings = GM_getValue("TE_settings");
			TE.User = JSON.parse(TE_settings);
		}
	})();
	
	
	
	
	/*************************************************************************************
	* Enhance Page - Core Functionality
	*  + Creates IDs for important elements.
	*  + Gathers data for storage in the TE object.
	*************************************************************************************/
	TE.enhancePage = function()
	{
		var dfd = jQuery.Deferred();
		TE.vbLog("gname","TE.enhancePage","Started working...");
		$(document).ready(function()
		{
			/*************************************************************************************
			* All pages.
			*************************************************************************************/
			// The navigation bar at the top.
			$("nav").attr("id","te_siteNavbar");
			
			// Replace favicon.
			$("link[rel='icon']").attr("href",TE.ui.favicon);
			
			// Apply Tsumino Enhanced CSS.
			$("head").append("<style>"+TE.ui.css+"</style>");
			
			// Add Tsumino Enhanced config link to navbar.
			var navbar = $("ul.nav.navbar-nav")[0];
			$(navbar).attr("id","te_navbarMain");
			$("#te_navbarMain").append("<li><a href='javascript:;' style='color:"+TE.ui.mainColor+" !important;' id='te_configNavLink'>ENHANCED</a></li>");
			$("#te_configNavLink").click(function(){ TE.settings.render(); });
			
			// ID the primary content area.
			var pageContent = $("div.container-fluid")[1];
			$(pageContent).attr("id","te_pageContent");
			
			/*************************************************************************************
			* Book & Reader
			*************************************************************************************/
			if(TE.on.reader || TE.on.book)
			{
				// Create the book object.
				TE.book = {};
				
				// Reader only.
				if(TE.on.reader)
				{
					// Create IDs.
					$(".reader-page").attr("id","te_readerPageMain");
					var imageBlock = $("#te_readerPageMain").children()[0];
					$(imageBlock).attr("id","te_imageBlock");
					$(".reader-btn").attr("id","te_readerButtonContainer");
					$("img.reader-img").attr("id","te_readerCurrentImage");
					
					var readInfo = TE.myLocation;
					readInfo = readInfo.replace(TE.site.reader.url,"");
					readInfo = readInfo.split("/");
					
					// Book ID.
					TE.book.id = parseInt(readInfo[0]);
					
					// Book title.
					var bookTitle = $("title").text();
					TE.book.title = bookTitle.replace("Tsumino - Read ","");
					
					// Pagination setup.
					var pagination = $("#te_readerButtonContainer").find("h1")[0];
					$(pagination).attr("id","te_readerPagination");
					var pagesInfo = $("#te_readerPagination").text();
					pagesInfo = pagesInfo.split(" Page ")[1];
					pagesInfo = pagesInfo.split(" of ");
					
					// Current Page.
					TE.book.currentPage = parseInt(pagesInfo[0]);
					TE.book.currentPageURL = TE.site.reader.prefix + TE.book.id + "/" + TE.book.currentPage;
					
					// Origin page.
					TE.book.originPage = TE.book.currentPage;
					
					// Total Pages.
					TE.book.totalPages = parseInt(pagesInfo[1]);
					
					// Next page.
					TE.book.nextPage = TE.book.currentPage + 1;
					if(TE.book.nextPage > TE.book.totalPages) { TE.book.nextPage = false; }
					else { TE.book.nextPageURL = TE.site.reader.prefix + TE.book.id + "/" + TE.book.nextPage; }
					
					// Previous page.
					TE.book.prevPage = TE.book.currentPage - 1;
					if(TE.book.prevPage == 0) { TE.book.prevPage = false; }
					else { TE.book.prevPageURL = TE.site.reader.prefix + TE.book.id + "/" + TE.book.prevPage; }
					
					// Rewrite pagination section.
					$("#te_readerPagination").html("Page <span id='te_currentPage'></span> of <span id='te_totalPages'></span>");
					$("#te_currentPage").html(TE.book.currentPage);
					$("#te_totalPages").html(TE.book.totalPages);
					
					// Add ID to return button.
					$("a[href*='"+TE.site.book.prefix+"']:contains('RETURN')").attr("id","te_returnButton");
					
					// Enhance Previous Page button.
					if ($("a:contains(' PREV')").length)
					{
						$("a:contains(' PREV')").attr("id","te_prevButton");
					}
					else
					{
						$("#te_returnButton").before("<a id=\"te_prevButton\" class=\"book-read-button\" style=\"margin-right: 10px;\"><i class=\"fa fa-arrow-left\"></i> PREV</a>");
						$("#te_prevButton").css("display","none");
					}
					$("#te_prevButton").attr("href",TE.book.prevPageURL);
					if(TE.book.currentPage > 1) { $("#te_prevButton").css("display","inline"); }
					else { $("#te_prevButton").css("display","none"); }
					
					// Enhance Next Page Button
					if ($("a:contains('NEXT ')").length)
					{
						$("a:contains('NEXT ')").attr("id","te_nextButton");
					}
					else
					{
						$("#te_returnButton").after(" <a id=\"te_nextButton\" class=\"book-read-button\">NEXT <i class=\"fa fa-arrow-right\"></i></a>");
						$("#te_nextButton").css("display","none");
					}
					$("#te_nextButton").attr("href",TE.book.nextPageURL);
					if(TE.book.currentPage < TE.book.totalPages) { $("#te_nextButton").css("display","inline"); }
					else { $("#te_nextButton").css("display","none"); }
					
					// Enhance Image link.
					var imageLink = $("a[href*='"+TE.site.reader.prefix+"']")[0];
					$(imageLink).attr("id","te_imageLink");
					$("#te_imageLink").attr("href",TE.book.nextPageURL);
					
					TE.vbLog("gname","TE.book",TE.book);
				}
				else if(TE.on.book)
				{
					var readInfo = TE.myLocation;
					readInfo = readInfo.replace(TE.site.book.url,"");
					readInfo = readInfo.split("/");
					
					// Book ID.
					TE.book.id = parseInt(readInfo[0]);
					
					// Fix tag display bug causing unwanted line breaks.
					$(".book-tag:contains(' ')").css("white-space","nowrap");
					$(".book-tag:contains('-')").css("white-space","nowrap");
					
					// Read Online button.
					$("a.book-read-button:contains(' READ ONLINE')").attr("id","te_readOnlineButton");
				}
			}
			if(TE.on.browse)
			{
				var browsePage = $("div.browse-page");
				var ctProper = $("div.row.push-in");
				var bookshelfContainer = $(ctProper).children()[0];
				$(bookshelfContainer).attr("id","te_bookshelfContainer");
				var sidebarContainer = $(ctProper).children()[1];
				$(sidebarContainer).attr("id","te_sidebarContainer");
				
				var bookshelf = $(browsePage).find("div.row.row-no-padding");
				$(bookshelf).attr("id","te_bookshelf");
				$(bookshelf).children().each(function()
				{
					var thisLinkUrl = $(this).find("a.overlay-button").attr("href");
					var temp = thisLinkUrl.replace(TE.site.book.prefix,"");
					temp = temp.split("/");
					var thisBookID = temp[0];
					$(this).attr("id","te_book_" + thisBookID + "_masterContainer");
					
					$(this).find("div.book-grid-item").attr("id","te_book_" + thisBookID + "_container");
					
					var thisOverlay = $("#te_book_" + thisBookID + "_container").find("div.overlay");
					$(thisOverlay).attr("id","te_book_" + thisBookID + "_overlay");
					
					var thisData = $("#te_book_" + thisBookID + "_overlay").find("div.overlay-data");
					$(thisData).attr("id","te_book_" + thisBookID + "_data");
					
					var thisPages = $("#te_book_" + thisBookID + "_data").find("div.overlay-sub");
					$(thisPages).attr("id","te_book_" + thisBookID + "_pagesContainer");
					
					
					var bottomTitle = $(this).find("a.title");
					$(bottomTitle).attr("id","te_book_" + thisBookID + "_bottomTitle");
				});
				TE.vbLog("gname","TE.enhancePage",bookshelf);
			}
			TE.vbLog("gname","TE.enhancePage","Finished working.");
			dfd.resolve();
		});
		
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
	(function()
	{
		/*******************************************************
		* Unstickied Header - General Enhancement
		*******************************************************/
		var name = "Unstickied Header",
			shortName = TE.fn.camelize(name),
			description = "The Tsumino navigation bar will no longer follow you as you scroll down.",
			options = [],
			section = "General",
			incompatible = false,
			main =
			{
				init : function()
				{
					$.when(TE.status.enhancePage).done($.proxy(function()
					{
						this.run();
					},this));
				},
				run : function()
				{
					$("#te_siteNavbar").css("position","absolute");
				},
			};
		//TE.Enhancement.option.main(type,name,description,defaultValue,arguments)
		var opt1 =
		{
			type : "enable",
			name : false,
			description : false,
			defaultValue : false,
			arguments : false,
		};
		options.push(new TE.Enhancement.option.main(opt1.type,opt1.name,opt1.description,opt1.defaultValue,opt1.arguments));
		TE.Enhancements[shortName] = new TE.Enhancement.main(name,description,options,section,incompatible,main);
	})();
	
	
	
	(function()
	{
		/*******************************************************
		* Record Keeper - General Enhancement
		*******************************************************/
		var name = "Record Keeper",
			shortName = TE.fn.camelize(name),
			description = "The aptly named Record Keeper Enhancement keeps a record of what Doujin you've read.<br />This record includes Doujin IDs, the last page you read, and whether or not you finished reading a Doujin.<br />While browsing, unread Doujin will retain the normal blue border.<br />Doujin you have started but haven't finished will have a yellow border.<br />Doujin you've finished reading will have a green border.<br />Additionally, the information overlay will now contain this information.<br />There will also be a 'Continue Reading' button on the book info page if you have previously read a Doujin past the first page.",
			options = [],
			section = "General",
			incompatible = false,
			main = {};
			
			
		main =
		{
			init : function()
			{
				if(typeof TE.User.recordKeeper.data !== "object")
				{
					TE.User.recordKeeper.data = {};
					TE.updateSettings();
				}
				if(TE.on.browse)
				{
					$.when(TE.status.enhancePage).done(function()
					{
						TE.log("gname",name,"Initializining...");
						for (var key in TE.User.recordKeeper.data)
						{
							if (TE.User.recordKeeper.data.hasOwnProperty(key))
							{
								var obj = TE.User.recordKeeper.data[key];
								if(obj["finished"])
								{
									$("#te_book_"+key+"_pagesContainer").append("<br />Finished!");
									$("#te_book_"+key+"_overlay").css("border","3px solid rgba(0,125,0,.8)");
									$("#te_book_"+key+"_bottomTitle").css("border-top","3px solid rgba(0,125,0,.8)");
								}
								if((obj["lastSeen"] > 1) && (!obj["finished"]))
								{
									$("#te_book_"+key+"_pagesContainer").text("Read " + obj["lastSeen"] + " / " + obj["totalPages"] + " pages.");
									$("#te_book_"+key+"_overlay").css("border","3px solid rgba(190,190,90,.8)");
									$("#te_book_"+key+"_bottomTitle").css("border-top","3px solid rgba(190,190,90,.8)");
								}
							}
						}
					});
				}
				if(TE.on.book)
				{
					$.when(TE.status.enhancePage).done($.proxy(function()
					{
						TE.log("gname",name,"Initializining...");
						if(typeof TE.User.recordKeeper.data[TE.book.id] === "object")
						{
							if(TE.User.recordKeeper.data[TE.book.id]["lastSeen"] > 1)
							{
								TE.User.recordKeeper.data[TE.book.id]["lastSeen"];
								var oldButton = $("#te_readOnlineButton").html();
								var starOver = oldButton.replace(" READ ONLINE"," START OVER");
								var continueReading = oldButton.replace(" READ ONLINE"," CONTINUE READING");
								$("#te_readOnlineButton").html(starOver);
								var resumeUrl = TE.site.reader.url + TE.book.id + "/" + TE.User.recordKeeper.data[TE.book.id]["lastSeen"];
								$("#te_readOnlineButton").before("<a id='te_resumeButton' class='book-read-button button-stack' href='"+resumeUrl+"'></a>");
								$("#te_resumeButton").html(continueReading);
							}
						}
					},this));
				}
				if(TE.on.reader)
				{
					$.when(TE.status.enhancePage).done($.proxy(function()
					{
						TE.log("gname",name,"Initializining...");
						if(typeof TE.User[shortName].data !== "object")
						{
							TE.User[shortName].data = {};
						}
						if(typeof TE.User[shortName].data[TE.book.id] !== "object")
						{
							TE.User[shortName].data[TE.book.id] =
							{
								totalPages	: TE.book.totalPages,
								lastSeen 	: TE.book.currentPage,
								finished	: false,
							};
						}
						this.update();
					},this));
				}
			},

			update : function()
			{
				TE.User[shortName].data[TE.book.id].lastSeen = TE.book.currentPage;
				if(!TE.User[shortName].data[TE.book.id]["finished"])
				{
					if(TE.book.totalPages == TE.book.currentPage)
					{
						TE.User[shortName].data[TE.book.id]["finished"] = true;
					}
				}
				TE.updateSettings();
			},
		};
		
		//TE.Enhancement.option.main(type,name,description,defaultValue,arguments)
		var opt1 =
		{
			type : "enable",
			name : false,
			description : false,
			defaultValue : false,
			arguments : false,
		};
		var opt2 =
		{
			type : "toggle",
			name : "Show Messages",
			description : "Displays loading messages while preparing images for display.",
			defaultValue : true,
			arguments : false,
		};
		options.push(new TE.Enhancement.option.main(opt1.type,opt1.name,opt1.description,opt1.defaultValue,opt1.arguments));
		//options.push(new TE.Enhancement.option.main(opt2.type,opt2.name,opt2.description,opt2.defaultValue,opt2.arguments));
		
		TE.Enhancements[shortName] = new TE.Enhancement.main(name,description,options,section,incompatible,main);
	})();
	
		
	(function()
	{
		/*******************************************************
		* Browsing Tweaks - Browsing Enhancement
		*******************************************************/
		var name = "Browsing Tweaks",
			shortName = TE.fn.camelize(name),
			description = "A collection of customizations to browsing.",
			options = [],
			section = "Browsing",
			incompatible = false,
			main = {};
			
		main =
		{
			init : function()
			{
				if(TE.on.browse)
				{
					$.when(TE.status.enhancePage).done(function()
					{
						if(typeof TE.User[shortName] !== "undefined")
						{
							if(TE.User[shortName].removeSidebar)
							{
								$("#te_sidebarContainer").remove();
								$("#te_bookshelfContainer").css("width","100%");
							}
							if(TE.User[shortName].thumbnailLinks)
							{
								$("div.overlay").each(function()
								{
									$(this).click(function()
									{
										if(TE.User[shortName].skipInfo)
										{
											$(this).find("a.te_browsetweak_readbutton")[0].click();
										}
										else
										{
											$(this).find("a.overlay-button")[0].click();
										}
										
									});
								});
							}
							if(TE.User[shortName].moreBooks)
							{
								$("style").append("@media(min-width:768px) { .col-sm-4 { width: 25% } }");
								$("style").append("@media(min-width:992px) { .col-md-3 { width: 20% } }");
							}
							if(TE.User[shortName].skipInfo)
							{
								// Apply new CSS.
								$("style").append(".te_browsetweak_infobutton,.te_browsetweak_readbutton{position:absolute;border:3px solid #fff;bottom:10px;padding:10px;margin-left:5%;margin-right:5%;font-size:17px;color:#fff;width:42.5%;display:inline-block}.te_browsetweak_readbutton{right:0}.te_browsetweak_infobutton:hover,.te_browsetweak_readbutton:hover{background-color:#22a7f0;color:#fff;text-decoration:none}.te_browsetweak_infobutton{left:0}");
								$("div.overlay").each(function()
								{
									// Get Book ID
									var bookID = $(this).attr("id");
									bookID = bookID.replace("te_book_","");
									bookID = bookID.replace("_overlay","");
									bookID = parseInt(bookID);
									
									// Replace old class on view button.
									var viewInfoButton = $(this).find("a.overlay-button");
									$(viewInfoButton).text("INFO");
									var viewButtonSrc = $(viewInfoButton)[0]['outerHTML'];
									$(viewInfoButton).removeClass("overlay-button");
									$(viewInfoButton).addClass("te_browsetweak_infobutton");
									
									// Add new read button.
									var readButtonSrc = viewButtonSrc.replace("INFO","READ");
									readButtonSrc = readButtonSrc.replace("class=\"overlay-button\"","class=\"te_browsetweak_readbutton\"");
									$(this).append(readButtonSrc);
									var readButton = $(this).find("a.te_browsetweak_readbutton");
									var linkURL = TE.site.reader.prefix + bookID + "/1";
									$(readButton).attr("href",linkURL);
									
									if(TE.User.recordKeeper)
									{
										if(TE.User.recordKeeper.data[bookID])
										{
											linkURL = TE.site.reader.prefix + bookID + "/" + TE.User.recordKeeper.data[bookID]['lastSeen'];
											$(readButton).attr("href",linkURL);
										}
									}
								});
							}
						}
					});
				}
			},
		};
		
		//TE.Enhancement.option.main(type,name,description,defaultValue,arguments)
		var opt1 =
		{
			type : "toggle",
			name : "Remove Sidebar",
			description : "Removes the &quot;random picks&quot; sidebar.",
			defaultValue : false,
			arguments : false,
		};
		var opt2 =
		{
			type : "toggle",
			name : "More Books",
			description : "Displays one extra book per row.",
			defaultValue : false,
			arguments : false,
		};
		var opt3 =
		{
			type : "toggle",
			name : "Thumbnail Links",
			description : "Clicking anywhere on the thumbnail image will load the Doujin.",
			defaultValue : false,
			arguments : false,
		};
		var opt4 =
		{
			type : "toggle",
			name : "Skip Info",
			description : "Skips the book info page and takes you directly to the reader.",
			defaultValue : false,
			arguments : false,
		};

		options.push(new TE.Enhancement.option.main(opt1.type,opt1.name,opt1.description,opt1.defaultValue,opt1.arguments));
		options.push(new TE.Enhancement.option.main(opt2.type,opt2.name,opt2.description,opt2.defaultValue,opt2.arguments));
		options.push(new TE.Enhancement.option.main(opt3.type,opt3.name,opt3.description,opt3.defaultValue,opt3.arguments));
		options.push(new TE.Enhancement.option.main(opt4.type,opt4.name,opt4.description,opt4.defaultValue,opt4.arguments));
		TE.Enhancements[shortName] = new TE.Enhancement.main(name,description,options,section,incompatible,main);
	})();
	
	
	
	/*******************************************************
	* Reader Enhancements
	*******************************************************/
	(function()
	{
		/*******************************************************
		* Automatic Repositioning - Reader Enhancement
		*******************************************************/
		var name = "Automatic Repositioning",
			shortName = TE.fn.camelize(name),
			description = "Automatically scrolls you to the top of the image.",
			options = [],
			section = "Reader",
			incompatible = false,
			main =
			{
				init : function()
				{
					if(TE.on.reader)
					{
						$.when(TE.status.enhancePage).done($.proxy(function()
						{
							TE.Enhancements.unstickiedHeader.fn.run();
							this.run();
						},this));
					}
				},
				run : function()
				{
					var imgPos = $("#te_imageBlock").position().top;
					$('html, body').animate({ scrollTop: imgPos}, 1);
				},
			};
			
		var opt1 =
		{
			type : "enable",
			name : false,
			description : false,
			defaultValue : false,
			arguments : false,
		};
		options.push(new TE.Enhancement.option.main(opt1.type,opt1.name,opt1.description,opt1.defaultValue,opt1.arguments));
		TE.Enhancements[shortName] = new TE.Enhancement.main(name,description,options,section,incompatible,main);
	})();
	
	(function()
	{
		/*******************************************************
		* Seamless Viewing - Reader Enhancement
		*******************************************************/
		var name = "Seamless Viewing",
			shortName = TE.fn.camelize(name),
			description = "Negates the need to load the entire Tsumino webpage again every time you flip through a Doujin.<br />This means faster load times, and not losing sight of the previous page until the instant the new page is loaded.<br />Seamless Viewing leaves the previous image in place until the new one is ready.<br />Once the new image is ready, you are automatically scrolled up to the top of the image.",
			options = [],
			section = "Reader",
			incompatible = ["Infinity Scrolling"],
			main = {};
		
		main =
		{
			replaceKeybinds : function()
			{
				// Disable default Tsumino Reader Keybinds.
				unsafeWindow.$(document).off("keydown");
				
				// Use Classic Seamless Viewing keybinds instead.
				$(document).keydown($.proxy(function(e)
				{
					var bk = $.proxy(function() { this.changePage(TE.book.prevPage); },this);
					var fwd = $.proxy(function() { this.changePage(TE.book.nextPage); },this);
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
				},this));
			},
			redirection : function()
			{
				var temp = TE.myLocation;
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
					if(TE.on.reader)
					{
						TE.log("gname",name,"Redirecting you to the real page.");
						// Kill the page before it can load.
						TE.fn.killPage();
						var newLocation = TE.site.reader.url + bookID + "/" + newPage;
						window.location.href = newLocation;
					}
					// If on the auth page, wait for DOM and update form info to redirect to the appropriate page.
					if(TE.on.auth)
					{
						$(document).ready(function()
						{
							$("input#Page").val(newPage);
						});
					}
				}
			},
			changePage : function(pageNumber)
			{
				var dfd = jQuery.Deferred();
				
				// Make sure the page is in range first.
				if((pageNumber <= TE.book.totalPages) && (pageNumber > 0))
				{
					TE.status.load = TE.load(pageNumber);
					// Once the requested page is preloaded, continue.
					$.when(TE.status.load).then($.proxy(function()
					{
						pageNumber = parseInt(pageNumber);
						// Update page and location variables.
						TE.book.currentPage = pageNumber;
						TE.book.prevPage = pageNumber-1;
						TE.book.nextPage = pageNumber+1;
						TE.book.currentPageURL = TE.site.reader.prefix + TE.book.id + "/" + TE.book.currentPage;
						
						var newImageSrc = TE.site.image.prefix + TE.book.id + "/" + TE.book.currentPage;
						$("#te_readerCurrentImage").attr("src",newImageSrc);
						
						// Reposition.
						TE.Enhancements.automaticRepositioning.fn.run();
						
						// If Record Keeper is Enabled.
						if(TE.User.recordKeeper.enable) { TE.Enhancements.recordKeeper.fn.update(); }
						
						// If Page Jumper is Enabled.
						if(TE.User.pageJumper.enable) { $("#te_pageJumper").val(pageNumber); }
						
						// Update links.
						this.updateLinks();
						window.location.href = TE.myLocation + "#" + pageNumber;
						TE.log("gname",name,"Image " + pageNumber + " has been placed in the reader.");
						dfd.resolve();
					},this));
				}
				// If the user requested a page that was less than 1 or greater than the total number of pages, stop.
				else
				{
					TE.log("gname","Seamless Viewing","Image " + pageNumber + " is out of range and will not be loaded.");
					dfd.resolve();
				}
				return dfd.promise();
			},
			updateLinks : function()
			{
				TE.vbLog("gname",name,"Updating links... ");
				scope = this;
				// Remove old click binds from links.
				$("#te_prevButton").off("click");
				$("#te_nextButton").off("click");
				$("#te_imageLink").off("click");
				
				// Establish updated click binds.
				if(TE.book.currentPage < TE.book.totalPages)
				{
					$("#te_nextButton").css("display","inline");
					$("#te_nextButton").click($.proxy(function(){ this.changePage(TE.book.nextPage); },this) );
					$("#te_imageLink").css("cursor","pointer");
					$("#te_imageLink").click($.proxy(function(){ this.changePage(TE.book.nextPage); },this) );
				}
				else
				{
					$("#te_nextButton").css("display","none");
					$("#te_imageLink").css("cursor","context-menu");
					$("#te_imageLink").attr("href","javascript:;");
				}
				if(TE.book.currentPage > 1)
				{
					$("#te_prevButton").css("display","inline");
					$("#te_prevButton").click($.proxy(function(){ this.changePage(TE.book.prevPage); },this) );
				}
				else
				{
					$("#te_prevButton").css("display","none");
				}
				
				$("#te_currentPage").html("<a href='"+TE.book.currentPageURL+"'>"+TE.book.currentPage+"</a>");
			},
			init : function()
			{
				if(TE.on.reader)
				{
					this.redirection();
					$.when(TE.status.enhancePage).done($.proxy(function()
					{
						TE.log("gname",name,"Initializining...");
						
						// Replace default Tsumino reader keybinds with Enhanced Seamless Viewing keybinds.
						this.replaceKeybinds();
						
						// Automatic Repositioning.
						TE.Enhancements.automaticRepositioning.fn.run();
						
						// Unstickied Header.
						TE.Enhancements.unstickiedHeader.fn.run();
						
						// Remove default Tsumino doujin navigation links.
						$("#te_prevButton").attr("href","javascript:;");
						$("#te_nextButton").attr("href","javascript:;");
						$("#te_imageLink").attr("href","javascript:;");
						
						// Update doujin navigation links.
						this.updateLinks();
					},this));
				}
			},
		};
		
		//TE.Enhancement.option.main(type,name,description,defaultValue,arguments)
		var opt1 =
		{
			type : "enable",
			name : false,
			description : false,
			defaultValue : false,
			arguments : false,
		};
		var opt2 =
		{
			type : "toggle",
			name : "Show Messages",
			description : "Displays loading messages while preparing images for display.",
			defaultValue : true,
			arguments : false,
		};
		
		options.push(new TE.Enhancement.option.main(opt1.type,opt1.name,opt1.description,opt1.defaultValue,opt1.arguments));
		//options.push(new TE.Enhancement.option.main(opt2.type,opt2.name,opt2.description,opt2.defaultValue,opt2.arguments));
		
		TE.Enhancements[shortName] = new TE.Enhancement.main(name,description,options,section,incompatible,main);
	})();
	
	
	(function()
	{
		/*******************************************************
		* Page Jumper - Reader Enhancement
		*******************************************************/
		var name = "Page Jumper",
			shortName = TE.fn.camelize(name),
			description = "Adds a dropdown box to the Reader that lets you skip directly to a page.",
			options = [],
			section = "Reader",
			incompatible = false,
			main = {};
			
		main =
		{
			init : function()
			{
				if(TE.on.reader)
				{
					$.when(TE.status.enhancePage).done(function()
					{
						$("#te_readerPagination").after("<h1 style='display:inline;'>Jump to page: </h1><select class='te_select' id='te_pageJumper'></select><br />");
						for(i = 1; i <= TE.book.totalPages; i++)
						{
							$("#te_pageJumper").append("<option value='"+i+"'>"+i+"</option>");
						}
						$("#te_pageJumper").val(TE.book.currentPage);
						
						$("#te_pageJumper").change(function()
						{
							// Seamless Viewing Compatibility
							if(TE.User.seamlessViewing.enable)
							{
								TE.Enhancements.seamlessViewing.fn.changePage($("#te_pageJumper").val());
							}
							// Vanilla Tsumino
							else
							{
								window.location.href = TE.site.reader.url + TE.book.id + "/" + $("#te_pageJumper").val();
							}
						});
					});
				}
			},
			
		};
		
		//TE.Enhancement.option.main(type,name,description,defaultValue,arguments)
		var opt1 =
		{
			type : "enable",
			name : false,
			description : false,
			defaultValue : false,
			arguments : false,
		};
		options.push(new TE.Enhancement.option.main(opt1.type,opt1.name,opt1.description,opt1.defaultValue,opt1.arguments));
		
		TE.Enhancements[shortName] = new TE.Enhancement.main(name,description,options,section,incompatible,main);
	})();
	


	
	/*************************************************************************************
	* Tsumino Enhanced Settings Page
	*************************************************************************************/
	TE.settings =
	{
		render : function()
		{
			this.navContent = $("#te_siteNavbar").html();
			this.pageContent = $("#te_pageContent").html();
			$("#te_siteNavbar").html("<div class='container-fluid'><div id='te_settingsTop' class='navbar-header navbar-brand'>TSUMINO <span id='te_brand'>ENHANCED</span>&nbsp;&nbsp;</div></div>");
			$("#te_settingsTop").append("<span id='te_version'>"+TE.version+"</span>");
			$("#te_settingsTop").css("margin-bottom","2px");
			$("#te_pageContent").html("<div id='te_settings'></div>");
			
			// Settings page navigation structure.
			$("#te_settings").prepend("<div id='te_tabContainer' class='te_configTab'><nav><ul><li id='tab_generalEnhancements'><a href='javascript:;'>General</a></li><li id='tab_browsingEnhancements'><a href='javascript:;'>Browsing</a></li><li id='tab_readerEnhancements'><a href='javascript:;'>Reader</a></li><li id='tab_searchEnhancements'><a href='javascript:;'>Search</a></li><li id='tab_forumEnhancements'><a href='javascript:;'>Forum</a></li></ul></nav></div>");
			
			// Create sections.
			$("#te_settings").append("<div id='te_settingsBody'></div>");
			$("#te_settingsBody").append("<div id='generalEnhancements' class='te_options'></div>");
			$("#te_settingsBody").append("<div id='browsingEnhancements' class='te_options'></div>");
			$("#te_settingsBody").append("<div id='readerEnhancements' class='te_options'></div>");
			
			// Populate Sections.
			for (var key in TE.Enhancements)
			{
				if (TE.Enhancements.hasOwnProperty(key))
				{
					var obj = TE.Enhancements[key];

					if(obj["section"] != false)
					{
						// Determine which section to append to.
						var sectionID = "";
						if (obj["section"] == "General") { sectionID = "#generalEnhancements"; }
						else if (obj["section"] == "Browsing") { sectionID = "#browsingEnhancements"; }
						else if (obj["section"] == "Reader") { sectionID = "#readerEnhancements"; }
						
						// Append the Enhancement's options group to the section.
						$(sectionID).append("<div id='"+obj["shortName"]+"_group' class='te_optionGroup'></div>");
						
						// Add the description.
						if(obj["description"] != false)
						{
							$("#"+obj["shortName"]+"_group").append("<div class='te_optionDescription'>"+obj["description"]+"</div>");
						}
						
						// Add the primary options area.
						$("#"+obj["shortName"]+"_group").append("<div id='te_options_"+obj["shortName"]+"'></div>");
						
						var noEnable = true;
						if(obj["options"] != false)
						{
							// Display all options.
							for (var oKey in obj["options"])
							{
								if (obj["options"].hasOwnProperty(oKey))
								{
									var option = obj["options"][oKey];
									// Write the Enable option.
									if(option["type"] == "enable")
									{
										$("#"+obj["shortName"]+"_group").prepend("<div class='te_fauxRow'><div class='te_fauxCell te_switchContainer'><input id='tes_"+obj["shortName"]+"_enable' name='tes_"+obj["shortName"]+"_enable' type='checkbox' class='te_switch te_switch-style' /><label for='tes_"+obj["shortName"]+"_enable'></label></div><div class='te_fauxCell'><h2 class='te_enhancementName'>"+obj["name"]+"</h2></div></div>");
										noEnable = false;
									}
									// Write Toggle Options.
									if(option["type"] == "toggle")
									{
										$("#te_options_"+obj["shortName"]).append("<br /><div id='"+obj["shortName"]+"_optionContainer_"+option['shortName']+"'><input id='tes_"+obj["shortName"]+"_"+option['shortName']+"' name='tes_"+obj["shortName"]+"_"+option['shortName']+"' type='checkbox' class='te_subOption' /><label for='tes_"+obj["shortName"]+"_"+option['shortName']+"'><span></span>"+option['name']+"</label></div>");
										// Write the option's description.
										if(option["description"] != false)
										{
											$("#"+obj["shortName"]+"_optionContainer_"+option['shortName']).append("<br />"+option["description"]);
										}
									}
								}
							}
						}
						
						// If there was no "enable" option found:
						if(noEnable)
						{
							// Display the title without a switch.
							$("#"+obj["shortName"]+"_group").prepend("<h2 class='te_enhancementName'>"+obj["name"]+"</h2>");
							
							// Apply user settings.
							if(typeof TE.User[obj["shortName"]] !== "undefined")
							{
								for (var oKey in obj["options"])
								{
									var option = obj["options"][oKey];
									if(option["type"] == "toggle")
									{
										$("#tes_"+obj["shortName"]+"_"+option['shortName'])
											.prop("checked",TE.User[obj["shortName"]][option['shortName']]);
									}
								}
							}
						}
						else
						{
							// Apply user settings.
							if(typeof TE.User[obj["shortName"]] !== "undefined")
							{
								for (var oKey in obj["options"])
								{
									var option = obj["options"][oKey];
									if(TE.User[obj["shortName"]]["enable"] == true)
									{
										if(option["type"] == "enable")
										{
											$("#tes_"+obj["shortName"]+"_"+option['shortName']).prop("checked",true);
										}
										else
										{
											if(option["type"] == "toggle")
											{
												$("#tes_"+obj["shortName"]+"_"+option['shortName'])
													.prop("checked",TE.User[obj["shortName"]][option['shortName']]);
											}
										}
									}
									else
									{
										if(option["type"] != "enable")
										{
											$("#tes_"+obj["shortName"]+"_"+option['shortName']).prop("checked",false);
											$("#tes_"+obj["shortName"]+"_"+option['shortName']).prop("disabled","disabled");
										}
									}
								}
							}
							else
							{
								for (var oKey in obj["options"])
								{
									if (obj["options"].hasOwnProperty(oKey))
									{
										var option = obj["options"][oKey];
										if(option["type"] != "enable")
										{
											if(!$("#tes_"+obj["shortName"]+"_"+option['shortName']).prop("disabled"))
											{
												$("#tes_"+obj["shortName"]+"_"+option['shortName']).prop("disabled","disabled");
											}
										}
									}
								}
							}
							
							// Apply default values to options when enabling an Enhancement.
							$("#tes_"+obj["shortName"]+"_enable").change({ obj : obj },function(event)
							{
								if($("#tes_"+event.data.obj["shortName"]+"_enable").prop("checked") == true)
								{
									for (var oKey in event.data.obj["options"])
									{
										if (event.data.obj["options"].hasOwnProperty(oKey))
										{
											var option = event.data.obj["options"][oKey];
											if(option["type"] == "toggle")
											{
												$("#tes_"+event.data.obj["shortName"]+"_"+option['shortName']).removeProp("disabled");
												$("#tes_"+event.data.obj["shortName"]+"_"+option['shortName']).prop("checked",option['defaultValue']);
											}
										}
									}
								}
								// Disable Enhancement options unless the enhancement is enabled.
								else
								{
									for (var oKey in event.data.obj["options"])
									{
										if (event.data.obj["options"].hasOwnProperty(oKey))
										{
											var option = event.data.obj["options"][oKey];
											if(option["type"] != "enable")
											{
												if(option["type"] == "toggle")
												{
													$("#tes_"+event.data.obj["shortName"]+"_"+option['shortName']).prop("checked",false);
												}
												$("#tes_"+event.data.obj["shortName"]+"_"+option['shortName']).prop("disabled","disabled");
											}
										}
									}
								}
							});
						}
						// List any incompatibilities.
						if(obj["incompatible"] != false)
						{
							$("#"+obj["shortName"]+"_group").append("<br /><div class='te_en_incompatible' id='"+obj["shortName"]+"_incompatible'>This Enhancement is incompatible with: </div>");
							var punct = "";
							for(i = 0; i < obj["incompatible"].length; i++)
							{
								$("#"+obj["shortName"]+"_incompatible").append("<span class='te_enhancementColor'>"+obj["incompatible"][i]+"</span>");
								if(i+1 == obj["incompatible"].length) { punct = "."; }
								else { punct = ", "; }
								$("#"+obj["shortName"]+"_incompatible").append(punct);
							}
						}
					}
				}
			}
			
			
			
			$("#te_settingsBody").append("<div id='searchEnhancements' class='te_options'></div>");
			$("#te_settings").append("<div id='forumEnhancements' class='te_options'></div>");
			
			// Create Buttons
			$("#te_settings").append("<br /><br /><div id='te_buttonContainer'></div><br /><br />");
			$("#te_buttonContainer").append("<a id='te_saveAndCloseButton' class='book-read-button'>Save &amp; Reload</a>&nbsp;&nbsp;");
			$("#te_saveAndCloseButton").click($.proxy(function(){ this.save(); location.reload(); },this));
			$("#te_buttonContainer").append("<a id='te_applySettingsButton' class='book-read-button'>Apply</a>&nbsp;&nbsp;");
			$("#te_applySettingsButton").click($.proxy(function(){ this.save(); },this));
			$("#te_buttonContainer").append("<a id='te_cancelSettingsButton' class='book-read-button'>Cancel</a>");
			$("#te_cancelSettingsButton").click($.proxy(function(){ this.remove(); },this));
			
			// Activate settings page navigation.
			(function ()
			{
				var newActiveTab = "";
				$("#te_tabContainer").find("a").click(function()
				{
					$(this).parent().siblings().removeClass("te_tab-current");
					$(this).parent().addClass("te_tab-current");
					newActiveTab = "#" + $(this).parent().attr("id").replace("tab_","");
					$(newActiveTab).siblings().removeClass("te_currentTabContent");
					$(newActiveTab).siblings().addClass("te_hiddenTabContent");
					$(newActiveTab).removeClass("te_hiddenTabContent");
					$(newActiveTab).addClass("te_currentTabContent");
				});
				
				// Temporarily deactivate Search and Forum tabs.
				$("#te_tabContainer").find("a").each(function()
				{
					if(($(this).text() == "Search") || ($(this).text() == "Forum"))
					{
						$(this).off("click");
						$(this).css("display","none");
					}
				});
				
				$(".te_options").addClass("te_hiddenTabContent");
				$("#generalEnhancements").removeClass("te_hiddenTabContent");
				$("#tab_generalEnhancements").addClass("te_tab-current");
			})();
		},
		remove : function()
		{
			$("#te_siteNavbar").html(this.navContent);
			$("#te_pageContent").html(this.pageContent);
			$("#te_configNavLink").click($.proxy(function(){ this.render(); },this));
		},
		save : function ()
		{
			// Find all enhancement groups within the main settings area.
			var enhancementGroups = $("#te_settingsBody").find("div[id*='_group']"),
				enhancementSettings = {};
			
			// Loop through the groups to get all the individual settings.
			for(i=0 ; i < enhancementGroups.length; i++)
			{
				var thisEnhancement = enhancementGroups[i];
				var thisEnhName = $(thisEnhancement).attr("id");
				thisEnhName = thisEnhName.replace("_group","");
				var thisEnhSettings = $(thisEnhancement).find("*[id*='tes_"+thisEnhName+"_']");
				enhancementSettings[thisEnhName] = {};
				for(es = 0; es < thisEnhSettings.length; es++)
				{
					var thisEnSetting = $(thisEnhSettings)[es],
						thisEnSettingName = $(thisEnSetting).attr("id");
					thisEnSettingName = thisEnSettingName.replace("tes_"+thisEnhName+"_","");
					if($(thisEnSetting).prop("tagName") == "INPUT")
					{
						if($(thisEnSetting).prop("type") == "checkbox")
						{
							enhancementSettings[thisEnhName][thisEnSettingName] = $(thisEnSetting).prop("checked");
						}
					}
				}
			}
			$.extend(true,TE.User,enhancementSettings);
			TE.updateSettings();
		},
	};
	
	/*************************************************************************************
	* Tsumino Enhanced Initialization Code
	*************************************************************************************/
	// Initialization.
	TE.init = function()
	{
		// Output initializating messages to the console.
		var debugState = "Disabled";
		if(TE.config.debug)
		{
			if(TE.config.verboseDebug) { debugState = "Verbose"; }
			else { debugState = "Standard"; }
		}
		
		// Check which Enhancements the user has enabled.
		var enabledEnhancements = [],
			eeLongNames = "",
			autoOn = [];
		for (var key in TE.User)
		{
			if (TE.User.hasOwnProperty(key))
			{
				var obj = TE.User[key];
				for (var prop in obj)
				{
					if (obj.hasOwnProperty(prop))
					{
						if((prop == "enable") && (obj[prop] == true))
						{
							// Add enabled Enhancements to the appropriate array.
							if(typeof TE.Enhancements[key] !== "undefined")
							{
								enabledEnhancements.push(key);
								eeLongNames = eeLongNames + "[X] " + TE.Enhancements[key].name + "\r\n";
							}
						}
						else if ((prop == "enable") && (obj[prop] == false))
						{
							eeLongNames = eeLongNames + "[ ] " + TE.Enhancements[key].name + "\r\n";
						}
					}
				}
			}
		}
		// Check for automatic enhancements.
		for (var key in TE.Enhancements)
		{
			if (TE.Enhancements.hasOwnProperty(key))
			{
				var obj = TE.Enhancements[key];
				autoOn.push(obj['shortName']);
				for (var prop in obj)
				{
					if (obj.hasOwnProperty(prop))
					{
						if(prop == "options")
						{
							for(var optNum in obj['options'])
							{
								for (var opt in obj['options'][optNum])
								{
									if((opt == "type") && (obj['options'][optNum][opt] == "enable"))
									{
										var thisIndex = autoOn.indexOf(obj['shortName']);
										if (thisIndex > -1) 
										{
											autoOn.splice(thisIndex, 1);
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
		for (i = 0; i < autoOn.length; i++)
		{
			enabledEnhancements.push(autoOn[i]);
			eeLongNames = eeLongNames + "[X] " + TE.Enhancements[autoOn[i]].name + "\r\n";
		}
		
		// Output initialization messages.
		TE.log("gname",TE.name,"Version:	" + TE.version,"Debugging:	" + debugState,"Enhancements:",eeLongNames);
		TE.vbLog("gname",TE.name,"Current Settings:",TE.User);
		TE.vbLog("gname","TE.site",TE.site);
		TE.vbLog("gname","TE.on",TE.on);
		TE.vbLog("gname","TE.Enhancements",TE.Enhancements);
		
		// Set up TE.status.enhancePage for Enhancements that require it to run.
		TE.status.enhancePage = TE.enhancePage();
				
		// Initialize all enabled Enhancements.
		for(i = 0; i < enabledEnhancements.length; i++)
		{
			if(typeof TE.Enhancements[enabledEnhancements[i]] !== "undefined")
			{
				TE.Enhancements[enabledEnhancements[i]].fn.init();
			}
		}
	};
	
	// Export Tsumino Enhanced to the window.
	if (global.TE) { throw new Error(TE.name + " has already been defined"); }
	else { global.TE = TE; }
	// Nothing below here.
})(typeof window === "undefined" ? this : window);

// Initialize Tsumino Enhanced.
TE.init();
