import { CUSTOM_ELEMENTS_SCHEMA, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';

declare var bootstrap: any;

export interface Send {
  receiver_currency: string
  sender_tag: string
  recipient_tag: string
  category: string
  amount: number
}


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, CommonModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy{
  subscriptions: Subscription[]=[];
  sendForm!: FormGroup;
  accountDetails: any;
  userInfo: any;
  userTag: any;
  @ViewChild('sendActionSheet') sendActionSheet!: ElementRef; // Reference to the modal element
  private modalInstance: any;

  constructor(private fb: FormBuilder, private _authService: AuthService) {}

  openModal(): void {
    this.modalInstance = new bootstrap.Modal(this.sendActionSheet.nativeElement, {});
    this.modalInstance.show();
  }

ngOnInit(): void {
  this.sendForm = this.fb.group({
    to: ['', [Validators.required]], // Assuming 'To' should be a valid email
    reason: ['', Validators.required],
    currency: ['', Validators.required],
    amount: ['', [Validators.required, Validators.pattern(/^\d+$/)]], // Ensures input is a digit
  });
  this.userInfo = this._authService.retrieveUserInfo();
  if(this.userInfo?.id) {
    this.subscriptions.push(
      this._authService.getAccountDetails(this.userInfo?.id).subscribe(res => {
        if(res) {
          this.accountDetails = res;
          //this.userTag = this.userInfo.tag;
        }
      })
    )
  }
}

onSubmit() {
  this._authService.show();
  if (this.sendForm.valid) {
    const sendObj: Send = {
      receiver_currency: this.sendForm.controls['currency']?.value,
      sender_tag: this.userInfo.tag,
      recipient_tag: this.sendForm.controls['to']?.value,
      amount: Number(this.sendForm.controls['amount']?.value),
      category: this.sendForm.controls['reason']?.value
    }
    this.subscriptions.push(
      this._authService.send(sendObj).subscribe(res => {
        if(res) {
          this.accountDetails = res;
          this.closeModal();
        }
        this._authService.hide();
      })
    );
  }else {
    this._authService.hide();
  }
}
closeModal(): void {
  if (this.modalInstance) {
    this.modalInstance.hide();
  }
}
ngOnDestroy(): void {
    this.subscriptions.forEach(subs => subs.unsubscribe());
}
}
