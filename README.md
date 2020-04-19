# Will Estony's Internship Application: Full-Stack

## What is it?

Using Cloudflare Workers, this application randomly sends the user to one of two urls. 
This project utilizes the following JavaScript tools and capabilities:


- [Cloudflare Workers](https://developers.cloudflare.com/workers/quickstart/)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [HTMLRewriter](https://developers.cloudflare.com/workers/reference/apis/html-rewriter/)
- [Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)

The variant urls have been updated with links to my personal website and my top 5 favorite movies.
Additionally, the app uses a permanent cookie to persist which url is chosen until August 11, 2020 
(my birthday). 

## Useful Links

The app can be viewed at two different locations:

- [Workers Dev](https://fullstack_challenge_estony-staging.williamestony.workers.dev)
- [Personal Domain](https://fullstack.browdiegram.us)


## Running this project with the wrangler CLI

This project was developed using the command line tool [wrangler] (https://github.com/cloudflare/wrangler).
As such, it requires a .toml file to be included in the directory where the project is built. To avoid any
security problems, I used environment variables $CF_ACCOUNT_ID and $CF_ZONE_ID to inject the zone id and 
account id into the file at the command line when wrangler commands are executed. Here are some examples of 
how to run them.

- To run wrangler in the development environment run: 

    `CF_ACCOUNT_ID=myAccountID wrangler dev`

- To deploy the staging worker run the following command: 

    `CF_ACCOUNT_ID=myAccountID wrangler publish --env production`

- To deploy production worker to a personal domain run:

    `CF_ACCOUNT_ID=myAccountID CF_ZONE_ID=myZoneID wrangler publish --env production`
