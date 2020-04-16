addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

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
  return await fetch(urls[variant]);
}

function checkErrors(request){
  if (!request.ok) {
    throw Error(request.status);
  }else{
    return request;
  }
}