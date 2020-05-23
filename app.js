var screenshotmachine = require('screenshotmachine');
const fs = require('fs');
const {google} = require('googleapis');

//global var
const customerKey = '1f35b0'//'b01474';
const TOKEN_PATH = 'token.json';

var sites =['https://ifunded.de/en/','https://www.propertypartner.co','https://propertymoose.co.uk',
            'https://www.homegrown.co.uk','https://www.realtymogul.com'];

var folderId='1DFr-tpi9rl9Wi7yy2v8xBy-JFZU93X61';

function createScreen(url,name='',secretPhrase=''){
    var options ={
        url:url,
        dimension : '1920x1080', 
        device : 'desktop',
        format: 'jpg',
        cacheLimit: '0',
        delay: '200',
        zoom: '100'
    }
    var apiUrl = screenshotmachine.generateScreenshotApiUrl(customerKey, secretPhrase, options);
    if(name==='') var output='salida.jpg'
    else
     var output = name+'.jpg';
    screenshotmachine.readScreenshot(apiUrl).pipe(fs.createWriteStream(output).on('close', function() {
        fs.readFile('credentials.json', (err, content) => {
            if (err) return console.log('Error loading client secret file:', err);
            authorize(JSON.parse(content), function(auth){
                 uploadFile(output, auth);
            });
            });
    }));
}
function uploadFile(fileName,auth){
    const drive = google.drive({version: 'v3', auth});
    var fileMetadata = {
      'name': fileName,
      parents: [folderId]
    
    };
    var media = {
      mimeType: 'image/jpg',
      body: fs.createReadStream(fileName)
    };
    drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id'
    }, function (err, file) {
      if (err) {
        console.error(err);
      } else {
        //delete file
        fs.unlinkSync(fileName);
      }
    });
}
function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) return getAccessToken(oAuth2Client, callback);
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }
function getName(site){
   if(site.indexOf('www.')!=-1){
        var start = site.indexOf('www.')+4;
        var end =site.indexOf('.',start);
      
       return site.slice(start,end);
    }else{
        var start = site.indexOf('//')+2;
        var end =site.indexOf('.',start);
        return site.slice(start,end);
    }
}
function main(){
    sites.forEach(function(url){
        createScreen(url,getName(url));
        return;
    });
}
main();