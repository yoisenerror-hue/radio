const canvas = document.getElementById('canvasA');
const ctx = canvas.getContext('2d');
let clk = 0;
let clk2 = 0;
let img = new Image();
img.src='pholder.png';
let name='_';
let audio = document.getElementById('audio-player');
let audioContext, analyser, source, dataArray;
let isContextInitialized = false;

const gradient = ctx.createLinearGradient(0, 0, 0, 100);
gradient.addColorStop(0, 'rgba(255,255,255,0.2)'); // 開始色
gradient.addColorStop(0.35, 'rgba(255,255,255,0.1)'); // 開始色
gradient.addColorStop(0.45, 'rgba(255,255,255,0.2)'); // 開始色
gradient.addColorStop(0.55, 'rgba(255,255,255,0.1)'); // 開始色
gradient.addColorStop(1, 'rgba(0,0,0,0.3)'); // 終了色

const gradient2 = ctx.createLinearGradient(0, 0, 0, 120);
gradient2.addColorStop(0, 'rgba(100,100,100,1)'); // 開始色
gradient2.addColorStop(1, 'rgba(177,177,177,1)'); // 終了色


function setupVisualizer(){
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    
    source = audioContext.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    analyser.fftSize = 64; // 音の細かさ（2の倍数）
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
}

async function loadAlbumlist() {
  const response = await fetch('./albums.json'); // 同ディレクトリ内のファイル名を指定
  const albumlist = await response.json();
  albumlist.forEach((album, index) => {
        const li = document.createElement('li');
        li.className = 'album-item';
        li.textContent = album.title;
        li.addEventListener('click', () => selectAlbum(album, index));
        document.getElementById('album-list').appendChild(li);
  });
}
loadAlbumlist();

async function loadAlbum(src) {
  const response = await fetch(src); // 同ディレクトリ内のファイル名を指定
  const data = await response.json();
  const playlist = data.playlist;
  document.getElementById('track-list').textContent = '';
  playlist.forEach((track, index) => {
            const li = document.createElement('li');
            li.className = 'track-item';
            li.textContent = track.title;
            li.addEventListener('click', () => playTrack(track, index));
            document.getElementById('track-list').appendChild(li);
    });
}

/*
let playlist = [
        { title: "Whirlwind", src: "whirlwind.mp3" },
        { title: "ColdFlow", src: "coldflow.mp3" },
        { title: "Sawblade", src: "sawblade.mp3" }
];*/

/*
albumlist.forEach((album, index) => {
        const li = document.createElement('li');
        li.className = 'album-item';
        li.textContent = album.title;
        li.addEventListener('click', () => selectAlbum(album, index));
        document.getElementById('album-list').appendChild(li);
});*/

function selectAlbum(album, index){
    document.querySelectorAll('.album-item').forEach((item, idx) => {
        item.classList.toggle('active', idx === index);
    });
    loadAlbum(album.src);
    img.src = album.jacket;
    name='_';
}

function playTrack(track, index){
    
    if (!isContextInitialized) {
            setupVisualizer();
            isContextInitialized = true;
    }
    document.querySelectorAll('.track-item').forEach((item, idx) => {
        item.classList.toggle('active', idx === index);
    });
    name = track.title;
    audio.src = track.src;
    audio.play();
}

class floatblock{
    constructor(){
        this.rot = 2 * Math.PI * Math.random();
        this.x = 400 * Math.random();
        this.y = 250;
        this.size = 30*(0.2+0.8*Math.random());
        this.spd = 0.6*(0.5+0.5*Math.random());
        this.rspd = 0.6 * (-1 + 2 * Math.random());
    }

    draw(){
        ctx.beginPath();
        ctx.moveTo(this.x + this.size * Math.cos(this.rot), 
                    this.y+ this.size * Math.sin(this.rot));
        ctx.lineTo(this.x + this.size * Math.cos(this.rot+Math.PI*0.5), 
                    this.y+ this.size * Math.sin(this.rot+Math.PI*0.5));
        ctx.lineTo(this.x + this.size * Math.cos(this.rot+Math.PI*1.0), 
                    this.y+ this.size * Math.sin(this.rot+Math.PI*1.0));
        ctx.lineTo(this.x + this.size * Math.cos(this.rot+Math.PI*1.5), 
                    this.y+ this.size * Math.sin(this.rot+Math.PI*1.5));
        ctx.closePath();
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fill();
        this.y = this.y - this.spd;
        this.rot=this.rot+Math.PI/180 * this.rspd;
        
    }
}

let blocks = [];

function draw(){
    const width = canvas.width;
    const height = canvas.height;
    //ctx.fillStyle = '#000000';
    //ctx.fillRect(0, 0, width, height);
    ctx.clearRect(0, 0, width, height);

    //blocks
    if(clk >= 20){
        blocks.push(new floatblock());
        clk=0;
    }

    for(let i = 0; i < blocks.length; i++){
        blocks[i].draw();
        if(blocks[i].y<-blocks[i].size){
            blocks.splice(i, 1);
            i--; 
        }
            
    }
    clk++;
    //end blocks

    //img
    let imgx = 20;
    let imgy = 20+3*Math.sin(Math.PI/180*clk2);
    ctx.fillStyle = gradient2;
    ctx.fillRect(imgx-3, imgy-3, 100+6, 100+6);

    try{ctx.drawImage(img, imgx, imgy, 100, 100);}catch(err){img.src='pholder.png';}
    ctx.fillStyle = gradient;
    ctx.fillRect(imgx, imgy, 100, 100);
    
    clk2+=1;
    //end img

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    if(name.length>16){
    ctx.font = "bold 10px sans-serif";
    } else if(name.length>10){
    ctx.font = "bold 16px sans-serif";
    }else{
    ctx.font = "bold 24px sans-serif";
    
    }
    ctx.fillText(name, 70, 160);

    ctx.lineWidth = 0.2;
    ctx.strokeStyle = '#0f0f0f';
    ctx.strokeText(name, 70, 160)

    if (!isContextInitialized){
        if (analyser) {
            analyser.getByteFrequencyData(dataArray);
        }
    
        // 音データをもとに緑色の波形（バー）を描画
        const barAreaWidth = 200;
        const offsetx = 150;
        const offsety = 50;
        const barWidth = (barAreaWidth / dataArray.length) * 1.5;
        let barHeight;
        let x = 0;
    
        for (let i = 0; i < dataArray.length; i++) {
            barHeight = dataArray[i] * 0.5; // 音の大きさに合わせて高さを計算
    
            ctx.fillStyle = `rgb(${barHeight + 100}, ${barHeight + 100}, ${barHeight + 100})`;
            
            // 下から上に向かってバーを描画
            ctx.fillRect(x+offsetx, height - barHeight -offsety, barWidth - 2, barHeight);
            ctx.fillStyle = gradient;
            ctx.fillRect(x+offsetx, height-offsety, barWidth - 2, barHeight/4);
    
    
            x += barWidth;
        }
        }
    
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(offsetx, height-offsety, barAreaWidth, 2);
    }
    requestAnimationFrame(draw);
}

draw();

