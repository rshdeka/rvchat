const socket = io('/');                 //import io

const videoGrid = document.getElementById('video-grid');
console.log(videoGrid);
//create a video element
const myVideo = document.createElement('video');
myVideo.muted = true;

//filters
const filter = document.querySelector('#filter');
let currentFilter

var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443',
    port: '8000'
}); 

const peers = {}

let myVideoStream
navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);

    //accept the call and display our video in the other user's browser window
    peer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })
    
    socket.on('user-connected', (userId) => {
        setTimeout(() => {
            connectToNewUser(userId, stream)
        }, 1000)
    })

    //displaying messages in chat box
		let text = $('input');

		$('html').keydown(function (e) {
			if (e.which == 13 && text.val().length !== 0) {
				socket.emit('message', text.val());
				text.val('');
			}
		});

		socket.on('createMessage', (message, userId) => {
			$('ul').append(`<li >
								<span class="message_header">
									<span>
										From 
										<span class="message_sender">user${userId}</span> 
										to 
										<span class="message_receiver">Everyone:</span>
									</span>
									${new Date().toLocaleString('en-US', {
										hour: 'numeric',
										minute: 'numeric',
										hour12: true,
									})}
								</span>
								<span class="message">${message}</span>
							
							</li>`)
			scrollToBottom();
		})
})

const scrollToBottom = () => {
	var d = $('.main_chat_window');
	d.scrollTop(d.prop('scrollHeight'));
}


//to get the id & then remove the video of the user who left the call
socket.on('user-disconnected', (userId) => {
    //console.log(userId);
    if (peers[userId]){
        peers[userId].close();
    }
});

peer.on('open', id => {
    socket.emit('join-room', room_id, id);
})

//connect to the other user
const connectToNewUser = (userId, stream) => {
    console.log(`New user ${userId} connected!`);
    alert(`New user ${userId} joined the call!`);
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
  })
  call.on('close', () => {
      video.remove();
  })
  peers[userId] = call;
}


const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
      video.play();
    })
    videoGrid.append(video);

    filter.addEventListener('change', (eve) => {
        let changedFilter = eve.target.value
        video.style.filter = changedFilter
        //currentFilter = eve.target.value
        //video.style.filter = currentFilter
        eve.preventDefault
    });
}

//mute and unmute our audio 
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    }
    else{
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}
const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span> 
    `
    document.querySelector('.main_mute_button').innerHTML = html;
}
const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `
    document.querySelector('.main_mute_button').innerHTML = html;
}

//play and stop our video 
const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    }
    else{
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}
const setStopVideo = () => {
    const html = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `
    document.querySelector('.main_video_button').innerHTML = html;
}
const setPlayVideo = () => {
    const html = `
        <i class="stop fas fa-video-slash"></i>
        <span>Play Video</span>
    `
    document.querySelector('.main_video_button').innerHTML = html;
}