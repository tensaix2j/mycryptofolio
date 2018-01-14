## What is the project about?

Mycryptofolio is a web blockfolio, where it can show you for each coin at current price, what is the equivalent of USD, SGD, BTC and ETH at a glance.

It also shows you, how much you own in term of USD, SGD, BTC and ETH for each different coin. Check the screenshot below:

![img](https://i.imgur.com/kweqLKi.png)

Also, if you tap on the symbol, it will take you to tradingview.com, or hitbtc.com, or okex charting depending on provider of the data.  


The profile is a json content hosted by either jsonblob.com or myjson.com .  You can create a new content on jsonblob.com as such 

```
{
  "BTC": 19.18,
  "ETH": 1981.3,
  "BTG": 19.18,
  "NEO": 317.67
}
```
Save the content and get a unique key, 
Using the key, append ?profile=yourkey after the index.html on the url

For example:

https://tensaix2j.github.io/mycryptofolio/index.html?profile=e6124640-f887-11e7-a727-b99d68134366

---

## Technology Stack

Frontend: Javascript, CSS, HTML, 

No server side processing, since it is hosted on github.io.  

Due to Cross Origin Request Restriction imposed by browser, all API queries to Binance, Hitbtc, Kucoin, Bittrex, Okex and Fixer.io will be routed to a cors proxy known as cors anywhere.

https://cors-anywhere.herokuapp.com/

The json content is hosted by jsonblob.com, or you can use myjson.com if you want. 
To use myjson.com instead of jsonblob.com simply supply &server=myjson on the url.

---

## How to contribute?

https://github.com/tensaix2j/mycryptofolio

You can fork my code, do your modification, and do a pull request if you want me to merge your code into mine.

    

<br /><hr/><em>Posted on <a href="https://utopian.io/utopian-io/@tensaix2j/mycryptofolio-a-web-blockfolio">Utopian.io -  Rewarding Open Source Contributors</a></em><hr/>
