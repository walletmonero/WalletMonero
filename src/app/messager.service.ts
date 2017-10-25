import { Injectable } from '@angular/core';
import { Subject } from "rxjs";

export interface Message{
  message: string;
  type?: string;
}

@Injectable()
export class MessagerService {

  public pusher: Subject<Message>;

  constructor() {
    this.pusher = new Subject<Message>();
    console.log('create pusher subject');
  }

  public push(message : Message){
    console.log('in massege service push');
    this.pusher.next(message);
  }


}
