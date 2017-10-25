import {Component, OnInit, OnDestroy, AfterViewInit, ViewChild} from '@angular/core';
import {BackendService} from "../backend.service";
import {CryptoService} from "../crypto.service";
import {SessionService} from "../session.service";
import {TxDetailsComponent} from "../tx-details/tx-details.component";
import {MessagerService} from "../messager.service";

declare var cnUtil;
declare var config;
// declare var JSBigInt;

enum TabState{
  Wallet = 0,
  Transactions = 1,
  Send = 2,
  Exchange = 3
}

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild(TxDetailsComponent)
  private txDetails: TxDetailsComponent;

  private updateInterval: any;

  public accountData: any;

  public priceUsd: number;
  public balance: number;
  public unlockedBalance: number;
  public currentTab: TabState;
  public transactions: any[];
  public shownTransactions: any[];
  public showLoadBtn: boolean;

  public sendAmount: number;
  public sendAddress: string;
  public sendId: string;
  public submitting: boolean;
  public sendMessage: string;

  public showImportInfo: boolean;
  public importFee: number;
  public paymentAddress: string;
  public paymentStatus: string;
  public patmentSuccess: boolean;
  public isImporting: boolean;

  public showQR: boolean;



  constructor(
    private backend: BackendService,
    private crypto: CryptoService,
    private session: SessionService,
    private messager: MessagerService
  ){

    this.showQR = false;

    this.currentTab = TabState.Wallet;
    this.balance = 0;
    this.priceUsd = 0;

    this.sendAmount = 0;
    this.sendAddress = '';
    this.sendId = '';
    this.submitting = false;

    this.showImportInfo = false;
    this.isImporting = false;
    this.shownTransactions = [];
    this.transactions = [];
    this.showLoadBtn = true;

    this.accountData = session;

  }

  ngOnInit() {
    this.backend
      .getPriceUsd()
      .subscribe({
        next: (data)=>{
          this.priceUsd = parseFloat(data[0].price_usd);
        },
        error: (e)=>{
          this.messager.push({
            message: "Cannot get current XMR/USD cource",
            type: 'warn'
          });
        }
      });

    this.updateData().then(()=>{
      this.loadMore();
    });
    this.updateInterval = setInterval(()=>{
      this.updateData();
    },15000);

  }

  ngAfterViewInit(){

  }

  ngOnDestroy(){
    clearInterval(this.updateInterval);
  }

  public loadMore(){
    let step = 10, size = this.shownTransactions.length;
    if( size + step >= this.transactions.length){
      this.showLoadBtn = false;
    }
    this.shownTransactions.concat(this.transactions.slice(size, size + step));
  }

  public toogleQR(){
    this.showQR = !this.showQR;
  }

  public showDetails(event: MouseEvent, index:number){
    console.log(this.session.transactions[index]);
    this.backend.getTxDetails(this.session.transactions[index].hash).subscribe({
      next: (data)=>{
        console.log(data);
        this.txDetails.data = data;
        this.txDetails.show(event);
      },
      error: (e)=>{
        console.log(e);
        this.messager.push({
          message: "Cannot load transaction details",
          type: 'error'
        });
      },
    });
  }

  public tryImport(){
    this.backend.import().subscribe({
      next: (data)=>{
        console.log(data);
        this.showImportInfo = true;
        this.paymentStatus = data.status;
        this.paymentAddress = data.payment_address;
        this.importFee = data.import_fee * 1e-12;
        this.patmentSuccess = data.request_fulfilled;
        this.startCheckingPayment();
      },
      error: (e)=>{
        console.log(e);
        this.messager.push({
          message: e.message,
          type: 'error'
        });
      }
    });
  }

  private startCheckingPayment(){
    let interval = setInterval(()=>{
      this.backend.import().subscribe({
        next: (data)=>{
          console.log(data);
          if(data.error){
            return;
          }

          this.showImportInfo = false;
          // this.paymentStatus = data.status;
          // this.paymentAddress = data.payment_address;
          // this.importFee = data.import_fee * 1e-12;
          this.patmentSuccess = data.request_fulfilled;
          clearInterval(interval);
        },
        error: (e)=>{console.log(e);}
      });
    },10000);
  }

  public transactionType(tx: any){
    if( tx.mempool){
      return 'Pool';
    }
    return tx.amount > 0? 'Incoming' : 'Spent';
  }

  private updateData(){
    return new Promise((resolve)=>{
      this.backend.getAddressInfo().subscribe({
        next: (data)=>{
          console.log(data);
          // this.balance = data.total_received * 1e-12;
          // this.unlockedBalance = data.total_received - data.locked_funds;
          var view_only = false;

          for (var i = 0; i < (data.spent_outputs || []).length; ++i) {
            if (view_only === false) {
              let key_image = this.crypto.cachedKeyImage(
                data.spent_outputs[i].tx_pub_key,
                data.spent_outputs[i].out_index
              );
              if (data.spent_outputs[i].key_image !== key_image) {
                data.total_sent = data.total_sent - data.spent_outputs[i].amount;
              }
            }
          }
          var scanned_block_timestamp = data.scanned_block_timestamp || 0;

          if (scanned_block_timestamp > 0){
            scanned_block_timestamp = new Date(scanned_block_timestamp * 1000);
          }

          this.session.lockedBalance = data.locked_funds || 0;
          this.session.totalSent = data.total_sent || 0;
          //$scope.account_scanned_tx_height = data.scanned_height || 0;
          this.session.accountScannedBlockHeight = data.scanned_block_height || 0;
          this.session.accountScannedBlockTimestamp = scanned_block_timestamp;
          this.session.accountScanStartHeight = data.start_height || 0;
          //$scope.transaction_height = data.transaction_height || 0;
          this.session.blockchainHeight = data.blockchain_height || 0;
          if(this.session.accountScannedBlockHeight > 0 && this.session.accountScannedBlockHeight < this.session.blockchainHeight){
            this.isImporting = true;
          } else{
            this.isImporting = false;
          }
        },
        error: (e) =>{
          console.log(e);
        }
      });

      this.backend.getAddressTxs().subscribe({
        next: (data)=>{
          console.log(data);
          let scanned_block_timestamp = data.scanned_block_timestamp || 0;

          if (scanned_block_timestamp > 0) {
            scanned_block_timestamp = new Date(scanned_block_timestamp * 1000);
          }

          this.session.accountScannedHeight = data.scanned_height || 0;
          this.session.accountScannedBlockHeight = data.scanned_block_height || 0;
          this.session.accountScannedBlockTimestamp = scanned_block_timestamp;
          this.session.accountScanStartHeight = data.start_height || 0;
          //$scope.transaction_height = data.transaction_height || 0;
          this.session.blockchainHeight = data.blockchain_height || 0;


          let transactions = data.transactions || [];
          let view_only = false;

          for (var i = 0; i < transactions.length; ++i) {
            if ((transactions[i].spent_outputs || []).length > 0) {
              if (view_only === false)
              {
                for (var j = 0; j < transactions[i].spent_outputs.length; ++j)
                {
                  var key_image = this.crypto.cachedKeyImage(
                    transactions[i].spent_outputs[j].tx_pub_key,
                    transactions[i].spent_outputs[j].out_index
                  );
                  if (transactions[i].spent_outputs[j].key_image !== key_image)
                  {
                    transactions[i].total_sent = transactions[i].total_sent - transactions[i].spent_outputs[j].amount;
                    transactions[i].spent_outputs.splice(j, 1);
                    j--;
                  }
                }
              }
            }

            // decrypt payment_id8 which results in using
            // integrated address
            if (transactions[i].payment_id.length == 16) {
              if (transactions[i].tx_pub_key) {
                var decrypted_payment_id8
                  = cnUtil.decrypt_payment_id(transactions[i].payment_id,
                  transactions[i].tx_pub_key,
                  this.session.view);
                //console.log("decrypted_payment_id8: " + decrypted_payment_id8);
                transactions[i].payment_id = decrypted_payment_id8;
              }
            }



            if ((transactions[i].total_received || 0)+(transactions[i].total_sent || 0) <= 0){
              transactions.splice(i, 1);
              i--;
              continue;
            }
            transactions[i].amount = (transactions[i].total_received || 0) - (transactions[i].total_sent || 0);
            transactions[i].approx_float_amount = parseFloat(cnUtil.formatMoney(transactions[i].amount));
            transactions[i].timestamp = new Date(transactions[i].timestamp * 1000);

          }

          transactions.sort(function(a, b)
          {
            return b.id - a.id; // sort by id in database
          });
          this.session.transactions = transactions;
          this.session.totalReceived = data.total_received || 0;
          this.session.totalReceivedUnlocked = data.total_received_unlocked || 0;
          console.log(this.session.transactions);

          this.balance = (this.session.totalReceived - this.session.totalSent)* 1e-12;
          this.unlockedBalance = (this.session.totalReceivedUnlocked - this.session.totalSent) * 1e-12;
          resolve(true);
        },
        error: (e) =>{
          console.log(e);
        }
      });

    });
  }

  public startSending(){
    this.submitting = true;
    this.sendCoins([{address: this.sendAddress, amount: this.sendAmount}], 4, this.sendId);
  }

  private sendCoins(targets, mixin, payment_id) {

    function isInt(value:any) {
      return !isNaN(value) &&
        parseInt(value) == value &&
        !isNaN(parseInt(value, 10));
    }

    let self = this;

    let status = "";
    let error = "";
    let submitting = false;
    // let targets = [{}];
    let totalAmount = 0;
    let mixins = config.defaultMixin.toString();
    let view_only = false;
    let success_page = false;
    let sent_tx = {};

    if (submitting) return;

    submitting = true;
    var fee_multiplayers = [1, 4, 20, 166];

    var default_priority = 2;
    mixin = parseInt(mixin);
    var rct = true; //maybe want to set this later based on inputs (?)
    var realDsts = [];
    var targetPromises = [];

    for (let i = 0; i < targets.length; ++i) {
      let target: any = targets[i];
      if (!target.address && !target.amount) {
        continue;
      }
      // var deferred = $q.defer();
      targetPromises.push(new Promise(function (resolve, reject){
        let amount;
        let _target:any = Object.assign({}, target);
        try {
          amount = cnUtil.parseMoney(_target.amount);
        } catch (e) {
          this.messager.push({
            message: e.message,
            type: 'error'
          });
          reject("Failed to parse amount (#" + i + ")");
          return;
        }
        if (_target.address.indexOf('.') === -1) {
          try {
            // verify that the address is valid
            cnUtil.decode_address(_target.address);
            resolve({
              address: _target.address,
              amount: amount
            });
          } catch (e) {
            reject("Failed to decode address (#" + i + "): " + e);
            return;
          }
        } else {
          throw new Error('Unexpected address!');
          // var domain = _target.address.replace(/@/g, ".");
          // ApiCalls.get_txt_records(domain)
          //   .then(function(response) {
          //     var data = response.data;
          //     var records = data.records;
          //     var oaRecords = [];
          //     console.log(domain + ": ", data.records);
          //     if (data.dnssec_used) {
          //       if (data.secured) {
          //         console.log("DNSSEC validation successful");
          //       } else {
          //         reject("DNSSEC validation failed for " + domain + ": " + data.dnssec_fail_reason);
          //         return;
          //       }
          //     } else {
          //       console.log("DNSSEC Not used");
          //     }
          //     for (var i = 0; i < records.length; i++) {
          //       var record = records[i];
          //       if (record.slice(0, 4 + config.openAliasPrefix.length + 1) !== "oa1:" + config.openAliasPrefix + " ") {
          //         continue;
          //       }
          //       console.log("Found OpenAlias record: " + record);
          //       oaRecords.push(parseOpenAliasRecord(record));
          //     }
          //     if (oaRecords.length === 0) {
          //       reject("No OpenAlias records found for: " + domain);
          //       return;
          //     }
          //     if (oaRecords.length !== 1) {
          //       reject("Multiple addresses found for given domain: " + domain);
          //       return;
          //     }
          //     console.log("OpenAlias record: ", oaRecords[0]);
          //     var oaAddress = oaRecords[0].address;
          //     try {
          //       cnUtil.decode_address(oaAddress);
          //       confirmOpenAliasAddress(domain, oaAddress,
          //         oaRecords[0].name, oaRecords[0].description,
          //         data.dnssec_used && data.secured)
          //         .then(function() {
          //           resolve({
          //             address: oaAddress,
          //             amount: amount,
          //             domain: domain
          //           });
          //         }, function(err) {
          //           reject(err);
          //         });
          //     } catch (e) {
          //       reject("Failed to decode OpenAlias address: " + oaRecords[0].address + ": " + e);
          //       return;
          //     }
          //   }, function(data) {
          //     reject("Failed to resolve DNS records for '" + domain + "': " + "Unknown error");
          //   });
        }
      }));
      // (function(deferred, target) {
      // })(deferred, target);

    }

    var strpad = function(org_str, padString, length)
    {
      var str = org_str;
      while (str.length < length)
        str = padString + str;
      return str;
    };

    // Transaction will need at least 1KB fee (13KB for RingCT)

    var feePerKB = config.feePerKB;

    var priority = default_priority;

    if (!isInt(priority)) {
      this.submitting = false;
      // this.sendMessage = "Priority is not an integer number";
      this.messager.push({
        message: "Priority is not an integer number",
        type: 'error'
      });

      return;
    }

    if (!(priority >= 1 && priority <= 4))
    {
      this.submitting = false;
      // this.sendMessage = "Priority is not between 1 and 4";
      this.messager.push({
        message: "Priority is not between 1 and 4",
        type: 'error'
      });
      return;
    }

    var fee_multiplayer = fee_multiplayers[priority - 1]; // default is 4

    var neededFee = rct ? feePerKB * 13 : feePerKB;
    var totalAmountWithoutFee;
    var unspentOuts;
    // let self = this;
    var pid_encrypt = false; //don't encrypt payment ID unless we find an integrated one
    Promise.all(targetPromises).then(function(destinations) {
      totalAmountWithoutFee = 0;
      for (var i = 0; i < destinations.length; i++) {
        totalAmountWithoutFee += destinations[i].amount;
      }
      realDsts = destinations;
      console.log("Parsed destinations: " + JSON.stringify(realDsts));
      console.log("Total before fee: " + cnUtil.formatMoney(totalAmountWithoutFee));
      if (realDsts.length === 0) {
        self.submitting = false;
        // self.sendMessage = "You need to enter a valid destination";
        this.messager.push({
          message: "You need to enter a valid destination",
          type: 'error'
        });
        return;
      }
      if (payment_id)
      {
        if (payment_id.length <= 64 && /^[0-9a-fA-F]+$/.test(payment_id))
        {
          // if payment id is shorter, but has correct number, just
          // pad it to required length with zeros
          payment_id = strpad(payment_id, "0", 64);
        }

        // now double check if ok, when we padded it
        if (payment_id.length !== 64 || !(/^[0-9a-fA-F]{64}$/.test(payment_id)))
        {
          self.submitting = false;
          // self.sendMessage = "The payment ID you've entered is not valid";
          this.messager.push({
            message: "The payment ID you've entered is not valid",
            type: 'error'
          });
          return;
        }

      }
      if (realDsts.length === 1) {//multiple destinations aren't supported by MyMonero, but don't include integrated ID anyway (possibly should error in the future)
        var decode_result = cnUtil.decode_address(realDsts[0].address);
        if (decode_result.intPaymentId && payment_id) {
          self.submitting = false;
          // self.sendMessage = "Payment ID field must be blank when using an Integrated Address";
          this.messager.push({
            message: "Payment ID field must be blank when using an Integrated Address",
            type: 'error'
          });
          return;
        } else if (decode_result.intPaymentId) {
          payment_id = decode_result.intPaymentId;
          pid_encrypt = true; //encrypt if using an integrated address
        }
      }
      if (totalAmountWithoutFee <= 0) {
        self.submitting = false;
        // self.sendMessage = "The amount you've entered is too low";
        this.messager.push({
          message: "The amount you've entered is too low",
          type: 'error'
        });
        return;
      }
      // self.sendMessage = "Generating transaction...";
      this.messager.push({
        message: "Generating transaction...",
        type: 'success'
      });
      console.log("Destinations: ");
      // Log destinations to console
      for (var j = 0; j < realDsts.length; j++) {
        console.log(realDsts[j].address + ": " + cnUtil.formatMoneyFull(realDsts[j].amount));
      }


      self.backend.getUnspentOuts('0',mixin, mixin === 0, config.dustThreshold.toString()).subscribe({
        next: (data)=>{
          unspentOuts = checkUnspentOuts(data.outputs || []);
          unused_outs = unspentOuts.slice(0);
          using_outs = [];
          using_outs_amount = 0;
          if (data.per_kb_fee)
          {
            feePerKB = data.per_kb_fee;
            neededFee = feePerKB*13*fee_multiplayer;
          }
          transfer().then(transferSuccess, transferFailure);
        },
        error: (data)=>{
          self.sendMessage = "";
          self.submitting = false;
          if (data && data.Error) {
            // self.sendMessage = data.Error;
            this.messager.push({
              message: data.Error,
              type: 'error'
            });
            console.warn(data.Error);
          } else {
            // self.sendMessage = "Something went wrong with getting your available balance for spending";
            this.messager.push({
              message: "Something went wrong with getting your available balance for spending",
              type: 'error'
            });
          }
        }
      });
    }, function(err) {
      self.submitting = false;
      // self.sendMessage = err;
      console.log("Error decoding targets: " + err);
      this.messager.push({
        message: 'Error decoding target',
        type: 'error'
      });
    });

    function checkUnspentOuts(outputs) {
      for (var i = 0; i < outputs.length; i++) {
        for (var j = 0; outputs[i] && j < outputs[i].spend_key_images.length; j++) {
          var key_img = self.crypto.cachedKeyImage(outputs[i].tx_pub_key, outputs[i].index);
          if (key_img === outputs[i].spend_key_images[j]) {
            console.log("Output was spent with key image: " + key_img + " amount: " + cnUtil.formatMoneyFull(outputs[i].amount));
            // Remove output from list
            outputs.splice(i, 1);
            if (outputs[i]) {
              j = outputs[i].spend_key_images.length;
            }
            i--;
          } else {
            console.log("Output used as mixin (" + key_img + "/" + outputs[i].spend_key_images[j] + ")");
          }
        }
      }
      console.log("Unspent outs: " + JSON.stringify(outputs));
      return outputs;
    }

    function transferSuccess(tx_h) {
      var prevFee = neededFee;
      var raw_tx = tx_h.raw;
      var tx_hash = tx_h.hash;
      var tx_prvkey = tx_h.prvkey;
      // work out per-kb fee for transaction
      var txBlobBytes = raw_tx.length / 2;
      var txBlobKBytes = txBlobBytes / 1024.0;
      var numKB = Math.floor(txBlobKBytes);
      if (txBlobBytes % 1024) {
        numKB++;
      }
      console.log(txBlobBytes + " bytes <= " + numKB + " KB (current fee: " + cnUtil.formatMoneyFull(prevFee) + ")");
      neededFee = feePerKB*numKB*fee_multiplayer;
      // if we need a higher fee
      if (neededFee - prevFee > 0) {
        console.log("Previous fee: " + cnUtil.formatMoneyFull(prevFee) + " New fee: " + cnUtil.formatMoneyFull(neededFee));
        transfer().then(transferSuccess, transferFailure);
        return;
      }

      // generated with correct per-kb fee
      console.log("Successful tx generation, submitting tx");
      console.log("Tx hash: " + tx_hash);
      this.messager.push({
        message: 'Successful tx generation, submitting...',
        type: 'success'
      });
      // self.sendMessage = "Submitting...";
      var request = {
        tx: raw_tx
      };


      let mockPromise = new Promise((res, rej)=>{
        setTimeout(()=>{
          res(true);
        },1000);
      }).then(function() {

        //alert('Confirmed ');

        self.backend.submitRawTx(request.tx).subscribe({
          next: (data) => {
            if (data.status === "error")
            {
              self.submitting = false;
              // self.sendMessage = "Something unexpected occurred when submitting your transaction: " + data.error;
              this.messager.push({
                message: 'Something unexpected occurred',
                type: 'error'
              });
              return;
            }

            //console.log("Successfully submitted tx");
            // self.targets = [{}];
            // self.sent_tx = {
            //   address: realDsts[0].address,
            //   domain: realDsts[0].domain,
            //   amount: realDsts[0].amount,
            //   payment_id: payment_id,
            //   tx_id: tx_hash,
            //   tx_prvkey: tx_prvkey,
            //   tx_fee: neededFee/*.add(getTxCharge(neededFee))*/,
            //   explorerLink: explorerUrl + "tx/" + tx_hash
            // };
            // self.sendMessage = 'Success!';

            // $scope.success_page = true;
            // $scope.status = "";
            self.submitting = false;
            this.messager.push({
              message: 'Success',
              type: 'success'
            });
          },
          error: (e) =>{
            // $scope.status = "";
            self.submitting = false;
            // self.sendMessage = "Something unexpected occurred when submitting your transaction: ";
            this.messager.push({
              message: 'Something unexpected occurred',
              type: 'error'
            });
          }
        });
      }, function(reason) {
        //alert('Failed: ' + reason);
        transferFailure("Transfer canceled");
      });


    }

    function transferFailure(reason) {
      // $scope.status = "";
      self.submitting = false;
      // self.sendMessage = reason;
      console.log("Transfer failed: " + reason);
      this.messager.push({
        message: reason,
        type: 'error'
      });
    }

    var unused_outs;
    var using_outs;
    var using_outs_amount;

    function random_index(list) {
      return Math.floor(Math.random() * list.length);
    }

    function pop_random_value(list) {
      var idx = random_index(list);
      var val = list[idx];
      list.splice(idx, 1);
      return val;
    }

    function select_outputs(target_amount) {
      console.log("Selecting outputs to use. Current total: " + cnUtil.formatMoney(using_outs_amount) + " target: " + cnUtil.formatMoney(target_amount));
      while (using_outs_amount - target_amount < 0 && unused_outs.length > 0) {
        var out = pop_random_value(unused_outs);
        if (!rct && out.rct) {continue;} //skip rct outs if not creating rct tx
        using_outs.push(out);
        using_outs_amount = using_outs_amount+out.amount;
        console.log("Using output: " + cnUtil.formatMoney(out.amount) + " - " + JSON.stringify(out));
      }
    }

    function transfer() {

      return new Promise(function(resolve, reject){
        var dsts: any = realDsts.slice(0);
        var totalAmount = totalAmountWithoutFee+neededFee/*.add(chargeAmount)*/;
        console.log("Balance required: " + cnUtil.formatMoneySymbol(totalAmount));

        select_outputs(totalAmount);

        //compute fee as closely as possible before hand
        if (using_outs.length > 1 && rct)
        {
          var newNeededFee = Math.ceil(cnUtil.estimateRctSize(using_outs.length, mixin, 2) / 1024)*feePerKB*fee_multiplayer;
          totalAmount = totalAmountWithoutFee + newNeededFee;
          //add outputs 1 at a time till we either have them all or can meet the fee
          while (using_outs_amount - totalAmount < 0 && unused_outs.length > 0)
          {
            var out = pop_random_value(unused_outs);
            using_outs.push(out);
            using_outs_amount = using_outs_amount + out.amount;
            console.log("Using output: " + cnUtil.formatMoney(out.amount) + " - " + JSON.stringify(out));
            newNeededFee = Math.ceil(cnUtil.estimateRctSize(using_outs.length, mixin, 2) / 1024)*feePerKB*fee_multiplayer;
            totalAmount = totalAmountWithoutFee + newNeededFee;
          }
          console.log("New fee: " + cnUtil.formatMoneySymbol(newNeededFee) + " for " + using_outs.length + " inputs");
          neededFee = newNeededFee;
        }

        if (using_outs_amount - totalAmount < 0)
        {
          reject("Not enough spendable outputs / balance too low (have "
            + cnUtil.formatMoneyFull(using_outs_amount) + " but need "
            + cnUtil.formatMoneyFull(totalAmount)
            + " (estimated fee " + cnUtil.formatMoneyFull(neededFee) + " included)");
          return;
        }
        else if (using_outs_amount - totalAmount > 0)
        {
          var changeAmount = using_outs_amount - totalAmount;

          if (!rct)
          {   //for rct we don't presently care about dustiness
            //do not give ourselves change < dust threshold
            // var changeAmountDivRem = changeAmount.divRem(config.dustThreshold);
            // if (changeAmountDivRem[1].toString() !== "0") {
            //   // add dusty change to fee
            //   console.log("Adding change of " + cnUtil.formatMoneyFullSymbol(changeAmountDivRem[1]) + " to transaction fee (below dust threshold)");
            // }
            // if (changeAmountDivRem[0].toString() !== "0") {
            //   // send non-dusty change to our address
            //   var usableChange = changeAmountDivRem[0]*config.dustThreshold;
            //   console.log("Sending change of " + cnUtil.formatMoneySymbol(usableChange) + " to " + self.session.address);
            //   dsts.push({
            //     address: self.session.address,
            //     amount: usableChange
            //   });
            // }
          }
          else
          {
            //add entire change for rct
            console.log("Sending change of " + cnUtil.formatMoneySymbol(changeAmount)
              + " to " + self.session.address);
            dsts.push({
              address: self.session.address,
              amount: changeAmount
            });
          }
        }
        else if (using_outs_amount === totalAmount && rct)
        {
          //create random destination to keep 2 outputs always in case of 0 change
          var fakeAddress = cnUtil.create_address(cnUtil.random_scalar()).public_addr;
          console.log("Sending 0 XMR to a fake address to keep tx uniform (no change exists): " + fakeAddress);
          dsts.push({
            address: fakeAddress,
            amount: 0
          });
        }

        if (mixin > 0)
        {
          var amounts = [];
          for (var l = 0; l < using_outs.length; l++)
          {
            amounts.push(using_outs[l].rct ? "0" : using_outs[l].amount.toString());
            //amounts.push("0");
          }
          var request = {
            amounts: amounts,
            count: mixin + 1 // Add one to mixin so we can skip real output key if necessary
          };

          self.backend.getRandomOuts(request.amounts, request.count).subscribe({
            next: (data)=>{
              createTx(data.amount_outs);
            },
            error: (e)=>{
              console.log(e);
              reject('Failed to get unspent outs');
            }
          });
        } else if (mixin < 0 || isNaN(mixin)) {
          reject("Invalid mixin");
          return;
        } else { // mixin === 0
          createTx(null);
        }

        // Create & serialize transaction
        function createTx(mix_outs)
        {
          var signed;
          try {
            console.log('Destinations: ');
            cnUtil.printDsts(dsts);
            //need to get viewkey for encrypting here, because of splitting and sorting
            if (pid_encrypt)
            {
              var realDestViewKey = cnUtil.decode_address(dsts[0].address).view;
            }

            var splittedDsts = cnUtil.decompose_tx_destinations(dsts, rct);

            console.log('Decomposed destinations:');

            cnUtil.printDsts(splittedDsts);

            signed = cnUtil.create_transaction(
              self.session.publicKeys,
              self.session.privateKeys,
              splittedDsts, using_outs,
              mix_outs, mixin, neededFee,
              payment_id, pid_encrypt,
              realDestViewKey, 0, rct);

          } catch (e) {
            reject("Failed to create transaction: " + e);
            return;
          }
          console.log("signed tx: ", JSON.stringify(signed));
          //move some stuff here to normalize rct vs non
          var raw_tx_and_hash :any = {};
          if (signed.version === 1) {
            raw_tx_and_hash.raw = cnUtil.serialize_tx(signed);
            raw_tx_and_hash.hash = cnUtil.cn_fast_hash(raw_tx_and_hash.raw);
            raw_tx_and_hash.prvkey = signed.prvkey;
          } else {
            raw_tx_and_hash = cnUtil.serialize_rct_tx_with_hash(signed);
          }
          console.log("raw_tx and hash:");
          console.log(raw_tx_and_hash);
          resolve(raw_tx_and_hash);
        }
      });
    }
  };

}
