ssh -tt -i $1 ec2-user@$2 << 'EOF'


echo 'GITHUB_ACCESS_TOKEN='$3 | sudo tee ~/.bash_profile
echo 'GITHUB_ID='$4 | sudo tee ~/.bash_profile
echo 'GITHUB_SECRET='$5 | sudo tee ~/.bash_profile

EOF
