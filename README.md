# fb-feed-test-app

## How to launch

Due to Facebook API application can use only one domain.
So I added 'fb.dev' for local testing. 

### Prepairing

At first clone the repo:
'''sh
git clone https://github.com/51ck/fb-feed-test-app.git
'''

Then launch local web-server:
'''sh
cd fb-feed-test-app
python -m SimpleHTTPServer 8080
'''
or
'''sh
python3 -m http.server 8080
'''

Also you should add next line to your hosts file:
'''
127.0.0.1   fb.dev
'''

### Launch

Open [http://fb.dev:8080/](http://fb.dev:8080/) in your browser.