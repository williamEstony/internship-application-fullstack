/**
 * @author Will Estony
 * @version 0.0.2
 */

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})


class ElementHandler {
  constructor(styleMap) {
    this.styleMap = styleMap;
  }

  element(element) {
    let tag = element.tagName;
    if(tag in this.styleMap && element.getAttribute('id') === this.styleMap[tag]['id']){
      element.setInnerContent(this.styleMap[tag]['value']);
      if(this.styleMap[tag].hasOwnProperty('attributes')){
        for (var key in this.styleMap[tag]['attributes']) {
          element.setAttribute(key, this.styleMap[tag]['attributes'][key]);
        }
      }
    }
  }
}

async function handleRequest(request) {
  
  const cookie = request.headers.get('cookie');
  const persistentUrl = hasCookie(cookie, 'url');
  if(persistentUrl){
    
    let response = await fetch(persistentUrl);
    if(!isError(response)){
      const styleMap = getStyleMap();
      const variant = parseInt(persistentUrl.substring(persistentUrl.length - 1));
      return new HTMLRewriter().on('*', new ElementHandler(styleMap['variant' + variant])).transform(response)
    }else{
      return new Response(response.status +  ' Error: ' + getErrorMessages(response.status), {
        headers: { 'content-type': 'text/plain' }
      })
    }
  }else{
    const url = 'https://cfw-takehome.developers.workers.dev/api/variants';
    const key = 'variants'; //name of the key in the JSON object pointing to the array of urls value
    let response = await fetch(url);
    if(!isError(response)){
      let json = await response.json();
      let urls = json[key];
      return distRequests(urls);
    }else{
      return new Response(response.status +  ' Error: ' + getErrorMessages(response.status), {
        headers: { 'content-type': 'text/plain' }
      })
    }
  }
}

function hasCookie(cookie, key){
  if(cookie){
    let cookies = cookie.split(';')
    for(var i = 0; i < cookies.length; i++){
      let cookieKey = cookies[i].split('=')[0].trim();
      if(cookieKey === key){
        return cookies[i].split('=')[1].trim()
      }
    }
  }
  return null;
}

async function distRequests(urls){
  /* 
    Get a random number between 0 and 1 inclusive
    to represent the index of two possible variants 
  */
  let variant = Math.floor(Math.random() * 2);
  let response = await fetch(urls[variant]);
  response = new Response(response.body, response)
  response.headers.append('Set-Cookie', `url=${urls[variant]}; Expires=Tue, 11 Aug 2020 00:00:01 GMT`);
  if(!isError(response)){
    const styleMap = getStyleMap();
    return new HTMLRewriter().on('*', new ElementHandler(styleMap['variant' + (variant + 1)])).transform(response)
  }else{
      return new Response(response.status +  ' Error: ' + getErrorMessages(response.status), {
        headers: { 'content-type': 'text/plain' }
    })
  }
}


function isError(request){
  if (!request.ok) {
    return true;
  }else{
    return false;
  }
}

/* 

*/
function getStyleMap(){
  return {
    'variant1': {
      title: {
        value: 'Will Estony\'s Website',
        id: null
      },
      h1:{
        value: 'Check out my new personal site',
        id: 'title'
      },
      p:{
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
      h1:{
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

function getErrorMessages(errorCode){

  if(errorCode == 400){
    return 'Bad Request';
  }else if(errorCode == 401){
    return 'Unauthorized Request';
  }else if(errorCode == 403){
    return 'Forbidden';
  }else if(errorCode == 404){
    return 'Page Not Found';
  }else if(errorCode == 500){
    return 'Internal Server Error';
  }else if(errorCode == 502){
    return 'Bad Gateway';
  }else if(errorCode == 503){
    return 'Service Unavailable';
  }else if(errorCode == 504){
    return 'Gateway Timeout';
  }else{
    return 'Unknown Error';
  }
}