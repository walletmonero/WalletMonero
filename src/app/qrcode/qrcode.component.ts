import { Component, OnInit, Input } from '@angular/core';

declare var QRious;

@Component({
  selector: 'app-qrcode',
  templateUrl: './qrcode.component.html',
  styleUrls: ['./qrcode.component.css']
})
export class QrcodeComponent implements OnInit {

  @Input() source: string;
  @Input() size: number = 180;
  public uri: string;

  constructor() {}

  ngOnInit(){
    let qrious = new QRious({value: this.source, size: this.size, padding: 0});
    this.uri = qrious.toDataURL();
  }

}
