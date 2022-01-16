// Import Angular packages
import { Component, OnInit } from '@angular/core';

// Import Services
import { NotificationService } from 'src/app/services/notifcation.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// Import Dependencies
import Peer from 'peerjs';
import { WebSocketSubject } from 'rxjs/webSocket';

// Import Models
import { ChatMessage } from 'src/app/models/chatMessage';
import { User } from 'src/app/models/user';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.css'],
})
export class CallComponent implements OnInit {
  // Add websocket and send message on call
  // is remotePeerId is not null then current user is the reciever

  private peer: Peer;
  remotePeerId: string | null = null;
  peerId: string | null = null;
  private userStream: any;
  currentPeer: any;
  private peerList: Array<any> = [];
  isVideoOn = false;
  isAudioOn = true;

  isVideoAvailable = true;
  isAudioAvailable = true;

  isPeerVideoOn = false;

  chatWebSocket$: WebSocketSubject<any> | null = null;

  sender: User | null = null;
  recipient: User | null = null;

  conn: Peer.DataConnection | null = null;

  callCancellationSubscription: Subscription | null = null;

  constructor(
    private notify: NotificationService,
    public modal: NgbActiveModal
  ) {
    this.peer = new Peer();
  }

  ngOnInit(): void {}

  ngAfterViewInit() {
    this.getPeerId();
  }

  async setupDevice() {
    let stream: MediaStream = new MediaStream();

    let videoStream = new MediaStream();

    let audioStream = new MediaStream();

    try {
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
    } catch (err) {
      this.notify.notifyError(
        'Unable to get media for video',
        'Please provide necessary permissons'
      );

      this.isVideoAvailable = false;
    }

    try {
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
    } catch (err) {
      this.notify.notifyError(
        'Unable to get media for audio',
        'Please provide necessary permissons'
      );

      this.isAudioAvailable = false;
    }

    let videoStreamList = videoStream.getVideoTracks();

    let audioStreamList = audioStream.getAudioTracks();

    if (audioStreamList.length || videoStreamList.length) {
      if (videoStreamList.length) stream.addTrack(videoStreamList[0]);

      if (audioStreamList.length) stream.addTrack(audioStreamList[0]);

      return stream;
    } else return null;
  }

  handlePeerDisconnect() {
    for (let conns in this.peer.connections) {
      this.peer.connections[conns].forEach(
        (conn: any, index: any, array: any) => {
          conn.peerConnection.close();

          if (conn.close) conn.close();
        }
      );
    }
  }

  terminatePeerCall() {
    if (this.remotePeerId === null) {
      this.callCancellationSubscription?.unsubscribe();
      this.sendMessage('call-arbitrate');
    }
    this.peer.destroy();
    this.modal.close();
  }

  private sendMessage(content: string) {
    let chatMessage: ChatMessage = {
      sender: this.sender!.username,
      recipient: this.recipient!.username,
      messageType: 'call',
      createdAt: new Date().toISOString(),
      content: content,

      // dosen't matter here
      seen: false,
    };

    this.chatWebSocket$?.next({
      data: chatMessage,
    });
  }

  private getPeerId = () => {
    this.peer.on('open', async (id) => {
      this.peerId = id;

      if (this.remotePeerId) await this.callPeer(this.remotePeerId);
      else {
        // wait for 35 seconds
        this.callCancellationSubscription = interval(35000).subscribe(() => {
          this.notify.notifyWarning('Call not received');
          this.disconnect();
        });

        this.sendMessage(this.peerId);
      }
    });

    this.peer.on('connection', (conn) => {
      // send stream to remote user
      this.peer.on('call', async (call) => {
        let stream = await this.setupDevice();

        if (stream) {
          this.userStream = stream;

          this.callCancellationSubscription?.unsubscribe();

          this.sendMessage('call-arbitrate');

          // set video on/off by default
          if (stream.getVideoTracks().length > 0) {
            this.streamPersonalVideo();
            stream.getVideoTracks()[0].enabled = this.isVideoOn;
          }

          // send stream to caller
          call.answer(stream);

          call.on('stream', (remoteStream) => {
            if (!this.peerList.includes(call.peer)) {
              this.streamRemoteVideo(remoteStream);
              this.currentPeer = call.peerConnection;
              this.peerList.push(call.peer);
            }
          });

          conn.on('close', () => {
            this.disconnect();
          });

          conn.on('error', () => {
            this.disconnect();
          });

          conn.on('data', (data) => {
            this.isPeerVideoOn = data;
          });

          this.conn = conn;
        } else {
          this.terminatePeerCall();
        }
      });
    });
  };

  disconnect() {
    if (this.userStream)
      this.userStream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
    this.handlePeerDisconnect();
    this.terminatePeerCall();
  }

  toggleVideo() {
    this.isVideoOn = !this.isVideoOn;
    if (this.userStream.getVideoTracks().length > 0)
      this.userStream.getVideoTracks()[0].enabled = this.isVideoOn;

    if (this.isVideoAvailable) this.conn?.send(this.isVideoOn);
  }

  toggleAudio() {
    this.isAudioOn = !this.isAudioOn;
    if (this.userStream.getAudioTracks().length > 0)
      this.userStream.getAudioTracks()[0].enabled = this.isAudioOn;
  }

  private async callPeer(id: string) {
    let stream = await this.setupDevice();

    if (stream) {
      this.userStream = stream;

      // set video on/off by default
      if (stream.getVideoTracks().length > 0) {
        this.streamPersonalVideo();
        stream.getVideoTracks()[0].enabled = this.isVideoOn;
      }

      let conn = this.peer.connect(id);

      const call = this.peer.call(id, stream);

      call.on('stream', (remoteStream) => {
        if (!this.peerList.includes(call.peer)) {
          this.streamRemoteVideo(remoteStream);
          this.currentPeer = call.peerConnection;
          this.peerList.push(call.peer);
        }
      });

      conn.on('error', () => {
        this.disconnect();
      });

      conn.on('close', () => {
        this.disconnect();
      });

      conn.on('data', (data) => {
        this.isPeerVideoOn = data;
      });

      this.conn = conn;
    } else {
      this.terminatePeerCall();
    }
  }

  private streamPersonalVideo() {
    if (this.userStream.getVideoTracks().length) {
      let stream = new MediaStream();
      stream.addTrack(this.userStream.getVideoTracks()[0]);

      const video = document.createElement('video');
      video.classList.add('video');
      video.srcObject = stream;
      video.play();

      video.width = 320;

      document.getElementById('self-video-stream')?.append(video);
    }
  }

  private streamRemoteVideo(stream: any) {
    let video: HTMLVideoElement | null = document.querySelector('video');

    if (video) {
      video.srcObject = stream;
      video.play();

      video.width = 640;

      video.height = 480;
    }
  }
}
