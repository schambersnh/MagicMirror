/* Config Sample
 *
 * For more information on how you can configure this file
 * see https://docs.magicmirror.builders/configuration/introduction.html
 * and https://docs.magicmirror.builders/modules/configuration.html
 *
 * You can use environment variables using a `config.js.template` file instead of `config.js`
 * which will be converted to `config.js` while starting. For more information
 * see https://docs.magicmirror.builders/configuration/introduction.html#enviromnent-variables
 */
let config = {
	address: "127.0.0.1", 	// Address to listen on, can be:
							// - "localhost", "127.0.0.1", "::1" to listen on loopback interface
							// - another specific IPv4/6 to listen on a specific interface
							// - "0.0.0.0", "::" to listen on any interface
							// Default, when address config is left out or empty, is "localhost"
	port: 8080,
	basePath: "/",	// The URL path where MagicMirror² is hosted. If you are using a Reverse proxy
									// you must set the sub path here. basePath must end with a /
	ipWhitelist: ["127.0.0.1", "::ffff:127.0.0.1", "::1"],	// Set [] to allow all IP addresses
									// or add a specific IPv4 of 192.168.1.5 :
									// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.1.5"],
									// or IPv4 range of 192.168.3.0 --> 192.168.3.15 use CIDR format :
									// ["127.0.0.1", "::ffff:127.0.0.1", "::1", "::ffff:192.168.3.0/28"],

	useHttps: false,			// Support HTTPS or not, default "false" will use HTTP
	httpsPrivateKey: "",	// HTTPS private key path, only require when useHttps is true
	httpsCertificate: "",	// HTTPS Certificate path, only require when useHttps is true

	language: "en",
	locale: "en-US",   // this variable is provided as a consistent location
			   // it is currently only used by 3rd party modules. no MagicMirror code uses this value
			   // as we have no usage, we  have no constraints on what this field holds
			   // see https://en.wikipedia.org/wiki/Locale_(computer_software) for the possibilities

	logLevel: ["INFO", "LOG", "WARN", "ERROR"], // Add "DEBUG" for even more logging
	timeFormat: 12,
	units: "imperial",

	modules: [
		{
			module: "alert",
		},
		{
			module: "updatenotification",
			position: "top_bar"
		},
		{
			module: "clock",
			position: "top_left"
		},
		{
			module: "MMM-Spotify",
			position: "bottom_bar", // "bottom_bar" or "top_bar" for miniBar
			config: {
				debug: false, // debug mode
				style: "default", // "default" or "mini" available (inactive for miniBar)
				moduleWidth: 360, // width of the module in px
				control: "default", // "default" or "hidden"
				showAccountButton: true, // if you want to show the "switch account" control button
				showDeviceButton: true, // if you want to show the "switch device" control button
				useExternalModal: false, // if you want to use MMM-Modal for account and device popup selection instead of the build-in one (which is restricted to the album image size)
				accountDefault: 0, // default account number, attention : 0 is the first account
				updateInterval: 1000, // update interval when playing
				idleInterval: 1000, // update interval on idle
				onStart: null, // disable onStart feature with `null`
				deviceDisplay: "Listening on", // text to display in the device block (default style only)
				allowDevices: [], //If you want to limit devices to display info, use this. f.e. allowDevices: ["RASPOTIFY", "My Home speaker"],
				// if you want to send custom notifications when suspending the module, f.e. switch MMM-Touch to a different "mode"
				notificationsOnSuspend: [
					{
						notification: "TOUCH_SET_MODE",
						payload: "myNormalMode",
					},
					{
						notification: "WHATEVERYOUWANT",
						payload: "sendMe",
					}
				],
				// if you want to send custom notifications when resuming the module, f.e. switch MMM-Touch to a different "mode"
				notificationsOnResume: [
					{
						notification: "TOUCH_SET_MODE",
						payload: "mySpotifyControlMode",
					},
				],
				volumeSteps: 5, // in percent, the steps you want to increase or decrese volume when reacting on the "SPOTIFY_VOLUME_{UP,DOWN}" notifications
				miniBarConfig: {
					album: false, // display Album name in miniBar style
					scroll: false, // scroll title / artist / album in miniBar style
					logo: false, // display Spotify logo in miniBar style
				}
			}
		},
		{
			module: "calendar",
			header: "Upcoming Events",
			position: "top_left",
			config: {
				calendars: [
					{
						symbol: "calendar-check",
						url: "https://calendar.google.com/calendar/ical/stephenchambers515%40gmail.com/private-7ad9805b526b801b71772e1282d5a7a5/basic.ics"
					}
				]
			}
		},
		{
			module: "MMM-OpenWeatherMapForecast",
			header: "Weather",
			position: "bottom_left",
			classes: "default everyone",
			disabled: false,
			config: {
				apikey: "911235ef4349d60e3b7092db05c101e5",
				latitude: "41.558658",
				longitude: "-72.650627",
				iconset: "4c",
				units: "imperial",
				showHourlyForecast: false,
				maxDailiesToShow: 5,
				concise: true,
				forecastLayout: "table"
			}
		},
		{
			module: "MMM-MyScoreboard",
			position: "bottom_right",
			classes: "default everyone",
			header: "My Scoreboard",
			config: {
				showLeagueSeparators: true,
				colored: true,
				viewStyle: "mediumLogos",
				sports: [
					{
						league: "NHL",
						teams: ["BOS"]
					},
					{
						league: "NBA",
						teams: ["BOS"]
					},
					{
						league: "NFL",
						teams: ["NE"]
					},
					{
						league: "MLB",
						teams: ["BOS"]
					},
				]

			}
		},
		{
			module: "newsfeed",
			position: "top_center",
			config: {
				feeds: [
					{
						title: "New York Times",
						url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml"
					}
				],
				showSourceTitle: true,
				showPublishDate: true,
				broadcastNewsFeeds: true,
				broadcastNewsUpdates: true
			}
		},
		{
			module: "down-payment-saver",
			position: "middle_center",
			config: {
				goal: 160000,
				refreshTime: 300000
				// investments: [
				// 	{
				// 		ticker: 'SPY',
				// 		amount: 15.5
				// 	},
				// 	{
				// 		ticker: 'AAPL',
				// 		amount: 10,
				// 	},
				// 	{
				// 		ticker: 'BTC',
				// 		amount: 10,
				// 		crypto: true
				// 	}
				// ],
			}
		},
	],
};

/*************** DO NOT EDIT THE LINE BELOW ***************/
if (typeof module !== "undefined") { module.exports = config; }
