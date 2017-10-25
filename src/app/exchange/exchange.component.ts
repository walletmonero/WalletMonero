import {Component, OnInit, Input} from '@angular/core';
import {ChangellyService, CURRENCIES} from "../changelly.service";

declare var io;

@Component({
  selector: 'app-exchange',
  templateUrl: './exchange.component.html',
  styleUrls: ['./exchange.component.css']
})
export class ExchangeComponent implements OnInit {
  @Input() address: string;

  public currencies: string[];
  public currency : string;
  public pay : number;
  public minAmount: number;
  public receive: number;
  public paymentAddress: string;
  public paymentStatus: string;
  public updateDelay: any;
  public dic = CURRENCIES;

  public step: number;


  constructor(private changelly: ChangellyService) {
    this.currencies = [];
    this.currency = 'btc';
    this.pay = 0;
    this.receive = 0;
    this.address = '';
    this.minAmount = 0;
    this.step = 1;
  }

  ngOnInit() {
    this.changelly.getCurrencies().subscribe({
      next: (data)=>{
        this.currencies = data.result;
        console.log(data);
      },
      error: (error) =>{
        console.log(error);
      }
    });
  }

  updateMinAmount(){
    this.updateDelay = setTimeout(()=>{
      //TODO: how to detect both next are resolved in rxjs?
      this.changelly.getMinAmount(this.currency).subscribe({
        next: (data) =>{
          this.minAmount = parseFloat(data.result as string);
          console.log(this.minAmount);
        },
        error: (error) => {console.log(error)}
      });
    }, 500);
  }

  updateReceive(){
    clearInterval(this.updateDelay);
    this.updateDelay = setTimeout(()=>{

      //TODO: how to detect both next are resolved in rxjs?
      this.changelly.getExchangeAmount(this.currency, this.pay).subscribe({
        next:(data) =>{
          this.receive = parseFloat(data.result as string);
          console.log(this.receive);
        },
        error: (error) =>{console.log(error)}
      });
    }, 500);
  }


  isValid(): boolean{
    return isNum(this.pay) && this.pay > this.minAmount;
  }

  toExchangePayment(){
    if(this.isValid){
      // console.log('valid!');
      this.changelly.generateAddress(this.currency,this.address).subscribe({
        next: (data)=>{
          if(data.error) {
            console.log(data.error);
            return;
          }
          this.paymentAddress = data.result.address;
          this.paymentStatus = `waiting ${this.pay} ${this.currency.toUpperCase()}`;
          this.step = 2;
          this.startSocket();
        },
        error: (error)=>{ console.log(error) }
      });
    }
  }

  startSocket(){
    let socket = io('https://walletmonero.com/');
    socket.on('status', (data) => {
      console.log(data);
      this.paymentStatus = data.status;
      if(data.status === 'finished' || data.status === 'failed' || data.status === 'refunded'){
        socket.close();
      }
    });
  }

}

function isNum (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
