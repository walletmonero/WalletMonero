import { Injectable } from '@angular/core';
import { BackendService } from "./backend.service";
import { CryptoService } from "./crypto.service";
import { SessionService } from "./session.service";
import { MessagerService } from "./messager.service";

@Injectable()
export class LoginService {

  constructor(
    private backend: BackendService,
    private crypto: CryptoService,
    private session: SessionService,
    private messager: MessagerService
  ){}

  tryLogin(key): Promise<boolean> {
    let keys: any;
    return new Promise((resolve, reject) => {

      try {
        keys = this.crypto.parsePrivateKey(key);
      } catch (e) {
        console.log(e);
        reject(e);
      }

      this.session.updateKeys(keys);

      this.backend.login().subscribe({
        next: (data) => {
          console.log(data);
          if (data.status === 'error') {
            console.log('Key parsed successfully but cannot login :( maybe key from testnet?');
            reject(data.status);
            return;
          }
          if (data.new_address) {
            this.session.isNewAdrress = true;
          }
          this.session.isLogged = true;
          // this.router.navigate(['/account']);
          resolve(keys);
        },
        error: (e) => {
          console.log(e);
          reject(e.message);
        },
        complete: () => {
          // console.log('login complete')
        },
      });
      // console.log('try login', key);
    });
  }
}
