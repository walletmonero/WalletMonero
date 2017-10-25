import { Injectable } from '@angular/core';
import {SessionService} from "./session.service";


declare var cnUtil: any;
declare var mn_decode: any;


@Injectable()
export class CryptoService {

  constructor(private session: SessionService) {

  }

  public parsePrivateKey(key: string){
    let type = this.detectKeyType(key), seed, keys;

    switch(type){
      case 'seed':
        keys = this.parseSeed(key);
        console.log(keys);
        break;
      case 'monero':
      case 'mymonero':
        let seed = this.decodeMnemonic(key);
        keys = this.parseSeed(seed);
        console.log(keys);
        break;
      default: throw new Error('Cannot parse private key');
    }
    return keys;
  }

  public generateSeedAndKeys(): any{
    let t : any;
    t = {};
    t.seed = cnUtil.rand_16();
    t.keys = cnUtil.create_address(t.seed);

    return t;
  }

  private detectKeyType(key: string) {

    let mnemonic_size = key.trim().split(' ').length;
    if (key.length === 32) return 'seed';
    if (mnemonic_size === 25) return 'monero';
    if (mnemonic_size === 13) return 'mymonero';

    return false;
  }

  private parseSeed(seed) {
    let keys: string;
    try {
      keys = cnUtil.create_address(seed);
    } catch (e) {
      console.log('invalid seed!', e);
      throw new Error('Invalid private key!');
    }
    return keys;
  }

  private decodeMnemonic(mnemonic) {
    let seed;

    try {
      seed = mn_decode(mnemonic);
    } catch (e) {
      console.log(e);
      try {
        seed = mn_decode(mnemonic, "electrum");
      } catch (ee) {
        console.log(ee);
        throw new Error('Cannot decode mnemonic');
      }
    }

    return seed;
  }

  public cachedKeyImage(tx_pub_key, out_index) {
    var cache_index = tx_pub_key + ':' + this.session.address + ':' + out_index;
    if (this.session.keyImages[cache_index]) {
      return this.session.keyImages[cache_index];
    }
    this.session.keyImages[cache_index] = cnUtil.generate_key_image(
      tx_pub_key,
      this.session.privateKeys.view,
      this.session.publicKeys.spend,
      this.session.privateKeys.spend,
      out_index
    ).key_image;
    return this.session.keyImages[cache_index];
  };

}
