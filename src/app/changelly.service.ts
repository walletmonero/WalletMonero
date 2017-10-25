import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";


export const CURRENCIES = {"btc":"Bitcoin","btcusd":"US Dollar","btceur":"Euro","eth":"Ethereum","etc":"Ethereum Classic","exp":"Expanse","xem":"XEM (NEM)","lsk":"Lisk","xmr":"Monero","game":"GameCredits","steem":"Steem","golos":"Golos","sbd":"Steem Dollar","zec":"Zcash","nlg":"Gulden","strat":"Stratis","ardr":"Ardor","rep":"Augur","lbc":"LBRY Credits","maid":"MaidSafeCoin","fct":"Factom","ltc":"Litecoin","bcn":"Bytecoin","xrp":"Ripple","doge":"Dogecoin","amp":"Synereo","nxt":"Nxt","dash":"Dash","dsh":"Dashcoin","rads":"Radium","xdn":"DigitalNote","aeon":"AeonCoin","nbt":"NuBits","fcn":"FantomCoin","qcn":"QuazarCoin","nav":"NAV Coin","pot":"PotCoin","gnt":"Golem","waves":"Waves","usdt":"Tether USD","swt":"Swarm City","mln":"Melon","dgd":"DigixDAO","time":"Chronobank","sngls":"SingularDTV","xaur":"Xaurum","pivx":"PIVX","gbg":"Golos Gold","trst":"Trustcoin","edg":"Edgeless","gbyte":"Byteball","dar":"Darcrus","wings":"Wings DAO","rlc":"iEx.ec","gno":"Gnosis","dcr":"Decred","gup":"Guppy","sys":"Syscoin","lun":"Lunyr","str":"Stellar - XLM","bat":"Basic Attention Token","ant":"Aragon","bnt":"Bancor Network Token","snt":"Status Network Token","cvc":"Civic","eos":"EOS","pay":"TenXPay","qtum":"Qtum","bcc":"Bitcoin Cash","neo":"Neo","omg":"OmiseGo","mco":"Monaco","mtl":"Metal","1st":"FirstBlood","adx":"AdEx","zrx":"0x Protocol Token","qtum-i":"Qtum Ignition","dct":"Decent"};

@Injectable()
export class ChangellyService {

  constructor(private http: HttpClient) {}

  getCurrencies(){
    return this.method('/changellyGetCurrencies', {});
  }

  getMinAmount(from) {
    return this.method('/changellyGetMinAmount', {
      'from': from
    });
  }

  getExchangeAmount(from, amount){
    return this.method('/changellyGetExchangeAmount', {
      'from': from,
      'amount': amount
    });
  }

  generateAddress(from, address){
    //TODO: remove on prod
    // address = '49Jt4tzbvZ5PyEMub6tNDGKP4zxogN9t1VACVWgTEcMwhtCGjxrDyt5XCDHG6XpA2U1uWsnsyKYdrL25Vp6y2pou2bdboCZ';
    return this.method('/changellyGenerateAddress', {
      'from': from,
      'address': address
    });
  }

  getStatus(id){
    return this.method('/changellyGetStatus', {
      'id': id
    });
  }

  method(url: string, params: any):Observable<any> {
    return this.http.post(url, params, {responseType: 'json'});
  }
}
