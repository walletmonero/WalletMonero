import {Component, OnInit, Input} from '@angular/core';

interface TxData{
  fee: number;
  mixin_no: number;
  no_confirmations: number;
  payment_id: string;
  timestamp: Date;
  tx_hash: string;
}

@Component({
  selector: 'app-tx-details',
  templateUrl: './tx-details.component.html',
  styleUrls: ['./tx-details.component.css']
})
export class TxDetailsComponent implements OnInit {

  @Input() data: TxData;

  public isVisible: boolean = false;
  private width: number = 392;
  public left: number = 0;
  public top: number = 0;

  constructor() {
    this.data = null;
  }

  ngOnInit(){
  }

  blockBubbling(event : MouseEvent){
    event.stopPropagation();
  }


  show(event: MouseEvent){

    window.addEventListener('click', this.hide.bind(this));
    console.log(event);
    this.isVisible = true;

    let displaceX = window.innerWidth - this.width - event.clientX;

    displaceX = displaceX > 0 ? 0 : displaceX - 20;

    this.top = event.pageY;
    this.left  = event.clientX + displaceX;
  }

  hide(){
    this.isVisible = false;
    window.removeEventListener('click', this.hide);
  }

  update(){

  }

}


