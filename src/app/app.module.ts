import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { AccountComponent } from './account/account.component';
import { CreateComponent } from './create/create.component';
import { SessionService } from "./session.service";
import  {BackendService } from "./backend.service";
import {CryptoService} from "./crypto.service";
import { CopyOnClickDirective } from './copy-on-click.directive';
import {LoginService} from "./login.service";
import { QrcodeComponent } from './qrcode/qrcode.component';
import { SpreadPipe } from './spread.pipe';
import { TxDetailsComponent } from './tx-details/tx-details.component';
import { SplitPipe } from './split.pipe';
import { ExchangeComponent } from './exchange/exchange.component';
import {ChangellyService} from "./changelly.service";
import { MessagerComponent } from './messager/messager.component';
import {MessagerService} from "./messager.service";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AccountComponent,
    CreateComponent,
    CopyOnClickDirective,
    QrcodeComponent,
    SpreadPipe,
    TxDetailsComponent,
    SplitPipe,
    ExchangeComponent,
    MessagerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [SessionService, BackendService, CryptoService, LoginService, ChangellyService, MessagerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
