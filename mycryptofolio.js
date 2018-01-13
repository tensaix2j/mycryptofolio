

function SimpleList() {


	//-----
	this.total_resource = 6;
	this.usdsgd 	    = 1.35;
	this.queries_loaded = 0;
	this.total_queries  = 11;

	//---------------
	this.get_resources = function() {

		var profile = this.get_querystring_value("profile") ;
	    var server  = this.get_querystring_value("server");

	    if ( !profile ) {
	    	profile = "831a4554-f848-11e7-a727-573ba0e3182e"
	    }
	   	if ( !server ) {
	        server = "jsonblob";
	    }
	    this.get_holdings( profile , server );
	    
	}


	//-------
	this.get_exchange_rates = function() {
		this.get_exchange_rates_high_priority();
	}

	//--------------------
	this.get_exchange_rates_high_priority = function() {
		
		this.get_fixer_exchange_rates();
		this.get_binance_exchange_rates();
	}

	//---------
	// Called on completetion of high priority
	this.get_exchange_rates_low_priority = function() {

		this.get_hitbtc_exchange_rates();
		this.get_kucoin_exchange_rates();
		this.get_okex_exchange_rates("TIO","BTC");
		this.get_bittrex_exchange_rates("BTC","USDT");
		this.get_bittrex_exchange_rates("ETH","USDT");
		this.get_bittrex_exchange_rates("ETC","BTC");
		this.get_bittrex_exchange_rates("CVC","BTC");
		this.get_bittrex_exchange_rates("SYS","BTC");
		this.get_bittrex_exchange_rates("GNT","BTC");
		this.get_bittrex_exchange_rates("CLUB","BTC");
		
	}

	//----------
	this.get_exchange_rates_cb = function( provider ) {
		
		this.show_loading_msg( provider + " query completed." );
		this.queries_loaded += 1;
		if ( this.queries_loaded >= this.total_queries ) {
			this.calculate_total();
			this.render_list();
		}
	}


	//----
	this.common_extract = function( provider, base, quote , price ) {

				
		if ( typeof sl.exchange_rates[base] != "undefined" &&
			 ( typeof sl.exchange_rates[base].provider == "undefined" || 
			 	sl.exchange_rates[base].provider == "binance" )  ) {
					
			sl.exchange_rates[base].provider = provider ;
				
			if ( quote == "BTC" ) {

				sl.exchange_rates[base].btc = price;

				
				if ( base == "ETH" ) {
					sl.exchange_rates["BTC"].eth = 1 / price;

					sl.ethbtc = price;
					sl.btceth = sl.exchange_rates["BTC"].eth;
				}

			} else if ( quote == "ETH" ) {
				sl.exchange_rates[base].eth = price;

			} else if ( quote == "USDT" || quote == "USD" ) {

				sl.exchange_rates[base].usd = price;
				sl.exchange_rates[base].sgd = price * sl.usdsgd;
			
				if ( base == "BTC" ) {
					sl.exchange_rates["USDT"].btc = 1 / price;
					sl.btcusd = price;
				}
				if ( base == "ETH" ) {
					sl.exchange_rates["USDT"].eth = 1 / price;	
					sl.ethusd = price;
				}
			}

		}
	}


	//--------
	this.stop_loading_msg = function() {
		var loader_icon = document.getElementById("loader_icon");	
		if ( loader_icon ) {
			loader_icon.innerHTML = "";
		}
	}

	//-------------------------------
	this.show_loading_msg = function(msg) {
			
		console.log(msg);	
		var loader_msg = document.getElementById("loader_msg");
		if ( loader_msg ) {
			loader_msg.innerHTML += ("<br/>" + msg );
		}

	}

	//--------
	this.get_binance_exchange_rates = function() {

		var sl = this;

		var proxy 		= "https://cors-anywhere.herokuapp.com/";
		var targeturl 	= "https://www.binance.com/api/v1/ticker/allPrices";
			
		var useurl = proxy + targeturl

		
		this.show_loading_msg("Querying Binance");
		this.loadJSON(useurl, function( obj ) {

			for ( i = 0 ; i < obj.length ; i++ ) {

				var pair 	= obj[i].symbol ;
				var price  	= parseFloat( obj[i].price ); 

				var quotelen = 3;
				if ( pair.substr(pair.length - 4 , pair.length ) == "USDT" ) {
					quotelen = 4;
				}
				var base    = pair.substr( 0, pair.length - quotelen );
				var quote   = pair.substr( pair.length - quotelen, pair.length );

				//console.log( pair, base, quote , price );
				sl.common_extract("binance", base, quote, price );

			}
			sl.get_exchange_rates_cb("binance");
			sl.get_exchange_rates_low_priority();
			
	    }, function(xhr) {
	    	sl.show_loading_msg("Error getting data from binance.");
	    });
	
	}

	//--------
	this.get_hitbtc_exchange_rates = function() {

		var sl = this;

		var proxy 		= "https://cors-anywhere.herokuapp.com/";
		var targeturl 	= "https://api.hitbtc.com/api/1/public/ticker";
			
		var useurl = proxy + targeturl

		this.show_loading_msg("Querying HitBTC");
		
		this.loadJSON(useurl, function( obj ) {
			
			for ( pair in obj ) {

				var price  	= parseFloat( obj[pair].last ); 
				var base    = pair.substr( 0, pair.length - 3 );
				var quote   = pair.substr( pair.length - 3, pair.length );
				sl.common_extract("hitbtc", base, quote, price );
			}
			sl.get_exchange_rates_cb("hitbtc");
			
	    }, function(xhr) {
	    	sl.show_loading_msg("Error getting data from hitbtc.");
	    });
	
	}


	//--------
	this.get_kucoin_exchange_rates = function() {

		var sl = this;
		var proxy 		= "https://cors-anywhere.herokuapp.com/";
		var targeturl 	= "https://api.kucoin.com/v1/open/tick";
		var useurl = proxy + targeturl

		this.show_loading_msg("Querying Kucoin");
		
		this.loadJSON(useurl, function( obj ) {
			
			var arr = obj["data"];
			for ( i = 0 ; i < arr.length ; i++ ) {

				var obj 	= arr[i]
				var pair 	= obj.symbol ;
				var price  	= parseFloat( obj.lastDealPrice ); 

				var quotelen = 3;
				if ( pair.substr(pair.length - 4 , pair.length ) == "USDT" ) {
					quotelen = 4;
				}
				var base    = pair.substr( 0, pair.length - (quotelen + 1) );
				var quote   = pair.substr( pair.length - quotelen , pair.length );

				sl.common_extract("kucoin", base, quote, price );
			}
			sl.get_exchange_rates_cb("kucoin");
			
	    }, function(xhr) {
	    	sl.show_loading_msg("Error getting data from kucoin.");
	    });
		
	}



	//--------
	this.get_okex_exchange_rates = function( base, quote) {

		// Just need the TIOBTC
		var sl = this;
		var proxy 		= "https://cors-anywhere.herokuapp.com/";
		var targeturl 	= "https://www.okex.com/api/v1/ticker.do?symbol=" + base + "_" + quote;
		var useurl = proxy + targeturl

		this.show_loading_msg("Querying OKEX: " + base + quote );
			
		this.loadJSON(useurl, function( obj ) {
			
			try {
				var price  	= parseFloat( obj.ticker.last ); 
				sl.common_extract("okex", base, quote, price );
			} catch (err) {
				console.log("okex error:" + err);
			}
			sl.get_exchange_rates_cb("okex");
			
	    }, function(xhr) {
	    	sl.show_loading_msg("Error getting data from okex.");
	    });
		
	}

	//-----
	this.get_bittrex_exchange_rates = function( base, quote ) {

		// Just need the TIOBTC
		var sl = this;
		var proxy 		= "https://cors-anywhere.herokuapp.com/";
		var targeturl 	= "https://bittrex.com/api/v1.1/public/getticker?market=" + quote + "-" + base ;
		var useurl = proxy + targeturl

		this.show_loading_msg("Querying BITTREX: " + base + quote );
		
		this.loadJSON(useurl, function( obj ) {
			
			if ( obj.success == true ) {
				var price  	= parseFloat( obj.result.Last ); 
				sl.common_extract("bittrex", base, quote, price );
			} else {
				sl.show_loading_msg("Error getting data from bittrex. " + base + quote);
			}
			sl.get_exchange_rates_cb("bittrex:" + base + quote + ":" + obj.success );
						
	    }, function(xhr) {
	    	sl.show_loading_msg("Error getting data from bittrex. " + base + quote);
	    });
		
	}

	//---------
	this.get_fixer_exchange_rates = function( ) {

		var sl = this;
		var proxy 		= "";
		var targeturl 	= "https://api.fixer.io/latest?base=USD&symbols=SGD";
		var useurl = proxy + targeturl

		this.show_loading_msg("Querying fixer.io: for USDSGD rate" );
		
		this.loadJSON(useurl, function( obj ) {
			
			sl.usdsgd = parseFloat( obj.rates["SGD"] );
			sl.show_loading_msg("fixer.io query completed: USDSGD: " + sl.usdsgd );
					 
	    }, function(xhr) {
	    	sl.show_loading_msg("Error getting data from fixer.io");
	    });
	}




	//---------
	this.calculate_total = function() {

		var sl = this;

		sl.total_usd = 0.0;
		sl.total_sgd = 0.0;
		sl.total_btc = 0.0;
		sl.total_eth = 0.0;

		for ( symbol in sl.exchange_rates ) {
			var sl_obj = sl.exchange_rates[symbol] 

			if ( typeof sl_obj.btc == "undefined" ) {

				if ( typeof sl_obj.eth != "undefined" ) {
					sl_obj.btc = sl_obj.eth * sl.ethbtc;
				} else {
					sl_obj.btc = 0.0;
				}
			} 
			if ( typeof sl_obj.eth == "undefined" ) {
				if ( typeof sl_obj.btc != "undefined" ) {
					sl_obj.eth = sl_obj.btc * sl.btceth;
				} else {
					sl_obj.eth = 0.0;
				}
			}
			if ( typeof sl_obj.usd == "undefined") {

				if ( typeof sl_obj.btc != "undefined" ) {
					sl_obj.usd = sl_obj.btc * sl.btcusd;
				} else if ( typeof sl_obj.eth != "undefined" ) {
					sl_obj.usd = sl_obj.eth * sl.ethusd;
				} else {
					sl_obj.usd = 0.0;
				}
			
			}


			if ( typeof sl_obj.sgd == "undefined") {
				if ( typeof sl_obj.usd != "undefined" ) {
					sl_obj.sgd = sl_obj.usd * sl.usdsgd;
				} else {
					sl_obj.sgd = 0.0;
				}
			}

			if ( typeof sl_obj.total_usd == "undefined" ) {
				sl_obj.total_usd = sl_obj.own * sl_obj.usd;
				sl_obj.total_sgd = sl_obj.own * sl_obj.sgd;
				sl_obj.total_btc = sl_obj.own * sl_obj.btc;
				sl_obj.total_eth = sl_obj.own * sl_obj.eth;

				sl.total_usd += sl_obj.total_usd;
				sl.total_sgd += sl_obj.total_sgd;
				sl.total_btc += sl_obj.total_btc;
				sl.total_eth += sl_obj.total_eth;
					
			}
		}
	}


	//-----------
	// Get user's holding from profile
	this.get_holdings = function( profile_name , server ) {
		
		this.show_loading_msg( "Retrieving Profile : " + profile_name + " from " + server );

		var useurl ;
		if ( server == "myjson" ) { 
			useurl = "https://api.myjson.com/bins/" + profile_name;
		} else if ( server == "jsonblob" ) {
			useurl = "https://jsonblob.com/api/jsonBlob/" + profile_name;
		} else if ( server == "local" ) {
			useurl = profile_name
		}

		var sl = this;

		sl.exchange_rates = {};

		var mandatory_base = ["BTC","ETH","USDT"];
		for ( i = 0 ; i < mandatory_base.length ; i++ ) {
			var base = mandatory_base[i];
			sl.exchange_rates[ base ] = {};
			sl.exchange_rates[ base ].symbol = base ;
			sl.exchange_rates[ base ].own = 0; 
		}

		this.profile_name = profile_name;
		this.loadJSON(useurl, function( obj ) {
			for (base in obj ) {

				sl.exchange_rates[base] = {};
				sl.exchange_rates[base]["symbol"] = base;
				sl.exchange_rates[base]["own"] = obj[base];
				if ( base == "BTC" ) {
					sl.exchange_rates[base].btc = 1.0;
				} else if ( base == "ETH" ) {
					sl.exchange_rates[base].eth = 1.0;
				} else if ( base == "USDT" ) {
					sl.exchange_rates[base].usd = 1.0;
					sl.exchange_rates[base].sgd = sl.usdsgd;
				}
			}
			sl.get_exchange_rates();
		    	    	
	    }, function(xhr) {
	    	sl.show_loading_msg("Error Getting Profile from " + server );
	    	sl.stop_loading_msg();
	    });
	}




	//--------------------------
	this.loadJSON = function( path, success, error ) {
	    
	    var xhr = new XMLHttpRequest();
	    xhr.onreadystatechange = function() {
	        if (xhr.readyState === XMLHttpRequest.DONE) {
	            if (xhr.status === 200) {
	                if (success)
	                    success(JSON.parse(xhr.responseText));
	            } else {
	                if (error)
	                    error(xhr);
	            }
	        }
	    };
	    xhr.open("GET", path, true);
	    xhr.send();
	}


	//-------------
	this.get_querystring_value = function( name ) {

		var url = window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
		results = regex.exec(url);
		if (!results) { 
			return null;
		}
		if (!results[2]) { 
			return '';
		}
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}


	//--------
	this.sprintf = function( ) {
		
		var str = arguments[0];
		for ( var i = 1 ; i < arguments.length ; i++ ) {
			str = str.replace("%s", arguments[i]);
		}
		return str;
	}


	//-----
	this.render_list = function() {
		
		console.log("render_list");

		var sl = this;

		
		var mylist = document.getElementById("threadindex_list");
		var str = ""

		if ( typeof sl.total_usd != "undefined" ) {
			str += "<li id='li_profile'>";
			str += "<div>";
			str += this.sprintf( "<div class='profile_header'>%s</div>", this.profile_name );
			str += this.sprintf( "<div class='curr_rate_holding'>Total USD: <br/>%s </div>", this.numberWithCommas( sl.total_usd.toFixed(2) ));
			str += this.sprintf( "<div class='curr_rate_holding'>Total SGD: <br/>%s </div>", this.numberWithCommas( sl.total_sgd.toFixed(2) ));
			str += this.sprintf( "<div class='curr_rate_holding'>Total BTC: <br/>%s </div>", this.numberWithCommas( sl.total_btc.toFixed(4) ));
			str += this.sprintf( "<div class='curr_rate_holding'>Total ETH: <br/>%s </div>", this.numberWithCommas( sl.total_eth.toFixed(4) ));
			str += "</div>";
			str += "</li>";
		}
		

		var sorted_list = []
		for ( symbol in sl.exchange_rates ) {
			var sl_obj = sl.exchange_rates[symbol] 
			sorted_list.push( sl_obj );
		}
		sorted_list.sort( sl.compare );


		for ( i = 0 ; i < sorted_list.length ; i++ ) {
			
			str += "<li>";

				var symbol 		= sorted_list[i].symbol;
				var sl_obj 		= sl.exchange_rates[symbol];
				var provider 	= sl_obj.provider;

				
				var pair   		= this.sprintf("%sBTC", symbol );
				if ( symbol == "BTC" ) {
					pair = "BTCUSDT"
				}


				var chart_url = this.sprintf("http://tradingview.com/e?symbol=%s", pair );	
				if ( provider == "hitbtc" ) {
					chart_url = this.sprintf("https://hitbtc.com/chart/%s", pair );	
				} else if ( provider == "kucoin" ) {
					chart_url = this.sprintf("https://www.kucoin.com/#/trade/%s-ETH", symbol );
				} else if ( provider == "okex" ) {
					chart_url = "https://www.okex.com/spot.html";	
				}

				str += "<div class='curr_rate_header'>"
					str += this.sprintf( "<div class='curr_rate_symbol'><a href='%s' target='_blank'>%s</a></div>", chart_url, symbol );

				str += "</div>"
				str += "<div class='curr_rate'>";
					str += this.sprintf("<div class='curr_rate_inner'>%s USD</div>", sl_obj.usd.toFixed(4) );
					str += this.sprintf("<div class='curr_rate_inner'>%s BTC</div>", sl_obj.btc.toFixed(8) );
					str += this.sprintf("<div class='curr_rate_inner'>%s SGD</div>", sl_obj.sgd.toFixed(4) );
					str += this.sprintf("<div class='curr_rate_inner'>%s ETH</div>", sl_obj.eth.toFixed(8) );
					
				str += "</div>";
				
				if ( typeof sl_obj.total_usd != "undefined" ) {
					str += "<div>";
					str += this.sprintf( "<hr /><div class='curr_rate_holding_title'>You Own:  %s %s</div>", sl_obj.own, symbol );
					str += this.sprintf( "<div class='curr_rate_holding' id='curr_rate_holding_usd_%s'>%s USD</div>", symbol, this.numberWithCommas( sl_obj.total_usd.toFixed(2) ) );
					str += this.sprintf( "<div class='curr_rate_holding' id='curr_rate_holding_sgd_%s'>%s SGD</div>", symbol, this.numberWithCommas( sl_obj.total_sgd.toFixed(2) ) );
					str += this.sprintf( "<div class='curr_rate_holding' id='curr_rate_holding_btc_%s'>%s BTC</div>", symbol, this.numberWithCommas( sl_obj.total_btc.toFixed(4) ) );
					str += this.sprintf( "<div class='curr_rate_holding' id='curr_rate_holding_eth_%s'>%s ETH</div>", symbol, this.numberWithCommas( sl_obj.total_eth.toFixed(4) ) );
					str += "</div>"
				}
			str += "</li>";

		}
		


		mylist.innerHTML = str;
	}




	//-------------
	this.compare = function( a, b) {

		if ( a.total_usd < b.total_usd ) {
	    	return 1;
	    }
		if ( a.total_usd > b.total_usd ) {
			return -1;
		}
		return 0;
	
	}


	

	//--------------
	this.numberWithCommas = function(x) {
    	var parts = x.toString().split(".");
    	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    	return parts.join(".");
	}

	//-------------
	this.init = function() {
		this.get_resources();
	}

}

document.addEventListener("DOMContentLoaded", function() {
	sl = new SimpleList();
	sl.init();
});

