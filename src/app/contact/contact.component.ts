import { Component } from '@angular/core';
import emailjs from 'emailjs-com';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
})
export class ContactComponent {
  isSendingEmail = false;

  private emailJsConfig = {
    user_id: 'CqsjiW6hHD_LdRD5P',
    service_id: 'default_service',
    template_id: 'template_5cw4bqv',
  };

  // Initializes emailjs with the provided user ID.
  constructor() {
    emailjs.init(this.emailJsConfig.user_id);
  }

  // Handles the email sending process when the form is submitted.
  sendEmail(event: Event) {
    event.preventDefault();
    this.isSendingEmail = true;
    const form = event.target as HTMLFormElement;

    emailjs
      .sendForm(
        this.emailJsConfig.service_id,
        this.emailJsConfig.template_id,
        form
      )
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
