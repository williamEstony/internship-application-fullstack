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
  const url = 'https://cfw-takehome.developers.workers.dev/api/variants';
  const key = 'variants'; //name of the key in the JSON object pointing to the array of urls value
  try{
    let resp = checkErrors(await fetch(url));
    let json = await resp.json();
    let urls = json[key];
    return distRequests(urls);
  }catch(error){
    return new Response(error.message + ' Error', {
      headers: { 'content-type': 'text/plain' },
    })
  }
}

async function distRequests(urls){
  //Get a random number between 0 and 1 inclusive
  //to represent the index of two possible variants
  let variant = Math.floor(Math.random() * 2);
  let resp =  await fetch(urls[variant]);
  const styleMap = getStyleMap();
  return new HTMLRewriter().on('*', new ElementHandler(styleMap['variant' + variant])).transform(resp)
}

async function getStyleMap(){
  let request = new Request("./styleMap.json");
  await fetch(request)
    .then(function(resp){
      return resp.json();
    })
}

function checkErrors(request){
  if (!request.ok) {
    throw Error(request.status);
  }else{
    return request;
  }
}

function getStyleMap(){
  return {
    'variant0': {
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
    'variant1': {
      title: {
        value: 'Will Estony\'s Favorite Movies',
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