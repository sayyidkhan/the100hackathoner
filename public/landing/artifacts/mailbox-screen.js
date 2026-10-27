// A crisp, unlit screen keeps the notification readable under studio lighting.
export function mailboxScreen(T) {
 const group=new T.Group();group.name='mailbox-phone-screen';
 let state='',map,ctx;
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=1280;ctx=canvas.getContext('2d');
  map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;
  const mesh=new T.Mesh(new T.PlaneGeometry(1.48,2.48),new T.MeshBasicMaterial({map,toneMapped:false}));mesh.userData.noShadow=true;group.add(mesh);
 }
 function update(next){
  group.userData.state=next;if(next===state)return;state=next;if(!ctx)return;
  const c=ctx,arrived=state==='notified',sending=state==='sending';
  c.fillStyle='#f5eee1';c.fillRect(0,0,768,1280);
  c.textAlign='left';c.fillStyle='#21393b';c.font='600 26px sans-serif';c.fillText('9:41',55,62);
  c.fillStyle='#15282c';c.beginPath();c.roundRect(295,25,178,40,20);c.fill();
  c.font='600 22px sans-serif';c.fillText('MAILBOX / IOT',55,167);
  c.fillStyle='#667b78';c.font='24px sans-serif';c.fillText('Home, connected.',55,212);
  c.fillStyle='#ffffff';c.beginPath();c.roundRect(38,320,692,620,36);c.fill();
  c.fillStyle=arrived?'#d66543':sending?'#258b86':'#dce4df';c.beginPath();c.arc(384,485,88,0,Math.PI*2);c.fill();
  c.strokeStyle=arrived||sending?'#ffffff':'#49635f';c.lineWidth=6;c.lineJoin='round';c.beginPath();c.roundRect(335,454,98,65,7);c.stroke();c.beginPath();c.moveTo(338,459);c.lineTo(384,491);c.lineTo(430,459);c.stroke();
  c.textAlign='center';c.fillStyle='#183234';c.font='600 57px sans-serif';c.fillText(arrived?'Mail has arrived':sending?'Checking mailbox':'No new mail',384,665,650);
  c.font='34px sans-serif';c.fillStyle='#617673';c.fillText(arrived?'Ready to collect':sending?'Sending an update':'We’ll let you know',384,731);
  c.fillStyle=arrived?'#e8f1e9':'#f3f4ef';c.beginPath();c.roundRect(171,798,426,65,30);c.fill();
  c.font='600 24px sans-serif';c.fillStyle='#376d5a';c.fillText(arrived?'●   New delivery':'●   Sensor connected',384,840);
  c.fillStyle='#758681';c.font='22px sans-serif';c.fillText('Apartment #02-01',384,1062);
  c.font='18px sans-serif';c.fillText('Illustrative notification',384,1102);
  c.fillStyle='#354e4b';c.beginPath();c.roundRect(282,1225,204,7,3);c.fill();map.needsUpdate=true;
 }
 update('waiting');return {group,update};
}
