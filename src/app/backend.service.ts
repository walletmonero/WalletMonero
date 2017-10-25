import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { SessionService } from "./session.service";


//TODO: write interfaces to different backend answers
interface LoginAnswer{

}

@Injectable()
export class BackendService {

  constructor(private http: HttpClient, private session: SessionService) {

  }

  public getPriceUsd(){
    return this.api_method('get_monero_price', {});
  }

  public getAddressTxs(){
    return this.api_method('get_address_txs', {'address': this.session.address, 'view_key': this.session.view });
  }

  public getAddressInfo(){
    return this.api_method('get_address_info', {'address': this.session.address, 'view_key': this.session.view });
  }

  public getTxDetails(tx_hash){
    return this.api_method('get_tx', {'tx_hash': tx_hash, 'address': this.session.address, 'view_key': this.session.view });
  }

  public getRandomOuts(amounts, count){
    return this.api_method('get_random_outs', {'amounts':amounts, 'count': count});
  }

  public getUnspentOuts(amount, mixin, use_dust, dust_threshold){
    return this.api_method('get_unspent_outs', {
      'address': this.session.address,
      'view_key': this.session.view,
      "amount": amount,
      "mixin": mixin,
      "use_dust": use_dust,
      "dust_threshold": dust_threshold
    });
  }

  public submitRawTx(tx){
    return this.api_method('submit_raw_tx', {
      'address': this.session.address,
      'view_key': this.session.view,
      "tx": tx
    });
  }

  public import(){
    return this.api_method('import_wallet_request', {'address': this.session.address, 'view_key': this.session.view });
  }

  public login(){
    // debugger;
    // console.log(this.session);
    return this.api_method('login', {'address': this.session.address, 'view_key': this.session.view });
  }

  private api_method(name : string, params: any): any{
    return this.http.post('/api/'+name, params,{responseType: 'json'});
  }

}
