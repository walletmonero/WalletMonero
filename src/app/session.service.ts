import { Injectable } from '@angular/core';

@Injectable()
export class SessionService {

  public address: string;
  public view: string;
  public spend: string;

  public isLogged: boolean;
  public isNewAdrress: boolean;

  public keyImages: any;

  public privateKeys: any;
  public publicKeys: any;

  public lockedBalance : any;
  public totalSent : any;
  public accountScannedHeight: any;
  public accountScannedBlockHeight : any;
  public accountScannedBlockTimestamp : any;
  public accountScanStartHeight : any;
  public blockchainHeight : any;

  public transactions: any;
  public totalReceived: any;
  public totalReceivedUnlocked: any;

  constructor() {
    //TODO: remove on prod
    // this.address = '9w7UYUD35ZS82ZsiHus5HeJQCJhzJiMRZTLTsCYCGfUoahk5PJpfKpPMvsBjteE3EW3Xm63t4ibk1ihBdjYjZn6KAjH2oSt';
    // this.view = 'c53e9456ca998abc13cfc9a4c868bbe142ef0298fcf6b569bdf7986b9d525305';
    // this.spend = '0da41a4648265e69701418753b610566ae04f0bbee8b815e3e4b99a69a5bd80d';
    this.address = '';
    this.view = '';
    this.spend = '';

    this.privateKeys = {
      spend: '',
      view: ''
    };

    this.publicKeys = {
      spend: "",
      view: ""
    };

    // this.privateKeys = {
    //   spend: '0da41a4648265e69701418753b610566ae04f0bbee8b815e3e4b99a69a5bd80d',
    //   view: 'c53e9456ca998abc13cfc9a4c868bbe142ef0298fcf6b569bdf7986b9d525305'
    // };
    //
    // this.publicKeys = {
    //   spend: "681bc616b034192a030362a78318a56806fbc627a49cf89d7339bde34691ccc9",
    //   view: "7e6c85df82a1447d1fe5231759f70f0f20c1b6e8d66ffef943db08f652570856"
    // };

    this.keyImages = [];

    this.isLogged = false;
  }

  public updateKeys(keys){
    this.address = keys.public_addr;
    this.view = keys.view.sec;
    this.spend = keys.spend.sec;

    this.privateKeys = {
      spend: keys.spend.sec,
      view: keys.view.sec
    };

    this.publicKeys = {
      spend: keys.view.pub,
      view: keys.view.pub
    };

  }

  public clear(){
    this.address = null;
    this.view = null;
    this.spend = null;
    this.publicKeys = null;
    this.privateKeys = null;
    this.isLogged = false;
    this.keyImages = [];
  }
}
