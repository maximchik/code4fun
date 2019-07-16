int  n_lines;
float q[],qx[],qy[], qxi[], qyi[], qxo[], qyo[],sd, sn, r, centerx, centery, cx,cy;
long  iter;
String lines[], lines1[];
PFont font;
float scale;
boolean note;

void setup() {
  size(1280, 720,P2D);
  lines = loadStrings("text1.txt");
  lines1 = loadStrings("text2.txt");

  font = createFont("Verdana", 10, true);
  textFont(font,12);

  background(255);
  noStroke();
  smooth(0);
  frameRate(30);
  
  q=new float[2];
  qx=new float[2];
  qy=new float[2];
  qxi=new float[2];
  qyi=new float[2];
  qxo=new float[2];
  qyo=new float[2];
  note=false; 

  centerx=centery=0;
  
  iter=0;
  scale=1; 
  
  qxo[0]=qxi[0]=-200;
  qyo[0]=qyi[0]=0;
  qxo[1]=qxi[1]=200;
  qyo[1]=qyi[1]=0;
  
  n_lines = 30;
  sn= 1;

}

float mcos (float u) {
  float gr= u % 6;
  return ((gr>3?(6-gr):gr)-1.5)/1.5;
};

float msin (float u) {
  float gr= (u+3) % 6;
  return ((gr>3?(6-gr):gr)-1.5)/1.5;
};


void mouseDragged() {
  int dd;
  if (mouseButton == LEFT) {
    dd=abs(pmouseY-mouseY)>abs(pmouseX-mouseX)?pmouseY-mouseY:mouseX-pmouseX;
    scale+=dd/1000;
    scale=scale<0.3?0.3:scale;
    scale=scale>1.7?1.7:scale;
    if (scale>0.3 && scale < 1.7) {
      centerx+=(cx-centerx)*abs(dd)/500; 
      centery+=(cy-centery)*abs(dd)/500;
    }  
  }
}

void mousePressed() {
  if (mouseButton == LEFT) {
    cx=centerx+(mouseX-width/2)/scale; 
    cy=centery+(mouseY-height/2)/scale;  
  }
}


void keyPressed () {
  if (key == ' ') {
    centerx=centery=0;
    
    scale=1; 
    
    qxo[0]=qxi[0]=-200;
    qyo[0]=qyi[0]=0;
    qxo[1]=qxi[1]=200;
    qyo[1]=qyi[1]=0;
  } else if (key == 'n' || key == 'N'|| key == 'т' || key == 'Т') note=!note;
}


void iterat() {
 if (mousePressed && mouseButton == RIGHT) {
    qxi[0]+=q[0]*(centerx+(mouseX-width/2)/scale-qx[0])/1000;
    qxi[1]+=q[1]*(centerx+(mouseX-width/2)/scale-qx[1])/1000;
    qyi[0]+=q[0]*(centery+(mouseY-height/2)/scale-qy[0])/1000;
    qyi[1]+=q[1]*(centery+(mouseY-height/2)/scale-qy[1])/1000;
  } else {
    qxi[0]+=(qxo[0]-qx[0])/2000;
    qxi[1]+=(qxo[1]-qx[1])/2000;
    qyi[0]+=(qyo[0]-qy[0])/2000;
    qyi[1]+=(qyo[1]-qy[1])/2000;    
  }
  qx[0]=sin(iter/500.)*300+qxi[0];
  qx[1]=-sin(iter/300.)*300+qxi[1];
  qy[0]=cos(iter/800.)*200+qyi[0];
  qy[1]=-cos(iter/600.)*200+qyi[1];
  q[0]= sin(iter/1000.)*10;
  q[1]= cos(iter/800.)*10;
  r=sin(iter/100.)*40+45;
  sd=-sin(iter/500.)*40+45;
}

void DrawFieldLine(float x, float y, float qq, String st )
{
  float  dl,Ax, Ay, A, rk, rk1,cl1,cl2;
  float dx,dx1,dy,dy1, mi=msin(iter/80.0);
  int  stl=st.length();
  dl = sd*(qq>=0?1:-1);
  cl1=qq>=0?(150+mi*50.0):30;
  cl2=qq<0?(100+mi*50.0):30;
  for (int k=0; k<50 && k<stl;k++) {
      dx=x - qx[0];
      dx1=x - qx[1];
      dy=y - qy[0];
      dy1=y - qy[1];    
      
      rk = q[0]/(dx*dx + dy*dy);
      rk1 = q[1]/(dx1*dx1 + dy1*dy1);

      Ax = rk * dx + rk1 * dx1;
      Ay = rk * dy + rk1 * dy1;

      A =sqrt(Ax*Ax + Ay*Ay);

      x +=dl*Ax/A;
      y +=dl*Ay/A;
      
      if ((x-centerx)*scale>=-width/2 && (x-centerx)*scale<width/2 && (y-centery)*scale>=-height/2 && (y-centery)*scale<height/2) {      
        fill(cl1, 50, cl2, mi*50.0+130+k*5+20*(1-scale));
        textSize(max(scale*min(-mi*2.0+13+k/5,sd+4),4));
        text(st.charAt(qq>=0?k:(stl-k-1)),width/2+(x-centerx)*scale,height/2+(y-centery)*scale);
      }
  }

}


void draw()
{
  float  temp_alpha, p2l;
  String strn;

  iterat();
  iter++;
  p2l=2 * PI / n_lines;
  background(255);

  for (int i = 0; i < 2; i++) {
    for (int j = 0; j < ((i==1)?lines1.length:lines.length) && j < n_lines; j++)
    {
      strn=(i==1)?lines1[j]:lines[j];
      if (strn.length() > 0) {
        temp_alpha = (250-iter/10.0)*PI/180+(float(j)+0.5*float(i)) * p2l;
        DrawFieldLine( qx[i] + (q[i]>=0?1:-1)*r * cos(temp_alpha), qy[i] + r * sin(temp_alpha),q[i],strn);
      }
    };
  }
  if (note) {
    fill(200, 200, 200);
    textSize(9);
    text(floor(frameRate)+"\n"+qx[0]+"\n"+qy[0]+"\n"+qx[1]+"\n"+qy[1],10,10);
    
    fill(150, 150, 150);
    textSize(25);
    text("полярности",width/2-80,30);
  
    fill(150, 150, 150);
    textSize(11);
    text("Двигая мышку с зажатой левой кнопкой вы меняете масштаб.\nПравой кнопкой мыши вы можете притягивать/отталкивать \"полярности\".\nНажав пробел, вы сбрасываете все изменения.\nКлавиша 'n' включает/выключает эту подсказку.",20,height-45);
  }
}


