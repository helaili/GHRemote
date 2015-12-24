GHRemote gives you two Webhooks and a form to create a deployment (left box on [the diagram from the doc](https://developer.github.com/v3/repos/deployments)). 

The first Webhook analyses your push on a pull request to check the pusher's email matches the committer's email. You can click on the status details link to see the values. 

The second webhook is the "3rd Party" box on [the diagram from the doc](https://developer.github.com/v3/repos/deployments). It just set the status of the deployment to pending.

## Setting up your development environement 

- [Install MEAN.JS](http://meanjs.org/docs/0.3.x/#getting-started)
- [Install MongoDB](https://www.mongodb.org/downloads)
- Clone the repo
- ```cd GHRemote``` 
- Execute ```npm install``` to download the dependancies
- Create an OAUTH app and retrive the GITHUB_ID and GITHUB_SECRET. 
- Set the environment variables ```GITHUB_ID``` and  ```GITHUB_SECRET```  in the file ~/.bash_profile as following :
```bash
export GITHUB_ID=<your id>
export GITHUB_SECRET=<your secret>
```
- Edit the file ```config/env/development.js``` and set the variables according to your environment. 

## Deploying the production environement

- Provision an AWS machine
- Run ```./scripts/install_GHRemote_aws.sh <path_to_pem_file> <hostname>``` from your computer.
- Reboot the AWS machine
- Configure the GitHub section of the file config/env/production.js with the right IP address/hostname, both for the callback URL on this AWS machine and the GitHub server (github.com or GitHub Enterprise).
- Create an OAUTH app and retrive the GITHUB_ID and GITHUB_SECRET. Info should match config/env/production.js
- Connect to the AWS machine and set the environment variables ```GITHUB_ID``` and  ```GITHUB_SECRET```  in the file ~/.bash_profile as following :
```bash
export GITHUB_ID=<your id>
export GITHUB_SECRET=<your secret>
```
- Make sure ruby and sass are in your ```PATH```
- ```cd GHRemote```
- Execute ```./scripts/generate-ssl-certs.sh``` and answer the questions
- ```grunt prod```
- Register the webhook ```http://<your server name>/api/impersonation/pushValidator``` with you repository or organization
