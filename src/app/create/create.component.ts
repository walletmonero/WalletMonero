import { Component, OnInit } from '@angular/core';
import { CryptoService } from "../crypto.service";
import { SessionService } from "../session.service";
import { BackendService } from "../backend.service";
import { LoginService } from "../login.service";
import { Router } from "@angular/router";
import { MessagerService } from "../messager.service";

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {

  public stepNumber: number;
  public seedSlices: string[];
  public seed: string;
  public sliceSize: number;
  public keys: any;
  public inputSeed: string;

  constructor(
    private crypto: CryptoService,
    private session: SessionService,
    private backend: BackendService,
    private login: LoginService,
    private router: Router,
    private messager: MessagerService
  ){
    this.inputSeed = '';
    this.stepNumber = 1;
    this.sliceSize = 5.4;
    this.seedSlices = [];
    let t: any = this.crypto.generateSeedAndKeys();
    this.seed = t.seed;
    this.keys = t.keys;

  }

  ngOnInit() {
    for(let i = 0; i < 6; i++){
      this.seedSlices.push(this.seed.slice(this.sliceSize*i,this.sliceSize*(i+1)));
    }
  }

  confirm(){
    this.stepNumber = 2;
  }

  tryLogin(){
    if(this.inputSeed !== this.seed){
      return;
    }

    //TODO: refactor dublication of coping wallet data to session service
    //TODO: uncomment on main net
    this.session.updateKeys(this.keys);
    // this.session.address = this.keys.public_addr;
    // this.session.view = this.keys.view.sec;
    // this.session.spend = this.keys.spend.sec;

    this.login
      .tryLogin(this.seed)
      .then((data)=>{
        if(data){
          this.router.navigate(['/account']);
        }
      })
      .catch((e) => {
        this.messager.push({
          message: e.message,
          type: 'error'
        });
      });
  }

}
