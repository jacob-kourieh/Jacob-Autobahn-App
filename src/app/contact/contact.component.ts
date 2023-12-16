import { Component } from '@angular/core';
import emailjs from 'emailjs-com';
import { emailJsConfig } from '../../environments/emailjs-config';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  isSendingEmail = false;

  constructor() {
    emailjs.init(emailJsConfig.user_id);
  }

  sendEmail(event: Event) {
    event.preventDefault();
    this.isSendingEmail = true;
    const form = event.target as HTMLFormElement;

    emailjs
      .sendForm(emailJsConfig.service_id, emailJsConfig.template_id, form)
      .then(
        () => {
          alert('Email successfully sent!');
          form.reset();
        },
        (err) => {
          alert('Failed to send email. Error: ' + JSON.stringify(err));
        }
      )
      .finally(() => {
        this.isSendingEmail = false;
      });
  }
}
