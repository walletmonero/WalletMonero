import { Component, OnInit } from '@angular/core';
import { SessionService } from "../session.service";
import { BackendService } from "../backend.service";
import { CryptoService } from "../crypto.service";
import { Router } from "@angular/router";
import { LoginService } from "../login.service";
import { MessagerService } from "../messager.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public privatekey: string;

  constructor(
    private session: SessionService,
    private backend: BackendService,
    private crypto: CryptoService,
    private router: Router,
    private login: LoginService,
    private messager: MessagerService
  ){
    this.privatekey = '';
  }

  ngOnInit() {

  }


  validate(){

    let length = this.privatekey.length;
    if(length === 0) return true;

    let mnemonic_size = this.privatekey.trim().split(' ').length;
    // console.log(length, mnemonic_size);

    return (length === 32 || mnemonic_size === 25 || mnemonic_size === 13);
  }

  tryLogin(){

    //TODO: uncomment on main net
    // this.session.address = keys.public_addr;
    // this.session.view = keys.view.sec;
    // this.session.spend = keys.spend.sec;
    if(this.validate()){
      this.login
        .tryLogin(this.privatekey)
        .then((data : any)=>{
          if(data){
            // this.session.address = data.public_addr;
            // this.session.view = data.view.sec;
            // this.session.spend = data.spend.sec;
            this.router.navigate(['/account']);
          }
        })
        .catch((e) => {
          this.messager.push({
            message: e.message,
            type: 'error'
          });
          console.log('Login error');
          // alert('Login failed:' + e);
        });
    }

  }



}
