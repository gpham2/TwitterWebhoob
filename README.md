# TwitterWebhoob


## How to start it
1. Be in TwitterWebhoob dir and activate command "firebase emulators:start"
2. The twitter app configurations is set to be on port 5001, so try to match that
3. Then, activate command "ngrok http 5001" to make it accessible outside of local
4. Note the ngrok link that is outputted in the command. Activate the following link in your browser:
5. https://xxxx-xx-xxx-xx-xxx.ngrok.io/twitter-d7a18/us-central1/authorization/?username=yyyyyyy
6. The x's should match the link your terminal displays. The "yyyyyyy" is your twitter handle WIHOUT the @
7. So if your twitter handle is @espn, it should just be .../?username=espn

... 

## What it does

The code will automatically follow the twitter accounts listed in the "followList" array.
So, if you want to add more accounts to follow, then just add on to that array. Make sure the account ID is correct.
You can use this [link](https://tweeterid.com/) to find a particular handle's ID.

## How it works

### Background
In order to follow on behalf of a user, the twitter API requires the user's "access token" and "access token secret". 
* IF this info is already known (like if was generated in the past and saved), you can just put info in the "preSetList" array.
* ELSE the app will generate one for the user AND will ask for authorization.

### Scenarios
For the sake of clarity, when I say "inputted twitter handle", I mean the "yyyyyyy" you see in "How to start it" section, step 5

1. The inputted twitter handle MATCHES a name found in the "preSetList" array (e.g. .../?username=GiangStacks)
    => No Authorization or redirection required, The code will just automatically perform the follow

2. The client is NOT LOGGED IN twitter and have NOT AUTHORIZE the app in the past 
    => Page will popup asking them to login. The action of logging in will authorize the app and perform the follow

3. The client is LOGGED IN twitter and HAVE NOT AUTHORIZE the app in the past
    => Page will popup with a button. Clicking the button will authorize the app and perform the follow

4. The client is LOGGED IN tiwtter and HAVE AUTHORIZE the app in the past
    => No Authorization required, the code will do a quick redirect and perform the follow.

### Webhooks Used

Two webhooks are used: **authorization()** and **followC9()**
**authorization()** will automatically perform the follow if the user is already in the preSetList array.
If not, the code will generate an access token for the user and it will redirect the user to the
twitter API authorization page. After authorizing, the **followC9()** webhook will get called.
This is where the "follow" logic takes places.

### Code Architecture
![diagram](https://cdn.discordapp.com/attachments/371115539365494794/996508178592321617/unknown.png)






