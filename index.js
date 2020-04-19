/**
 * The following script first uses the fetch command to direct the page to 
 * one of two possible urls. Next, the script uses an HTMLRewriter to change
 * the look of the url chosen after fetch is called. Finally, it persists 
 * which variant of url is chosen using a permanent cookie (as opposed to a 
 * session cookie).
 * 
 * This script is run on a Cloudflare worker and can be accessed at two 
 * different locations (see @ link). [Google JavaScript Style Guide] 
 * (https://google.github.io/styleguide/jsguide.html#terminology-notes) 
 * followed for documentation.
 * 
 * @link https://fullstack.browdiegram.us 
 * @link http://fullstack_challenge_estony-staging.williamestony.workers.dev 
 * @author Will Estony
 * @since 4.13.20
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Checks if a valid cookie exists at the provided request, then makes a
 * fetch request to the appropriate url.
 * 
 * @param {Request} request the initial request made by the page visited
 */
async function handleRequest(request) {
  const cookie = request.headers.get('cookie');
  const persistentUrl = hasCookie(cookie, 'url');
  
  if (persistentUrl) { /* A valid cookie exists. Fetch the url stored in it. */
     let response = await fetch(persistentUrl);
     if (!isError(response)) {
        const styleMap = getStyleMap();
        /* Get the variant number by parsing the last character of the url as an int. 
           Necessary for accessing the correct styleMap key @see getStyleMap()*/
        const variant = parseInt(persistentUrl.substring(persistentUrl.length - 1));
        return new HTMLRewriter().on('*', new ElementHandler(styleMap['variant' + variant])).transform(response)
     }
     else {
        return new Response(response.status + ' Error: ' + getErrorMessages(response.status), {
           headers: {
              'content-type': 'text/plain'
           }
        })
     }
  }
  else { /* The user has not yet made a request to the page. */
     const url = 'https://cfw-takehome.developers.workers.dev/api/variants';
     /* Name of the key in the JSON object pointing to the array of urls. */
     const key = 'variants'; 
     let response = await fetch(url);
     if (!isError(response)) {
        let json = await response.json();
        let urls = json[key];
        /* Choose one of the two urls and store that choice in a cookie. */ 
        return distRequests(urls);
     }
     else {
        return new Response(response.status + ' Error: ' + getErrorMessages(response.status), {
           headers: {
              'content-type': 'text/plain'
           }
        })
     }
  }
}
/**
 * Chooses a random url from a list, fetches that url, stores it in a cookie
 * and styles the page using the HTMLRewriter.
 * 
 * For more information on setting a cookie with Cloudflare workers see:
 * https://developers.cloudflare.com/workers/archive/recipes/setting-a-cookie/
 * 
 * @param {String[]} urls a list of two urls
 */
async function distRequests(urls) {
  /* Get a random number between 0 and 1 inclusive to represent the index of
   two possible variants */
  let variant = Math.floor(Math.random() * 2);
  let response = await fetch(urls[variant]);
  response = new Response(response.body, response)
  response.headers.append('Set-Cookie', `url=${urls[variant]}; Expires=Tue, 11 Aug 2020 00:00:01 GMT`);
  if (!isError(response)) {
     const styleMap = getStyleMap();
     return new HTMLRewriter().on('*', new ElementHandler(styleMap['variant' + (variant + 1)])).transform(response)
  }
  else {
    return new Response(response.status + ' Error: ' + getErrorMessages(response.status), {
      headers: {
          'content-type': 'text/plain'
      }
    })
  }
}
/**
 * Defines the object to be passed to an HTMLRewriter.
 * See https://developers.cloudflare.com/workers/reference/apis/html-rewriter/
 * for more information on HTMLRewriters. 
 */
class ElementHandler {
  /**
   * Creates an instance of an ElementHandler object.
   *  
   * @param {Map} styleMap a collection of nested key-value pairs
   *    outlining the values of various html DOM elements. @see getStyleMap()
   */
  constructor(styleMap) {
     this.styleMap = styleMap;
  }

  element(element) {
     let tag = element.tagName;
     /* Check if the tag name of the element read exists in the style map 
        and that they have the same ids */
     if (tag in this.styleMap){ 
       if(element.getAttribute('id') === this.styleMap[tag]['id']) {
        element.setInnerContent(this.styleMap[tag]['value']);
        /* Loop through the attributes in the style map if they exist.
           Used primarily for changing the href link on the button. */
        if (this.styleMap[tag].hasOwnProperty('attributes')) {
           for (var key in this.styleMap[tag]['attributes']) {
              element.setAttribute(key, this.styleMap[tag]['attributes'][key]);
            }
          }
        }
     }
  }
  comments(comment) {
    
  }

  text(text) {
    
  }
}
/**
 * Checks the request to see if there are any errors.
 * @param {Request} request
 * @return {boolean} true if there is an error, false otherwise
 */
function isError(request) {
  if (!request.ok) {
     return true;
  }
  else {
     return false;
  }
}
/**
 * Loops through each cookie and checks if any of the keys start with
 * the key being searched for. For more information on parsing cookies
 * with Cloudflare workers see:
 * https://developers.cloudflare.com/workers/templates/pages/cookie_extract/
 * 
 * @param {?String} cookie possibly contains cookies, could also be null
 * @param {String} key the name of the cookie being searched for
 * @return {?String} the value of the cookie if it is found, null otherwise 
 */
function hasCookie(cookie, key) {
  if (cookie) {
     let cookies = cookie.split(';')
     for (var i = 0; i < cookies.length; i++) {
        let cookieKey = cookies[i].split('=')[0].trim();
        if (cookieKey === key) {
           return cookies[i].split('=')[1].trim()
        }
     }
  }
  return null;
}

/**
 * Returns a map of keys and values for the two url variants and their
 * respective stylings. While this could have been stored in a
 * global variable, it looks cleaner putting it in a function. The next step/idea
 * would be to store this in a separate file in the same directory.
 * 
 * @return {Map} a mapping of DOM tags with their respective new values.
 */
function getStyleMap() {
  return {
     'variant1': {
        title: {
           value: 'Will Estony\'s Website',
           id: null
        },
        h1: {
           value: 'Check out my new personal site',
           id: 'title'
        },
        p: {
           value: 'to learn more about my interests and experience',
           id: 'description'
        },
        a: {
           value: 'Go to my site',
           id: 'url',
           attributes: {
              href: "http://cakephp-mysql-persistent-estony-ecs417.bde1.qmul-eecs.openshiftapps.com/website/willEstony.html"
           }
        }
     },
     'variant2': {
        title: {
           value: 'Will Estony\'s Movie Picks',
           id: null
        },
        h1: {
           value: 'Here is a link to my top 5 favorite movies',
           id: 'title'
        },
        p: {
           value: 'and the leading actors who starred in them',
           id: 'description'
        },
        a: {
           value: 'Go to my movie list',
           id: 'url',
           attributes: {
              href: "http://cakephp-mysql-persistent-estony-ecs417.bde1.qmul-eecs.openshiftapps.com/topic4/exercise2/exercise2.html"
           }
        }
     }
  }
}

/**
 * In the case when request.status does not equal 200, request.statusText
 * should return a message explaining the error. However, after running some
 * tests, it was discovered that request.statusText returned 'OK' even after 
 * a 404 status was returned. To ensure error handling is more descriptive,
 * this simple function returns a short description of some common http errors
 * based on the error code passed.
 * 
 * @param {number} errorCode the error code returned by a failed request
 */
function getErrorMessages(errorCode) {

  if (errorCode == 400) {
     return 'Bad Request';
  }
  else if (errorCode == 401) {
     return 'Unauthorized Request';
  }
  else if (errorCode == 403) {
     return 'Forbidden';
  }
  else if (errorCode == 404) {
     return 'Page Not Found';
  }
  else if (errorCode == 500) {
     return 'Internal Server Error';
  }
  else if (errorCode == 502) {
     return 'Bad Gateway';
  }
  else if (errorCode == 503) {
     return 'Service Unavailable';
  }
  else if (errorCode == 504) {
     return 'Gateway Timeout';
  }
  else {
     return 'Unidentified Error';
  }
}