- Remember to set the right IP address in config/env/development.js
- Change the callback url accordingly in GitHub's developer application
- Create an OAUTH app as well as a Personal Access Token
- GITHUB_ACCESS_TOKEN, GITHUB_ID and GITHUB_SECRET must be set as env variables


http(s)://hostname/api/v3/


application/json
application/vnd.github+json

application/vnd.github.v3+json


$ curl https://api.github.com/users/technoweenie -I
HTTP/1.1 200 OK
X-GitHub-Media-Type: github.v3

$ curl https://api.github.com/users/technoweenie -I \
  -H "Accept: application/vnd.github.full+json"
HTTP/1.1 200 OK
X-GitHub-Media-Type: github.v3; param=full; format=json

$ curl https://api.github.com/users/technoweenie -I \
  -H "Accept: application/vnd.github.v3.full+json"
HTTP/1.1 200 OK
X-GitHub-Media-Type: github.v3; param=full; format=json


/user/orgs
