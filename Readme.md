# Cron Jobs Repository

## Overview

This repository contains code for handling cron jobs using Cloudflare Workers. Cron jobs are scheduled tasks that run periodically at specified intervals. This repository allows you to set up and manage these cron jobs using Cloudflare Workers as the platform.

## What are Cron Jobs?

Cron jobs are automated tasks that are executed on a recurring schedule. They are commonly used to perform routine maintenance, data processing, or triggering specific actions at predefined intervals without the need for manual intervention.

## When do we use Cron Jobs?

Cron jobs are useful in various scenarios, such as:

- Periodic data synchronization or updates.
- Sending scheduled notifications or emails.
- Regularly cleaning up or archiving data.
- Running scheduled API calls to external services.
- Automating repetitive tasks on a specific schedule.

## How to Set Trigger Time

To set the trigger time for the cron jobs, follow these steps:

1. Go to the Cloudflare Workers page for the "Cron Jobs" worker.
2. Navigate to the "Triggers" option.
3. Set the desired time and frequency for your cron jobs.

## Platform Used: Cloudflare Workers

This project uses Cloudflare Workers as the platform to manage cron jobs. Cloudflare Workers offer a serverless execution environment, making it easy to run code at scale without managing infrastructure.

## Verification Mechanism

To ensure secure communication between the cron jobs and the backend, every request is signed with an RSA private key, and the JWT (JSON Web Token) is set in the authorization header. The backend will then verify the JWT using an RSA public key.

## How to Set Up Locally

1. Clone this repository to your local machine.
2. Run `npm install` to install the required dependencies.
3. Run `npm deploy` to deploy the Cloudflare Worker.
4. Generate a pair of RSA 2048-bit keys (private and public).
5. Go to `dash.cloudflare.com`, select "Workers," and find the worker named "Cron Jobs."
6. Go to its settings > variables and add a variable named `CRON_JOB_PRIVATE_KEY`, and paste your private key.
7. Copy and paste the public key in the RDS backend configuration file (`config/local.js`) under `cronJobHandler`:

```js
cronJobHandler: {
publicKey: <copied public key>,
}
```

Make sure the public key is formatted as it is in `config/test.js`. 
8. Start the backend by running the following command in your terminal:

```bash
yarn dev
```

9. With the backend running, use ngrok to expose your local server publicly. Install ngrok if you haven't already.
10. Start ngrok with the following command:

```
ngrok http <PORT_NUMBER>
```

Replace `<PORT_NUMBER>` with the port number your backend is running on (e.g., 3000). 
11. Ngrok will generate a public URL (e.g., `https://abc123.ngrok.io`) that forwards requests to your local server. Copy this ngrok URL. 12. Paste the ngrok URL in the "else" part of the Cron Jobs project's `src/config.ts` file, inside the `handleConfig` function. 
13. Now set the desired trigger time as mentioned [here](#how-to-set-trigger-time)

Now, your backend will get the call at the set time using the public ngrok URL. Remember to keep the backend running with ngrok to ensure the scheduled cron jobs work as intended.

**Note**: Ensure you have set up the Cloudflare Worker and backend properly before expecting the cron jobs to work as intended. Double-check all configurations and variables to avoid any issues.
