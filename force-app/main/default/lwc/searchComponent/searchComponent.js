import { LightningElement } from 'lwc';

export default class SearchComponent extends LightningElement {
    activeValueMessage = '';
    Expert = false;
    Appointment = false;
    handleActive(event) {
         if(event.target.value == 'Expert')
         {
         this.Expert = true;
         this.Appointment = false;
         }
        else
        {
        this.Appointment = true;
        this.Expert = false;
        }
        this.activeValueMessage = `Tab with value ${event.target.value} is now active`;
    }
}