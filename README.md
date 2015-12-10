## Deploying the production environement 

- Provision an AWS machine 
- Run ```./scripts/install_GHRemote_aws.sh <path_to_pem_file> <hostname>```
- Reboot the AWS machine 
- Configure the GitHub section of the file config/env/production.js with the right IP address/hostname, both for the callback URL on this AWS machine and the GitHub server (github.com or GitHub Enterprise). 
- Create a personal access token (GITHUB_ACCESS_TOKEN) in you GitHub profile with ```repo```, ```publi_repo``` and ```user``` access
- Create an OAUTH app and retrive the GITHUB_ID and GITHUB_SECRET. Info should match config/env/production.js 
- Run ```./scripts/set_github_env_variables.sh <path_to_pem_file> <hostname> <GITHUB_ACCESS_TOKEN> <GITHUB_ID> <GITHUB_SECRET>```

