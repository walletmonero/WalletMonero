import { Directive, Input, HostListener } from '@angular/core';

@Directive({
  selector: '[appCopyOnClick]'
})
export class CopyOnClickDirective {
  @Input() copySource: string;

  constructor() { }

  @HostListener('click') onClick() {
    if(this.copySource.length > 0){
      this.copyToClipboard(this.copySource);
    }
  }

  private copyToClipboard(str: string){
    let textArea = document.createElement("textarea");
    textArea.style.opacity = '0';
    textArea.value = str;
    document.body.appendChild(textArea);
    textArea.select();
    try{
      var copy = document.execCommand('copy');
    } catch(e){
      alert(e.message);
    }
    textArea.remove();
  }


}
