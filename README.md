## Deploying the production environement

- Provision an AWS machine
- Run ```./scripts/install_GHRemote_aws.sh <path_to_pem_file> <hostname>``` from your computer.
- Reboot the AWS machine
- Configure the GitHub section of the file config/env/production.js with the right IP address/hostname, both for the callback URL on this AWS machine and the GitHub server (github.com or GitHub Enterprise).
- Create a personal access token (GITHUB_ACCESS_TOKEN) in you GitHub profile with ```repo```, ```publi_repo``` and ```user``` access
- Create an OAUTH app and retrive the GITHUB_ID and GITHUB_SECRET. Info should match config/env/production.js
- Connect to the AWS machine and set the environment variables ```GITHUB_ACCESS_TOKEN```,  ```GITHUB_ID``` and  ```GITHUB_SECRET```  in the file ~/.bash_profile as following :
```bash
export GITHUB_ACCESS_TOKEN=<your access token>
export GITHUB_ID=<your id>
export GITHUB_SECRET=<your secret>
```
- ```cd GHRemote```
- Execute ```./scripts/generate-ssl-certs.sh``` and answer the questions
- ```grunt prod```
- Register the webhook ```http://<your server name>/api/impersonation/pushValidator``` with you repository or organization
