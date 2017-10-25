import { Component, OnInit } from '@angular/core';
import { MessagerService, Message } from "../messager.service";

@Component({
  selector: 'app-messager',
  templateUrl: './messager.component.html',
  styleUrls: ['./messager.component.css']
})
export class MessagerComponent implements OnInit {

  public message: string;
  public type: string;
  public isActive: boolean;
  private timer: any;

  constructor(private messager: MessagerService) {
  }

  ngOnInit() {
    console.log('on messager comp init');
    this.message = '';
    this.messager.pusher.subscribe((m : Message)=>{
      this.message = m.message;
      this.type = m.type;
      this.isActive = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(()=>{
        this.isActive = false;
      },7500);
    });
  }

  public typeToColor(type: string): string{
    switch(type){
      case 'warn': return '#FF9500';
      case 'error': return '#dc3545';
      case 'success': return '#00D68F';
      default: return '#fff';
    }
  }
}
