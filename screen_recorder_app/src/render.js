

const { desktopCapturer, remote } = require('electron');
const { dialog, Menu } = remote;
const { writeFile } = require('fs');
let mediaRecorder;
const recordChunks = [];

const videoElement = document.querySelector('video');
const startbtn = document.getElementById('startbtn');
const stopbtn = document.getElementById('stopbtn');
const videoSelectbtn = document.getElementById('videoSelectbtn');




videoSelectbtn.onclick = getVideoSources;



async function getVideoSources(){
    const inputSources = await desktopCapturer.getSources({
        types:['window', 'screen']
    });
    const videoOptionsMenu = Menu.buildFromTemplate(
        inputSources.map(source =>{
            return {
                label: source.name,
                click: ()=> selectSource(source)
            }
        })
    )
    videoOptionsMenu.popup();
}



async function selectSource(source){
    videoSelectbtn.innerText = source.name;
    const constraints = {
        audio : false,
        video : {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: source.id
            }

        }
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    videoElement.srcObject = stream;
    videoElement.play();

    const options = { mimeType : 'video/webm; codecs=vp9'};
    mediaRecorder = new MediaRecorder(stream, options);

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.onstop = handleStop;
}


function handleDataAvailable(e){
    console.log('video is available');
    recordChunks.push(e.data);
}



async function handleStop(e){
    const blob = new Blob(recordChunks,{
        type: 'video/webm; codecs=vp9'
    });
    const buffer = Buffer.from(await blob.arrayBuffer());
    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save video',
        defaultPath: `vid-${Date.now()}.webm`
    });
    if(filePath){
        writeFile(filePath, buffer, ()=>console.log("your video is recorded"));
    }
   
}

startbtn.onclick = e => {
    mediaRecorder.start();
    startbtn.classList.add('is-danger');
    startbtn.innerText = 'Recording';
  };

stopbtn.onclick = e => {
  mediaRecorder.stop();
  startbtn.classList.remove('is-danger');
  startbtn.innerText = 'Start';
};

