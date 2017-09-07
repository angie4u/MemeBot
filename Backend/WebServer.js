var http = require('http');
var Jimp = require('jimp');
var express = require('express');
var app = express();

// Meme 만들 떄 사용할 입술 위치를 저장하는 값 
// var memeTextLocationX = 0;
// var memeTextLocationY = 0;
var lipX = 0;
var lipY = 0;

//미들웨어 설정
app.use(function(request,response,next){

    //이미지 URL과 x,y 좌표 받아서 넘겨주기
    var url = request.param('url');
    //var lipX = request.param('lipX');
    var lipX = parseInt(request.param('lipX'));
    var lipY = parseInt(request.param('lipY'));
    //var lipY = request.param('lipY');
    var ment = request.param('ment');

    //analyseImage(url);    
    generateMeme(url,lipX,lipY,ment);
    
    
    response.send('<h1>done</h1>');

    
});

//서버 실행
http.createServer(app).listen(52273,function(){
    console.log('Server running at http://127.0.0.1:52273');
});


function analyseImage(sourceImageUrl){
    var subscriptionKey = "2f2fd5e9edbe4c4db60c2c87c9304bf1";
    var uriBase = "https://southeastasia.api.cognitive.microsoft.com/face/v1.0/detect";

    // Request parameters.
    var params = {
        "returnFaceId": "true",
        "returnFaceLandmarks": "true",
        "returnFaceAttributes": "age,gender,headPose,smile,facialHair,glasses,emotion,hair,makeup,occlusion,accessories,blur,exposure,noise",
    };

    
    // Perform the REST API call.
    $.ajax({
        url: uriBase + "?" + $.param(params),

        // Request headers.
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },

        type: "POST",

        // Request body.
        data: '{"url": ' + '"' + sourceImageUrl + '"}',
    })

    .done(function(data) {
        // 이미지 데이터 중 입술 위치 값만 추출하여 전역 변수로 저장
        var faceLandmarks = data[0].faceLandmarks;
        var underLipBottom = faceLandmarks.underLipBottom;
        
        memeTextLocationX = underLipBottom.x - 223;
        memeTextLocationY = underLipBottom.y - 223;             

    })

    .fail(function(jqXHR, textStatus, errorThrown) {
        // Display error message.
        var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ? "" : (jQuery.parseJSON(jqXHR.responseText).message) ? 
            jQuery.parseJSON(jqXHR.responseText).message : jQuery.parseJSON(jqXHR.responseText).error.message;
        alert(errorString);
    });
};


function generateMeme (img, lipX, lipY,ment) {

    Jimp.read("think.png", function (err, lenna) {
        if (err) throw err;
        
        Jimp.read(img, function (err, img) {
            if (err) throw err;

            // 이미지를 말풍선이랑 합성하는 단계            
            //img.composite(lenna,lipX,lipY).quality(60).write("newname2.jpg");
            img.composite(lenna,lipX,lipY);
            
            //이미지를 문구랑 합성하는 단계
            Jimp.loadFont(Jimp.FONT_SANS_32_BLACK).then(function (font) { // load font from .fnt file 
                img.print(font,lipX,lipY, ment).quality(60).write("newname3.jpg");;        // print a message on an image 
                //image.print(font, x, y, str, width); // print a message on an image with text wrapped at width 
            });

        });
        
    
    });

   
    
};